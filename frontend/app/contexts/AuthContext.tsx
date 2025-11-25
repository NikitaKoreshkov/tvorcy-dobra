'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { getApiUrl } from '@/src/config';

interface User {
  id: string;
  email: string;
  name: string | null;
  profileAvatar?: string | null;
  hasSeenTutorial?: boolean;
  hasBiometric?: boolean;
  subscription?: {
    id: string;
    planName: string;
    planType: string;
    status: string;
  } | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => void;
  markTutorialSeen: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // На сервере isLoading должен быть false, чтобы не блокировать SSR
  // На клиенте тоже начинаем с false, чтобы не блокировать рендеринг главной страницы
  // Загрузка будет происходить асинхронно в фоне
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const isFetchingRef = useRef(false);
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const MIN_FETCH_INTERVAL = 1000; // Минимум 1 секунда между запросами

  const fetchUser = useCallback(async (): Promise<void> => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') {
      setIsLoading(false);
      setHasInitialized(true);
      return;
    }

    // Если уже идет запрос, возвращаем существующий промис
    if (isFetchingRef.current && fetchPromiseRef.current) {
      return fetchPromiseRef.current;
    }

    // Проверяем, прошло ли достаточно времени с последнего запроса
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (timeSinceLastFetch < MIN_FETCH_INTERVAL && lastFetchTimeRef.current > 0) {
      console.log(`⏸️ Rate limit: Skipping token verification, only ${timeSinceLastFetch}ms since last request`);
      return;
    }

    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      setHasInitialized(true);
      return;
    }

    lastFetchTimeRef.current = now;
    console.log('🔐 Verifying token...');

    isFetchingRef.current = true;
    // НЕ устанавливаем isLoading в true, чтобы не блокировать интерфейс
    // Загрузка происходит в фоне
    // setIsLoading(true);

    const fetchPromise = (async () => {
      try {
        // Загружаем данные пользователя с таймаутом
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд таймаут
        
        const res = await fetch(getApiUrl('/auth/verify-token'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!res.ok) {
          if (res.status === 401) {
            // Токен невалидный или истек
            if (typeof window !== 'undefined') {
              localStorage.removeItem('accessToken');
            }
            setUser(null);
            setIsLoading(false);
            setHasInitialized(true);
            isFetchingRef.current = false;
            fetchPromiseRef.current = null;
            return;
          }
          // Для 429 (Too Many Requests) не удаляем токен, просто не обновляем данные
          if (res.status === 429) {
            console.warn('⚠️ Rate limit exceeded: Too many authentication requests. Please wait a moment and try again.');
            setIsLoading(false);
            setHasInitialized(true);
            isFetchingRef.current = false;
            fetchPromiseRef.current = null;
            return;
          }
          throw new Error('Failed to verify token');
        }

        const data = await res.json();
        if (data.success && data.user) {
          console.log('User data updated in AuthContext:', {
            id: data.user.id,
            name: data.user.name,
            hasAvatar: !!data.user.profileAvatar,
            avatarLength: data.user.profileAvatar?.length || 0
          });
          setUser(data.user);
        } else {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
          }
          setUser(null);
        }
        setHasInitialized(true);
      } catch (error) {
        console.error('Error verifying token:', error);
        // При ошибке сети или таймауте не удаляем токен, возможно просто проблема с соединением
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.warn('Backend server is not available or request timed out');
          // Не удаляем токен при ошибке сети - возможно бэкенд просто не запущен или медленный
          // НЕ устанавливаем user в null, чтобы не блокировать интерфейс
          // Просто оставляем текущее состояние пользователя
        } else if (error instanceof Error && error.name === 'AbortError') {
          console.warn('Request timeout: Backend did not respond in time');
          // Не удаляем токен при таймауте - возможно просто медленный ответ
          // НЕ устанавливаем user в null, чтобы не блокировать интерфейс
        } else {
          // Для других ошибок тоже не блокируем интерфейс
          console.warn('Token verification failed, but keeping current state to avoid blocking UI');
        }
        // Удаляем только если это явная ошибка авторизации
        if (error instanceof Error && error.message.includes('401')) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
          }
          setUser(null);
        } else {
          // Для других ошибок не меняем состояние пользователя, чтобы не блокировать интерфейс
          // Просто оставляем текущее состояние
        }
        setHasInitialized(true);
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
        isFetchingRef.current = false;
        fetchPromiseRef.current = null;
      }
    })();

    fetchPromiseRef.current = fetchPromise;
    return fetchPromise;
  }, []);

  const refreshAuth = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      // Триггерим событие для обновления в других компонентах
      window.dispatchEvent(new Event('authStateChanged'));
    }
    setUser(null);
    setIsLoading(false);
  }, []);

  const markTutorialSeen = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch(getApiUrl('/auth/mark-tutorial-seen'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error('Error marking tutorial as seen:', error);
    }
  }, []);

  useEffect(() => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') {
      return;
    }

    // Загружаем данные при монтировании
    // Добавляем таймаут для инициализации, чтобы не блокировать интерфейс
    const initTimeout = setTimeout(() => {
      if (!hasInitialized) {
        console.warn('Auth initialization timeout - setting isLoading to false to avoid blocking UI');
        setIsLoading(false);
        setHasInitialized(true);
      }
    }, 5000); // 5 секунд максимум на инициализацию

    fetchUser().finally(() => {
      clearTimeout(initTimeout);
    });

    let debounceTimer: NodeJS.Timeout | null = null;

    // Слушаем изменения в localStorage (для обновления при логине/логауте в других вкладках)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
        fetchUser();
        }, 300);
      }
    };

    // Слушаем кастомное событие для обновления при логине в той же вкладке
    const handleCustomStorageChange = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
      fetchUser();
      }, 300);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleCustomStorageChange);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleCustomStorageChange);
    };
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        refreshAuth,
        logout,
        markTutorialSeen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

