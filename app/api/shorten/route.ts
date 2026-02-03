import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado. Por favor, inicia sesión.' }, { status: 401 });
  }

  const { original_url } = await request.json();

  if (!original_url || typeof original_url !== 'string') {
    return NextResponse.json({ error: 'URL no válida.' }, { status: 400 });
  }

  // 1. Rate Limiting: Max 5 links per minute
  const oneMinuteAgo = new URLSearchParams();
  const date = new Date();
  date.setSeconds(date.getSeconds() - 60);

  const { count, error: countError } = await supabase
    .from('urls')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gt('created_at', date.toISOString());

  if (countError) {
    console.error('Error counting links:', countError);
  } else if (count !== null && count >= 5) {
    return NextResponse.json({
      error: 'Has alcanzado el límite de 5 enlaces por minuto. Por favor, espera un poco antes de crear más.'
    }, { status: 429 });
  }

  // 2. Validate URL and Protocol
  try {
    const parsedUrl = new URL(original_url);

    // Only allow http and https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({
        error: 'Protocolo no permitido. Solo se aceptan enlaces http:// o https:// para mayor seguridad.'
      }, { status: 400 });
    }
  } catch {
    return NextResponse.json({
      error: 'Formato de URL no válido. Asegúrate de incluir el protocolo (http:// o https://).\n\nEjemplos válidos:\n- https://google.com\n- http://mi-sitio.com/pagina\n- https://facebook.com/u/perfil'
    }, { status: 400 });
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
      .maybeSingle(); // Use maybeSingle to avoid 406 errors if not found
    isUnique = !data;
    attempts++;
  }

  if (!isUnique) {
    return NextResponse.json({ error: 'No se pudo generar un código único. Inténtalo de nuevo.' }, { status: 500 });
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
    return NextResponse.json({ error: 'Error al guardar en la base de datos.' }, { status: 500 });
  }

  // Return the short URL
  const short_url = `${request.nextUrl.origin}/${short_code}`;

  return NextResponse.json({ short_url, short_code });
}