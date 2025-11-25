import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
  }

  // Получаем параметры из query string
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'login'; // 'login' или 'register'
  const locale = searchParams.get('locale') || 'ru';
  
  // Генерируем state для защиты от CSRF
  const state = Buffer.from(JSON.stringify({ action, locale })).toString('base64');
  
  // Параметры для OAuth запроса
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state: state,
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  
  return NextResponse.redirect(authUrl);
}

