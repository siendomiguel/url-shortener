"use client"

import { createClient } from '@/lib/supabase/client';
import { CopyButton } from '@/components/copy-button';
import { Copy, BarChart3, Share2, Trash2, Link2, Edit2, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function AnalyticsPage() {
  const params = useParams();
  const shortCode = params.shortCode as string;
  const [user, setUser] = useState<any>(null);
  const [url, setUrl] = useState<any>(null);
  const [clicks, setClicks] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      // Fetch URL
      const { data: url, error: urlError } = await supabase
        .from('urls')
        .select('*')
        .eq('short_code', shortCode)
        .eq('user_id', user.id)
        .single();

      if (urlError || !url) {
        setLoading(false);
        return;
      }

      setUrl(url);
      setNewTitle(url.title || '');

      // Fetch clicks
      const { data: clicks } = await supabase
        .from('clicks')
        .select('*')
        .eq('url_id', url.id)
        .order('clicked_at', { ascending: true });

      const clickData = clicks || [];
      setClicks(clickData);

      // Process countries
      const uniqueIPs = [...new Set(clickData.map(c => c.ip_address.split('/')[0]).filter(ip => ip !== 'unknown' && ip !== '::1'))];

      const ipCountries = await Promise.all(
        uniqueIPs.slice(0, 10).map(async (ip) => {
          if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
            return { ip, country: 'Local' };
          }
          try {
            const res = await fetch(`https://ip.guide/${ip}`);
            const data = await res.json();
            return { ip, country: data.country || 'Unknown' };
          } catch {
            return { ip, country: 'Unknown' };
          }
        })
      );

      const countryCounts = ipCountries.reduce((acc: Record<string, number>, item) => {
        acc[item.country] = (acc[item.country] || 0) + clickData.filter(c => c.ip_address.startsWith(item.ip)).length;
        return acc;
      }, {});

      const countryCodeToFlag: Record<string, string> = {
        'United States': '🇺🇸',
        'Germany': '🇩🇪',
        'Netherlands': '🇳🇱',
        'United Kingdom': '🇬🇧',
        'Italy': '🇮🇹',
        'Vietnam': '🇻🇳',
        'France': '🇫🇷',
        'Spain': '🇪🇸',
        'Canada': '🇨🇦',
        'Australia': '🇦🇺',
        'Japan': '🇯🇵',
        'China': '🇨🇳',
        'India': '🇮🇳',
        'Brazil': '🇧🇷',
        'Mexico': '🇲🇽',
        'Russia': '🇷🇺',
        'South Korea': '🇰🇷',
        'Argentina': '🇦🇷',
        'Chile': '🇨🇱',
        'Colombia': '🇨🇴',
        'Local': '🏠',
        'Unknown': '🌍',
      };

      const countriesList = Object.entries(countryCounts)
        .map(([name, clicks]) => ({
          name,
          flag: countryCodeToFlag[name] || '🏳️',
          clicks,
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 6);

      setCountries(countriesList);
      setLoading(false);
    };

    fetchData();
  }, [shortCode]);

  const handleSaveTitle = async () => {
    if (!url) return;
    const supabase = createClient();
    await supabase.from('urls').update({ title: newTitle }).eq('id', url.id);
    setUrl({ ...url, title: newTitle });
    setIsEditingTitle(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !url) {
    return <div>Access denied or URL not found</div>;
  }

  // Process data for chart (group by month)
  const monthlyClicks = clicks.reduce((acc: Record<string, number>, click) => {
    const date = new Date(click.clicked_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(monthlyClicks).map(([month, value]) => ({
    month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
    value,
  }));

  const totalClicks = clicks.length;
  const maxValue = Math.max(...chartData.map(d => d.value), 5000);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Link Details Card */}
        <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="grid grid-cols-[100px_1fr] gap-y-3 gap-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Title</span>
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                    />
                    <button onClick={handleSaveTitle} className="text-green-600 hover:text-green-700">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setIsEditingTitle(false)} className="text-red-600 hover:text-red-700">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{url.title || 'No title'}</span>
                    <button onClick={() => setIsEditingTitle(true)} className="text-blue-600 hover:text-blue-700">
                      <Edit2 size={16} />
                    </button>
                  </>
                )}
              </div>

              <span className="text-sm text-gray-500 dark:text-gray-400">Destination</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-lg font-bold">#</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">{url.original_url}</span>
              </div>

              <span className="text-sm text-gray-500 dark:text-gray-400">Short URL</span>
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-500 font-medium">{`${origin}/${url.short_code}`}</span>
              </div>

              <span className="text-sm text-gray-500 dark:text-gray-400">Created on</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{new Date(url.created_at).toLocaleDateString()}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <CopyButton text={`${origin}/${url.short_code}`} />
              <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <BarChart3 className="w-4 h-4" />
              </button>
              <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </Card>

        {/* Analytics Section */}
        <div className="grid grid-cols-[1fr_280px] gap-6">
          {/* Chart Card */}
          <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-500">{totalClicks.toLocaleString()}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Clicks</span>
              </div>

              {/* Tabs - Placeholder for now */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button className="px-4 py-1.5 text-sm bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-100 rounded-md">
                  All time
                </button>
              </div>
            </div>

            {/* Chart */}
            <div className="relative h-72">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 dark:text-gray-500 pr-4 pb-6">
                <span>{maxValue}</span>
                <span>{Math.round(maxValue * 0.8)}</span>
                <span>{Math.round(maxValue * 0.6)}</span>
                <span>{Math.round(maxValue * 0.4)}</span>
                <span>{Math.round(maxValue * 0.2)}</span>
                <span>0</span>
              </div>

              {/* Grid lines */}
              <div className="ml-12 h-full flex flex-col justify-between pb-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="border-t border-gray-100 dark:border-gray-700 w-full" />
                ))}
              </div>

              {/* Bars */}
              <div className="absolute ml-12 bottom-6 left-0 right-0 h-[calc(100%-24px)] flex items-end justify-around px-4">
                {chartData.map((item, index) => (
                  <div
                    key={item.month}
                    className="flex flex-col items-center relative"
                  >
                    <div
                      className="w-12 bg-blue-500 rounded-t cursor-pointer hover:bg-blue-600 transition-colors"
                      style={{ height: `${(item.value / maxValue) * 100}%` }}
                      title={`${item.month}: ${item.value}`}
                    />
                  </div>
                ))}
              </div>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-12 right-0 flex justify-around px-4">
                {chartData.map((item) => (
                  <span key={item.month} className="text-xs text-gray-400 dark:text-gray-500">
                    {item.month}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Top Countries Card */}
          <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-2xl">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Top countries</h3>

            <div className="space-y-4">
              {countries.map((country) => (
                <div key={country.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{country.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{country.clicks}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}