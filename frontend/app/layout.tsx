import { ReactNode } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-playfair',
  preload: true,
  fallback: ['Georgia', 'serif'],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'ТворцыДобра',
    template: '%s | ТворцыДобра',
  },
  description: 'Платформа для благотворительности и помощи нуждающимся. Поддержите проекты, которые меняют мир к лучшему.',
  keywords: ['благотворительность', 'помощь', 'донаты', 'charity', 'donate'],
  authors: [{ name: 'ТворцыДобра' }],
  creator: 'ТворцыДобра',
  publisher: 'ТворцыДобра',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    alternateLocale: 'en_US',
    siteName: 'ТворцыДобра',
    title: 'ТворцыДобра',
    description: 'Платформа для благотворительности и помощи нуждающимся',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ТворцыДобра',
    description: 'Платформа для благотворительности и помощи нуждающимся',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Добавьте ваши ключи верификации при необходимости
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html suppressHydrationWarning className={`${inter.variable} ${playfairDisplay.variable}`}>
      <head>
        <link rel="icon" href="/images/121.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/121.png" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined' && typeof document !== 'undefined') {
                  const path = window.location.pathname;
                  const localeRegex = new RegExp('^/(ru|en)');
                  const localeMatch = path.match(localeRegex);
                  if (localeMatch) {
                    document.documentElement.lang = localeMatch[1];
                  } else {
                    document.documentElement.lang = 'ru';
                  }
                  
                  // Глобальный обработчик ошибок для webpack
                  window.addEventListener('error', function(event) {
                    if (event.message && event.message.includes('Cannot read properties of undefined') && event.message.includes('reading \'call\'')) {
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
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
