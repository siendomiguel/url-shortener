import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

interface PageProps {
  params: Promise<{ shortCode: string }>;
}

export default async function ShortUrlPage({ params }: PageProps) {
  // Temporary debug: return simple text
  return <div>Short code: {(await params).shortCode} - DB access test</div>;

  // Original code commented
  /*
  const { shortCode } = await params;
  const supabase = await createClient();

  // Lookup the URL
  const { data: url, error } = await supabase
    .from('urls')
    .select('id, original_url')
    .eq('short_code', shortCode)
    .single();

  if (error || !url) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1>404 - Short URL not found</h1>
      </div>
    );
  }

  // Log the click
  const headersList = await headers();

  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
  const userAgent = headersList.get('user-agent') || '';
  const referrer = headersList.get('referer') || '';

  await supabase.from('clicks').insert({
    url_id: url.id,
    ip_address: ip,
    user_agent: userAgent,
    referrer: referrer,
  });

  // Redirect to original URL
  redirect(url.original_url);
  */
}

  // Log the click
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
  const userAgent = headersList.get('user-agent') || '';
  const referrer = headersList.get('referer') || '';

  await supabase.from('clicks').insert({
    url_id: urlData.id,
    ip_address: ip,
    user_agent: userAgent,
    referrer: referrer,
  });

  // Redirect to original URL
  redirect(urlData.original_url);
}