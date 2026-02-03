import { AuthButton } from '@/components/auth-button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Link from 'next/link';
import { Suspense } from 'react';
import { ShortenForm } from '@/components/shorten-form';
import { LandingPage } from '@/components/landing-page';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-white/50 dark:bg-gray-950/50 backdrop-blur-md sticky top-0 z-50">
          <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center">
              <Link href={'/'} className="flex items-center gap-2">
                <img src="/logo.png" alt="URLShot Logo" className="h-8 w-auto" />
                <span className="text-xl font-black tracking-tighter text-blue-600 hidden sm:block">
                  URL<span className="text-gray-900 dark:text-white">Shot</span>
                </span>
              </Link>
            </div>
            <Suspense fallback={<div className="h-10 w-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-full" />}>
              <AuthButton />
            </Suspense>
          </div>
        </nav>

        <div className="w-full flex flex-col items-center">
          {user ? (
            <div className="w-full max-w-5xl p-5 py-20 flex flex-col gap-20">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Bienvenido de nuevo</h2>
                <p className="text-gray-500 dark:text-gray-400">¿Qué enlace vamos a acortar hoy?</p>
              </div>
              <ShortenForm />
            </div>
          ) : (
            <LandingPage />
          )}
        </div>

        <footer className="w-full flex flex-col md:flex-row items-center justify-between max-w-7xl border-t mx-auto text-center text-xs gap-8 py-10 px-5 mt-20">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href={'/'} className="flex items-center gap-2">
              <img src="/logo.png" alt="URLShot Logo" className="h-6 w-auto" />
              <span className="text-lg font-black tracking-tighter text-blue-600">URLShot</span>
            </Link>
            <p className="text-gray-500">© {new Date().getFullYear()} Todos los derechos reservados.</p>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-gray-600 dark:text-gray-400">
              Desarrollado por{' '}
              <a href="https://siendomiguel.com" target="_blank" className="font-bold hover:text-blue-600 transition-colors" rel="noreferrer">
                Miguel Lares
              </a>
            </p>
            <ThemeSwitcher />
          </div>
        </footer>
      </div>
    </main>
  );
}
