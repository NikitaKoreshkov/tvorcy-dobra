import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;
  
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Если пользователь отменил авторизацию
  if (error) {
    const locale = state ? JSON.parse(Buffer.from(state, 'base64').toString()).locale || 'ru' : 'ru';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Авторизация отменена</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.close();
            } else {
              window.location.href = '/${locale}/login?error=access_denied';
            }
          </script>
          <p>Авторизация отменена. Окно закроется автоматически...</p>
        </body>
      </html>
    `;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  }

  if (!code) {
    const locale = state ? JSON.parse(Buffer.from(state, 'base64').toString()).locale || 'ru' : 'ru';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ошибка авторизации</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.close();
            } else {
              window.location.href = '/${locale}/login?error=no_code';
            }
          </script>
          <p>Ошибка получения кода. Окно закроется автоматически...</p>
        </body>
      </html>
    `;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  }

  try {
    // Декодируем state
    const stateData = state ? JSON.parse(Buffer.from(state, 'base64').toString()) : { action: 'login', locale: 'ru' };
    const { action, locale } = stateData;

    // Обмениваем код на токен
    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.id_token) {
      throw new Error('No ID token received');
    }

    // Получаем информацию о пользователе
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    // Здесь вы можете сохранить пользователя в базу данных
    // TODO: Сохранить пользователя в БД через backend API
    
    const userData = {
      email: payload.email,
      name: payload.name || payload.email?.split('@')[0] || 'User',
      picture: payload.picture,
      googleId: payload.sub,
    };

    if (!userData.email || !userData.googleId) {
      throw new Error('Missing required user data');
    }

    // Вызываем backend API для регистрации/входа
    try {
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: userData.googleId,
          email: userData.email,
          name: userData.name,
        }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.message || 'Ошибка авторизации через Google');
      }

      const authData = await backendResponse.json();

      // Если это popup окно, закрываем его и отправляем сообщение родительскому окну
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Авторизация успешна</title>
          </head>
          <body>
            <script>
              // Сохраняем токен в localStorage родительского окна
              if (window.opener) {
                window.opener.localStorage.setItem('accessToken', '${authData.accessToken}');
                // Триггерим событие для обновления хука useAuth в родительском окне
                window.opener.dispatchEvent(new Event('authStateChanged'));
                // Закрываем popup
                window.close();
                // Перенаправляем родительское окно на профиль
                window.opener.location.href = '/${locale}/profile?token=${authData.accessToken}';
              } else {
                // Если popup уже закрыт, перенаправляем текущее окно
                window.location.href = '/${locale}/profile?token=${authData.accessToken}';
              }
            </script>
            <p>Авторизация успешна. Окно закроется автоматически...</p>
          </body>
        </html>
      `;

      const response = new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });

      response.cookies.set('accessToken', authData.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 дней
      });

      return response;
    } catch (apiError: any) {
      console.error('Backend API error:', apiError);
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ошибка авторизации</title>
          </head>
          <body>
            <script>
              if (window.opener) {
                window.close();
                window.opener.location.href = '/${locale}/${action === 'register' ? 'register' : 'login'}?error=oauth_failed';
              } else {
                window.location.href = '/${locale}/${action === 'register' ? 'register' : 'login'}?error=oauth_failed';
              }
            </script>
            <p>Ошибка авторизации. Окно закроется автоматически...</p>
          </body>
        </html>
      `;
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
    }
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    const locale = state ? JSON.parse(Buffer.from(state, 'base64').toString()).locale || 'ru' : 'ru';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ошибка авторизации</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.close();
              window.opener.location.href = '/${locale}/login?error=oauth_failed';
            } else {
              window.location.href = '/${locale}/login?error=oauth_failed';
            }
          </script>
          <p>Ошибка авторизации. Окно закроется автоматически...</p>
        </body>
      </html>
    `;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  }
}

