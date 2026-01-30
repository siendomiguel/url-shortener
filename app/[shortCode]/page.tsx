import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { GeolocationService } from '@/lib/services/geolocation.service';
import { parseLanguage, parseUserAgent } from '@/lib/utils/headers-parser';

interface PageProps {
  params: Promise<{ shortCode: string }>;
}

export default async function ShortUrlPage({ params }: PageProps) {
  const { shortCode } = await params;
  const supabase = await createClient();
  const headersList = await headers();

  // Lookup the URL
  const { data: urlData, error } = await supabase
    .from('urls')
    .select('id, original_url')
    .eq('short_code', shortCode)
    .single();

  if (error || !urlData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl">404 - Short URL not found</h1>
        <p>Short code: {shortCode}</p>
        {error && <p>Error: {error.message}</p>}
      </div>
    );
  }

  // Log the click
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || 'unknown';
  const userAgent = headersList.get('user-agent') || '';
  const referrer = headersList.get('referer') || '';
  const acceptLanguage = headersList.get('accept-language');

  // Parse headers
  const { browser, os, deviceType } = parseUserAgent(userAgent);
  const language = parseLanguage(acceptLanguage);

  // Get country and details using GeolocationService
  const location = await GeolocationService.getGeolocation(ip);

  await supabase.from('clicks').insert({
    url_id: urlData.id,
    ip_address: ip,
    user_agent: userAgent,
    referrer: referrer,
    country: location.country,
    city: location.city,
    isp: location.isp,
    timezone: location.timezone,
    language: language,
    browser: browser,
    os: os,
    device_type: deviceType,
  });

  // Redirect to original URL
  redirect(urlData.original_url);
}