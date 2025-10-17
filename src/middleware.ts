import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Determine the variant
  const variant = hostname.includes('tigeryt.com') ? 'tiger' : 'tim';

  // Rewrite the URL to include the variant, e.g., /projects -> /tim/projects
  const newUrl = new URL(`/${variant}${request.nextUrl.pathname}`, request.url);
  
  return NextResponse.rewrite(newUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - any path that includes a file extension (e.g., .svg, .png, .ico)
     */
    '/((?!api|_next/static|_next/image|studio|.*\\..*).*)'
  ]
};