import { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
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
  return children;
}
