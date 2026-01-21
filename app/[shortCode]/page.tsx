import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

interface PageProps {
  params: Promise<{ shortCode: string }>;
}

export default async function ShortUrlPage({ params }: PageProps) {
  const { shortCode } = await params;

  // TEMP: Simple response to test if route is accessible
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1>Short code: {shortCode}</h1>
      <p>This is a test. If you see this without login, the route is public.</p>
    </div>
  );
}