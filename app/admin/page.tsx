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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Shortened URLs</h1>

        {urlsWithCounts && urlsWithCounts.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Short URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Original URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {urlsWithCounts.map((url) => (
                  <tr key={url.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center">
                      <Link href={`/${url.short_code}`} target="_blank" className="hover:underline">
                        {truncateUrl(origin, url.short_code)}
                      </Link>
                      <CopyButton text={`${origin}/${url.short_code}`} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {url.original_url}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {url.clickCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(url.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        <Link href={`/admin/${url.short_code}`}>Analytics</Link>
                      </button>
                      <DeleteButton urlId={url.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No shortened URLs yet.</p>
        )}
      </div>
    </div>
  );
}
