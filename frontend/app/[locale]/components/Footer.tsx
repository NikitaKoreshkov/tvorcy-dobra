'use client';

import { Link } from '@/src/routing';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { TelegramIcon, WhatsAppIcon, InstagramIcon, FacebookIcon } from './Icons';
import { getApiUrl } from '@/src/config';

export default function Footer() {
  const t = useTranslations('header');
  const tf = useTranslations('footer');
  const params = useParams();
  const locale = (params?.locale as string) || 'ru';
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'already'; text: string } | null>(null);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const removeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    // Очищаем таймеры при новой подписке
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (removeTimerRef.current) {
      clearTimeout(removeTimerRef.current);
      removeTimerRef.current = null;
    }
    setMessage(null);
    setIsMessageVisible(false);

    try {
      const response = await fetch(getApiUrl('/newsletter/subscribe'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || tf('subscriptionError'));
      }

      if (data.alreadySubscribed) {
        setMessage({
          type: 'already',
          text: tf('alreadySubscribed'),
        });
      } else {
        setMessage({
          type: 'success',
          text: tf('thankYouSubscribe'),
        });
        setIsSubscribed(true);
        setEmail('');
      }
      setIsMessageVisible(true);
    } catch (error: any) {
      setMessage({
        type: 'success',
        text: error.message || tf('generalError'),
      });
      setIsMessageVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Очищаем предыдущие таймеры
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (removeTimerRef.current) {
      clearTimeout(removeTimerRef.current);
      removeTimerRef.current = null;
    }

    if (isMessageVisible && message) {
      timerRef.current = setTimeout(() => {
        setIsMessageVisible(false);
        // Ждем завершения анимации исчезновения перед очисткой сообщения
        removeTimerRef.current = setTimeout(() => {
          setMessage(null);
        }, 300);
      }, 3000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (removeTimerRef.current) {
        clearTimeout(removeTimerRef.current);
      }
    };
  }, [isMessageVisible, message]);

  const socialLinks = [
    { name: 'Telegram', url: '#', icon: TelegramIcon },
    { name: 'WhatsApp', url: '#', icon: WhatsAppIcon },
    { name: 'Instagram', url: '#', icon: InstagramIcon },
    { name: 'Facebook', url: '#', icon: FacebookIcon },
  ];

  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-content">
          {/* Logo and Description */}
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              {t('brand')}
            </Link>
            <p className="footer-description">
              {tf('description')}
            </p>
            
            {/* Social Links */}
            <div className="footer-social">
              <p className="footer-social-title">{tf('followUs')}</p>
              <div className="footer-social-links">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                  <a
                    key={social.name}
                    href={social.url}
                    className="footer-social-link"
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                      <IconComponent />
                  </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation and Support Links */}
          <div className="footer-links-group">
            <div className="footer-links-column">
              <h3 className="footer-links-title">{tf('navigation')}</h3>
              <nav className="footer-nav">
                <Link href="/about" className="footer-link">
                  {t('about')}
                </Link>
                <Link href="/programs" className="footer-link">
                  {t('programs')}
                </Link>
                <Link href="/reports" className="footer-link">
                  {t('reports')}
                </Link>
              </nav>
            </div>
            <div className="footer-links-column">
              <h3 className="footer-links-title">{tf('supportSection')}</h3>
              <nav className="footer-nav">
                <Link href="/support" className="footer-link">
                  {t('support')}
                </Link>
                <Link href="/contacts" className="footer-link">
                  {t('contacts')}
                </Link>
              </nav>
            </div>
          </div>

          {/* Legal Information */}
          <div className="footer-links-column">
            <h3 className="footer-links-title">{tf('legalInformation')}</h3>
            <nav className="footer-nav">
              <Link href="/legal/user-agreement" className="footer-link">
                {tf('userAgreement')}
              </Link>
              <Link href="/legal/privacy-policy" className="footer-link">
                {tf('privacyPolicy')}
              </Link>
              <Link href="/legal/ai-rules" className="footer-link">
                {tf('aiRules')}
              </Link>
              <Link href="/legal/cookies" className="footer-link">
                {tf('cookiesPolicy')}
              </Link>
            </nav>
          </div>

          {/* Newsletter Subscription */}
          <div className="footer-newsletter">
            <h3 className="footer-newsletter-title">{tf('newsletterTitle')}</h3>
            <p className="footer-newsletter-description">
              {tf('newsletterDescription')}
            </p>
            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (message) {
                    // Очищаем таймеры
                    if (timerRef.current) {
                      clearTimeout(timerRef.current);
                      timerRef.current = null;
                    }
                    if (removeTimerRef.current) {
                      clearTimeout(removeTimerRef.current);
                      removeTimerRef.current = null;
                    }
                    // Скрываем сообщение с анимацией
                    setIsMessageVisible(false);
                    setTimeout(() => {
                      setMessage(null);
                    }, 300);
                  }
                }}
                placeholder={tf('yourEmail')}
                className="footer-newsletter-input"
                required
                disabled={isLoading}
              />
              <button type="submit" className="footer-newsletter-button" disabled={isLoading}>
                {isLoading ? '...' : isSubscribed ? tf('subscribed') : tf('subscribe')}
              </button>
            </form>
            <div className="footer-newsletter-message-wrapper">
              <div className={`footer-newsletter-message ${message && isMessageVisible ? 'footer-newsletter-message-visible' : 'footer-newsletter-message-hidden'}`}>
                {message && (
                  <p className={message.type === 'success' ? 'footer-newsletter-success' : 'footer-newsletter-already'}>
                    {message.text}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            {tf('copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="footer-legal-links">
            <Link href="/legal/user-agreement" className="footer-legal-link">
              {tf('userAgreement')}
            </Link>
            <span className="footer-legal-separator">•</span>
            <Link href="/legal/privacy-policy" className="footer-legal-link">
              {tf('privacyPolicy')}
            </Link>
            <span className="footer-legal-separator">•</span>
            <Link href="/legal/cookies" className="footer-legal-link">
              {tf('cookies')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

