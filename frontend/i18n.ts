import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { routing } from './src/routing';
// Статические импорты сообщений для надежной загрузки
import ruMessages from './messages/ru.json';
import enMessages from './messages/en.json';

// Маппинг доменов на языки
export const domainLocaleMap: Record<string, 'ru' | 'en'> = {
  // .ru домены - русский язык
  'localhost': 'ru', // для разработки
  // Английские домены
  'charityfond.online': 'en',
  'www.charityfond.online': 'en',
  'charityfond.ru': 'en',
  'www.charityfond.ru': 'en',
  'charityfond.store': 'en',
  'www.charityfond.store': 'en',
  // Русские домены (.рф) - кириллические версии
  'творцыдобра.рф': 'ru',
  'www.творцыдобра.рф': 'ru',
  'творецдобра.рф': 'ru',
  'www.творецдобра.рф': 'ru',
  'странадобра.рф': 'ru',
  'www.странадобра.рф': 'ru',
  'творцы-добра.рф': 'ru',
  'www.творцы-добра.рф': 'ru',
  'творец-добра.рф': 'ru',
  'www.творец-добра.рф': 'ru',
  'страна-добра.рф': 'ru',
  'www.страна-добра.рф': 'ru',
  // Русские домены (.рф) - Punycode версии (для браузеров)
  'xn--80abci3cbmdl7b3c.xn--p1ai': 'ru',
  'www.xn--80abci3cbmdl7b3c.xn--p1ai': 'ru',
  'xn--80abcie7ccnem2c.xn--p1ai': 'ru',
  'www.xn--80abcie7ccnem2c.xn--p1ai': 'ru',
  'xn--80aaado6cjlgcl.xn--p1ai': 'ru',
  'www.xn--80aaado6cjlgcl.xn--p1ai': 'ru',
  'xn----7sbaber4dlmhcm.xn--p1ai': 'ru',
  'www.xn----7sbaber4dlmhcm.xn--p1ai': 'ru',
  'xn----8sbccl2dcnem1c6c.xn--p1ai': 'ru',
  'www.xn----8sbccl2dcnem1c6c.xn--p1ai': 'ru',
  'xn----8sbccle6ddofn6c.xn--p1ai': 'ru',
  'www.xn----8sbccle6ddofn6c.xn--p1ai': 'ru',
};

// Поддерживаемые локали
export const locales = ['ru', 'en'] as const;
export type Locale = (typeof locales)[number];

// Язык по умолчанию
export const defaultLocale: Locale = 'ru';

// Функция для определения локали по домену.
// null означает «домен не закреплён за языком» — тогда язык берётся из URL.
export function getLocaleFromDomain(host: string): Locale | null {
  // Убираем порт если есть
  const domain = host.split(':')[0].toLowerCase();
  
  // Сначала проверяем точное совпадение (включая www)
  if (domainLocaleMap[domain]) {
    return domainLocaleMap[domain];
  }
  
  // Проверяем поддомены (например, www.charityfond.ru -> charityfond.ru)
  const domainWithoutWww = domain.replace(/^www\./, '');
  if (domainWithoutWww !== domain && domainLocaleMap[domainWithoutWww]) {
    return domainLocaleMap[domainWithoutWww];
  }
  
  // Проверяем Punycode домены (xn--...)
  if (domain.includes('xn--')) {
    // Это Punycode домен, проверяем по окончанию
    if (domain.endsWith('.xn--p1ai')) {
      return 'ru'; // Все .рф домены в Punycode
    }
  }
  
  // Проверяем по окончанию домена (только если нет точного совпадения)
  // НО: charityfond.ru должен быть 'en', поэтому проверяем окончание только для неизвестных доменов
  if (domain.endsWith('.рф')) {
    return 'ru';
  }
  
  // По умолчанию английский для остальных доменов (.online, .store)
  if (domain.endsWith('.online') || domain.endsWith('.store')) {
    return 'en';
  }
  
  // Для .ru доменов проверяем, есть ли они в маппинге
  // Если нет - по умолчанию русский
  if (domain.endsWith('.ru')) {
    return 'ru';
  }
  
  // Прочие хосты (previews, *.vercel.app, IP) за языком не закреплены
  return null;
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Получаем заголовки напрямую из Next.js
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  // Определяем локаль по домену
  const domainLocale = host ? getLocaleFromDomain(host) : null;
  
  // Приоритет: requestLocale из URL > домен > defaultLocale
  const requestedLocale = await requestLocale;
  let locale: Locale;
  
  // Если есть requestLocale из URL, используем его (это приоритет #1)
  if (requestedLocale && locales.includes(requestedLocale as Locale)) {
    locale = requestedLocale as Locale;
  } 
  // Если нет requestLocale, но есть домен, используем домен
  else if (domainLocale) {
    locale = domainLocale;
  } 
  // Иначе используем дефолтную локаль
  else {
    locale = defaultLocale;
  }
  
  // Валидация локали
  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }

  // Используем статические импорты вместо динамических для надежности
  const messages = locale === 'en' ? enMessages : ruMessages;

  return {
    locale,
    messages
  };
});

