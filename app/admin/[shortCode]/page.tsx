"use client"

import { createClient } from '@/lib/supabase/client';
import { CopyButton } from '@/components/copy-button';
import { Copy, BarChart3, Share2, Trash2, Link2, Edit2, Check, X, LineChart as LineChartIcon, Activity, ChevronLeft, ChevronRight, Globe, Monitor, Smartphone, Bot as BotIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Helper function to get country flag from FlagsAPI
function getCountryFlag(country: string | null | undefined): React.ReactElement {
  if (!country) {
    return <span className="text-lg">🌍</span>;
  }

  // Special cases
  if (country === 'Local') {
    return <span className="text-lg">🏠</span>;
  }

  if (country === 'Unknown') {
    return <span className="text-lg">🌍</span>;
  }

  // Map country names to ISO 3166-1 alpha-2 codes
  const countryToISO: Record<string, string> = {
    // North America
    'United States': 'US',
    'Canada': 'CA',
    'Mexico': 'MX',

    // Central America
    'Guatemala': 'GT',
    'Honduras': 'HN',
    'El Salvador': 'SV',
    'Nicaragua': 'NI',
    'Costa Rica': 'CR',
    'Panama': 'PA',
    'Belize': 'BZ',

    // South America
    'Colombia': 'CO',
    'Venezuela': 'VE',
    'Ecuador': 'EC',
    'Peru': 'PE',
    'Bolivia': 'BO',
    'Chile': 'CL',
    'Argentina': 'AR',
    'Uruguay': 'UY',
    'Paraguay': 'PY',
    'Brazil': 'BR',
    'Guyana': 'GY',
    'Suriname': 'SR',

    // Caribbean
    'Cuba': 'CU',
    'Dominican Republic': 'DO',
    'Puerto Rico': 'PR',
    'Jamaica': 'JM',
    'Haiti': 'HT',
    'Trinidad and Tobago': 'TT',

    // Europe
    'United Kingdom': 'GB',
    'Ireland': 'IE',
    'France': 'FR',
    'Germany': 'DE',
    'Italy': 'IT',
    'Spain': 'ES',
    'Portugal': 'PT',
    'Netherlands': 'NL',
    'Belgium': 'BE',
    'Switzerland': 'CH',
    'Austria': 'AT',
    'Poland': 'PL',
    'Russia': 'RU',
    'Ukraine': 'UA',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Greece': 'GR',
    'Turkey': 'TR',
    'Czech Republic': 'CZ',
    'Romania': 'RO',
    'Hungary': 'HU',
    'Slovakia': 'SK',
    'Bulgaria': 'BG',
    'Croatia': 'HR',
    'Serbia': 'RS',

    // Asia
    'China': 'CN',
    'Japan': 'JP',
    'South Korea': 'KR',
    'India': 'IN',
    'Pakistan': 'PK',
    'Bangladesh': 'BD',
    'Vietnam': 'VN',
    'Thailand': 'TH',
    'Philippines': 'PH',
    'Indonesia': 'ID',
    'Malaysia': 'MY',
    'Singapore': 'SG',
    'Israel': 'IL',
    'Saudi Arabia': 'SA',
    'United Arab Emirates': 'AE',
    'Iran': 'IR',
    'Iraq': 'IQ',
    'Afghanistan': 'AF',
    'Kazakhstan': 'KZ',
    'Taiwan': 'TW',
    'Hong Kong': 'HK',

    // Oceania
    'Australia': 'AU',
    'New Zealand': 'NZ',
    'Fiji': 'FJ',

    // Africa
    'South Africa': 'ZA',
    'Egypt': 'EG',
    'Nigeria': 'NG',
    'Kenya': 'KE',
    'Morocco': 'MA',
    'Algeria': 'DZ',
    'Tunisia': 'TN',
    'Ethiopia': 'ET',
    'Ghana': 'GH',
  };

  const isoCode = countryToISO[country];

  if (!isoCode) {
    return <span className="text-lg">🌍</span>;
  }

  return (
    <img
      src={`https://flagsapi.com/${isoCode}/flat/32.png`}
      alt={`${country} flag`}
      className="w-6 h-6 object-cover rounded shadow-sm"
      loading="lazy"
    />
  );
}

export default function AnalyticsPage() {
  const params = useParams();
  const shortCode = params.shortCode as string;
  const [user, setUser] = useState<any>(null);
  const [url, setUrl] = useState<any>(null);
  const [clicks, setClicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [osFilter, setOsFilter] = useState<string[]>([]);
  const [browserFilter, setBrowserFilter] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      // Fetch user role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = userData?.role === 'admin';

      // Fetch URL
      let query = supabase
        .from('urls')
        .select('*')
        .eq('short_code', shortCode);

      // If not admin, restrict by user_id
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data: url, error: urlError } = await query.single();

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

      setLoading(false);
    };

    fetchData();
  }, [shortCode]);

  const handleSaveTitle = async () => {
    if (!url || !user) return;
    const supabase = createClient();

    // Check if user is admin or owner
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'admin';
    const isOwner = url.user_id === user.id;

    if (!isAdmin && !isOwner) return;

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

  // Filter and Group Data
  const now = new Date();

  const filteredClicks = clicks.filter(click => {
    // OS and Browser filters
    const osMatch = osFilter.length === 0 || osFilter.includes(click.os || 'Unknown');
    const browserMatch = browserFilter.length === 0 || browserFilter.includes(click.browser || 'Unknown');

    // Date filter
    let dateMatch = true;
    const clickDate = new Date(click.clicked_at);
    if (timeRange === '24h') {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      dateMatch = clickDate >= yesterday;
    } else if (timeRange === '7d') {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateMatch = clickDate >= lastWeek;
    } else if (timeRange === '30d') {
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateMatch = clickDate >= lastMonth;
    }

    return osMatch && browserMatch && dateMatch;
  });

  // Calculate unique OS and Browser values for filters (using ALL clicks)
  const availableOS = Array.from(new Set(clicks.map(c => c.os || 'Unknown'))).sort();
  const availableBrowsers = Array.from(new Set(clicks.map(c => c.browser || 'Unknown'))).sort();

  // Derived statistics based on fully filtered clicks
  const countriesList = Object.entries(
    filteredClicks.reduce((acc: Record<string, number>, click) => {
      const country = click.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, clicks]) => ({
      name,
      flag: getCountryFlag(name),
      clicks,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 6);

  const referrersList = Object.entries(
    filteredClicks.reduce((acc: Record<string, number>, click) => {
      const ref = click.referrer || 'Direct';
      acc[ref] = (acc[ref] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const getFilteredData = () => {
    const labels: string[] = [];
    const groupedData: Record<string, number> = {};

    if (timeRange === '24h') {
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        const key = `${d.getHours()}:00`;
        labels.push(key);
        groupedData[key] = 0;
      }
      filteredClicks.forEach(c => {
        const d = new Date(c.clicked_at);
        const key = `${d.getHours()}:00`;
        if (groupedData[key] !== undefined) groupedData[key]++;
      });
    } else if (timeRange === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toLocaleDateString('en-US', { weekday: 'short' });
        labels.push(key);
        groupedData[key] = 0;
      }
      filteredClicks.forEach(c => {
        const d = new Date(c.clicked_at);
        const key = d.toLocaleDateString('en-US', { weekday: 'short' });
        if (groupedData[key] !== undefined) groupedData[key]++;
      });
    } else if (timeRange === '30d') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = `${d.getDate()} / ${d.getMonth() + 1}`;
        labels.push(key);
        groupedData[key] = 0;
      }
      filteredClicks.forEach(c => {
        const d = new Date(c.clicked_at);
        const key = `${d.getDate()} / ${d.getMonth() + 1}`;
        if (groupedData[key] !== undefined) groupedData[key]++;
      });
    } else {
      // All time - group by day
      if (filteredClicks.length === 0) return [];

      const sortedClicks = [...filteredClicks].sort((a, b) => new Date(a.clicked_at).getTime() - new Date(b.clicked_at).getTime());
      const firstClickDate = new Date(sortedClicks[0].clicked_at);
      const startDate = new Date(firstClickDate.getFullYear(), firstClickDate.getMonth(), firstClickDate.getDate());
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      for (let i = diffDays; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = `${d.getDate()} / ${d.getMonth() + 1}`;
        labels.push(key);
        groupedData[key] = 0;
      }

      filteredClicks.forEach(c => {
        const d = new Date(c.clicked_at);
        const key = `${d.getDate()} / ${d.getMonth() + 1}`;
        if (groupedData[key] !== undefined) groupedData[key]++;
      });

      return labels.map(label => ({ label, value: groupedData[label] }));
    }

    return labels.map(label => ({ label, value: groupedData[label] }));
  };

  const chartData = getFilteredData();

  const rangeTotalClicks = chartData.reduce((a, b) => a + b.value, 0);

  const origin = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-[100%] mx-auto space-y-8">
        {/* Header/Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="md:col-span-2 p-4 md:p-8 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="w-full sm:w-auto">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-blue-500 rounded-lg px-3 py-1 outline-none w-full"
                      />
                      <button onClick={handleSaveTitle} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shrink-0">
                        <Check size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="group flex items-center gap-2">
                      <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white truncate max-w-[250px] md:max-w-md">{url.title || 'Untitled URL'}</h1>
                      <button onClick={() => setIsEditingTitle(true)} className="sm:opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity p-1">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1 font-medium">Created on {new Date(url.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <CopyButton text={`${origin}/${url.short_code}`} />
                  <button className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl shadow-inner">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Total Clicks</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{clicks.length}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Destination</p>
                    <p className="text-xs font-bold truncate text-blue-600 hover:underline cursor-pointer" title={url.original_url}>
                      {url.original_url}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Short URL</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      {origin}/{url.short_code}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-blue-600 dark:bg-blue-700 text-white rounded-3xl border-0 shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-125 transition-transform" />
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md shadow-inner">
              <Activity size={32} />
            </div>
            <h2 className="text-lg font-bold opacity-80 uppercase tracking-widest text-xs">Visitas Filtradas</h2>
            <p className="text-5xl font-black mt-2 tabular-nums">{rangeTotalClicks}</p>
            <p className="text-[10px] opacity-70 mt-2 font-bold uppercase tracking-tight">Periodo: {timeRange.toUpperCase()}</p>
          </Card>
        </div>

        {/* Global Filters Section */}
        <Card className="p-4 md:p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OS Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Monitor size={14} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sistema Operativo</span>
                {osFilter.length > 0 && (
                  <button
                    onClick={() => {
                      setOsFilter([]);
                      setCurrentPage(1);
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableOS.map(os => {
                  const isSelected = osFilter.includes(os);
                  return (
                    <button
                      key={os}
                      onClick={() => {
                        if (isSelected) {
                          setOsFilter(osFilter.filter(o => o !== os));
                        } else {
                          setOsFilter([...osFilter, os]);
                        }
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSelected
                        ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                      {os}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Browser Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe size={14} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Navegador</span>
                {browserFilter.length > 0 && (
                  <button
                    onClick={() => {
                      setBrowserFilter([]);
                      setCurrentPage(1);
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableBrowsers.map(browser => {
                  const isSelected = browserFilter.includes(browser);
                  return (
                    <button
                      key={browser}
                      onClick={() => {
                        if (isSelected) {
                          setBrowserFilter(browserFilter.filter(b => b !== browser));
                        } else {
                          setBrowserFilter([...browserFilter, browser]);
                        }
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSelected
                        ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                      {browser}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <Card className="lg:col-span-2 p-4 md:p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl lg:order-1 order-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                  <LineChartIcon size={20} />
                </div>
                <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white">Estadísticas de Tráfico</h3>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex p-1 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => setChartType('bar')}
                    className={`p-2 rounded-xl transition-all ${chartType === 'bar' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <BarChart3 size={18} />
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`p-2 rounded-xl transition-all ${chartType === 'line' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <LineChartIcon size={18} />
                  </button>
                </div>

                <div className="flex p-0.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
                  {(['24h', '7d', '30d', 'all'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${timeRange === range
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                      {range === 'all' ? 'Siempre' : range}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-[300px] md:h-[400px] mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" opacity={0.5} />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 'bold' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 'bold' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '16px',
                        color: '#fff',
                        fontSize: '11px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ fontWeight: 'bold' }}
                      cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                      barSize={12}
                    />
                  </BarChart>
                ) : (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" opacity={0.5} />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 'bold' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 'bold' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '16px',
                        color: '#fff',
                        fontSize: '11px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Right Column: Countries & Referrers */}
          <div className="space-y-8 lg:order-2 order-1">
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl">
              <div className="flex items-center gap-2 mb-6">
                <Globe size={18} className="text-gray-400" />
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">Top Países</h3>
              </div>
              <div className="space-y-5">
                {countriesList.length > 0 ? countriesList.map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl shadow-inner">
                        {c.flag}
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                          style={{ width: `${filteredClicks.length > 0 ? (c.clicks / filteredClicks.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-gray-900 dark:text-white w-6 text-right">{c.clicks}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-400 text-center py-4 font-medium italic">Sin datos aún</p>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl">
              <div className="flex items-center gap-2 mb-6">
                <Share2 size={18} className="text-gray-400" />
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">Referrers</h3>
              </div>
              <div className="space-y-4">
                {referrersList.length > 0 ? referrersList.map((ref) => (
                  <div key={ref.name} className="group flex items-center justify-between gap-4 p-2 rounded-xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all">
                    <span
                      className="text-xs font-bold text-gray-600 dark:text-gray-400 truncate flex-1"
                      title={ref.name}
                    >
                      {ref.name}
                    </span>
                    <span className="text-[10px] font-black bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      {ref.count}
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-gray-400 text-center py-4 font-medium italic">Sin datos aún</p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Detailed Logs Table */}
        <Card className="p-4 md:p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-lg">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Registros Detallados</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Metadatos en tiempo real</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Items per page - keep as dropdown */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5">
                <span className="text-xs font-bold text-gray-400">Ver:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-transparent border-0 text-xs font-black outline-none w-full text-gray-900 dark:text-white cursor-pointer"
                >
                  {[10, 20, 50].map(n => (
                    <option key={n} value={n} className="text-gray-900 bg-white">{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>


          <div className="overflow-x-auto -mx-4 md:-mx-8">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead className="bg-gray-50/50 dark:bg-gray-950/50 border-y border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha & Hora</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">IP Address</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ubicación</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Device / OS</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Browser / Lang</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Referrer</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Red (ISP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                {filteredClicks.length > 0 ? (
                  filteredClicks
                    .slice()
                    .reverse()
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((click, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-blue-900/5 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-black text-gray-900 dark:text-white">
                            {new Date(click.clicked_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                            {click.ip_address || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner grayscale group-hover:grayscale-0 transition-all">
                              {getCountryFlag(click.country)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-gray-900 dark:text-white uppercase">{click.city || 'Desconocida'}</span>
                              <span className="text-[10px] font-bold text-gray-400">{click.country || 'Desconocido'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm text-blue-500">
                              {click.device_type === 'Mobile' ? <Smartphone size={14} /> :
                                click.device_type === 'Bot' ? <BotIcon size={14} className="text-red-500" /> :
                                  <Monitor size={14} />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-gray-900 dark:text-white uppercase">{click.device_type || 'Unknown'}</span>
                              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{click.os || 'Unknown'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-gray-900 dark:text-white uppercase">{click.browser || 'Unknown'}</span>
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{click.language || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-[200px] overflow-hidden">
                          {click.referrer ? (
                            <a
                              href={click.referrer}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-blue-500 hover:text-blue-700 hover:underline break-all truncate block"
                              title={click.referrer}
                            >
                              {click.referrer}
                            </a>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 italic">Directo / Desconocido</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter truncate max-w-[150px] block opacity-60 group-hover:opacity-100 transition-opacity">
                            {click.isp || 'Red Privada'}
                          </span>
                        </td>
                      </tr>
                    ))) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-400 font-black uppercase tracking-widest italic opacity-50">Sin actividad reciente</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredClicks.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredClicks.length)}</span> of <span className="font-medium text-gray-900 dark:text-white">{filteredClicks.length}</span> results
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-300"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.ceil(filteredClicks.length / itemsPerPage))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === i + 1
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      {i + 1}
                    </button>
                  )).slice(Math.max(0, currentPage - 3), Math.min(Math.ceil(filteredClicks.length / itemsPerPage), currentPage + 2))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredClicks.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(filteredClicks.length / itemsPerPage)}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-300"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}