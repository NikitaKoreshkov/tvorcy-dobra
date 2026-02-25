'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/src/routing';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import CustomNotification from '../components/CustomNotification';
import AliusAISettings from '../components/AliusAISettings';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AliusAIPage() {
  const t = useTranslations('aliusAIPage');
  const tCommon = useTranslations('common');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isChatsExpanded, setIsChatsExpanded] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [showHelpSubmenu, setShowHelpSubmenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const helpSubmenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const helpButtonRef = useRef<HTMLButtonElement | null>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInitialSection, setSettingsInitialSection] = useState<string>('general');
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const copyNotificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Устанавливаем монтирование после первого рендера
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Определение мобильного устройства и настройка видимости панели
  useEffect(() => {
    if (!isMounted) return;
    
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // На мобильных устройствах скрываем панель по умолчанию
      if (mobile) {
        setIsSidebarVisible(false);
      } else {
        setIsSidebarVisible(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMounted]);

  // Apply theme and accent color on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const appearance = localStorage.getItem('alius-ai-appearance') || 'system';
    const accentColor = localStorage.getItem('alius-ai-accent-color') || 'default';
    
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
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (appearance === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    
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
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Проверяем наличие автосообщения при монтировании компонента и отправляем автоматически
  useEffect(() => {
    const savedMessage = sessionStorage.getItem('aliusAutoMessage');
    if (savedMessage) {
      sessionStorage.removeItem('aliusAutoMessage');
      
      // Создаём сообщение пользователя
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: savedMessage,
        timestamp: new Date(),
      };

      // Добавляем сообщение в список
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Симулируем ответ ИИ
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: tCommon('testModeMessage'),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000);
    }
  }, []);


  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: tCommon('aliusAI.testMode'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // Здесь будет логика записи голоса
  };

  const handleCopyEmail = async () => {
    const email = user?.email || 'koreskovnikita32@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      
      // Очищаем предыдущий таймер, если он есть
      if (copyNotificationTimeoutRef.current) {
        clearTimeout(copyNotificationTimeoutRef.current);
      }
      
      // Сбрасываем состояние перед показом нового уведомления
      setShowCopyNotification(false);
      
      // Небольшая задержка для сброса анимации
      setTimeout(() => {
        setShowCopyNotification(true);
        copyNotificationTimeoutRef.current = setTimeout(() => {
          setShowCopyNotification(false);
          copyNotificationTimeoutRef.current = null;
        }, 3000);
      }, 50);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
        setSelectedMenu(null);
      }
    };

    if (isMenuOpen || isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isProfileMenuOpen]);

  return (
    <>
      {/* Copy Notification - вне основного контейнера для позиционирования относительно всего экрана */}
      <AnimatePresence>
        {showCopyNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -20, scale: 0.95, x: '-50%' }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: '24px',
              left: '50%',
              background: '#22c55e',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 9999,
              boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3)',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8L6 10L12 4"/>
              </svg>
            </div>
            <span style={{
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
            }}>
              Email скопирован в буфер обмена
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="alius-chat-page">
      {/* Mobile Menu Button */}
      {isMounted && isMobile && (
        <button
          className="alius-chat-mobile-menu-btn"
          onClick={() => setIsSidebarVisible(true)}
          style={{ display: isSidebarVisible ? 'none' : 'flex' }}
          aria-label={t('openSidebar')}
        >
          <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="12" height="1.5" rx="0.75" fill="currentColor"/>
            <rect x="2" y="7.25" width="12" height="1.5" rx="0.75" fill="currentColor"/>
            <rect x="2" y="10.5" width="12" height="1.5" rx="0.75" fill="currentColor"/>
          </svg>
        </button>
      )}

      {/* Overlay для мобильных */}
      {isMounted && isMobile && (
        <AnimatePresence>
          {isSidebarVisible && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="alius-chat-sidebar-overlay"
              onClick={() => setIsSidebarVisible(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999,
              }}
            />
          )}
        </AnimatePresence>
      )}

      {/* Sidebar */}
      {isMobile ? (
        <AnimatePresence mode="wait">
          {isSidebarVisible && (
            <motion.aside
              key="sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="alius-chat-sidebar"
            >
        <div className="alius-chat-sidebar-header">
          <Link href="/" className="alius-chat-logo-link">
            <span className="alius-chat-logo-text">The creators of Good</span>
          </Link>
          <button
            className="alius-chat-sidebar-toggle"
            onClick={() => setIsSidebarVisible(false)}
            type="button"
            aria-label={t('hidePanel')}
          >
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 4V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="alius-chat-sidebar-content">
              <button className="alius-chat-new-chat-btn">
                <Image
                  src="/images/chat.png"
                  alt={t('newChat')}
                  width={16}
                  height={16}
                  className="alius-chat-new-chat-icon"
                />
                {t('newChat')}
              </button>
              
              <div className="alius-chat-chats-section">
                <button 
                  className="alius-chat-chats-header"
                  onClick={() => setIsChatsExpanded(!isChatsExpanded)}
                >
                  <span className="alius-chat-chats-title">{t('chats')}</span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className={`alius-chat-chats-arrow ${isChatsExpanded ? 'expanded' : ''}`}
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {isChatsExpanded && (
                  <div className="alius-chat-chats-list">
                    {/* Здесь будет список чатов */}
                  </div>
                )}
              </div>
            </div>

            <div className="alius-chat-sidebar-footer" style={{ position: 'relative' }}>
              <div 
                className="alius-chat-user-info"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                style={{ cursor: 'pointer' }}
              >
                {user?.profileAvatar ? (
                  <img 
                    src={user.profileAvatar} 
                    alt={user.name || 'User'} 
                    className="alius-chat-user-avatar"
                    style={{ borderRadius: '50%', width: '32px', height: '32px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="alius-chat-user-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'П'}
                  </div>
                )}
                <div className="alius-chat-user-details">
                  <div className="alius-chat-user-name">{user?.name || 'Пользователь'}</div>
                  <div className="alius-chat-user-plan">
                    {user?.subscription?.planName || 'Бесплатно'}
                  </div>
                </div>
              </div>
              {/* Profile Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    ref={profileMenuRef}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute',
                      bottom: '80px',
                      left: '16px',
                      width: '320px',
                      height: 'auto',
                      maxHeight: '500px',
                      background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      zIndex: 1000,
                      overflow: 'visible',
                    }}
                  >
                    {/* Left Panel */}
                    <div style={{
                      width: '100%',
                      padding: '8px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}>
                      <div style={{ padding: '0', overflowY: 'auto', overflowX: 'visible' }}>
                        <button
                          onClick={handleCopyEmail}
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '14px',
                            transition: 'background 0.2s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="2" y="4" width="12" height="8" rx="1"/>
                            <path d="M2 5L8 9L14 5"/>
                          </svg>
                          {user?.email || 'koreskovnikita32@gmail.com'}
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setSelectedMenu(null);
                            router.push('/profile?tab=subscriptions');
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '14px',
                            transition: 'background 0.2s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M8 2L10 6L14 7L10 8L8 12L6 8L2 7L6 6L8 2Z"/>
                          </svg>
                          Обновить план
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setSettingsInitialSection('personalization');
                            setSettingsOpen(true);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '14px',
                            transition: 'background 0.2s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M8 2L2 5L8 8L14 5L8 2Z"/>
                            <path d="M2 5V11L8 14L14 11V5"/>
                            <path d="M8 8V14"/>
                            <circle cx="8" cy="11" r="1" fill="currentColor"/>
                          </svg>
                          Персонализация
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setSettingsInitialSection('general');
                            setSettingsOpen(true);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '14px',
                            transition: 'background 0.2s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="8" cy="8" r="2"/>
                            <path d="M8 2V3M8 13V14M3 8H2M14 8H13M4.5 4.5L3.5 3.5M12.5 12.5L11.5 11.5M11.5 4.5L12.5 3.5M3.5 12.5L4.5 11.5"/>
                          </svg>
                          Настройки
                        </button>
                        <div style={{ 
                          width: '100%', 
                          height: '1px', 
                          background: 'rgba(255, 255, 255, 0.1)', 
                          margin: '4px 0' 
                        }}></div>
                        <div
                          style={{ position: 'relative', zIndex: 1 }}
                          onMouseEnter={() => {
                            if (helpSubmenuTimeoutRef.current) {
                              clearTimeout(helpSubmenuTimeoutRef.current);
                            }
                            setShowHelpSubmenu(true);
                          }}
                          onMouseLeave={() => {
                            helpSubmenuTimeoutRef.current = setTimeout(() => {
                              setShowHelpSubmenu(false);
                            }, 200);
                          }}
                        >
                          <button
                            ref={helpButtonRef}
                            data-help-button
                            style={{
                              width: '100%',
                              padding: '10px 16px',
                              background: showHelpSubmenu ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                              border: 'none',
                              color: '#fff',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              fontSize: '14px',
                              transition: 'background 0.2s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="8" cy="8" r="6"/>
                                <path d="M8 6C7.5 6 7 6.5 7 7V8C7 8.5 7.5 9 8 9M8 11H8.01"/>
                              </svg>
                              Справка
                            </div>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.6 }}>
                              <path d="M6 12L10 8L6 4"/>
                            </svg>
                          </button>
                        </div>
                        {/* Help Submenu - вынесен за пределы скроллируемого контейнера */}
                        <AnimatePresence>
                          {showHelpSubmenu && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                              onMouseEnter={() => {
                                if (helpSubmenuTimeoutRef.current) {
                                  clearTimeout(helpSubmenuTimeoutRef.current);
                                }
                              }}
                              onMouseLeave={() => {
                                helpSubmenuTimeoutRef.current = setTimeout(() => {
                                  setShowHelpSubmenu(false);
                                }, 200);
                              }}
                              style={{
                                position: 'fixed',
                                left: typeof window !== 'undefined' && profileMenuRef.current
                                  ? isMobile
                                    ? '16px'
                                    : `${profileMenuRef.current.getBoundingClientRect().right + 8}px`
                                  : isMobile ? '16px' : '336px',
                                top: typeof window !== 'undefined' && profileMenuRef.current
                                  ? isMobile
                                    ? `${profileMenuRef.current.getBoundingClientRect().top}px`
                                    : `${profileMenuRef.current.getBoundingClientRect().top}px`
                                  : 'auto',
                                transform: isMobile ? 'translateY(-100%)' : 'none',
                                marginTop: isMobile ? '-8px' : '0',
                                right: isMobile ? '16px' : 'auto',
                                width: isMobile ? 'calc(100vw - 32px)' : '280px',
                                maxWidth: isMobile ? '320px' : '280px',
                                background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: isMobile ? '6px' : '8px',
                                zIndex: 1002,
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                                pointerEvents: 'auto',
                              }}
                            >
                                <Link href="/support/help-center" style={{ textDecoration: 'none' }}>
                                  <button
                                    onClick={() => {
                                      setIsProfileMenuOpen(false);
                                      setShowHelpSubmenu(false);
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: isMobile ? '8px 10px' : '10px 12px',
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#fff',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: isMobile ? '10px' : '12px',
                                      fontSize: isMobile ? '13px' : '14px',
                                      transition: 'background 0.2s ease',
                                      borderRadius: '8px',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                      <circle cx="8" cy="8" r="6"/>
                                      <path d="M8 5V8M8 11H8.01"/>
                                    </svg>
                                    Справочный центр
                                  </button>
                                </Link>
                                <Link href="/support/release-notes" style={{ textDecoration: 'none' }}>
                                  <button
                                    onClick={() => {
                                      setIsProfileMenuOpen(false);
                                      setShowHelpSubmenu(false);
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: isMobile ? '8px 10px' : '10px 12px',
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#fff',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: isMobile ? '10px' : '12px',
                                      fontSize: isMobile ? '13px' : '14px',
                                      transition: 'background 0.2s ease',
                                      borderRadius: '8px',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                      <path d="M3 5H13M3 8H13M3 11H9"/>
                                    </svg>
                                    Примечания к выпуску
                                  </button>
                                </Link>
                                <Link href="/legal/user-agreement" style={{ textDecoration: 'none' }}>
                                  <button
                                    onClick={() => {
                                      setIsProfileMenuOpen(false);
                                      setShowHelpSubmenu(false);
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: isMobile ? '8px 10px' : '10px 12px',
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#fff',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: isMobile ? '10px' : '12px',
                                      fontSize: isMobile ? '13px' : '14px',
                                      transition: 'background 0.2s ease',
                                      borderRadius: '8px',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                      <rect x="3" y="3" width="10" height="10" rx="1"/>
                                      <path d="M6 7H10M6 10H10"/>
                                    </svg>
                                    Условия и политика
                                  </button>
                                </Link>
                                <Link href="/support/report-bug" style={{ textDecoration: 'none' }}>
                                  <button
                                    onClick={() => {
                                      setIsProfileMenuOpen(false);
                                      setShowHelpSubmenu(false);
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: isMobile ? '8px 10px' : '10px 12px',
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#fff',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: isMobile ? '10px' : '12px',
                                      fontSize: isMobile ? '13px' : '14px',
                                      transition: 'background 0.2s ease',
                                      borderRadius: '8px',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                      <path d="M8 2L10 6L14 7L10 8L8 12L6 8L2 7L6 6L8 2Z"/>
                                    </svg>
                                    Сообщить об ошибке
                                  </button>
                                </Link>
                                <button
                                  onClick={() => {
                                    setIsProfileMenuOpen(false);
                                    setShowHelpSubmenu(false);
                                    setSettingsInitialSection('keyboard');
                                    setSettingsOpen(true);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontSize: '14px',
                                    transition: 'background 0.2s ease',
                                    borderRadius: '8px',
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M8 2V6M8 10V14M4 8H12"/>
                                  </svg>
                                  Сочетания клавиш
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        <button
                          onClick={() => {
                            setShowLogoutConfirm(true);
                            setIsProfileMenuOpen(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '14px',
                            transition: 'background 0.2s ease',
                            marginTop: '4px',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 12H14M10 8L14 4M10 8L14 12"/>
                            <path d="M2 8H10"/>
                          </svg>
                          Выйти
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
      </motion.aside>
          )}
        </AnimatePresence>
      ) : (
        <aside className={`alius-chat-sidebar ${isSidebarVisible ? '' : 'collapsed'}`}>
          <div className="alius-chat-sidebar-header">
            {isSidebarVisible ? (
              <>
                <Link href="/" className="alius-chat-logo-link">
                  <span className="alius-chat-logo-text">The creators of Good</span>
                </Link>
                <button
                  className="alius-chat-sidebar-toggle"
                  onClick={() => setIsSidebarVisible(false)}
                  type="button"
                  aria-label={t('hidePanel')}
                >
                  <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 4V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            ) : (
              <button
                className="alius-chat-sidebar-toggle alius-chat-sidebar-show-btn"
                onClick={() => setIsSidebarVisible(true)}
                type="button"
                aria-label={t('showPanel')}
                title={t('openSidebar')}
              >
                <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 4V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>

          {isSidebarVisible && (
            <>
              <div className="alius-chat-sidebar-content">
                <button className="alius-chat-new-chat-btn">
                  <Image
                    src="/images/chat.png"
                    alt={t('newChat')}
                    width={16}
                    height={16}
                    className="alius-chat-new-chat-icon"
                  />
                  {t('newChat')}
                </button>
                
                <div className="alius-chat-chats-section">
                  <button 
                    className="alius-chat-chats-header"
                    onClick={() => setIsChatsExpanded(!isChatsExpanded)}
                  >
                    <span className="alius-chat-chats-title">{t('chats')}</span>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className={`alius-chat-chats-arrow ${isChatsExpanded ? 'expanded' : ''}`}
                    >
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {isChatsExpanded && (
                    <div className="alius-chat-chats-list">
                      {/* Здесь будет список чатов */}
                    </div>
                  )}
                </div>
              </div>

              <div className="alius-chat-sidebar-footer" style={{ position: 'relative' }}>
                <div 
                  className="alius-chat-user-info"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  style={{ cursor: 'pointer' }}
                >
                  {user?.profileAvatar ? (
                    <img 
                      src={user.profileAvatar} 
                      alt={user.name || 'User'} 
                      className="alius-chat-user-avatar"
                      style={{ borderRadius: '50%', width: '32px', height: '32px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="alius-chat-user-avatar">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'П'}
                    </div>
                  )}
                  <div className="alius-chat-user-details">
                    <div className="alius-chat-user-name">{user?.name || 'Пользователь'}</div>
                    <div className="alius-chat-user-plan">
                      {user?.subscription?.planName || 'Бесплатно'}
                    </div>
                  </div>
                </div>
                {/* Profile Menu */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      ref={profileMenuRef}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'absolute',
                        bottom: '80px',
                        left: '16px',
                        width: '320px',
                        height: 'auto',
                        maxHeight: '500px',
                        background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        zIndex: 1000,
                        overflow: 'visible',
                      }}
                    >
                      {/* Left Panel */}
                      <div style={{
                        width: '100%',
                        padding: '8px 0',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                      }}>
                        <div style={{ padding: '0', overflowY: 'auto', overflowX: 'visible' }}>
                          <button
                            onClick={handleCopyEmail}
                            style={{
                              width: '100%',
                              padding: '10px 16px',
                              background: 'transparent',
                              border: 'none',
                              color: '#fff',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              fontSize: '14px',
                              transition: 'background 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="2" y="4" width="12" height="8" rx="1"/>
                              <path d="M2 5L8 9L14 5"/>
                            </svg>
                            {user?.email || 'koreskovnikita32@gmail.com'}
                          </button>
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              setSelectedMenu(null);
                              router.push('/profile?tab=subscriptions');
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 16px',
                              background: 'transparent',
                              border: 'none',
                              color: '#fff',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              fontSize: '14px',
                              transition: 'background 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M8 2L10 6L14 7L10 8L8 12L6 8L2 7L6 6L8 2Z"/>
                            </svg>
                            Обновить план
                          </button>
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              setSettingsInitialSection('personalization');
                              setSettingsOpen(true);
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 16px',
                              background: 'transparent',
                              border: 'none',
                              color: '#fff',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              fontSize: '14px',
                              transition: 'background 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M8 2L2 5L8 8L14 5L8 2Z"/>
                              <path d="M2 5V11L8 14L14 11V5"/>
                              <path d="M8 8V14"/>
                              <circle cx="8" cy="11" r="1" fill="currentColor"/>
                            </svg>
                            Персонализация
                          </button>
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              setSettingsInitialSection('general');
                              setSettingsOpen(true);
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 16px',
                              background: 'transparent',
                              border: 'none',
                              color: '#fff',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              fontSize: '14px',
                              transition: 'background 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <circle cx="8" cy="8" r="2"/>
                              <path d="M8 2V3M8 13V14M3 8H2M14 8H13M4.5 4.5L3.5 3.5M12.5 12.5L11.5 11.5M11.5 4.5L12.5 3.5M3.5 12.5L4.5 11.5"/>
                            </svg>
                            Настройки
                          </button>
                          <div style={{ 
                            width: '100%', 
                            height: '1px', 
                            background: 'rgba(255, 255, 255, 0.1)', 
                            margin: '4px 0' 
                          }}></div>
                          <div
                            style={{ position: 'relative', zIndex: 1 }}
                            onMouseEnter={() => {
                              if (helpSubmenuTimeoutRef.current) {
                                clearTimeout(helpSubmenuTimeoutRef.current);
                              }
                              setShowHelpSubmenu(true);
                            }}
                            onMouseLeave={() => {
                              helpSubmenuTimeoutRef.current = setTimeout(() => {
                                setShowHelpSubmenu(false);
                              }, 200);
                            }}
                          >
                            <button
                              ref={helpButtonRef}
                              data-help-button
                              style={{
                                width: '100%',
                                padding: '10px 16px',
                                background: showHelpSubmenu ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                border: 'none',
                                color: '#fff',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                fontSize: '14px',
                                transition: 'background 0.2s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <circle cx="8" cy="8" r="6"/>
                                  <path d="M8 6C7.5 6 7 6.5 7 7V8C7 8.5 7.5 9 8 9M8 11H8.01"/>
                                </svg>
                                Справка
                              </div>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.6 }}>
                                <path d="M6 12L10 8L6 4"/>
                              </svg>
                            </button>
                          </div>
                          {/* Help Submenu */}
                          <AnimatePresence>
                            {showHelpSubmenu && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                onMouseEnter={() => {
                                  if (helpSubmenuTimeoutRef.current) {
                                    clearTimeout(helpSubmenuTimeoutRef.current);
                                  }
                                }}
                                onMouseLeave={() => {
                                  helpSubmenuTimeoutRef.current = setTimeout(() => {
                                    setShowHelpSubmenu(false);
                                  }, 200);
                                }}
                                style={{
                                  position: 'fixed',
                                  left: typeof window !== 'undefined' && profileMenuRef.current
                                    ? isMobile
                                      ? '16px'
                                      : `${profileMenuRef.current.getBoundingClientRect().right + 8}px`
                                    : isMobile ? '16px' : '336px',
                                  top: typeof window !== 'undefined' && profileMenuRef.current
                                    ? isMobile
                                      ? `${profileMenuRef.current.getBoundingClientRect().bottom + 8}px`
                                      : `${profileMenuRef.current.getBoundingClientRect().top}px`
                                    : 'auto',
                                  right: isMobile ? '16px' : 'auto',
                                  width: isMobile ? 'calc(100vw - 32px)' : '280px',
                                  maxWidth: isMobile ? '320px' : '280px',
                                  background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  borderRadius: '12px',
                                  padding: isMobile ? '6px' : '8px',
                                  zIndex: 1002,
                                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                                  pointerEvents: 'auto',
                                }}
                              >
                                <Link href="/support/help-center" style={{ textDecoration: 'none' }}>
                                  <button
                                    onClick={() => {
                                      setIsProfileMenuOpen(false);
                                      setShowHelpSubmenu(false);
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: isMobile ? '8px 10px' : '10px 12px',
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#fff',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: isMobile ? '10px' : '12px',
                                      fontSize: isMobile ? '13px' : '14px',
                                      transition: 'background 0.2s ease',
                                      borderRadius: '8px',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                      <circle cx="8" cy="8" r="6"/>
                                      <path d="M8 5V8M8 11H8.01"/>
                                    </svg>
                                    Справочный центр
                                  </button>
                                </Link>
                                <Link href="/support/release-notes" style={{ textDecoration: 'none' }}>
                                  <button
                                    onClick={() => {
                                      setIsProfileMenuOpen(false);
                                      setShowHelpSubmenu(false);
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: isMobile ? '8px 10px' : '10px 12px',
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#fff',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: isMobile ? '10px' : '12px',
                                      fontSize: isMobile ? '13px' : '14px',
                                      transition: 'background 0.2s ease',
                                      borderRadius: '8px',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                      <path d="M3 5H13M3 8H13M3 11H9"/>
                                    </svg>
                                    Примечания к выпуску
                                  </button>
                                </Link>
                                <Link href="/legal/user-agreement" style={{ textDecoration: 'none' }}>
                                  <button
                                    onClick={() => {
                                      setIsProfileMenuOpen(false);
                                      setShowHelpSubmenu(false);
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: isMobile ? '8px 10px' : '10px 12px',
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#fff',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: isMobile ? '10px' : '12px',
                                      fontSize: isMobile ? '13px' : '14px',
                                      transition: 'background 0.2s ease',
                                      borderRadius: '8px',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                      <rect x="3" y="3" width="10" height="10" rx="1"/>
                                      <path d="M6 7H10M6 10H10"/>
                                    </svg>
                                    Условия и политика
                                  </button>
                                </Link>
                                <Link href="/support/report-bug" style={{ textDecoration: 'none' }}>
                                  <button
                                    onClick={() => {
                                      setIsProfileMenuOpen(false);
                                      setShowHelpSubmenu(false);
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: isMobile ? '8px 10px' : '10px 12px',
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#fff',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: isMobile ? '10px' : '12px',
                                      fontSize: isMobile ? '13px' : '14px',
                                      transition: 'background 0.2s ease',
                                      borderRadius: '8px',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                      <path d="M8 2L10 6L14 7L10 8L8 12L6 8L2 7L6 6L8 2Z"/>
                                    </svg>
                                    Сообщить об ошибке
                                  </button>
                                </Link>
                                <button
                                  onClick={() => {
                                    setIsProfileMenuOpen(false);
                                    setShowHelpSubmenu(false);
                                    setSettingsInitialSection('keyboard');
                                    setSettingsOpen(true);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontSize: '14px',
                                    transition: 'background 0.2s ease',
                                    borderRadius: '8px',
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M8 2V6M8 10V14M4 8H12"/>
                                  </svg>
                                  Сочетания клавиш
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <button
                            onClick={() => {
                              setShowLogoutConfirm(true);
                              setIsProfileMenuOpen(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 16px',
                              background: 'transparent',
                              border: 'none',
                              color: '#fff',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              fontSize: '14px',
                              transition: 'background 0.2s ease',
                              marginTop: '4px',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 12H14M10 8L14 4M10 8L14 12"/>
                              <path d="M2 8H10"/>
                            </svg>
                            Выйти
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          {!isSidebarVisible && (
            <div className="alius-chat-sidebar-mini">
              <div>
                <button className="alius-chat-mini-btn alius-chat-new-chat-mini" title={t('newChat')}>
                  <Image
                    src="/images/chat.png"
                    alt={t('newChat')}
                    width={24}
                    height={24}
                    className="alius-chat-new-chat-icon"
                  />
                </button>
              </div>
              <div className="alius-chat-sidebar-mini-footer">
                <button 
                  className="alius-chat-mini-btn alius-chat-upgrade-btn" 
                  title="Обновить план"
                  onClick={() => {
                    router.push('/profile?tab=subscriptions');
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4L11 9L16 10L11 11L10 16L9 11L4 10L9 9L10 4Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="alius-chat-mini-btn" title={user?.name || 'Пользователь'}>
                  {user?.profileAvatar ? (
                    <img 
                      src={user.profileAvatar} 
                      alt={user.name || 'User'} 
                      className="alius-chat-user-avatar-mini"
                      style={{ borderRadius: '50%', width: '36px', height: '36px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="alius-chat-user-avatar-mini">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'П'}
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Main Chat Area */}
      <main className="alius-chat-main">
        {/* Chat Messages */}
        <div className="alius-chat-messages-container">
          {messages.length === 0 ? (
            <div className="alius-chat-welcome">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="alius-chat-welcome-content"
              >
                <div className="alius-chat-welcome-icon">
                  <Image
                    src="/images/ai.png"
                    alt="AliusAI"
                    width={64}
                    height={64}
                    className="object-contain alius-chat-ai-icon"
                  />
                </div>
                <h1 className="alius-chat-welcome-title">{t('readyWhenYouAre')}</h1>
                <p className="alius-chat-welcome-subtitle">
                  {t('askQuestion')}
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="alius-chat-messages">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`alius-chat-message alius-chat-message-${message.role}`}
                  >
                    <div className="alius-chat-message-avatar">
                      {message.role === 'assistant' ? (
                        <div className="alius-chat-ai-avatar">
                          <Image
                            src="/images/ai.png"
                            alt="AI"
                            width={24}
                            height={24}
                            className="object-contain alius-chat-ai-icon"
                          />
                        </div>
                      ) : (
                        user?.profileAvatar ? (
                          <img 
                            src={user.profileAvatar} 
                            alt={user.name || 'User'} 
                            className="alius-chat-user-avatar-small"
                            style={{ borderRadius: '50%', width: '24px', height: '24px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="alius-chat-user-avatar-small">
                            {user?.name ? user.name.charAt(0).toUpperCase() : tCommon('user').charAt(0).toUpperCase()}
                          </div>
                        )
                      )}
                    </div>
                    <div className="alius-chat-message-content">
                      <div className="alius-chat-message-text">{message.content}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="alius-chat-message alius-chat-message-assistant"
                >
                  <div className="alius-chat-message-avatar">
                    <div className="alius-chat-ai-avatar">
                      <Image
                        src="/images/ai.png"
                        alt="AI"
                        width={24}
                        height={24}
                        className="object-contain"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    </div>
                  </div>
                  <div className="alius-chat-message-content">
                    <div className="alius-chat-typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="alius-chat-input-area">
          <div className="alius-chat-input-wrapper-full">
            <div className="alius-chat-input-container" ref={menuRef}>
              <div className="alius-chat-menu-wrapper">
                <button
                  className="alius-chat-input-plus"
                  type="button"
                  onMouseEnter={() => setIsMenuOpen(true)}
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="alius-chat-menu"
                      onMouseEnter={() => setIsMenuOpen(true)}
                      onMouseLeave={() => setIsMenuOpen(false)}
                    >
                      <button className="alius-chat-menu-item">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 16L9.586 10.414C9.961 10.039 10.5 10.039 10.875 10.414L16 15.5M14 4H6C4.89543 4 4 4.89543 4 6V14C4 15.1046 4.89543 16 6 16H14C15.1046 16 16 15.1046 16 14V6C16 4.89543 15.1046 4 14 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9.5 8.5C10.0523 8.5 10.5 8.05228 10.5 7.5C10.5 6.94772 10.0523 6.5 9.5 6.5C8.94772 6.5 8.5 6.94772 8.5 7.5C8.5 8.05228 8.94772 8.5 9.5 8.5Z" fill="currentColor"/>
                        </svg>
                        <span>{t('uploadFile')}</span>
                      </button>
                      <div className="alius-chat-menu-divider"></div>
                      <button className="alius-chat-menu-item">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M12 11V17M9 14H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span>{t('editProfile')}</span>
                      </button>
                      <button className="alius-chat-menu-item">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 6C4 4.89543 4.89543 4 6 4H14C15.1046 4 16 4.89543 16 6V14C16 15.1046 15.1046 16 14 16H6C4.89543 16 4 15.1046 4 14V6Z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M10 7V13M7 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span>{t('createProject')}</span>
                      </button>
                      <button className="alius-chat-menu-item">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H6C4.89543 4 4 4.89543 4 6V14C4 15.1046 4.89543 16 6 16H14C15.1046 16 16 15.1046 16 14V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M14 2L18 6L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{t('editProject')}</span>
                      </button>
                      <div className="alius-chat-menu-divider"></div>
                      <button className="alius-chat-menu-item">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 3V17M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span>{t('supportProject')}</span>
                      </button>
                      <button className="alius-chat-menu-item">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                        <span>{t('becomePartner')}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('askSomething')}
                className="alius-chat-input-full"
                rows={1}
                style={{
                  resize: 'none',
                  overflow: 'hidden',
                  height: '40px',
                  minHeight: '40px',
                  maxHeight: '200px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = '40px';
                  target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                }}
              />
              <button
                onClick={handleVoiceToggle}
                className={`alius-chat-voice-btn ${isRecording ? 'recording' : ''}`}
                type="button"
              >
                {isRecording ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="5" width="10" height="10" rx="2" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3C8.89543 3 8 3.89543 8 5V9C8 10.1046 8.89543 11 10 11C11.1046 11 12 10.1046 12 9V5C12 3.89543 11.1046 3 10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 9C6 11.2091 7.79086 13 10 13C12.2091 13 14 11.2091 14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 13V16M7 16H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <button
                className="alius-chat-voice-waves"
                type="button"
                onClick={handleVoiceToggle}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="7" width="2.5" height="6" rx="1.25" fill="currentColor"/>
                  <rect x="7" y="5" width="2.5" height="10" rx="1.25" fill="currentColor"/>
                  <rect x="11" y="3" width="2.5" height="14" rx="1.25" fill="currentColor"/>
                  <rect x="15" y="5" width="2.5" height="10" rx="1.25" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div className="alius-chat-input-footer">
              <p className="alius-chat-input-disclaimer">
                {tCommon('disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
            }}
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '24px',
                width: '400px',
                maxWidth: '90vw',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#fff',
                margin: '0 0 12px 0',
              }}>
                Выход из аккаунта
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: '0 0 24px 0',
                lineHeight: '1.5',
              }}>
                Вы уверены, что хотите выйти из аккаунта?
              </p>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
              }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowLogoutConfirm(false);
                    router.push('/');
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ef4444';
                  }}
                >
                  Выйти
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AliusAISettings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialSection={settingsInitialSection}
      />
    </div>
    </>
  );
}

