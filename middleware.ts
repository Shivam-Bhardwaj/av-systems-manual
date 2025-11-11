import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'hi'];

// Get the preferred locale, similar to above logic
function getLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get('accept-language') ?? 'en';
  const preferredLocale = acceptLanguage.split(',').map(lang => lang.split(';')[0])[0];
  return locales.includes(preferredLocale) ? preferredLocale : 'en';
}

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect if there is no locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  // e.g. incoming request is /products
  // The new URL is now /en-US/products
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
};
