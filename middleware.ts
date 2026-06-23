import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['en', 'ja', 'ko'],
  defaultLocale: 'en',
  localeDetection: true,
})

export function middleware(request: NextRequest) {
  // www -> non-www canonical redirect (fixes Firebase Auth unauthorized-domain)
  const host = request.headers.get('host') || ''
  if (host.startsWith('www.')) {
    const url = request.nextUrl.clone()
    url.host = host.slice(4)
    url.port = ''
    return NextResponse.redirect(url, { status: 301 })
  }

  const pathname = request.nextUrl.pathname

  // Skip for dashboard, admin, api routes
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\..*).*)'],
}
