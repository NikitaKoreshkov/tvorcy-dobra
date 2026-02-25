'use client';

import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/src/routing';
import { useTranslations } from 'next-intl';
import { useSearchParams, useParams } from 'next/navigation';
import Image from 'next/image';
import { getApiUrl } from '@/src/config';
import { useAuth } from '../../contexts/AuthContext';


export default function LoginPage() {
  const t = useTranslations('auth');
  const tLogin = useTranslations('loginPage');
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const locale = (params?.locale as string) || 'ru';
  const [email, setEmail] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailShake, setEmailShake] = useState(false);
  const [passwordShake, setPasswordShake] = useState(false);

  const parseError = (error: any): { emailError: string | null; passwordError: string | null } => {
    const message = error.message || '';
    
    // Ошибки, связанные с email (некорректный email, email уже существует)
    if (message.includes('email') && (message.includes('некорректный') || message.includes('incorrect') || message.includes('уже существует') || message.includes('already exists') || message.includes('обязателен') || message.includes('required'))) {
      return { emailError: message, passwordError: null };
    }
    
    // Ошибки, связанные с паролем или общие ошибки входа (неверный email или пароль)
    // Оба инпута красные, но текст ошибки только под паролем
    if (message.includes('Неверный email или пароль') || message.includes('Incorrect email or password') || (message.includes('email') && message.includes('пароль')) || (message.includes('email') && message.includes('password')) || message.includes('пароль') || message.includes('password') || message.includes('Неверный') || message.includes('Incorrect')) {
      return { emailError: '', passwordError: message || tLogin('incorrectEmailOrPassword') };
    }
    
    // Ошибки блокировки - оба инпута красные, текст только под паролем
    if (message.includes('заблокирован') || message.includes('blocked') || message.includes('неактивен') || message.includes('inactive')) {
      return { emailError: '', passwordError: message || tLogin('accountBlocked') };
    }
    
    // Общие ошибки (активность, запросы) - оба инпута красные, текст только под паролем
    if (message.includes('активность') || message.includes('activity') || message.includes('запросов') || message.includes('requests') || message.includes('Too Many Requests') || message.includes('ThrottlerException') || message.includes('попробуйте позже') || message.includes('try again later')) {
      const errorText = message.includes('секунд') || message.includes('seconds')
        ? message 
        : (message.includes('запросов') || message.includes('requests') || message.includes('попробуйте позже') || message.includes('try again later') || message.includes('Too Many Requests') || message.includes('ThrottlerException'))
          ? tLogin('tooManyRequests')
          : message;
      return { emailError: '', passwordError: errorText };
    }
    
    // По умолчанию - оба инпута красные, текст только под паролем
    return { emailError: '', passwordError: message || tLogin('error') };
  };

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const emailParam = searchParams.get('email');
    
    if (success === 'true' && emailParam) {
      // Очищаем URL от параметров
      window.history.replaceState({}, '', `/${locale}/login`);
      // Перенаправляем на профиль
      router.push('/profile');
    }
    
    if (error) {
      const errorMessages: Record<string, string> = {
        'access_denied': tLogin('authorizationCancelled'),
        'no_code': tLogin('errorGettingCode'),
        'oauth_failed': tLogin('oauthFailed'),
      };
      const parsedError = parseError({ message: errorMessages[error] || tLogin('error') });
      setEmailError(parsedError.emailError);
      setPasswordError(parsedError.passwordError);
      window.history.replaceState({}, '', `/${locale}/login`);
    }
  }, [searchParams, locale]);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const parsedError = parseError({ message: data.message || t('loginError') });
        setEmailError(parsedError.emailError);
        setPasswordError(parsedError.passwordError);
        // Тряска для инпутов с ошибками
        if (parsedError.emailError !== null && parsedError.emailError !== undefined) {
          setEmailShake(true);
          setTimeout(() => setEmailShake(false), 500);
        }
        if (parsedError.passwordError) {
          setPasswordShake(true);
          setTimeout(() => setPasswordShake(false), 500);
        }
        return;
      }

      // Сохраняем токен
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        // Обновляем AuthContext и ждем завершения
        await refreshAuth();
      }

      // Перенаправляем сразу без сообщения
      router.push('/profile');
    } catch (error: any) {
      const parsedError = parseError(error);
      setEmailError(parsedError.emailError);
      setPasswordError(parsedError.passwordError);
      // Тряска для инпутов с ошибками
      if (parsedError.emailError !== null && parsedError.emailError !== undefined) {
        setEmailShake(true);
        setTimeout(() => setEmailShake(false), 500);
      }
      if (parsedError.passwordError) {
        setPasswordShake(true);
        setTimeout(() => setPasswordShake(false), 500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `/api/auth/google?action=login&locale=${locale}`;
  };
  
  const handleAliusAIRegister = () => {
    router.push('/alius-ai');
  };

  // Получаем или создаем уникальный ID пользователя для этого устройства
  const getOrCreateUserId = async (): Promise<string> => {
    const storageKey = 'webauthn_user_id';
    let userId = localStorage.getItem(storageKey);
    
    if (!userId) {
      // Генерируем уникальный ID на основе времени и случайных данных
      userId = 'user-' + Date.now() + '-' + crypto.getRandomValues(new Uint8Array(8)).join('');
      localStorage.setItem(storageKey, userId);
    }
    
    return userId;
  };

  const handleBiometricLogin = async () => {
    console.log('🔐 Biometric login started');
    setEmailError(null);
    setPasswordError(null);
    setIsLoading(true);

    try {
      // Проверяем поддержку WebAuthn
      if (!window.PublicKeyCredential) {
        console.error('❌ WebAuthn not supported');
        throw new Error('Ваш браузер не поддерживает биометрическую аутентификацию');
      }
      console.log('✅ WebAuthn supported');

      // Получаем challenge с сервера (для входа не требуется авторизация)
      console.log('📡 Requesting challenge...');
      const challengeResponse = await fetch(getApiUrl('/auth/biometric/login-challenge'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!challengeResponse.ok) {
        console.error(`❌ Challenge request failed: ${challengeResponse.status}`);
        throw new Error('Ошибка получения challenge');
      }

      const { challenge } = await challengeResponse.json();
      console.log('✅ Challenge received');

      // Получаем сохраненный credentialId из localStorage (если есть)
      const savedCredentialId = localStorage.getItem('biometric_credential_id');

      // Определяем rpId - должен совпадать с rpId, используемым при регистрации
      const hostname = window.location.hostname;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isPunycode = hostname.startsWith('xn--');
      
      // Определяем браузер
      const userAgent = navigator.userAgent;
      const isChrome = /Chrome/i.test(userAgent) && !/Edge|Edg|OPR/i.test(userAgent);
      const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
      
      console.log(`🌐 Hostname: ${hostname}`);
      console.log(`📱 Is mobile: ${isMobileDevice}`);
      console.log(`🔤 Is Punycode: ${isPunycode}`);
      console.log(`🌐 Browser: ${isChrome ? 'Chrome' : isSafari ? 'Safari' : 'Other'}`);
      
      // Используем ту же логику, что и при регистрации
      // Для Safari на мобильных с Punycode - используем обычный rpId (работает)
      // Для Chrome на мобильных с Punycode - НЕ указываем rpId (может не работать с указанным rpId)
      let rpId: string | undefined;
      if (isPunycode && isMobileDevice && isChrome) {
        // Для Chrome на мобильных с Punycode - НЕ указываем rpId
        rpId = undefined;
        console.log('💡 Chrome on mobile with Punycode - not specifying rpId, browser will determine');
      } else if (isMobileDevice && hostname.includes('.')) {
        const parts = hostname.split('.');
        rpId = parts.length > 2 ? parts.slice(-2).join('.') : hostname;
        if (isPunycode && isSafari) {
          console.log('💡 Safari on mobile with Punycode - using rpId (Safari supports it)');
        }
      } else {
        rpId = hostname.split('.').slice(-2).join('.');
      }
      
      console.log(`🌐 Using rpId: ${rpId || '(not specified - browser will determine)'}`);
      let credential: PublicKeyCredential | null = null;
      let userCancelled = false;

      try {
        // Формируем опции для get() - rpId указываем только если он определен
        const getOptions: any = {
          challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
          userVerification: 'preferred' as const,
          timeout: 60000,
        };
        
        // Указываем rpId только если он определен
        if (rpId) {
          getOptions.rpId = rpId;
        }
        
        if (savedCredentialId) {
          // Если есть сохраненный credentialId, используем его
          console.log('🔑 Using saved credential ID');
          const credentialIdArray = JSON.parse(savedCredentialId);
          getOptions.allowCredentials = [{
            id: Uint8Array.from(credentialIdArray),
            type: 'public-key',
          }];
          credential = await navigator.credentials.get({
            publicKey: getOptions,
          }) as PublicKeyCredential;
        } else {
          // Если нет сохраненного credentialId, пробуем получить credential без ограничений
          console.log('🔑 No saved credential, requesting all credentials');
          credential = await navigator.credentials.get({
            publicKey: getOptions,
          }) as PublicKeyCredential;
        }
        console.log('✅ Biometric credential obtained');
      } catch (getError: any) {
        console.error(`❌ Biometric authentication error: ${getError.name} - ${getError.message}`);
        
        // Проверяем, отменил ли пользователь или это другая ошибка
        if (getError.name === 'NotAllowedError' || getError.name === 'AbortError') {
          // Пользователь отменил биометрию - просто выходим без ошибки
          setIsLoading(false);
          return;
        } else if (getError.name === 'InvalidStateError' || getError.name === 'NotFoundError') {
          // Credential не найден - биометрия не привязана
          if (savedCredentialId) {
            localStorage.removeItem('biometric_credential_id');
          }
          throw new Error(tLogin('biometryNotLinked'));
        } else {
          // Другая ошибка
          throw new Error(tLogin('biometryError'));
        }
      }

      // Если credential не получен - показываем ошибку
      if (!credential) {
        throw new Error(tLogin('biometryNotLinked'));
      }

      // Отправляем данные на сервер для проверки
      console.log('📤 Sending biometric data to server...');
      const response = credential.response as AuthenticatorAssertionResponse;
      const credentialId = Array.from(new Uint8Array(credential.rawId));
      const authenticatorData = Array.from(new Uint8Array(response.authenticatorData));
      const clientDataJSON = Array.from(new Uint8Array(response.clientDataJSON));
      const signature = Array.from(new Uint8Array(response.signature));

      const loginResponse = await fetch(getApiUrl('/auth/biometric/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentialId,
          authenticatorData,
          clientDataJSON,
          signature,
          challenge,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.message || tLogin('biometryError'));
      }

      const result = await loginResponse.json();
      console.log('✅ Login successful');

      // Сохраняем токен (используем accessToken для совместимости с AuthContext)
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('biometric_credential_id', JSON.stringify(credentialId));

      // Обновляем AuthContext и ждем завершения
      console.log('🔄 Refreshing auth context...');
      await refreshAuth();
      console.log('✅ Auth context refreshed');

      // Перенаправляем на профиль
      console.log('➡️ Redirecting to profile...');
      router.push('/profile');
    } catch (error: any) {
      console.error('Biometric login error:', error);
      const parsedError = parseError(error);
      setEmailError(parsedError.emailError);
      setPasswordError(parsedError.passwordError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLoginOld = async () => {
    try {
      // Проверяем поддержку WebAuthn
      if (!window.PublicKeyCredential) {
        setPasswordError(tLogin('biometryNotSupported'));
        return;
      }

      // Проверяем доступность платформенного аутентификатора
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        setPasswordError(tLogin('biometryNotSupported'));
        return;
      }

      setEmailError(null);
      setPasswordError(null);

      // Генерируем challenge локально
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const challengeBase64 = btoa(String.fromCharCode(...challenge));
      const userId = await getOrCreateUserId();

      // Получаем правильный rpId (для localhost используем 'localhost', для других - hostname)
      const rpId = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'localhost' 
        : window.location.hostname;

      // Проверяем, есть ли сохраненный credentialId
      const savedCredentialId = localStorage.getItem('webauthn_credential_id');
      
      let credential: PublicKeyCredential | null = null;

      if (savedCredentialId) {
        // Пытаемся использовать существующий ключ с известным ID
        try {
          const credentialIdArray = JSON.parse(savedCredentialId);
          credential = await navigator.credentials.get({
            publicKey: {
              challenge: challenge,
              allowCredentials: [{
                id: Uint8Array.from(credentialIdArray),
                type: 'public-key',
                transports: ['internal'], // Только встроенный аутентификатор
              }],
              userVerification: 'required', // Обязательная биометрия
              rpId: rpId,
              timeout: 30000,
            },
          }) as PublicKeyCredential;
        } catch (getError: any) {
          // Если не удалось использовать ключ, создаем новый
          console.log('Key not found, creating new one:', getError);
          localStorage.removeItem('webauthn_credential_id');
        }
      }

      // Если ключа нет или не удалось его использовать, создаем новый
      if (!credential) {
        credential = await navigator.credentials.create({
          publicKey: {
            challenge: challenge,
            rp: {
              name: 'The creators of Good',
              id: rpId, // Используем правильный rpId
            },
            user: {
              id: new TextEncoder().encode(userId),
              name: userId,
              displayName: 'User',
            },
            pubKeyCredParams: [
              { alg: -7, type: 'public-key' }, // ES256
              { alg: -257, type: 'public-key' }, // RS256
            ],
            authenticatorSelection: {
              authenticatorAttachment: 'platform', // ТОЛЬКО встроенный аутентификатор устройства
              userVerification: 'required', // Обязательная биометрия
              residentKey: 'required', // Резидентный ключ хранится на устройстве
            },
            timeout: 30000,
            attestation: 'none',
            excludeCredentials: [], // Не исключаем никакие ключи
          },
        }) as PublicKeyCredential;
        
        // Сохраняем credentialId для последующих использований
        const credentialIdArray = Array.from(new Uint8Array(credential.rawId));
        localStorage.setItem('webauthn_credential_id', JSON.stringify(credentialIdArray));
      }

      if (!credential) {
        throw new Error(tLogin('authenticationCancelled'));
      }

      // Если это новая регистрация (create), просто сохраняем факт успешной аутентификации
      if (credential.response && 'attestationObject' in credential.response) {
        // Это новая регистрация - ключ создан на устройстве
        router.push('/');
        return;
      }

      // Если это вход (get) - проверяем на сервере
      const response = credential.response as AuthenticatorAssertionResponse;
      const authData = new Uint8Array(response.authenticatorData);
      const clientDataJSON = new Uint8Array(response.clientDataJSON);
      const signature = new Uint8Array(response.signature);
      const userHandle = response.userHandle ? new Uint8Array(response.userHandle) : null;

      const verifyResponse = await fetch(getApiUrl('/auth/webauthn/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentialId: Array.from(new Uint8Array(credential.rawId)),
          authenticatorData: Array.from(authData),
          clientDataJSON: Array.from(clientDataJSON),
          signature: Array.from(signature),
          userHandle: userHandle ? Array.from(userHandle) : null,
          challenge: challengeBase64,
        }),
      });

      if (!verifyResponse.ok) {
        // Если сервер недоступен, все равно разрешаем вход (ключ проверен устройством)
        router.push('/');
        return;
      }

      const result = await verifyResponse.json();
      
      // Перенаправляем на главную страницу
      router.push('/');

    } catch (error: any) {
      console.error('Biometric login error:', error);
      const parsedError = parseError(error);
      setEmailError(parsedError.emailError);
      setPasswordError(parsedError.passwordError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12 relative">
      {/* Logo */}
      <Link
        href="/"
        className="logo-link absolute top-6 left-6"
      >
        <span className="text-2xl font-bold tracking-tight">The creators of Good</span>
      </Link>
      
      <div className="w-full max-w-sm">
        {/* Title */}
        <h1 className="text-3xl font-semibold text-center text-black mb-8">
          {t('welcomeBack')}
        </h1>

        {/* Email Form */}
        <form onSubmit={handleContinue} className="mb-6">
          <div className="relative w-full max-w-[calc(100%-1rem)] mx-auto mb-4">
            <label
              htmlFor="email"
              className={`absolute left-5 transition-all duration-200 pointer-events-none z-10 ${
                email || isEmailFocused
                  ? isEmailFocused
                    ? `-top-2.5 text-xs bg-white px-2 ${emailError !== null && emailError !== undefined ? 'text-red-500' : 'text-black'}`
                    : `-top-2.5 text-xs bg-white px-2 ${emailError !== null && emailError !== undefined ? 'text-red-500' : 'text-gray-400'}`
                  : `top-1/2 -translate-y-1/2 text-base ${emailError !== null && emailError !== undefined ? 'text-red-500' : 'text-gray-400'}`
              }`}
            >
              {t('emailPlaceholder')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              className={`w-full px-5 py-3.5 rounded-full border text-base text-black focus:outline-none ${
                emailError !== null && emailError !== undefined ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-black'
              } ${emailShake ? 'input-error-shake' : ''}`}
              style={{ borderWidth: '1px' }}
              required
            />
            {emailError && emailError !== '' && (
              <p className="mt-1 text-sm text-red-600 px-5">{emailError}</p>
            )}
          </div>
          <div className="relative w-full max-w-[calc(100%-1rem)] mx-auto mb-4">
            <label
              htmlFor="password"
              className={`absolute left-5 transition-all duration-200 pointer-events-none z-10 ${
                password || isPasswordFocused || passwordError
                  ? isPasswordFocused
                    ? `-top-2.5 text-xs bg-white px-2 ${passwordError ? 'text-red-500' : 'text-black'}`
                    : `-top-2.5 text-xs bg-white px-2 ${passwordError ? 'text-red-500' : 'text-gray-400'}`
                  : `top-1/2 -translate-y-1/2 text-base ${passwordError ? 'text-red-500' : 'text-gray-400'}`
              }`}
            >
              {t('passwordPlaceholder')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(null);
                }}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className={`w-full px-5 py-3.5 pr-12 rounded-full border text-base text-black focus:outline-none ${
                  passwordError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-black'
                } ${passwordShake ? 'input-error-shake' : ''}`}
                style={{ borderWidth: '1px' }}
                required
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword(!showPassword);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 focus:outline-none"
              >
                <img
                  key={showPassword ? 'show' : 'hide'}
                  src={`${showPassword ? '/images/close.png' : '/images/open.png'}?v=${showPassword ? '1' : '0'}`}
                  alt={showPassword ? tLogin('hidePassword') : tLogin('showPassword')}
                  width={20}
                  height={20}
                  style={{ display: 'block' }}
                />
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-sm text-red-600 px-5">{passwordError}</p>
            )}
          </div>
          <div className="relative w-full max-w-[calc(100%-1rem)] mx-auto">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3.5 rounded-full text-base font-normal hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? tLogin('loggingIn') : t('continue')}
            </button>
          </div>
        </form>

        {/* Register Link */}
        <div className="text-center mb-6 text-base flex flex-col gap-1">
          <span className="text-black">{t('noAccount')}</span>
          <Link href="/register" className="text-blue-600 underline">
            {t('register')}
          </Link>
        </div>

        {/* Separator */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-black">{t('or')}</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full max-w-[calc(100%-1rem)] mx-auto flex items-center justify-start gap-3 px-5 py-3.5 rounded-full border border-gray-300 bg-white text-base text-black font-normal hover:bg-gray-50 transition-colors"
            style={{ borderWidth: '1px' }}
          >
            <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{t('continueWithGoogle')}</span>
          </button>

          {/* AliusAI Button */}
          <button
            onClick={handleAliusAIRegister}
            className="w-full max-w-[calc(100%-1rem)] mx-auto flex items-center justify-start gap-3 px-5 py-3.5 rounded-full border border-gray-300 bg-white text-base text-black font-normal hover:bg-gray-50 transition-colors"
            style={{ borderWidth: '1px' }}
          >
            <Image
              src="/images/ai.png"
              alt="AI"
              width={24}
              height={24}
              className="flex-shrink-0 object-contain w-6 h-6"
              style={{ filter: 'brightness(0)' }}
            />
            <span>{t('continueWithAliusAI')}</span>
          </button>

          {/* Biometric Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔘 Biometric button clicked');
              handleBiometricLogin();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('👆 Biometric button touched');
            }}
            disabled={isLoading}
            className="w-full max-w-[calc(100%-1rem)] mx-auto flex items-center justify-start gap-3 px-5 py-3.5 rounded-full border border-gray-300 bg-white text-base text-black font-normal hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderWidth: '1px', touchAction: 'manipulation' }}
          >
            <Image
              src="/images/f.png"
              alt="Biometric"
              width={24}
              height={24}
              className="flex-shrink-0 object-contain w-6 h-6"
              style={{ filter: 'brightness(0)' }}
            />
            <span>{t('continueWithBiometric')}</span>
          </button>
        </div>

        {/* Footer Links */}
        <div className="text-center text-sm">
          <Link href="/legal/user-agreement" className="text-black underline">
            {t('termsOfUse')}
          </Link>
          <span className="mx-2">|</span>
          <Link href="/legal/privacy-policy" className="text-black underline">
            {t('privacyPolicy')}
          </Link>
        </div>
      </div>

    </div>
  );
}


