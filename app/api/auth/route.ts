import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const APP_PASSWORD = process.env.APP_PASSWORD || '145323';

  if (password === APP_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set('matbaa_auth', APP_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: '/',
    });
    return res;
  }

  return NextResponse.json({ error: 'Yanlış şifre' }, { status: 401 });
}
