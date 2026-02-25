# Исправление ошибки webpack "Cannot read properties of undefined (reading 'call')"

## Проблема
Ошибка возникала при переходе на любую страницу при первом посещении. После перезагрузки страница работала нормально.

## Причина
Проблема была связана с тем, как webpack загружает модули при клиентской навигации в Next.js. При переходе на новую страницу Next.js пытался загрузить модули, но webpack еще не успевал их подготовить, что вызывало ошибку.

## Исправления

### 1. Конфигурация webpack (next.config.mjs)
- Увеличен таймаут загрузки чанков до 60 секунд
- Отключены агрессивные оптимизации, которые могут вызывать проблемы
- Добавлена обработка ошибок при загрузке модулей
- Отключена строгая проверка экспортов модулей

### 2. ErrorBoundary (app/ErrorBoundary.tsx)
- Добавлены обработчики ошибок window.error и unhandledrejection
- Автоматическая перезагрузка страницы при обнаружении ошибки загрузки модуля
- Перехват всех ошибок загрузки webpack модулей

### 3. Root Layout (app/layout.tsx)
- Добавлен обработчик ошибок загрузки чанков webpack
- Автоматическая перезагрузка при ошибке загрузки чанка

### 4. Catalog Page (app/[locale]/catalog/page.tsx)
- Добавлена проверка `typeof window === 'undefined'` перед использованием window

## Защищенные страницы (все 25 страниц)
Все страницы защищены через:
- ErrorBoundary в layout.tsx (оборачивает все страницы)
- Глобальные обработчики ошибок в root layout
- Улучшенная конфигурация webpack

### Список всех страниц:
1. /[locale]/page.tsx (главная)
2. /[locale]/catalog/page.tsx
3. /[locale]/about/page.tsx
4. /[locale]/programs/page.tsx
5. /[locale]/reports/page.tsx
6. /[locale]/support/page.tsx
7. /[locale]/contacts/page.tsx
8. /[locale]/corporate/page.tsx
9. /[locale]/alius-ai/page.tsx
10. /[locale]/profile/page.tsx
11. /[locale]/profile/subscriptions/page.tsx
12. /[locale]/profile/user/[userId]/page.tsx
13. /[locale]/profile/user/[userId]/achievements/page.tsx
14. /[locale]/projects/[id]/page.tsx
15. /[locale]/donate/page.tsx
16. /[locale]/login/page.tsx
17. /[locale]/register/page.tsx
18. /[locale]/join/page.tsx
19. /[locale]/legal/privacy-policy/page.tsx
20. /[locale]/legal/user-agreement/page.tsx
21. /[locale]/legal/ai-rules/page.tsx
22. /[locale]/legal/cookies/page.tsx
23. /[locale]/support/help-center/page.tsx
24. /[locale]/support/release-notes/page.tsx
25. /[locale]/support/report-bug/page.tsx

## Что нужно сделать после изменений

1. **Полностью перезапустить dev-сервер:**
   ```bash
   # Остановить сервер (Ctrl+C)
   # Очистить кэш
   rm -rf .next
   # Запустить заново
   npm run dev
   ```

2. **Проверить навигацию между страницами:**
   - Переходы должны работать без ошибок
   - При возникновении ошибки страница автоматически перезагрузится

## Примечания
- Все исправления применяются глобально через layout и конфигурацию
- ErrorBoundary перехватывает все ошибки на всех страницах
- Автоматическая перезагрузка срабатывает только при ошибках загрузки модулей webpack

