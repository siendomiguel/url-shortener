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
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [topReferrers, setTopReferrers] = useState<{ name: string; count: number }[]>([]);

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

      // Process countries from stored data
      const countryCounts = clickData.reduce((acc: Record<string, number>, click) => {
        const country = click.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});

      const countryCodeToFlag: Record<string, string> = {
        'United States': '🇺🇸', 'Germany': '🇩🇪', 'Netherlands': '🇳🇱', 'United Kingdom': '🇬🇧',
        'Italy': '🇮🇹', 'Vietnam': '🇻🇳', 'France': '🇫🇷', 'Spain': '🇪🇸', 'Canada': '🇨🇦',
        'Australia': '🇦🇺', 'Japan': '🇯🇵', 'China': '🇨🇳', 'India': '🇮🇳', 'Brazil': '🇧🇷',
        'Mexico': '🇲🇽', 'Russia': '🇷🇺', 'South Korea': '🇰🇷', 'Argentina': '🇦🇷',
        'Chile': '🇨🇱', 'Colombia': '🇨🇴', 'Local': '🏠', 'Unknown': '🌍',
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

      // Process referrers
      const refCounts = clickData.reduce((acc: Record<string, number>, click) => {
        let ref = 'Direct';
        try {
          if (click.referrer) {
            const url = new URL(click.referrer);
            ref = url.hostname;
          }
        } catch (e) { }
        acc[ref] = (acc[ref] || 0) + 1;
        return acc;
      }, {});

      const referrersList = Object.entries(refCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopReferrers(referrersList);

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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !url) {
    return <div className="min-h-screen flex items-center justify-center">Access denied or URL not found</div>;
  }

  // Filter and Group Data based on timeRange
  const now = new Date();
  const getFilteredData = () => {
    let filtered = clicks;
    const labels: string[] = [];
    const groupedData: Record<string, number> = {};

    if (timeRange === '24h') {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filtered = clicks.filter(c => new Date(c.clicked_at) >= yesterday);
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        const key = `${d.getHours()}:00`;
        labels.push(key);
        groupedData[key] = 0;
      }
      filtered.forEach(c => {
        const d = new Date(c.clicked_at);
        const key = `${d.getHours()}:00`;
        if (groupedData[key] !== undefined) groupedData[key]++;
      });
    } else if (timeRange === '7d') {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = clicks.filter(c => new Date(c.clicked_at) >= lastWeek);
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toLocaleDateString('en-US', { weekday: 'short' });
        labels.push(key);
        groupedData[key] = 0;
      }
      filtered.forEach(c => {
        const d = new Date(c.clicked_at);
        const key = d.toLocaleDateString('en-US', { weekday: 'short' });
        if (groupedData[key] !== undefined) groupedData[key]++;
      });
    } else if (timeRange === '30d') {
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = clicks.filter(c => new Date(c.clicked_at) >= lastMonth);
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = `${d.getDate()} / ${d.getMonth() + 1}`;
        labels.push(key);
        groupedData[key] = 0;
      }
      filtered.forEach(c => {
        const d = new Date(c.clicked_at);
        const key = `${d.getDate()} / ${d.getMonth() + 1}`;
        if (groupedData[key] !== undefined) groupedData[key]++;
      });
    } else {
      // All time - group by month
      const months = clicks.reduce((acc: Record<string, number>, click) => {
        const date = new Date(click.clicked_at);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      Object.keys(months).forEach(key => labels.push(key));
      return labels.map(label => ({ label, value: months[label] }));
    }

    return labels.map(label => ({ label, value: groupedData[label] }));
  };

  const chartData = getFilteredData();
  const rangeTotalClicks = chartData.reduce((a, b) => a + b.value, 0);
  const maxVal = Math.max(...chartData.map(d => d.value), 10);
  const yAxisTicks = [maxVal, Math.round(maxVal * 0.75), Math.round(maxVal * 0.5), Math.round(maxVal * 0.25), 0];

  const origin = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-[95%] mx-auto space-y-8">
        {/* Header/Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="text-xl font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-blue-500 rounded-lg px-3 py-1 outline-none"
                      />
                      <button onClick={handleSaveTitle} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        <Check size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="group flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{url.title || 'Untitled URL'}</h1>
                      <button onClick={() => setIsEditingTitle(true)} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity">
                        <Edit2 size={18} />
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-1">Created on {new Date(url.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <CopyButton text={`${origin}/${url.short_code}`} />
                  <button className="p-2.5 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-all">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                      <BarChart3 size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Total Clicks</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{clicks.length}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Destination</p>
                    <p className="text-sm font-medium truncate text-blue-600 hover:underline cursor-pointer" title={url.original_url}>
                      {url.original_url}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Short URL</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {origin}/{url.short_code}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-blue-600 dark:bg-blue-700 text-white rounded-3xl border-0 shadow-lg flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <BarChart3 size={32} />
            </div>
            <h2 className="text-lg font-medium opacity-90">Quick View</h2>
            <p className="text-4xl font-black mt-2">{rangeTotalClicks}</p>
            <p className="text-sm opacity-80 mt-1">Clicks in current filter</p>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <Card className="lg:col-span-2 p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl lg:order-1 order-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Visitor Stats</h3>
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                {(['24h', '7d', '30d', 'all'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${timeRange === range
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    {range === 'all' ? 'All Time' : range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative h-[350px] mt-4">
              {/* Y-Axis */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 font-mono pr-4 pb-8">
                {yAxisTicks.map((tick, i) => (
                  <span key={i}>{tick}</span>
                ))}
              </div>

              {/* Grid Lines */}
              <div className="ml-8 h-full flex flex-col justify-between pb-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border-t border-gray-100 dark:border-gray-800 w-full" />
                ))}
              </div>

              {/* Bars Container */}
              <div className="absolute ml-8 bottom-8 left-0 right-0 h-[calc(100%-32px)] flex items-end justify-around px-2">
                {chartData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {item.value} clicks
                    </div>
                    <div
                      className="w-full max-w-[40px] bg-blue-500 dark:bg-blue-600 rounded-t-sm group-hover:bg-blue-400 transition-all"
                      style={{ height: `${(item.value / maxVal) * 100}%`, minHeight: item.value > 0 ? '4px' : '0' }}
                    />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap rotate-45 origin-left">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-8" /> {/* Spacer for rotated labels */}
          </Card>

          {/* Right Column: Countries & Referrers */}
          <div className="space-y-8 lg:order-2 order-1">
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl">
              <h3 className="font-bold text-gray-900 dark:text-white mb-6">Top Countries</h3>
              <div className="space-y-5">
                {countries.length > 0 ? countries.map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                        {c.flag}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${(c.clicks / clicks.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{c.clicks}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">No location data yet</p>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl">
              <h3 className="font-bold text-gray-900 dark:text-white mb-6">Referrers</h3>
              <div className="space-y-4">
                {topReferrers.length > 0 ? topReferrers.map((ref) => (
                  <div key={ref.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate max-w-[150px]">{ref.name}</span>
                    <span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md">
                      {ref.count} visits
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">No referrer data yet</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}