// Конфигурация API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Вспомогательная функция для создания полного URL
export const getApiUrl = (path: string): string => {
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${apiPath}`;
};

