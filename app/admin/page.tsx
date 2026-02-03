import { Copy, BarChart3, Share2, Trash2, Link2, Edit2, Check, X, LineChart as LineChartIcon, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { CopyButton } from '@/components/copy-button';
import { DeleteButton } from '@/components/delete-button';
import { headers } from 'next/headers';

function truncateUrl(url: string, shortCode: string): string {
  const full = `${url}/${shortCode}`;
  if (full.length <= 50) return full;
  const domain = url;
  if (domain.length <= 20) return full;
  const start = domain.slice(0, 15);
  const end = domain.slice(-10);
  return `${start}...${end}/${shortCode}`;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const headersList = await headers();
  const origin = process.env.NEXT_PUBLIC_BASE_URL || headersList.get('origin') || 'http://localhost:3000';

  if (!user) {
    return <div>Access denied</div>;
  }

  // Fetch user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = userData?.role === 'admin';

  // Fetch URLs
  const { data: urls, error } = await supabase
    .from('urls')
    .select('id, original_url, short_code, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return <div>Error loading data</div>;
  }

  // Fetch click counts for each URL
  const urlsWithCounts = urls ? await Promise.all(
    urls.map(async (url) => {
      const { count } = await supabase
        .from('clicks')
        .select('*', { count: 'exact', head: true })
        .eq('url_id', url.id);
      return { ...url, clickCount: count || 0 };
    })
  ) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-[98%] md:max-w-[95%] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Mis Links Acortados</h1>

          {isAdmin && (
            <Link
              href="/admin/all"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold transition-all shadow-md active:scale-95"
            >
              <Activity size={18} />
              Panel Global
            </Link>
          )}
        </div>

        {urlsWithCounts && urlsWithCounts.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Link Corto
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Link Original
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
                      Clicks
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
                      Creado
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {urlsWithCounts.map((url) => (
                    <tr key={url.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400">
                        <div className="flex items-center gap-2">
                          <Link href={`/${url.short_code}`} target="_blank" className="hover:underline">
                            {url.short_code}
                          </Link>
                          <CopyButton text={`${origin}/${url.short_code}`} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                        {url.original_url}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-black text-gray-900 dark:text-white">
                        {url.clickCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400 font-medium">
                        {new Date(url.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/${url.short_code}`}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Activity size={18} />
                          </Link>
                          <DeleteButton urlId={url.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No shortened URLs yet.</p>
        )}
      </div>
    </div>
  );
}
