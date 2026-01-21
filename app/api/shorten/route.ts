import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { original_url } = await request.json();

  if (!original_url || typeof original_url !== 'string') {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  // Validate URL
  try {
    new URL(original_url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  // Generate unique short code
  let short_code;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    short_code = nanoid(6); // 6 character codes
    const { data } = await supabase
      .from('urls')
      .select('id')
      .eq('short_code', short_code)
      .single();
    isUnique = !data;
    attempts++;
  }

  if (!isUnique) {
    return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
  }

  // Insert into database
  const { data, error } = await supabase
    .from('urls')
    .insert({
      user_id: user.id,
      original_url,
      short_code,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  // Return the short URL
  const short_url = `${request.nextUrl.origin}/${short_code}`;

  return NextResponse.json({ short_url, short_code });
}