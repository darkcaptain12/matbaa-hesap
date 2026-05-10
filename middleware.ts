import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'matbaa_auth';
const LOGIN_PATH = '/login';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login sayfası ve statik dosyalar kontrol dışı
  if (pathname === LOGIN_PATH || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  const auth = req.cookies.get(AUTH_COOKIE)?.value;
  if (auth === process.env.APP_PASSWORD) {
    return NextResponse.next();
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = LOGIN_PATH;
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
