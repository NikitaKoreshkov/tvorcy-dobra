# Frontend - Donate Website

Next.js приложение с поддержкой мультиязычности на основе доменов.

## Особенности

- **Мультиязычность**: Автоматическое определение языка по домену
  - `.ru` домены → русский язык
  - Остальные домены → английский язык
- **Технологии**: Next.js 14, TypeScript, Tailwind CSS, next-intl

## Настройка доменов

Домены настраиваются в файле `i18n.ts` в объекте `domainLocaleMap`:

```typescript
export const domainLocaleMap: Record<string, 'ru' | 'en'> = {
  'localhost': 'ru', // для разработки
  'donate.ru': 'ru',
  'www.donate.ru': 'ru',
  'donate.com': 'en',
  'www.donate.com': 'en',
  // ... добавьте свои домены
};
```

## Использование переводов

В компонентах используйте хуки из `next-intl`:

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('common');
  return <h1>{t('welcome')}</h1>;
}
```

## Структура переводов

Переводы хранятся в папке `messages/`:
- `messages/ru.json` - русские переводы
- `messages/en.json` - английские переводы

## Запуск

```bash
npm install
npm run dev
```

Приложение будет доступно на http://localhost:3000 (русский язык по умолчанию для localhost)

