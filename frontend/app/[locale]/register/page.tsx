'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useRouter } from '@/src/routing';
import { useTranslations } from 'next-intl';
import { useSearchParams, useParams } from 'next/navigation';
import Image from 'next/image';
import { getApiUrl } from '@/src/config';


export default function RegisterPage() {
  const t = useTranslations('auth');
  const tRegister = useTranslations('registerPage');
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'ru';
  const [email, setEmail] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'email' | 'code' | 'credentials'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [emailShake, setEmailShake] = useState(false);
  const [codeShake, setCodeShake] = useState(false);
  const [nameShake, setNameShake] = useState(false);
  const [passwordShake, setPasswordShake] = useState(false);
  const [agreePrivacyAndTerms, setAgreePrivacyAndTerms] = useState(false);
  const [agreeDataCollection, setAgreeDataCollection] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const emailParam = searchParams.get('email');
    
    if (success === 'true' && emailParam) {
      window.history.replaceState({}, '', `/${locale}/register`);
    }
    
    if (error) {
      const errorMessages: Record<string, string> = {
        'access_denied': tRegister('authorizationCancelled'),
        'no_code': tRegister('errorGettingCode'),
        'oauth_failed': tRegister('oauthFailed'),
      };
      const parsedError = parseError({ message: errorMessages[error] || tRegister('error') }, 'email');
      setEmailError(parsedError.emailError);
      setCodeError(parsedError.codeError);
      setNameError(parsedError.nameError);
      setPasswordError(parsedError.passwordError);
      window.history.replaceState({}, '', `/${locale}/register`);
    }
  }, [searchParams, locale]);

  const checkCooldown = useCallback(async (): Promise<number> => {
    if (!email || step !== 'code') return 0;

    try {
      const response = await fetch(getApiUrl('/auth/check-code-cooldown'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.remainingSeconds > 0) {
          setResendCooldown(data.remainingSeconds);
          
          // Очищаем предыдущий интервал, если он есть
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          // Таймер обратного отсчета
          intervalRef.current = setInterval(() => {
            setResendCooldown((prev) => {
              if (prev <= 1) {
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return data.remainingSeconds;
        }
      } else if (response.status === 429) {
        // Если получили 429, просто возвращаем текущее значение кулдауна
        return resendCooldown;
      }
    } catch (error) {
      // Игнорируем ошибки проверки кулдауна
    }
    return 0;
  }, [email, step, resendCooldown]);

  useEffect(() => {
    // Автофокус на первое поле кода при переходе на шаг code
    if (step === 'code') {
      const firstInput = document.getElementById('code-0');
      firstInput?.focus();
      
      // Проверяем кулдаун при переходе на шаг code (только один раз, если кулдаун не активен)
      if (resendCooldown === 0) {
        checkCooldown().catch(() => {
          // Игнорируем ошибки проверки кулдауна
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, email]);

  useEffect(() => {
    // Очистка интервала при размонтировании компонента
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const parseError = (error: any, step: 'email' | 'code' | 'credentials'): { 
    emailError: string | null; 
    codeError: string | null; 
    nameError: string | null; 
    passwordError: string | null;
  } => {
    const message = error.message || '';
    
    // Ошибки, связанные с email (некорректный email, email уже существует)
    if (message.includes('email') && (message.includes('некорректный') || message.includes('incorrect') || message.includes('уже существует') || message.includes('already exists') || message.includes('обязателен') || message.includes('required'))) {
      return { emailError: message, codeError: null, nameError: null, passwordError: null };
    }
    
    // Ошибки, связанные с кодом
    if (message.includes('код') || message.includes('code') || message.includes('Неверный код') || message.includes('Invalid code') || message.includes('код истек') || message.includes('code expired')) {
      return { emailError: null, codeError: message || tRegister('invalidCode'), nameError: null, passwordError: null };
    }
    
    // Ошибки, связанные с паролем
    if (message.includes('пароль') || message.includes('password') || message.includes('Пароль') || message.includes('Password')) {
      return { emailError: null, codeError: null, nameError: null, passwordError: message || tRegister('passwordTooShort') };
    }
    
    // Ошибки, связанные с именем
    if (message.includes('имя') || message.includes('Имя') || message.includes('name') || message.includes('Name')) {
      return { emailError: null, codeError: null, nameError: message || tRegister('nameTooShort'), passwordError: null };
    }
    
    // Общие ошибки (активность, запросы, блокировки) - все инпуты красные, текст только под самым нижним
    // На шаге email - все инпуты красные, текст под email
    // На шаге code - все инпуты красные, текст под кодом
    // На шаге credentials - все инпуты красные, текст под паролем
    if (message.includes('активность') || message.includes('activity') || message.includes('запросов') || message.includes('requests') || message.includes('Too Many Requests') || message.includes('ThrottlerException') || message.includes('секунд') || message.includes('seconds') || message.includes('заблокирован') || message.includes('blocked') || message.includes('неактивен') || message.includes('inactive') || message.includes('попробуйте позже') || message.includes('try again later')) {
      // Если сообщение уже на русском и содержит "попробуйте позже", используем его
      // Иначе используем стандартное русское сообщение
      const errorText = message.includes('секунд') || message.includes('seconds')
        ? message 
        : (message.includes('запросов') || message.includes('requests') || message.includes('попробуйте позже') || message.includes('try again later') || message.includes('Too Many Requests') || message.includes('ThrottlerException'))
          ? tRegister('tooManyRequests')
          : message;
      if (step === 'email') {
        return { emailError: errorText, codeError: null, nameError: null, passwordError: null };
      }
      if (step === 'code') {
        // Все инпуты красные, текст только под кодом
        return { emailError: '', codeError: errorText, nameError: null, passwordError: null };
      }
      // На шаге credentials - все инпуты красные, текст только под паролем
      return { emailError: '', codeError: null, nameError: '', passwordError: errorText };
    }
    
    // Если не удалось определить, все инпуты красные, текст только под самым нижним
    if (step === 'email') {
      return { emailError: message || tRegister('error'), codeError: null, nameError: null, passwordError: null };
    }
    if (step === 'code') {
      return { emailError: '', codeError: message || tRegister('error'), nameError: null, passwordError: null };
    }
    // На шаге credentials - все инпуты красные, текст только под паролем
    return { emailError: '', codeError: null, nameError: '', passwordError: message || tRegister('error') };
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Защита от повторных отправок
    if (isLoading) {
      return;
    }
    
    setEmailError(null);
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('/auth/send-verification-code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        const parsedError = parseError({ message: data.message || tRegister('errorSendingCode') }, 'email');
        setEmailError(parsedError.emailError);
        setCodeError(parsedError.codeError);
        setNameError(parsedError.nameError);
        setPasswordError(parsedError.passwordError);
        
        // Тряска для инпута с ошибкой
        if (parsedError.emailError !== null && parsedError.emailError !== undefined) {
          setEmailShake(true);
          setTimeout(() => setEmailShake(false), 500);
        }
        
        // Если ошибка 429, устанавливаем кулдаун
        if (response.status === 429) {
          setResendCooldown(30);
          
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          intervalRef.current = setInterval(() => {
            setResendCooldown((prev) => {
              if (prev <= 1) {
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
        return;
      }

      setStep('code');
    } catch (error: any) {
      const parsedError = parseError(error, 'email');
      setEmailError(parsedError.emailError);
      setCodeError(parsedError.codeError);
      setNameError(parsedError.nameError);
      setPasswordError(parsedError.passwordError);
      // Тряска для инпута с ошибкой
      if (parsedError.emailError !== null && parsedError.emailError !== undefined) {
        setEmailShake(true);
        setTimeout(() => setEmailShake(false), 500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Если вставлено несколько символов (например, весь код из буфера)
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6);
      const newCode = ['', '', '', '', '', ''];
      
      for (let i = 0; i < digits.length && i < 6; i++) {
        newCode[i] = digits[i];
      }
      
      setCode(newCode);
      
      // Фокус на последнее заполненное поле или следующее пустое
      const nextEmptyIndex = newCode.findIndex(d => d === '');
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      const nextInput = document.getElementById(`code-${focusIndex}`);
      nextInput?.focus();
      
      // Автоматическая отправка при заполнении всех полей
      if (digits.length === 6) {
        setTimeout(() => handleCodeSubmit(digits), 100);
      }
      return;
    }
    
    // Разрешаем только цифры
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Автоматический переход на следующее поле
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Автоматическая отправка при заполнении всех полей
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      setTimeout(() => handleCodeSubmit(newCode.join('')), 100);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length > 0) {
      const newCode = ['', '', '', '', '', ''];
      for (let i = 0; i < digits.length && i < 6; i++) {
        newCode[i] = digits[i];
      }
      setCode(newCode);
      
      // Фокус на последнее заполненное поле или следующее пустое
      const nextEmptyIndex = newCode.findIndex(d => d === '');
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      setTimeout(() => {
        const nextInput = document.getElementById(`code-${focusIndex}`);
        nextInput?.focus();
      }, 0);
      
      // Автоматическая отправка при заполнении всех полей
      if (digits.length === 6) {
        setTimeout(() => handleCodeSubmit(digits), 100);
      }
    }
  };

  const handleCodeSubmit = async (codeValue?: string) => {
    const finalCode = codeValue || code.join('');
    
    if (finalCode.length !== 6) {
      return;
    }

    setCodeError(null);
    setIsLoading(true);

    try {
      // Проверяем код
      const verifyResponse = await fetch(getApiUrl('/auth/verify-code-check'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: finalCode }),
      });

      const data = await verifyResponse.json();

      if (!verifyResponse.ok) {
        const parsedError = parseError({ message: data.message || tRegister('invalidCode') }, 'code');
        setCodeError(parsedError.codeError);
        setEmailError(parsedError.emailError);
        setNameError(parsedError.nameError);
        setPasswordError(parsedError.passwordError);
        // Тряска для инпутов кода
        if (parsedError.codeError) {
          setCodeShake(true);
          setTimeout(() => setCodeShake(false), 500);
        }
        return;
      }

      // Код верный - автоматически переходим на следующий шаг
      setStep('credentials');
    } catch (error: any) {
      const parsedError = parseError(error, 'code');
      setCodeError(parsedError.codeError);
      setEmailError(parsedError.emailError);
      setNameError(parsedError.nameError);
      setPasswordError(parsedError.passwordError);
      // Тряска для инпутов кода
      if (parsedError.codeError) {
        setCodeShake(true);
        setTimeout(() => setCodeShake(false), 500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isLoading) {
      return;
    }

    // Проверяем кулдаун на backend перед отправкой
    const backendCooldown = await checkCooldown();
    if (backendCooldown > 0) {
      // Если кулдаун активен на backend, не отправляем запрос
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('/auth/send-verification-code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        // Если ошибка из-за кулдауна, пытаемся получить реальное значение из ответа
        if (response.status === 429) {
          try {
            const errorData = await response.json();
            // Пытаемся извлечь количество секунд из сообщения об ошибке
            const message = errorData.message || '';
            const secondsMatch = message.match(/(\d+)\s*секунд/);
            const remainingSeconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 30;
            
            setResendCooldown(remainingSeconds);
            
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            
            intervalRef.current = setInterval(() => {
              setResendCooldown((prev) => {
                if (prev <= 1) {
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                  }
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          } catch (parseError) {
            // Если не удалось распарсить, используем значение из check-code-cooldown
            const cooldownSeconds = await checkCooldown();
            if (cooldownSeconds > 0) {
              setResendCooldown(cooldownSeconds);
              
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
              
              intervalRef.current = setInterval(() => {
                setResendCooldown((prev) => {
                  if (prev <= 1) {
                    if (intervalRef.current) {
                      clearInterval(intervalRef.current);
                      intervalRef.current = null;
                    }
                    return 0;
                  }
                  return prev - 1;
                });
              }, 1000);
            }
          }
        }
        return;
      }

      const data = await response.json();

      setCode(['', '', '', '', '', '']);
      setResendCooldown(30);
      
      // Очищаем предыдущий интервал, если он есть
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Таймер обратного отсчета
      intervalRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      // Ошибка не показывается
    } finally {
      setIsLoading(false);
    }
  };

  // Валидация пароля в реальном времени
  const validatePassword = (pwd: string) => {
    const hasMinLength = pwd.length >= 8;
    const hasUpperLowerAndNumber = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd);
    return { hasMinLength, hasUpperLowerAndNumber, isValid: hasMinLength && hasUpperLowerAndNumber };
  };

  const passwordValidation = validatePassword(password);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setNameError(null);
    setPasswordError(null);

    // Проверка чекбоксов
    if (!agreePrivacyAndTerms || !agreeDataCollection) {
      setPasswordError('Необходимо согласиться со всеми условиями');
      setPasswordShake(true);
      setTimeout(() => setPasswordShake(false), 500);
      return;
    }

    // Валидация пароля
    if (!passwordValidation.isValid) {
      setPasswordShake(true);
      setTimeout(() => setPasswordShake(false), 500);
      return;
    }

    if (name.length < 2) {
      setNameError(tRegister('nameTooShort'));
      setNameShake(true);
      setTimeout(() => setNameShake(false), 500);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('/auth/verify-code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: code.join(''), password, name, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        const parsedError = parseError({ message: data.message || tRegister('registrationError') }, 'credentials');
        setNameError(parsedError.nameError);
        setPasswordError(parsedError.passwordError);
        setCodeError(parsedError.codeError);
        setEmailError(parsedError.emailError);
        // Тряска для инпутов с ошибками
        if (parsedError.nameError !== null && parsedError.nameError !== undefined) {
          setNameShake(true);
          setTimeout(() => setNameShake(false), 500);
        }
        if (parsedError.passwordError) {
          setPasswordShake(true);
          setTimeout(() => setPasswordShake(false), 500);
        }
        if (parsedError.emailError !== null && parsedError.emailError !== undefined) {
          setEmailShake(true);
          setTimeout(() => setEmailShake(false), 500);
        }
        return;
      }

      // Сохраняем токен
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        // Триггерим событие для обновления хука useAuth
        window.dispatchEvent(new Event('authStateChanged'));
      }

        router.push('/profile');
    } catch (error: any) {
      const parsedError = parseError(error, 'credentials');
      setNameError(parsedError.nameError);
      setPasswordError(parsedError.passwordError);
      setCodeError(parsedError.codeError);
      setEmailError(parsedError.emailError);
      // Тряска для инпутов с ошибками
      if (parsedError.nameError !== null && parsedError.nameError !== undefined) {
        setNameShake(true);
        setTimeout(() => setNameShake(false), 500);
      }
      if (parsedError.passwordError) {
        setPasswordShake(true);
        setTimeout(() => setPasswordShake(false), 500);
      }
      if (parsedError.emailError !== null && parsedError.emailError !== undefined) {
        setEmailShake(true);
        setTimeout(() => setEmailShake(false), 500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `/api/auth/google?action=register&locale=${locale}`;
  };
  
  const handleAliusAIRegister = () => {
    router.push('/alius-ai');
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
          {t('createAccount')}
        </h1>

        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="mb-6">
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
            <div className="relative w-full max-w-[calc(100%-1rem)] mx-auto">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3.5 rounded-full text-base font-normal hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Отправка...' : t('continue')}
              </button>
            </div>
          </form>
        )}

        {/* Code Step */}
        {step === 'code' && (
          <form onSubmit={(e) => { e.preventDefault(); handleCodeSubmit(); }} className="mb-6">
            <div className="w-full max-w-[calc(100%-1rem)] mx-auto mb-4">
              <label className="block text-sm text-gray-600 mb-3 text-center">
                {tRegister('confirmationCode')}
              </label>
              <div className="flex gap-2 justify-center">
                {code.map((digit, index) => (
              <input
                    key={index}
                    id={`code-${index}`}
                type="text"
                    inputMode="numeric"
                    value={digit}
                onChange={(e) => {
                      handleCodeChange(index, e.target.value);
                      setCodeError(null);
                    }}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    onPaste={handleCodePaste}
                    className={`w-12 h-12 rounded-lg border text-center text-xl font-semibold text-black focus:outline-none ${
                      codeError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-black'
                    } ${codeShake ? 'input-error-shake' : ''}`}
                    style={{ borderWidth: '1px' }}
                    maxLength={1}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>
            {codeError && (
              <p className="text-sm text-red-600 text-center mb-2">{codeError}</p>
            )}
            <div className="relative w-full max-w-[calc(100%-1rem)] mx-auto mb-4">
              <button
                type="submit"
                disabled={code.join('').length !== 6 || isLoading}
                className="w-full bg-black text-white py-3.5 rounded-full text-base font-normal hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? tRegister('verifying') : tRegister('verify')}
              </button>
            </div>
            <div className="text-center mb-6 text-base flex flex-col gap-1">
              <span className="text-black">{tRegister('didntReceiveCode')}</span>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isLoading}
                className="text-blue-600 underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
              >
                {tRegister('resendCode')}{resendCooldown > 0 ? ` (${resendCooldown} ${tRegister('seconds')})` : ''}
              </button>
            </div>
          </form>
        )}

        {/* Credentials Step */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="mb-6">
            <div className="relative w-full max-w-[calc(100%-1rem)] mx-auto mb-4">
              <label
                htmlFor="name"
                className={`absolute left-5 transition-all duration-200 pointer-events-none z-10 ${
                  name || isNameFocused
                    ? isNameFocused
                      ? `-top-2.5 text-xs bg-white px-2 ${nameError !== null && nameError !== undefined ? 'text-red-500' : 'text-black'}`
                      : `-top-2.5 text-xs bg-white px-2 ${nameError !== null && nameError !== undefined ? 'text-red-500' : 'text-gray-400'}`
                    : `top-1/2 -translate-y-1/2 text-base ${nameError !== null && nameError !== undefined ? 'text-red-500' : 'text-gray-400'}`
                }`}
              >
                {tRegister('name')}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(null);
                }}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
                className={`w-full px-5 py-3.5 rounded-full border text-base text-black focus:outline-none ${
                  nameError !== null && nameError !== undefined ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-black'
                } ${nameShake ? 'input-error-shake' : ''}`}
                style={{ borderWidth: '1px' }}
                required
                minLength={2}
              />
              {nameError && nameError !== '' && (
                <p className="mt-1 text-sm text-red-600 px-5">{nameError}</p>
              )}
            </div>
            <div className="w-full max-w-[calc(100%-1rem)] mx-auto mb-4">
              <div className="relative">
                <label
                  htmlFor="password"
                  className={`absolute left-5 transition-all duration-200 pointer-events-none z-10 ${
                    password || isPasswordFocused
                      ? isPasswordFocused
                        ? `-top-2.5 text-xs bg-white px-2 ${passwordError || (passwordTouched && password && !passwordValidation.isValid) ? 'text-red-500' : 'text-black'}`
                        : `-top-2.5 text-xs bg-white px-2 ${passwordError || (passwordTouched && password && !passwordValidation.isValid) ? 'text-red-500' : 'text-gray-400'}`
                      : `top-1/2 -translate-y-1/2 text-base ${passwordError || (passwordTouched && password && !passwordValidation.isValid) ? 'text-red-500' : 'text-gray-400'}`
                  }`}
                >
                  {tRegister('password')}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordTouched(true);
                    }}
                    onFocus={() => {
                      setIsPasswordFocused(true);
                      setPasswordTouched(true);
                    }}
                    onBlur={() => {
                      setIsPasswordFocused(false);
                      setPasswordTouched(true);
                    }}
                    placeholder=""
                    className={`w-full px-5 py-3.5 pr-12 rounded-full border text-base text-black focus:outline-none ${
                      passwordError || (passwordTouched && password && !passwordValidation.isValid)
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-black'
                    } ${passwordShake ? 'input-error-shake' : ''}`}
                    style={{ borderWidth: '1px' }}
                    required
                    minLength={8}
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
                      alt={showPassword ? tRegister('hidePassword') : tRegister('showPassword')}
                      width={20}
                      height={20}
                      style={{ display: 'block' }}
                    />
                  </button>
                </div>
              </div>
              {/* Валидация пароля - всегда видна */}
              <div className="mt-2 px-5 space-y-1 min-h-[60px]">
                <div className={`flex items-center gap-2 text-sm transition-colors ${
                  passwordValidation.hasMinLength 
                    ? 'text-green-600' 
                    : (passwordTouched && password && !passwordValidation.hasMinLength)
                    ? 'text-red-600'
                    : 'text-gray-400'
                }`}>
                  {passwordValidation.hasMinLength ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  <span>{tRegister('minimumCharacters')}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm transition-colors ${
                  passwordValidation.hasUpperLowerAndNumber 
                    ? 'text-green-600' 
                    : (passwordTouched && password && !passwordValidation.hasUpperLowerAndNumber)
                    ? 'text-red-600'
                    : 'text-gray-400'
                }`}>
                  {passwordValidation.hasUpperLowerAndNumber ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  <span>{tRegister('uppercaseLowercaseNumber')}</span>
                </div>
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-red-600 px-5">{passwordError}</p>
              )}
            </div>
            <div className="relative w-full max-w-[calc(100%-1rem)] mx-auto">
              <button
                type="submit"
                disabled={isLoading || !passwordValidation.isValid || !agreePrivacyAndTerms || !agreeDataCollection || name.length < 2}
                className="w-full bg-black text-white py-3.5 rounded-full text-base font-normal hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? tRegister('registering') : tRegister('register')}
              </button>
            </div>
          </form>
        )}

        {/* Чекбоксы согласия - показываем только на шаге credentials */}
        {step === 'credentials' && (
          <div className="mb-6 space-y-3 px-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-1">
                <input
                  type="checkbox"
                  checked={agreePrivacyAndTerms}
                  onChange={(e) => setAgreePrivacyAndTerms(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 border-2 border-gray-300 rounded peer-checked:bg-black peer-checked:border-black transition-all duration-200 group-hover:border-black group-hover:shadow-[0_0_8px_rgba(0,0,0,0.3)] peer-focus:ring-2 peer-focus:ring-black peer-focus:ring-offset-2">
                  {agreePrivacyAndTerms && (
                    <svg className="absolute inset-0 w-full h-full text-white" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs md:text-sm text-gray-700">
                {tRegister('agreeToTerms')} <Link href="/legal/user-agreement" className="text-blue-600 underline">{tRegister('userAgreement')}</Link> {tRegister('and')} <Link href="/legal/privacy-policy" className="text-blue-600 underline">{tRegister('privacyPolicy')}</Link>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-1">
                <input
                  type="checkbox"
                  checked={agreeDataCollection}
                  onChange={(e) => setAgreeDataCollection(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 border-2 border-gray-300 rounded peer-checked:bg-black peer-checked:border-black transition-all duration-200 group-hover:border-black group-hover:shadow-[0_0_8px_rgba(0,0,0,0.3)] peer-focus:ring-2 peer-focus:ring-black peer-focus:ring-offset-2">
                  {agreeDataCollection && (
                    <svg className="absolute inset-0 w-full h-full text-white" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-700">
                {tRegister('agreeToDataCollection')}
              </span>
            </label>
          </div>
        )}

        {/* Login Link - показываем только на шаге email */}
        {step === 'email' && (
        <div className="text-center mb-6 text-base flex flex-col gap-1">
          <span className="text-black">{t('haveAccount')}</span>
          <Link href="/login" className="text-blue-600 underline">
            {t('login')}
          </Link>
        </div>
        )}

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
            onClick={handleGoogleRegister}
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
