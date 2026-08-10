import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bordro-saas-super-secret-jwt-key-turkiye-2026'
);

const PUBLIC_PATHS = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/guide'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, Next internals, and public api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register'))
  ) {
    return NextResponse.next();
  }

  // Check auth cookie
  const token = request.cookies.get('auth_session')?.value;

  let sessionUser: any = null;
  if (token) {
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      sessionUser = payload;
    } catch (e) {
      sessionUser = null;
    }
  }

  // If user is on landing page '/'
  if (pathname === '/') {
    return NextResponse.next();
  }

  // If accessing /login or /register with valid session -> Redirect to app
  if ((pathname === '/login' || pathname === '/register') && sessionUser) {
    const targetUrl = sessionUser.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!sessionUser) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (sessionUser.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect application routes
  const protectedPrefixes = [
    '/dashboard',
    '/employees',
    '/reports',
    '/payroll',
    '/monthly-data',
    '/backup',
    '/settings',
    '/setup-wizard',
  ];

  if (protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    if (!sessionUser) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect internal API routes (except auth login/register)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/login') && !pathname.startsWith('/api/auth/register')) {
    if (!sessionUser) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
