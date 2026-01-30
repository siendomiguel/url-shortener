import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { CopyButton } from '@/components/copy-button';
import { DeleteButton } from '@/components/delete-button';
import { headers } from 'next/headers';
import { Shield, Users, Link2, MousePointer2, Calendar, LayoutDashboard } from 'lucide-react';

function truncateUrl(url: string, shortCode: string): string {
    const full = `${url}/${shortCode}`;
    if (full.length <= 40) return full;
    const start = url.slice(0, 15);
    return `${start}.../${shortCode}`;
}

export default async function GlobalAdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const headersList = await headers();
    const origin = process.env.NEXT_PUBLIC_BASE_URL || headersList.get('origin') || 'http://localhost:3000';

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-2">Acceso Denegado</h1>
                    <p className="text-gray-600 dark:text-gray-400">Debes iniciar sesión para ver esta página.</p>
                </div>
            </div>
        );
    }

    // Fetch current user's role to verify admin status
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (userData?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center border border-amber-200 dark:border-amber-900">
                    <Shield size={48} className="mx-auto text-amber-500 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceso Restringido</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Esta área está reservada exclusivamente para Super Administradores.</p>
                    <Link href="/admin" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Volver al Panel
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch ALL URLs from ALL users with their emails
    const { data: allUrls, error } = await supabase
        .from('urls')
        .select(`
      id, 
      original_url, 
      short_code, 
      created_at,
      users (
        email
      )
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching global URLs:', error);
        return <div className="p-8 text-red-500">Error al cargar datos globales: {error.message}</div>;
    }

    // Fetch click counts for each URL
    const urlsWithCounts = allUrls ? await Promise.all(
        allUrls.map(async (url: any) => {
            const { count } = await supabase
                .from('clicks')
                .select('*', { count: 'exact', head: true })
                .eq('url_id', url.id);
            return { ...url, clickCount: count || 0 };
        })
    ) : [];

    // Summary stats
    const totalUrls = urlsWithCounts.length;
    const totalClicks = urlsWithCounts.reduce((acc, curr) => acc + curr.clickCount, 0);
    const totalUsers = new Set(allUrls.map(u => (u.users as any)?.email)).size;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-[98%] mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider text-xs mb-2">
                            <Shield size={14} />
                            Control de Super Administrador
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Supervisión Global de Contenido</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Monitoreo de todos los enlaces acortados en la plataforma</p>
                    </div>

                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <LayoutDashboard size={18} />
                        Mi Panel Personal
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                            <Link2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1 font-medium">Total de Links Globales</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUrls}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400">
                            <MousePointer2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1 font-medium">Tráfico Total Global</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalClicks}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1 font-medium">Usuarios Activos</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
                        </div>
                    </div>
                </div>

                {/* Links Table */}
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Creador (Usuario)
                                    </th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Link Corto
                                    </th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Link de Destino
                                    </th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Uso
                                    </th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Control
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {urlsWithCounts.map((url) => (
                                    <tr key={url.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold border-2 border-white dark:border-gray-800 shadow-sm">
                                                    {(url.users as any)?.email?.[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{(url.users as any)?.email}</span>
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono uppercase tracking-tighter">
                                                        <Calendar size={10} />
                                                        {new Date(url.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/${url.short_code}`} target="_blank" className="font-mono text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                                    {truncateUrl(origin, url.short_code)}
                                                </Link>
                                                <CopyButton text={`${origin}/${url.short_code}`} />
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="max-w-[250px] truncate text-sm text-gray-600 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                                                {url.original_url}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-extrabold text-gray-900 dark:text-white">{url.clickCount}</span>
                                                <span className="text-gray-400 font-medium">clics</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/admin/${url.short_code}`}
                                                    className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all flex items-center gap-2"
                                                >
                                                    Ver Stats
                                                </Link>
                                                <DeleteButton urlId={url.id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {urlsWithCounts.length === 0 && (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                <Link2 size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No se encontraron links</h3>
                            <p className="text-gray-500 dark:text-gray-400">La plataforma aún no ha procesado ningún enlace.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
