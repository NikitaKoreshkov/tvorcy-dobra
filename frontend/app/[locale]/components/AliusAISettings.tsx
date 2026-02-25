'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import CustomSelect from './CustomSelect';

interface AliusAISettingsProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
}

type SettingsSection = 'general' | 'notifications' | 'personalization' | 'apps' | 'controls' | 'security' | 'parental' | 'account' | 'keyboard';

export default function AliusAISettings({ isOpen, onClose, initialSection = 'general' }: AliusAISettingsProps) {
  const t = useTranslations('aliusAIPage.settings');
  const [activeSection, setActiveSection] = useState<SettingsSection>((initialSection as SettingsSection) || 'general');
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  useEffect(() => {
    if (isOpen && initialSection) {
      setActiveSection(initialSection as SettingsSection);
    }
  }, [isOpen, initialSection]);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsSmallScreen(width <= 300);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Personalization settings
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true);
  const [baseStyle, setBaseStyle] = useState('default');
  const [userInstructions, setUserInstructions] = useState('');
  const [nickname, setNickname] = useState('');
  const [profession, setProfession] = useState('');
  
  // General settings
  const [appearance, setAppearance] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('alius-ai-appearance') || 'system';
    }
    return 'system';
  });
  const [accentColor, setAccentColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('alius-ai-accent-color') || 'default';
    }
    return 'default';
  });
  const [language, setLanguage] = useState('auto');
  const [spokenLanguage, setSpokenLanguage] = useState('auto');
  const [voice, setVoice] = useState('spruce');
  
  // Notifications settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState('immediate');
  
  // Apps settings
  const [integratedApps, setIntegratedApps] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState('');
  
  // Controls settings
  const [compactMode, setCompactMode] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  
  // Security settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [dataRetention, setDataRetention] = useState('90');
  
  // Parental settings
  const [parentalControlEnabled, setParentalControlEnabled] = useState(false);
  const [contentFilter, setContentFilter] = useState('moderate');
  
  // Account settings
  const [accountEmail, setAccountEmail] = useState('');
  const [accountName, setAccountName] = useState('');
  
  // Apply theme and accent color
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Apply theme
    const applyTheme = (theme: string) => {
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        root.setAttribute('data-theme', theme);
      }
    };
    
    applyTheme(appearance);
    localStorage.setItem('alius-ai-appearance', appearance);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (appearance === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [appearance]);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Apply accent color
    const accentColors: Record<string, string> = {
      default: '#0066cc',
      blue: '#3b82f6',
      green: '#22c55e',
      purple: '#a855f7',
      red: '#ef4444',
      orange: '#f59e0b',
      pink: '#ec4899',
    };
    
    const color = accentColors[accentColor] || accentColors.default;
    root.style.setProperty('--accent-color', color);
    localStorage.setItem('alius-ai-accent-color', accentColor);
  }, [accentColor]);

  const sections = [
    { id: 'general' as SettingsSection, label: t('general'), icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="7"/>
        <path d="M10 6V10L13 13"/>
      </svg>
    )},
    { id: 'notifications' as SettingsSection, label: t('notifications'), icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 2C7.2 2 5 4.2 5 7V12L3 14V15H17V14L15 12V7C15 4.2 12.8 2 10 2Z"/>
        <path d="M10 18C11.1 18 12 17.1 12 16H8C8 17.1 8.9 18 10 18Z"/>
      </svg>
    )},
    { id: 'personalization' as SettingsSection, label: t('personalization'), icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="7"/>
        <path d="M10 6V10L13 13"/>
      </svg>
    )},
    { id: 'apps' as SettingsSection, label: t('apps'), icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="7" cy="7" r="2"/>
        <circle cx="13" cy="7" r="2"/>
        <circle cx="7" cy="13" r="2"/>
        <circle cx="13" cy="13" r="2"/>
      </svg>
    )},
    { id: 'controls' as SettingsSection, label: t('controls'), icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 5H17M3 10H17M3 15H17"/>
      </svg>
    )},
    { id: 'security' as SettingsSection, label: t('security'), icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 2L3 5V9C3 13.5 6.5 17.5 10 18C13.5 17.5 17 13.5 17 9V5L10 2Z"/>
      </svg>
    )},
    { id: 'parental' as SettingsSection, label: t('parental'), icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="7" r="4"/>
        <path d="M5 18C5 15 7 13 10 13C13 13 15 15 15 18"/>
      </svg>
    )},
    { id: 'account' as SettingsSection, label: t('account'), icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="7" r="4"/>
        <path d="M5 18C5 15 7 13 10 13C13 13 15 15 15 18"/>
      </svg>
    )},
    { id: 'keyboard' as SettingsSection, label: t('keyboard'), icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="16" height="12" rx="1"/>
        <path d="M6 8H14M6 12H10"/>
      </svg>
    )},
  ];

  const tShortcuts = useTranslations('aliusAIPage.settings.shortcuts');
  const keyboardShortcuts = [
    {
      category: tShortcuts('general'),
      shortcuts: [
        { label: tShortcuts('searchInChats'), keys: ['⌘', 'K'] },
        { label: tShortcuts('openNewChat'), keys: ['⇧', '⌘', 'O'] },
        { label: tShortcuts('toggleSidebar'), keys: ['⇧', '⌘', 'S'] },
      ],
    },
    {
      category: tShortcuts('chat'),
      shortcuts: [
        { label: tShortcuts('copyLastCodeBlock'), keys: ['⇧', '⌘', ';'] },
        { label: tShortcuts('deleteChat'), keys: ['⇧', '⌘', '⌫'] },
        { label: tShortcuts('focusChatInput'), keys: ['⇧', '⌥', '↩'] },
        { label: tShortcuts('addPhotoAndFiles'), keys: ['⌘', 'U'] },
      ],
    },
    {
      category: tShortcuts('settings'),
      shortcuts: [
        { label: tShortcuts('showShortcuts'), keys: ['⌘', '/'] },
        { label: tShortcuts('setCustomInstructions'), keys: ['⇧', '⌘', 'I'] },
      ],
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div style={{ padding: isSmallScreen ? '1rem 0.75rem' : isMobile ? '1.5rem 1rem' : '2rem' }}>
            <h2 style={{ 
              fontSize: isSmallScreen ? '1.125rem' : isMobile ? '1.25rem' : '1.5rem', 
              fontWeight: 600, 
              marginBottom: isSmallScreen ? '1rem' : isMobile ? '1.5rem' : '2rem', 
              color: 'var(--text-primary, #fff)' 
            }}>{t('general')}</h2>
            
            <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: isSmallScreen ? 'flex-start' : 'space-between', 
                alignItems: isSmallScreen ? 'flex-start' : 'center', 
                gap: isSmallScreen ? '0.5rem' : '0',
                marginBottom: isSmallScreen ? '0.75rem' : '1rem' 
              }}>
                <label style={{ 
                  fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                  color: 'var(--text-primary, #fff)', 
                  fontWeight: 500 
                }}>{t('appearance')}</label>
              <div style={{ width: isSmallScreen || isMobile ? '160px' : '200px' }}>
                <CustomSelect
                  value={appearance}
                  onChange={(value) => {
                    setAppearance(value);
                  }}
                  options={[
                    { value: 'system', label: t('theme.system') },
                    { value: 'light', label: t('theme.light') },
                    { value: 'dark', label: t('theme.dark') },
                  ]}
                  variant="dark"
                  isSmall={isSmallScreen || isMobile}
                />
              </div>
              </div>
            </div>

            <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: isSmallScreen ? 'flex-start' : 'space-between', 
                alignItems: isSmallScreen ? 'flex-start' : 'center', 
                gap: isSmallScreen ? '0.5rem' : '0',
                marginBottom: isSmallScreen ? '0.75rem' : '1rem' 
              }}>
                <label style={{ 
                  fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                  color: 'var(--text-primary, #fff)', 
                  fontWeight: 500 
                }}>{t('accentColorLabel')}</label>
              <div style={{ width: isSmallScreen || isMobile ? '160px' : '200px' }}>
                <CustomSelect
                  value={accentColor}
                  onChange={(value) => {
                    setAccentColor(value);
                  }}
                  options={[
                    { value: 'default', label: t('accentColor.default') },
                    { value: 'blue', label: t('accentColor.blue') },
                    { value: 'green', label: t('accentColor.green') },
                    { value: 'purple', label: t('accentColor.purple') },
                    { value: 'red', label: t('accentColor.red') },
                    { value: 'orange', label: t('accentColor.orange') },
                    { value: 'pink', label: t('accentColor.pink') },
                  ]}
                  variant="dark"
                  isSmall={isSmallScreen || isMobile}
                />
              </div>
              </div>
            </div>

            <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: isSmallScreen ? 'flex-start' : 'space-between', 
                alignItems: isSmallScreen ? 'flex-start' : 'center', 
                gap: isSmallScreen ? '0.5rem' : '0',
                marginBottom: isSmallScreen ? '0.75rem' : '1rem' 
              }}>
                <label style={{ 
                  fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                  color: 'var(--text-primary, #fff)', 
                  fontWeight: 500 
                }}>{t('languageLabel')}</label>
                <div style={{ width: isSmallScreen || isMobile ? '160px' : '200px' }}>
                  <CustomSelect
                    value={language}
                    onChange={setLanguage}
                    options={[
                      { value: 'auto', label: t('language.auto') },
                      { value: 'ru', label: t('language.ru') },
                      { value: 'en', label: 'English' },
                    ]}
                    variant="dark"
                    isSmall={isSmallScreen || isMobile}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: isSmallScreen ? 'flex-start' : 'space-between', 
                alignItems: isSmallScreen ? 'flex-start' : 'center', 
                gap: isSmallScreen ? '0.5rem' : '0',
                marginBottom: isSmallScreen ? '0.75rem' : '1rem' 
              }}>
                <label style={{ 
                  fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                  color: 'var(--text-primary, #fff)', 
                  fontWeight: 500 
                }}>{t('spokenLanguageLabel')}</label>
                <div style={{ width: isSmallScreen || isMobile ? '160px' : '200px' }}>
                  <CustomSelect
                    value={spokenLanguage}
                    onChange={setSpokenLanguage}
                    options={[
                      { value: 'auto', label: t('language.auto') },
                      { value: 'ru', label: t('language.ru') },
                      { value: 'en', label: 'English' },
                    ]}
                    variant="dark"
                    isSmall={isSmallScreen || isMobile}
                  />
                </div>
              </div>
              <p style={{ 
                fontSize: isSmallScreen ? '0.75rem' : '0.875rem', 
                color: 'var(--text-secondary, #8a8a8a)', 
                lineHeight: '1.6', 
                marginTop: isSmallScreen ? '0.375rem' : '0.5rem' 
              }}>
                Для достижения наилучших результатов выберите язык, на котором вы в основном говорите. 
                Если его нет в списке, он все равно может поддерживаться посредством автоматического определения.
              </p>
            </div>

            <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: isSmallScreen ? 'flex-start' : 'space-between', 
                alignItems: isSmallScreen ? 'flex-start' : 'center', 
                gap: isSmallScreen ? '0.5rem' : '0',
                marginBottom: isSmallScreen ? '0.75rem' : '1rem' 
              }}>
                <label style={{ 
                  fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                  color: 'var(--text-primary, #fff)', 
                  fontWeight: 500 
                }}>{t('voice')}</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      color: 'var(--text-primary, #fff)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polygon points="6 4 6 12 12 8 6 4"/>
                    </svg>
                    Воспроизвести
                  </button>
                  <div style={{ width: isSmallScreen || isMobile ? '120px' : '150px' }}>
                    <CustomSelect
                      value={voice}
                      onChange={setVoice}
                      options={[
                        { value: 'spruce', label: 'Spruce' },
                        { value: 'nova', label: 'Nova' },
                        { value: 'shimmer', label: 'Shimmer' },
                      ]}
                      variant="dark"
                      isSmall={isSmallScreen || isMobile}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'personalization':
        return (
          <div style={{ padding: isSmallScreen ? '1rem 0.75rem' : isMobile ? '1.5rem 1rem' : '2rem' }}>
            <h2 style={{ 
              fontSize: isSmallScreen ? '1.125rem' : isMobile ? '1.25rem' : '1.5rem', 
              fontWeight: 600, 
              marginBottom: isSmallScreen ? '1rem' : isMobile ? '1.5rem' : '2rem', 
              color: 'var(--text-primary, #fff)' 
            }}>{t('personalization')}</h2>
            
            <div style={{ marginBottom: isSmallScreen ? '1.5rem' : '2.5rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: isSmallScreen ? 'flex-start' : 'space-between', 
                alignItems: isSmallScreen ? 'flex-start' : 'flex-start', 
                gap: isSmallScreen ? '0.75rem' : '0',
                marginBottom: isSmallScreen ? '0.375rem' : '0.5rem' 
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                    color: 'var(--text-primary, #fff)', 
                    fontWeight: 500, 
                    marginBottom: isSmallScreen ? '0.25rem' : '0.25rem' 
                  }}>
                    Включить персонализацию
                  </div>
                  <p style={{ 
                    fontSize: isSmallScreen ? '0.75rem' : '0.875rem', 
                    color: 'var(--text-secondary, #8a8a8a)', 
                    lineHeight: '1.6' 
                  }}>
                    Настройте, как AliusAI будет отвечать вам.{' '}
                    <a href="#" style={{ color: '#0066cc', textDecoration: 'underline' }}>Узнать больше</a>
                  </p>
                </div>
                <button
                  onClick={() => setPersonalizationEnabled(!personalizationEnabled)}
                  style={{
                    width: isSmallScreen ? '40px' : '48px',
                    height: isSmallScreen ? '24px' : '28px',
                    borderRadius: isSmallScreen ? '12px' : '14px',
                    background: personalizationEnabled ? 'var(--accent-color, #0066cc)' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <motion.div
                    animate={{ x: personalizationEnabled ? (isSmallScreen ? 18 : 20) : 2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: isSmallScreen ? '20px' : '24px',
                      height: isSmallScreen ? '20px' : '24px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                    }}
                  />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: isSmallScreen ? '1.5rem' : '2.5rem' }}>
              <div style={{ marginBottom: isSmallScreen ? '0.5rem' : '0.75rem' }}>
                <label style={{ 
                  fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                  color: 'var(--text-primary, #fff)', 
                  fontWeight: 500, 
                  display: 'block', 
                  marginBottom: isSmallScreen ? '0.375rem' : '0.5rem' 
                }}>
                  {t('communicationStyle')}
                </label>
                <p style={{ 
                  fontSize: isSmallScreen ? '0.75rem' : '0.875rem', 
                  color: '#8a8a8a', 
                  lineHeight: '1.6', 
                  marginBottom: isSmallScreen ? '0.75rem' : '1rem' 
                }}>
                  {t('communicationStyleDescription')}
                </p>
              </div>
              <div style={{ width: isSmallScreen || isMobile ? '160px' : '200px' }}>
                <CustomSelect
                  value={baseStyle}
                  onChange={setBaseStyle}
                  options={[
                    { value: 'default', label: t('style.default') },
                    { value: 'professional', label: t('style.professional') },
                    { value: 'casual', label: t('style.casual') },
                    { value: 'friendly', label: t('style.friendly') },
                  ]}
                  variant="dark"
                  isSmall={isSmallScreen || isMobile}
                />
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ 
                  fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                  color: 'var(--text-primary, #fff)', 
                  fontWeight: 500, 
                  display: 'block', 
                  marginBottom: isSmallScreen ? '0.375rem' : '0.5rem' 
                }}>
                  Пользовательские инструкции
                </label>
              </div>
              <textarea
                value={userInstructions}
                onChange={(e) => setUserInstructions(e.target.value)}
                placeholder={t('customInstructionsPlaceholder')}
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {[t('personality.chatty'), t('personality.witty'), t('personality.frank'), t('personality.encouraging'), t('personality.genZ')].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      const current = userInstructions.split(',').map(t => t.trim()).filter(Boolean);
                      if (!current.includes(tag)) {
                        setUserInstructions([...current, tag].join(', '));
                      }
                    }}
                    style={{
                      padding: '0.375rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      color: 'var(--text-primary, #fff)',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary, #fff)' }}>О вас</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                  color: 'var(--text-primary, #fff)', 
                  fontWeight: 500, 
                  display: 'block', 
                  marginBottom: isSmallScreen ? '0.375rem' : '0.5rem' 
                }}>
                  Псевдоним
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t('nicknamePlaceholder')}
                  style={{
                    width: '100%',
                    padding: isSmallScreen ? '0.625rem' : '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: isSmallScreen ? '6px' : '8px',
                    color: '#fff',
                    fontSize: isSmallScreen ? '0.8125rem' : '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                  color: 'var(--text-primary, #fff)', 
                  fontWeight: 500, 
                  display: 'block', 
                  marginBottom: isSmallScreen ? '0.375rem' : '0.5rem' 
                }}>
                  Профессия
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder={t('professionPlaceholder')}
                  style={{
                    width: '100%',
                    padding: isSmallScreen ? '0.625rem' : '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: isSmallScreen ? '6px' : '8px',
                    color: '#fff',
                    fontSize: isSmallScreen ? '0.8125rem' : '0.875rem',
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 'keyboard':
        return (
          <div style={{ padding: isSmallScreen ? '1rem 0.75rem' : isMobile ? '1.5rem 1rem' : '2rem' }}>
            <h2 style={{ 
              fontSize: isSmallScreen ? '1.125rem' : isMobile ? '1.25rem' : '1.5rem', 
              fontWeight: 600, 
              marginBottom: isSmallScreen ? '1rem' : isMobile ? '1.5rem' : '2rem', 
              color: 'var(--text-primary, #fff)' 
            }}>{t('keyboard')}</h2>
            
            {keyboardShortcuts.map((category, categoryIndex) => (
              <div key={category.category} style={{ marginBottom: categoryIndex < keyboardShortcuts.length - 1 ? (isSmallScreen ? '1.5rem' : '2.5rem') : '0' }}>
                <h3 style={{ 
                  fontSize: isSmallScreen ? '0.75rem' : '0.875rem', 
                  fontWeight: 600, 
                  color: 'var(--text-secondary, #8a8a8a)', 
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {category.category}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {category.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ 
                        fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                        color: 'var(--text-primary, #fff)' 
                      }}>{shortcut.label}</span>
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd style={{
                              padding: '0.25rem 0.5rem',
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '4px',
                              color: 'var(--text-primary, #fff)',
                              fontSize: isSmallScreen ? '0.75rem' : '0.8125rem',
                              fontFamily: 'monospace',
                              minWidth: isSmallScreen ? '20px' : '24px',
                              textAlign: 'center',
                            }}>
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span style={{ color: 'var(--text-secondary, #8a8a8a)', fontSize: '0.75rem' }}>+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'notifications':
        return (
          <div style={{ padding: isSmallScreen ? '1rem 0.75rem' : isMobile ? '1.5rem 1rem' : '2rem' }}>
            <h2 style={{ 
              fontSize: isSmallScreen ? '1.125rem' : isMobile ? '1.25rem' : '1.5rem', 
              fontWeight: 600, 
              marginBottom: isSmallScreen ? '1rem' : isMobile ? '1.5rem' : '2rem', 
              color: 'var(--text-primary, #fff)' 
            }}>{t('notifications')}</h2>
            
            <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: isSmallScreen ? 'flex-start' : 'space-between', 
                alignItems: isSmallScreen ? 'flex-start' : 'center', 
                gap: isSmallScreen ? '0.75rem' : '0',
                marginBottom: isSmallScreen ? '0.75rem' : '1rem' 
              }}>
                <div>
                  <div style={{ 
                    fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                    color: 'var(--text-primary, #fff)', 
                    fontWeight: 500, 
                    marginBottom: isSmallScreen ? '0.25rem' : '0.25rem' 
                  }}>
                    Email уведомления
                  </div>
                  <p style={{ 
                    fontSize: isSmallScreen ? '0.75rem' : '0.875rem', 
                    color: 'var(--text-secondary, #8a8a8a)', 
                    lineHeight: '1.6' 
                  }}>
                    Получать уведомления на email
                  </p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  style={{
                    width: isSmallScreen ? '40px' : '48px',
                    height: isSmallScreen ? '24px' : '28px',
                    borderRadius: isSmallScreen ? '12px' : '14px',
                    background: emailNotifications ? 'var(--accent-color, #0066cc)' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <motion.div
                    animate={{ x: emailNotifications ? (isSmallScreen ? 18 : 20) : 2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: isSmallScreen ? '20px' : '24px',
                      height: isSmallScreen ? '20px' : '24px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                    }}
                  />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: isSmallScreen ? 'flex-start' : 'space-between', 
                alignItems: isSmallScreen ? 'flex-start' : 'center', 
                gap: isSmallScreen ? '0.75rem' : '0',
                marginBottom: isSmallScreen ? '0.75rem' : '1rem' 
              }}>
                <div>
                  <div style={{ 
                    fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                    color: 'var(--text-primary, #fff)', 
                    fontWeight: 500, 
                    marginBottom: isSmallScreen ? '0.25rem' : '0.25rem' 
                  }}>
                    Push уведомления
                  </div>
                  <p style={{ 
                    fontSize: isSmallScreen ? '0.75rem' : '0.875rem', 
                    color: 'var(--text-secondary, #8a8a8a)', 
                    lineHeight: '1.6' 
                  }}>
                    Получать уведомления в браузере
                  </p>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  style={{
                    width: isSmallScreen ? '40px' : '48px',
                    height: isSmallScreen ? '24px' : '28px',
                    borderRadius: isSmallScreen ? '12px' : '14px',
                    background: pushNotifications ? 'var(--accent-color, #0066cc)' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <motion.div
                    animate={{ x: pushNotifications ? (isSmallScreen ? 18 : 20) : 2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: isSmallScreen ? '20px' : '24px',
                      height: isSmallScreen ? '20px' : '24px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                    }}
                  />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: isSmallScreen ? 'flex-start' : 'space-between', 
                alignItems: isSmallScreen ? 'flex-start' : 'center', 
                gap: isSmallScreen ? '0.75rem' : '0',
                marginBottom: isSmallScreen ? '0.75rem' : '1rem' 
              }}>
                <div>
                  <div style={{ 
                    fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                    color: 'var(--text-primary, #fff)', 
                    fontWeight: 500, 
                    marginBottom: isSmallScreen ? '0.25rem' : '0.25rem' 
                  }}>
                    Звуковые уведомления
                  </div>
                  <p style={{ 
                    fontSize: isSmallScreen ? '0.75rem' : '0.875rem', 
                    color: 'var(--text-secondary, #8a8a8a)', 
                    lineHeight: '1.6' 
                  }}>
                    Воспроизводить звук при получении уведомлений
                  </p>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  style={{
                    width: isSmallScreen ? '40px' : '48px',
                    height: isSmallScreen ? '24px' : '28px',
                    borderRadius: isSmallScreen ? '12px' : '14px',
                    background: soundEnabled ? 'var(--accent-color, #0066cc)' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <motion.div
                    animate={{ x: soundEnabled ? (isSmallScreen ? 18 : 20) : 2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: isSmallScreen ? '20px' : '24px',
                      height: isSmallScreen ? '20px' : '24px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                    }}
                  />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ marginBottom: isSmallScreen ? '0.5rem' : '0.75rem' }}>
                <label style={{ 
                  fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                  color: 'var(--text-primary, #fff)', 
                  fontWeight: 500, 
                  display: 'block', 
                  marginBottom: isSmallScreen ? '0.375rem' : '0.5rem' 
                }}>
                  Частота уведомлений
                </label>
              </div>
              <div style={{ width: isSmallScreen || isMobile ? '160px' : '200px' }}>
                <CustomSelect
                  value={notificationFrequency}
                  onChange={setNotificationFrequency}
                  options={[
                    { value: 'immediate', label: t('notificationFrequency.immediate') },
                    { value: 'hourly', label: t('notificationFrequency.hourly') },
                    { value: 'daily', label: t('notificationFrequency.daily') },
                    { value: 'weekly', label: t('notificationFrequency.weekly') },
                  ]}
                  variant="dark"
                  isSmall={isSmallScreen || isMobile}
                />
              </div>
            </div>
          </div>
        );

      case 'apps':
        return (
          <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', color: 'var(--text-primary, #fff)' }}>{t('apps')}</h2>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary, #fff)' }}>Интегрированные приложения</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #8a8a8a)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Подключите сторонние приложения для расширения функциональности AliusAI
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Google Drive', 'Notion', 'Slack', 'GitHub'].map((app) => (
                  <div
                    key={app}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                    }}
                  >
                    <span style={{ color: '#fff', fontSize: '0.95rem' }}>{app}</span>
                    <button
                      onClick={() => {
                        if (integratedApps.includes(app)) {
                          setIntegratedApps(integratedApps.filter(a => a !== app));
                        } else {
                          setIntegratedApps([...integratedApps, app]);
                        }
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        background: integratedApps.includes(app) ? '#dc2626' : 'var(--accent-color, #0066cc)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'var(--text-primary, #fff)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      {integratedApps.includes(app) ? t('disconnect') : t('connect')}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary, #fff)' }}>API ключ</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #8a8a8a)', lineHeight: '1.6', marginBottom: '1rem' }}>
                Используйте API ключ для интеграции с вашими приложениями
              </p>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t('apiKeyPlaceholder')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>
        );

      case 'controls':
        return (
          <div style={{ padding: isSmallScreen ? '1rem 0.75rem' : isMobile ? '1.5rem 1rem' : '2rem' }}>
            <h2 style={{ 
              fontSize: isSmallScreen ? '1.125rem' : isMobile ? '1.25rem' : '1.5rem', 
              fontWeight: 600, 
              marginBottom: isSmallScreen ? '1rem' : isMobile ? '1.5rem' : '2rem', 
              color: 'var(--text-primary, #fff)' 
            }}>{t('controls')}</h2>
            
            <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: isSmallScreen ? 'flex-start' : 'space-between', 
                alignItems: isSmallScreen ? 'flex-start' : 'center', 
                gap: isSmallScreen ? '0.75rem' : '0',
                marginBottom: isSmallScreen ? '0.75rem' : '1rem' 
              }}>
                <div>
                  <div style={{ 
                    fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                    color: 'var(--text-primary, #fff)', 
                    fontWeight: 500, 
                    marginBottom: isSmallScreen ? '0.25rem' : '0.25rem' 
                  }}>
                    Компактный режим
                  </div>
                  <p style={{ 
                    fontSize: isSmallScreen ? '0.75rem' : '0.875rem', 
                    color: 'var(--text-secondary, #8a8a8a)', 
                    lineHeight: '1.6' 
                  }}>
                    Уменьшить отступы и размеры элементов
                  </p>
                </div>
                <button
                  onClick={() => setCompactMode(!compactMode)}
                  style={{
                    width: isSmallScreen ? '40px' : '48px',
                    height: isSmallScreen ? '24px' : '28px',
                    borderRadius: isSmallScreen ? '12px' : '14px',
                    background: compactMode ? 'var(--accent-color, #0066cc)' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <motion.div
                    animate={{ x: compactMode ? (isSmallScreen ? 18 : 20) : 2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: isSmallScreen ? '20px' : '24px',
                      height: isSmallScreen ? '20px' : '24px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                    }}
                  />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: isSmallScreen ? 'flex-start' : 'space-between', 
                alignItems: isSmallScreen ? 'flex-start' : 'center', 
                gap: isSmallScreen ? '0.75rem' : '0',
                marginBottom: isSmallScreen ? '0.75rem' : '1rem' 
              }}>
                <div>
                  <div style={{ 
                    fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                    color: 'var(--text-primary, #fff)', 
                    fontWeight: 500, 
                    marginBottom: isSmallScreen ? '0.25rem' : '0.25rem' 
                  }}>
                    Показывать время сообщений
                  </div>
                  <p style={{ 
                    fontSize: isSmallScreen ? '0.75rem' : '0.875rem', 
                    color: 'var(--text-secondary, #8a8a8a)', 
                    lineHeight: '1.6' 
                  }}>
                    Отображать временные метки для каждого сообщения
                  </p>
                </div>
                <button
                  onClick={() => setShowTimestamps(!showTimestamps)}
                  style={{
                    width: isSmallScreen ? '40px' : '48px',
                    height: isSmallScreen ? '24px' : '28px',
                    borderRadius: isSmallScreen ? '12px' : '14px',
                    background: showTimestamps ? 'var(--accent-color, #0066cc)' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <motion.div
                    animate={{ x: showTimestamps ? (isSmallScreen ? 18 : 20) : 2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: isSmallScreen ? '20px' : '24px',
                      height: isSmallScreen ? '20px' : '24px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                    }}
                  />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: isSmallScreen ? 'flex-start' : 'space-between', 
                alignItems: isSmallScreen ? 'flex-start' : 'center', 
                gap: isSmallScreen ? '0.75rem' : '0',
                marginBottom: isSmallScreen ? '0.75rem' : '1rem' 
              }}>
                <div>
                  <div style={{ 
                    fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                    color: 'var(--text-primary, #fff)', 
                    fontWeight: 500, 
                    marginBottom: isSmallScreen ? '0.25rem' : '0.25rem' 
                  }}>
                    Автосохранение
                  </div>
                  <p style={{ 
                    fontSize: isSmallScreen ? '0.75rem' : '0.875rem', 
                    color: 'var(--text-secondary, #8a8a8a)', 
                    lineHeight: '1.6' 
                  }}>
                    Автоматически сохранять историю чатов
                  </p>
                </div>
                <button
                  onClick={() => setAutoSave(!autoSave)}
                  style={{
                    width: isSmallScreen ? '40px' : '48px',
                    height: isSmallScreen ? '24px' : '28px',
                    borderRadius: isSmallScreen ? '12px' : '14px',
                    background: autoSave ? 'var(--accent-color, #0066cc)' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <motion.div
                    animate={{ x: autoSave ? (isSmallScreen ? 18 : 20) : 2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: isSmallScreen ? '20px' : '24px',
                      height: isSmallScreen ? '20px' : '24px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div style={{ padding: isSmallScreen ? '1rem 0.75rem' : isMobile ? '1.5rem 1rem' : '2rem' }}>
            <h2 style={{ 
              fontSize: isSmallScreen ? '1.125rem' : isMobile ? '1.25rem' : '1.5rem', 
              fontWeight: 600, 
              marginBottom: isSmallScreen ? '1rem' : isMobile ? '1.5rem' : '2rem', 
              color: 'var(--text-primary, #fff)' 
            }}>{t('security')}</h2>
            
            <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: isSmallScreen ? 'flex-start' : 'space-between', 
                alignItems: isSmallScreen ? 'flex-start' : 'center', 
                gap: isSmallScreen ? '0.75rem' : '0',
                marginBottom: isSmallScreen ? '0.75rem' : '1rem' 
              }}>
                <div>
                  <div style={{ 
                    fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                    color: 'var(--text-primary, #fff)', 
                    fontWeight: 500, 
                    marginBottom: isSmallScreen ? '0.25rem' : '0.25rem' 
                  }}>
                    Двухфакторная аутентификация
                  </div>
                  <p style={{ 
                    fontSize: isSmallScreen ? '0.75rem' : '0.875rem', 
                    color: 'var(--text-secondary, #8a8a8a)', 
                    lineHeight: '1.6' 
                  }}>
                    Дополнительная защита вашего аккаунта
                  </p>
                </div>
                <button
                  onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                  style={{
                    width: isSmallScreen ? '40px' : '48px',
                    height: isSmallScreen ? '24px' : '28px',
                    borderRadius: isSmallScreen ? '12px' : '14px',
                    background: twoFactorAuth ? 'var(--accent-color, #0066cc)' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <motion.div
                    animate={{ x: twoFactorAuth ? (isSmallScreen ? 18 : 20) : 2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: isSmallScreen ? '20px' : '24px',
                      height: isSmallScreen ? '20px' : '24px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                    }}
                  />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
              <div style={{ marginBottom: isSmallScreen ? '0.5rem' : '0.75rem' }}>
                <label style={{ 
                  fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                  color: 'var(--text-primary, #fff)', 
                  fontWeight: 500, 
                  display: 'block', 
                  marginBottom: isSmallScreen ? '0.375rem' : '0.5rem' 
                }}>
                  Таймаут сессии (минуты)
                </label>
                <p style={{ 
                  fontSize: isSmallScreen ? '0.75rem' : '0.875rem', 
                  color: '#8a8a8a', 
                  lineHeight: '1.6', 
                  marginBottom: isSmallScreen ? '0.375rem' : '0.5rem' 
                }}>
                  Автоматический выход из аккаунта после периода неактивности
                </p>
              </div>
              <div style={{ width: isSmallScreen || isMobile ? '160px' : '200px' }}>
                <CustomSelect
                  value={sessionTimeout}
                  onChange={setSessionTimeout}
                  options={[
                    { value: '15', label: '15 минут' },
                    { value: '30', label: '30 минут' },
                    { value: '60', label: '1 час' },
                    { value: '120', label: '2 часа' },
                    { value: 'never', label: t('notificationFrequency.never') },
                  ]}
                  variant="dark"
                  isSmall={isSmallScreen || isMobile}
                />
              </div>
            </div>

            <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
              <div style={{ marginBottom: isSmallScreen ? '0.5rem' : '0.75rem' }}>
                <label style={{ 
                  fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                  color: 'var(--text-primary, #fff)', 
                  fontWeight: 500, 
                  display: 'block', 
                  marginBottom: isSmallScreen ? '0.375rem' : '0.5rem' 
                }}>
                  Хранение данных (дни)
                </label>
                <p style={{ 
                  fontSize: isSmallScreen ? '0.75rem' : '0.875rem', 
                  color: '#8a8a8a', 
                  lineHeight: '1.6', 
                  marginBottom: isSmallScreen ? '0.375rem' : '0.5rem' 
                }}>
                  Период хранения истории чатов и данных
                </p>
              </div>
              <div style={{ width: isSmallScreen || isMobile ? '160px' : '200px' }}>
                <CustomSelect
                  value={dataRetention}
                  onChange={setDataRetention}
                  options={[
                    { value: '30', label: '30 дней' },
                    { value: '90', label: '90 дней' },
                    { value: '180', label: '180 дней' },
                    { value: '365', label: '1 год' },
                    { value: 'forever', label: t('parentalControlLevel.forever') },
                  ]}
                  variant="dark"
                  isSmall={isSmallScreen || isMobile}
                />
              </div>
            </div>
          </div>
        );

      case 'parental':
        return (
          <div style={{ padding: isSmallScreen ? '1rem 0.75rem' : isMobile ? '1.5rem 1rem' : '2rem' }}>
            <h2 style={{ 
              fontSize: isSmallScreen ? '1.125rem' : isMobile ? '1.25rem' : '1.5rem', 
              fontWeight: 600, 
              marginBottom: isSmallScreen ? '1rem' : isMobile ? '1.5rem' : '2rem', 
              color: 'var(--text-primary, #fff)' 
            }}>{t('parental')}</h2>
            
            <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: isSmallScreen ? 'flex-start' : 'space-between', 
                alignItems: isSmallScreen ? 'flex-start' : 'center', 
                gap: isSmallScreen ? '0.75rem' : '0',
                marginBottom: isSmallScreen ? '0.75rem' : '1rem' 
              }}>
                <div>
                  <div style={{ 
                    fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                    color: 'var(--text-primary, #fff)', 
                    fontWeight: 500, 
                    marginBottom: isSmallScreen ? '0.25rem' : '0.25rem' 
                  }}>
                    Включить родительский контроль
                  </div>
                  <p style={{ 
                    fontSize: isSmallScreen ? '0.75rem' : '0.875rem', 
                    color: 'var(--text-secondary, #8a8a8a)', 
                    lineHeight: '1.6' 
                  }}>
                    Ограничить доступ к определенным функциям
                  </p>
                </div>
                <button
                  onClick={() => setParentalControlEnabled(!parentalControlEnabled)}
                  style={{
                    width: isSmallScreen ? '40px' : '48px',
                    height: isSmallScreen ? '24px' : '28px',
                    borderRadius: isSmallScreen ? '12px' : '14px',
                    background: parentalControlEnabled ? 'var(--accent-color, #0066cc)' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <motion.div
                    animate={{ x: parentalControlEnabled ? (isSmallScreen ? 18 : 20) : 2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: isSmallScreen ? '20px' : '24px',
                      height: isSmallScreen ? '20px' : '24px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                    }}
                  />
                </button>
              </div>
            </div>

            {parentalControlEnabled && (
              <div style={{ marginBottom: isSmallScreen ? '1.25rem' : '2rem' }}>
                <div style={{ marginBottom: isSmallScreen ? '0.5rem' : '0.75rem' }}>
                  <label style={{ 
                  fontSize: isSmallScreen ? '0.8125rem' : '0.95rem', 
                  color: 'var(--text-primary, #fff)', 
                  fontWeight: 500, 
                  display: 'block', 
                  marginBottom: isSmallScreen ? '0.375rem' : '0.5rem' 
                }}>
                    Фильтр контента
                  </label>
                  <p style={{ 
                    fontSize: isSmallScreen ? '0.75rem' : '0.875rem', 
                    color: '#8a8a8a', 
                    lineHeight: '1.6', 
                    marginBottom: isSmallScreen ? '0.375rem' : '0.5rem' 
                  }}>
                    Уровень фильтрации контента
                  </p>
                </div>
                <div style={{ width: isSmallScreen || isMobile ? '160px' : '200px' }}>
                  <CustomSelect
                    value={contentFilter}
                    onChange={setContentFilter}
                    options={[
                      { value: 'strict', label: t('parentalControlLevel.strict') },
                      { value: 'moderate', label: t('parentalControlLevel.moderate') },
                      { value: 'lenient', label: t('parentalControlLevel.lenient') },
                    ]}
                    variant="dark"
                    isSmall={isSmallScreen || isMobile}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'account':
        return (
          <div style={{ padding: isSmallScreen ? '1rem 0.75rem' : isMobile ? '1.5rem 1rem' : '2rem' }}>
            <h2 style={{ 
              fontSize: isSmallScreen ? '1.125rem' : isMobile ? '1.25rem' : '1.5rem', 
              fontWeight: 600, 
              marginBottom: isSmallScreen ? '1rem' : isMobile ? '1.5rem' : '2rem', 
              color: 'var(--text-primary, #fff)' 
            }}>{t('account')}</h2>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: '0.95rem', color: 'var(--text-primary, #fff)', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                Имя
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder={t('namePlaceholder')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: '0.95rem', color: 'var(--text-primary, #fff)', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                Email
              </label>
              <input
                type="email"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary, #fff)' }}>Опасная зона</h3>
              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#dc2626',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#dc2626'}
              >
                Удалить аккаунт
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div style={{ padding: isSmallScreen ? '1rem 0.75rem' : isMobile ? '1.5rem 1rem' : '2rem' }}>
            <h2 style={{ 
              fontSize: isSmallScreen ? '1.125rem' : isMobile ? '1.25rem' : '1.5rem', 
              fontWeight: 600, 
              marginBottom: isSmallScreen ? '1rem' : isMobile ? '1.5rem' : '2rem', 
              color: 'var(--text-primary, #fff)' 
            }}>
              {sections.find(s => s.id === activeSection)?.label}
            </h2>
            <p style={{ 
              fontSize: isSmallScreen ? '0.8125rem' : '0.875rem',
              color: 'var(--text-secondary, #8a8a8a)' 
            }}>Раздел в разработке</p>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 3000,
            }}
          />
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: isMobile ? '100vw' : '90vw',
              maxWidth: isMobile ? '100vw' : '800px',
              background: 'var(--bg-primary, #1a1a1a)',
              zIndex: 3001,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              boxShadow: '-10px 0 60px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar */}
            {!isMobile && (
            <div style={{
              width: '240px',
              background: 'var(--bg-secondary, #0f0f0f)',
              borderRight: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary, #fff)', margin: 0 }}>{tShortcuts('settings')}</h2>
                <button
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary, #fff)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    opacity: 0.7,
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 5L5 15M5 5l10 10" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              
              <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: activeSection === section.id ? 'color-mix(in srgb, var(--text-primary, #ffffff) 10%, transparent)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: activeSection === section.id ? 'var(--text-primary, #fff)' : 'var(--text-secondary, #8a8a8a)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.95rem',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      marginBottom: '0.25rem',
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== section.id) {
                        e.currentTarget.style.background = 'color-mix(in srgb, var(--text-primary, #ffffff) 5%, transparent)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== section.id) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            )}

            {/* Mobile Sidebar Toggle */}
            {isMobile && (
              <div style={{
                padding: isSmallScreen ? '0.75rem' : '1rem',
                borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-secondary, #0f0f0f)',
              }}>
                <h2 style={{ 
                  fontSize: isSmallScreen ? '1rem' : '1.125rem', 
                  fontWeight: 600, 
                  color: 'var(--text-primary, #fff)', 
                  margin: 0 
                }}>{tShortcuts('settings')}</h2>
                <button
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary, #fff)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    opacity: 0.7,
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 5L15 15M15 5L5 15"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Mobile Section Selector */}
            {isMobile && (
              <div style={{
                padding: isSmallScreen ? '0.5rem' : '0.75rem',
                borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                background: 'var(--bg-secondary, #0f0f0f)',
                overflowX: 'auto',
              }}>
                <div style={{
                  display: 'flex',
                  gap: isSmallScreen ? '0.375rem' : '0.5rem',
                  minWidth: 'max-content',
                }}>
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      style={{
                        padding: isSmallScreen ? '0.375rem 0.75rem' : '0.5rem 1rem',
                        background: activeSection === section.id 
                          ? 'var(--accent-color, #0066cc)' 
                          : 'transparent',
                        border: '1px solid',
                        borderColor: activeSection === section.id 
                          ? 'var(--accent-color, #0066cc)' 
                          : 'var(--border-color, rgba(255, 255, 255, 0.1))',
                        borderRadius: isSmallScreen ? '6px' : '8px',
                        color: 'var(--text-primary, #fff)',
                        fontSize: isSmallScreen ? '0.75rem' : '0.875rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                      }}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              background: 'var(--bg-primary, #1a1a1a)',
              padding: isMobile ? '1rem' : '0',
            }}>
              {renderContent()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

