import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/src/routing';
import { Metadata } from 'next';
import { fontVariables, inter } from '@/src/fonts';
import { ClientProviders } from '../ClientProviders';
import { ErrorBoundary } from '../ErrorBoundary';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === 'ru';
  
  return {
    title: {
      default: isRu ? 'ТворцыДобра' : 'The creators of Good',
      template: isRu ? '%s | ТворцыДобра' : '%s | The creators of Good',
    },
    description: isRu 
      ? 'Платформа для благотворительности и помощи нуждающимся. Поддержите проекты, которые меняют мир к лучшему.'
      : 'Platform for charity and helping those in need. Support projects that make the world a better place.',
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'ru': '/ru',
        'en': '/en',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={fontVariables}>
      <head>
        <link rel="icon" href="/images/121.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/121.png" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;

                // Глобальный обработчик ошибок для webpack
                window.addEventListener('error', function(event) {
                  if (event.message && event.message.includes('Cannot read properties of undefined') && event.message.includes('reading \\'call\\'')) {
                    console.warn('Webpack module load error detected, reloading...');
                    event.preventDefault();
                    setTimeout(function() {
                      window.location.reload();
                    }, 100);
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(event) {
                  const error = event.reason;
                  if (error && (error.message && error.message.includes('Cannot read properties of undefined') ||
                               error.toString && error.toString().includes('Cannot read properties of undefined'))) {
                    console.warn('Unhandled promise rejection (webpack error), reloading...');
                    event.preventDefault();
                    setTimeout(function() {
                      window.location.reload();
                    }, 100);
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <NextIntlClientProvider messages={messages}>
            <ClientProviders>
              {children}
            </ClientProviders>
          </NextIntlClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
