import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // 1. Direct API, CDN routes & static assets pass through untouched
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/hosted-fonts') ||
    pathname === '/css2' ||
    pathname === '/hosted-fonts-manifest'
  ) {
    return NextResponse.next();
  }

  // 2. Fonts subdomains (fonts.timchinye.com, fonts.tigerfolio.com)
  // Root path (/) rewrites to catalog; other paths pass through to allow 404 handling
  if (hostname.startsWith('fonts.')) {
    if (pathname === '/' || pathname === '') {
      return NextResponse.rewrite(new URL('/fonts', request.url));
    }
    return NextResponse.next();
  }

  // 3. Local preview of the catalog (must pass through to avoid a rewrite loop)
  if (pathname === '/fonts') {
    return NextResponse.next();
  }

  // 4. Regular dual-identity portfolio variant routing
  let variant = hostname.includes('timchinye.com') ? 'tim' : 'tiger';
  if (hostname.includes('localhost')) variant = 'tim';

  const newUrl = new URL(`/${variant}${pathname}`, request.url);

  return NextResponse.rewrite(newUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|otf)$).*)',
  ],
};