import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const isFontsSubdomain = hostname.startsWith('fonts.');
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  // 1. Static assets, API endpoints, CDN files, and internal 404 rewrite MUST pass through directly
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/tstatic') ||
    pathname === '/css2' ||
    pathname === '/hosted-fonts-manifest' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/_not-found'
  ) {
    return NextResponse.next();
  }

  // 2. FONTS SUBDOMAIN (fonts.localhost:3000, fonts.timchinye.com, fonts.tigerfolio.com)
  if (isFontsSubdomain) {
    // Only the exact root path renders the Fonts Catalog
    if (pathname === '/' || pathname === '') {
      return NextResponse.rewrite(new URL('/fonts', request.url));
    }

    // Any other path on fonts.* (e.g. /fonts, /css3, /random) triggers 404
    return NextResponse.rewrite(new URL('/_not-found', request.url));
  }

  // 3. ROOT DOMAIN (timchinye.com, tigerfolio.com, localhost:3000)
  // Direct user navigation to /fonts on the main domain is forbidden -> 404
  if (pathname === '/fonts' || pathname.startsWith('/fonts/')) {
    return NextResponse.rewrite(new URL('/_not-found', request.url));
  }

  // 4. Regular dual-identity portfolio variant routing
  let variant = hostname.includes('timchinye.com') ? 'tim' : 'tiger';
  if (isLocalhost) variant = 'tim';

  const newUrl = new URL(`/${variant}${pathname}`, request.url);
  return NextResponse.rewrite(newUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|otf)$).*)',
  ],
};