import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/src/routing';
import { Metadata } from 'next';
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
    <ErrorBoundary>
      <NextIntlClientProvider messages={messages}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </NextIntlClientProvider>
    </ErrorBoundary>
  );
}

