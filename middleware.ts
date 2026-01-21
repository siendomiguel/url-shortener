import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow public access to shortened URL routes
  if (request.nextUrl.pathname.match(/^\/[a-zA-Z0-9]+$/)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};