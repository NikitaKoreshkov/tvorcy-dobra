'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl } from '@/src/config';

interface BiometricPanelProps {
  onSkip: () => void;
  onComplete: () => void;
}

export default function BiometricPanel({ onSkip, onComplete }: BiometricPanelProps) {
  const t = useTranslations('profilePage');
  const [showInstructions, setShowInstructions] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  
  const hasBiometric = user?.hasBiometric || false;

  // Cleanup таймера при размонтировании
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleEnable = () => {
    // Показываем инструкцию при нажатии "Включить"
    setShowInstructions(true);
    setError(null);
  };

  const handleStartRegistration = async () => {
    if (!user) {
      setError(t('userNotFound'));
      return;
    }

    console.log('🔐 Starting biometric registration...');
    setIsRegistering(true);
    setError(null);

    try {
      // Проверяем поддержку WebAuthn
      if (!window.PublicKeyCredential) {
        console.error('❌ WebAuthn not supported');
        throw new Error(t('biometricNotSupportedBrowser'));
      }
      console.log('✅ WebAuthn supported');

      // Получаем challenge с сервера
      console.log('📡 Requesting challenge...');
      const challengeResponse = await fetch(getApiUrl('/auth/biometric/challenge'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!challengeResponse.ok) {
        console.error(`❌ Challenge request failed: ${challengeResponse.status}`);
        throw new Error(t('biometricChallengeError'));
      }

      const { challenge } = await challengeResponse.json();
      console.log('✅ Challenge received');

      // Определяем rpId
      // Для IDN доменов (Punycode) на мобильных устройствах WebAuthn может требовать особый подход
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
      
      // Определяем rpId
      // Для Safari на мобильных с Punycode - используем обычный rpId (работает)
      // Для Chrome на мобильных с Punycode - НЕ указываем rpId (может не работать с указанным rpId)
      let rpId: string | undefined;
      if (isPunycode && isMobileDevice && isChrome) {
        // Для Chrome на мобильных с Punycode - НЕ указываем rpId
        // Chrome может требовать, чтобы браузер сам определил rpId из origin
        rpId = undefined;
        console.log('💡 Chrome on mobile with Punycode - not specifying rpId, browser will determine');
      } else if (isMobileDevice && hostname.includes('.')) {
        // Для Safari и других браузеров на мобильных: если есть поддомен, используем только домен
        const parts = hostname.split('.');
        rpId = parts.length > 2 ? parts.slice(-2).join('.') : hostname;
        if (isPunycode && isSafari) {
          console.log('💡 Safari on mobile with Punycode - using rpId (Safari supports it)');
        }
      } else {
        // Для десктопа: всегда используем только домен
        rpId = hostname.split('.').slice(-2).join('.');
      }
      
      console.log(`🌐 Using rpId: ${rpId || '(not specified - browser will determine)'}`);

      // Создаем публичный ключ для регистрации
      const rpConfig: { name: string; id?: string } = {
        name: 'The creators of Good',
      };
      
      // Указываем id только если rpId определен
      if (rpId) {
        rpConfig.id = rpId;
      }
      
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
        rp: rpConfig,
        user: {
          id: Uint8Array.from(user.id, c => c.charCodeAt(0)),
          name: user.email,
          displayName: user.name || user.email,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          // Не указываем authenticatorAttachment - позволяем браузеру выбрать самому
          // Это важно для мобильных устройств, где может быть несколько вариантов
          userVerification: 'preferred' as const, // Используем 'preferred' для гибкости
          residentKey: 'preferred' as const,
        },
        timeout: 60000,
        attestation: 'none' as const,
      };

      // Регистрируем биометрию
      console.log('🔑 Creating credential...');
      let credential: PublicKeyCredential | null = null;
      try {
        credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions,
        }) as PublicKeyCredential;
        console.log('✅ Credential created successfully');
      } catch (createError: any) {
        console.error(`❌ Credential creation error: ${createError.name} - ${createError.message}`);
        // Обработка ошибок создания credential
        if (createError.name === 'NotAllowedError') {
          // Пользователь отменил или браузер не разрешил
          console.log('ℹ️ User cancelled or browser denied');
          setIsRegistering(false);
          setError(t('biometricNotAllowed') || 'Биометрическая аутентификация была отменена. Пожалуйста, попробуйте снова.');
          return;
        } else if (createError.name === 'InvalidStateError') {
          // Credential уже существует
          console.log('ℹ️ Credential already exists');
          setIsRegistering(false);
          setError(t('biometricAlreadyExists') || 'Биометрическая аутентификация уже настроена.');
          return;
        } else if (createError.name === 'SecurityError') {
          // Проблема с безопасностью (например, не HTTPS)
          console.error('❌ Security error - possibly not HTTPS');
          setIsRegistering(false);
          setError(t('biometricSecurityError') || 'Биометрическая аутентификация доступна только через HTTPS.');
          return;
        } else if (createError.name === 'NotSupportedError') {
          // Браузер или устройство не поддерживает
          console.error('❌ Not supported error');
          setIsRegistering(false);
          setError('Ваше устройство или браузер не поддерживает биометрическую аутентификацию.');
          return;
        } else {
          // Другие ошибки
          console.error(`❌ Unknown error:`, createError);
          throw createError;
        }
      }

      if (!credential) {
        console.error('❌ No credential created');
        throw new Error(t('biometricKeyCreationError'));
      }

      // Отправляем credential на сервер
      console.log('📤 Sending credential to server...');
      const response = await credential.response as AuthenticatorAttestationResponse;
      const credentialId = Array.from(new Uint8Array(credential.rawId));
      const clientDataJSON = Array.from(new Uint8Array(response.clientDataJSON));
      const attestationObject = Array.from(new Uint8Array(response.attestationObject));

      const registerResponse = await fetch(getApiUrl('/auth/biometric/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          credentialId,
          clientDataJSON,
          attestationObject,
          challenge,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        console.error(`❌ Registration failed:`, errorData);
        throw new Error(errorData.message || t('biometricRegistrationError'));
      }

      console.log('✅ Registration successful');
      // Сохраняем credentialId для последующего использования
      localStorage.setItem('biometric_credential_id', JSON.stringify(credentialId));

      // Показываем анимацию успеха
      setIsRegistering(false);
      setIsSuccess(true);
      
      // Таймер обратного отсчета
      let currentCountdown = 3;
      setCountdown(currentCountdown);
      
      countdownIntervalRef.current = setInterval(() => {
        currentCountdown -= 1;
        setCountdown(currentCountdown);
        
        if (currentCountdown <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
    onComplete();
        }
      }, 1000);
    } catch (err: any) {
      setIsRegistering(false);
      setError(err.message || t('biometricConnectionError'));
    }
  };

  return (
    <>
    <AnimatePresence mode="sync">
      {!showInstructions ? (
    <motion.div
          key="main"
      className="biometric-panel"
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      <div className="biometric-panel-content">
            <div className="biometric-panel-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 3C13.66 3 15 4.34 15 6V8H9V6C9 4.34 10.34 3 12 3ZM18 20H6V10H18V20Z" fill="currentColor"/>
                <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="biometric-panel-title">Быстрый вход</h3>
        <p className="biometric-panel-text">
              Используйте биометрию вашего устройства (Face ID, Touch ID, отпечаток пальца) для мгновенного входа в личный кабинет без ввода пароля
        </p>
        <div className="biometric-panel-actions">
              <div 
                className="biometric-button-wrapper"
                onMouseEnter={() => hasBiometric && setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
          <button
            className="premium-button"
            onClick={handleEnable}
                  disabled={isRegistering || hasBiometric}
                  style={hasBiometric ? { opacity: 0.6, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
          >
                  Включить
          </button>
                {showTooltip && hasBiometric && (
                  <div className="biometric-tooltip">
                    У вас уже подключена биометрия
                  </div>
                )}
              </div>
          <button
            className="biometric-panel-skip"
            onClick={onSkip}
                disabled={isRegistering}
          >
            Пропустить
          </button>
        </div>
      </div>
    </motion.div>
      ) : (
        <motion.div
          key="instructions"
          className="biometric-panel biometric-panel-instructions"
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          <div className="biometric-panel-content">
            <div className="biometric-panel-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="biometric-panel-title">
              {isRegistering ? t('connectingBiometric') : t('instructions')}
            </h3>
            {isRegistering ? (
              <div className="biometric-panel-instructions-content">
                <div className="biometric-loading">
                  <div className="biometric-loading-spinner"></div>
                </div>
                <p className="biometric-panel-text">
                  Подключение биометрии...
                </p>
                {error && (
                  <div className="biometric-panel-error">
                    {error}
                  </div>
                )}
              </div>
            ) : isSuccess ? (
              <div className="biometric-panel-instructions-content">
                <motion.div
                  className="biometric-success-icon"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2
                  }}
                >
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#065F46" opacity="0.1"/>
                    <path d="M9 12l2 2 4-4" stroke="#065F46" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <circle cx="12" cy="12" r="10" stroke="#065F46" strokeWidth="2" fill="none"/>
                  </svg>
                </motion.div>
                <motion.h3 
                  className="biometric-panel-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Биометрия подключена!
                </motion.h3>
                <motion.p 
                  className="biometric-panel-text"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Теперь вы можете входить без пароля
                </motion.p>
                <motion.p 
                  className="biometric-panel-countdown"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Через {countdown} секунд переведем вас дальше...
                </motion.p>
              </div>
            ) : (
              <div className="biometric-panel-instructions-content">
                <ol className="biometric-panel-steps">
                  <li>Разрешите использование биометрии в появившемся окне</li>
                  <li>Подтвердите свою личность с помощью Face ID, Touch ID или отпечатка пальца</li>
                  <li>Готово! Теперь вы можете входить без пароля</li>
                </ol>
                {error && (
                  <div className="biometric-panel-error">
                    {error}
                  </div>
                )}
                <div className="biometric-panel-actions" style={{ marginTop: '2rem' }}>
                  <button
                    className="premium-button"
                    onClick={handleStartRegistration}
                    disabled={isRegistering}
                  >
                    Начать подключение
                  </button>
                  <button
                    className="biometric-panel-skip"
                    onClick={() => setShowInstructions(false)}
                  >
                    Назад
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    </>
  );
}

