'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';

export function UserMenu({ email }: { email: string }) {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-800 outline-none">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-sm font-bold">
                        {email[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold hidden sm:block max-w-[120px] truncate text-gray-700 dark:text-gray-300">
                        {email}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-2xl z-[100]">
                <div className="px-3 py-3 mb-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cuenta</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{email}</p>
                </div>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
                <DropdownMenuItem asChild className="rounded-xl focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:text-blue-600 dark:focus:text-blue-400 cursor-pointer p-3 my-1">
                    <Link href="/admin" className="flex items-center gap-3 w-full">
                        <LayoutDashboard size={18} className="text-blue-500" />
                        <span className="font-bold">Panel de Control</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-600 dark:focus:text-red-400 cursor-pointer p-3 my-1 text-gray-600 dark:text-gray-400"
                >
                    <div className="flex items-center gap-3 w-full">
                        <LogOut size={18} />
                        <span className="font-bold">Cerrar sesión</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
