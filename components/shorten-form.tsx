'use client';

import { useState, useEffect } from 'react';
import { Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export function ShortenForm() {
  const [url, setUrl] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleShorten = async () => {
    if (!url.trim()) return;

    // Prevent action if not logged in
    if (!user) {
      setError('Debes iniciar sesión o registrarte para acortar enlaces.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original_url: url.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setShortUrl(data.short_url);
        setUrl(''); // Clear input on success
      } else {
        setError(data.error || 'Ocurrió un error al acortar la URL.');
      }
    } catch (err) {
      setError('Error de conexión. Por favor, revisa tu internet.');
    }
    setLoading(false);
  };

  return (
    <div className="  from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Header with pointing hands */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="text-4xl transform -scale-x-100">👉</span>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
            Crea un Link Corto
          </h1>
          <span className="text-4xl">👈</span>
        </div>

        {/* Subtitle */}
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-md mx-auto">
          URL Shortener es una herramienta personalizada que te permite gestionar, medir e impulsar tus enlaces. ¡Empieza gratis registrándote hoy!
        </p>

        {/* Input and Button */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 p-2 mb-4">
          <div className="flex items-center gap-2 flex-1 px-4">
            <Link className="w-5 h-5 text-blue-500" />
            <Input
              type="url"
              placeholder="¡Pega un enlace para acortarlo!"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent"
            />
          </div>
          <Button
            onClick={handleShorten}
            disabled={loading}
            className="rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2 h-10">
            {loading ? 'Acortando...' : 'Acortar'}
          </Button>
        </div>

        {shortUrl && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
            <p className="text-green-800 dark:text-green-200 font-semibold text-lg">¡Enlace acortado con éxito!</p>
            <p className="text-blue-600 dark:text-blue-400 font-mono mt-2 break-all text-xl">{shortUrl}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* See Analytics Link */}
        {!user && (
          <div className="flex flex-col items-center gap-2 mb-8">
            <p className="text-amber-600 dark:text-amber-500 font-semibold text-sm">
              ⚠️ Registrate o inicia sesión para crear enlaces y ver estadísticas
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-6" />

        {/* Features */}
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Úsalo, es Gratis...Rápido - Seguro - Enlaces Duraderos
        </p>

        {/* Link Icon */}
        <div className="flex justify-center">
          <div className="text-blue-500 dark:text-blue-400">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
