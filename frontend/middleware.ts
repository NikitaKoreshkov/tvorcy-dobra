import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, getLocaleFromDomain, type Locale } from './i18n';
import { routing } from './src/routing';

const intlMiddleware = createMiddleware(routing);

function getLocaleFromPath(pathname: string): Locale | null {
  const segment = pathname.split('/')[1] as Locale | undefined;
  return segment && (routing.locales as readonly string[]).includes(segment) ? segment : null;
}

export default function middleware(request: NextRequest) {
  const host = request.headers.get('host') || 'localhost';

  // Получаем текущий путь
  const { pathname } = request.nextUrl;

  // Домен задаёт язык, если он закреплён в map; иначе язык берётся из URL
  const locale = getLocaleFromDomain(host) ?? getLocaleFromPath(pathname) ?? defaultLocale;
  
  // Если путь уже содержит правильную локаль, пропускаем
  if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
    // Добавляем заголовок с локалью для getRequestConfig
    const response = intlMiddleware(request);
    // Устанавливаем заголовок x-locale с локалью из домена
    response.headers.set('x-locale', locale);
    return response;
  }
  
  // Если путь начинается с другой локали, редиректим на правильную (из домена)
  const otherLocales = ['ru', 'en'].filter(l => l !== locale);
  for (const otherLocale of otherLocales) {
    if (pathname.startsWith(`/${otherLocale}/`) || pathname === `/${otherLocale}`) {
      // Редиректим на локаль из домена
      const newPath = pathname.replace(`/${otherLocale}`, `/${locale}`);
      const newUrl = new URL(newPath, request.url);
      const redirectResponse = NextResponse.redirect(newUrl);
      // Устанавливаем заголовок для следующего запроса
      redirectResponse.headers.set('x-locale', locale);
      return redirectResponse;
    }
  }
  
  // Если путь без локали, добавляем правильную локаль (из домена)
  const newPath = `/${locale}${pathname === '/' ? '' : pathname}`;
  const newUrl = new URL(newPath, request.url);
  const redirectResponse = NextResponse.redirect(newUrl);
  // Устанавливаем заголовок для следующего запроса
  redirectResponse.headers.set('x-locale', locale);
  return redirectResponse;
}

export const config = {
  // Матчим все пути кроме статических файлов и API
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

