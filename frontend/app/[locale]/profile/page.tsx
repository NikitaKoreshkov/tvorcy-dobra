'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/src/routing';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Tutorial from '../components/Tutorial';
import ProfileDashboard from '../components/profile/ProfileDashboard';
import ProfileReports from '../components/profile/ProfileReports';
import ProfileAI from '../components/profile/ProfileAI';
import ProfileSettings from '../components/profile/ProfileSettings';
import ProfilePayments from '../components/profile/ProfilePayments';
import ProfileGamification from '../components/profile/ProfileGamification';
import Leaderboard from '../components/profile/Leaderboard';
import ProfileView from '../components/profile/ProfileView';
import ProfileSubscriptions from '../components/profile/ProfileSubscriptions';
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const t = useTranslations('profilePage');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated, logout, refreshAuth } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);
  
  // Флаг для отслеживания, было ли изменение вкладки через URL параметр
  const isTabFromUrl = useRef(false);
  // Флаг для отслеживания, было ли изменение вкладки пользователем через навигацию
  const isTabFromUser = useRef(false);
  
  // Восстанавливаем выбранную панель из sessionStorage или URL параметра при загрузке
  const getInitialTab = (): 'profile' | 'dashboard' | 'gamification' | 'leaderboard' | 'ai' | 'subscriptions' | 'payments' | 'reports' | 'settings' => {
    if (typeof window !== 'undefined') {
      // Сначала проверяем URL параметр
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get('tab');
      if (tabFromUrl && ['profile', 'dashboard', 'gamification', 'leaderboard', 'ai', 'subscriptions', 'payments', 'reports', 'settings'].includes(tabFromUrl)) {
        isTabFromUrl.current = true;
        // Убираем параметр из URL после чтения
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('tab');
        window.history.replaceState({}, '', newUrl.toString());
        return tabFromUrl as 'profile' | 'dashboard' | 'gamification' | 'leaderboard' | 'ai' | 'subscriptions' | 'payments' | 'reports' | 'settings';
      }
      // Затем проверяем sessionStorage
      const savedTab = sessionStorage.getItem('profileActiveTab');
      if (savedTab && ['profile', 'dashboard', 'gamification', 'leaderboard', 'ai', 'subscriptions', 'payments', 'reports', 'settings'].includes(savedTab)) {
        return savedTab as 'profile' | 'dashboard' | 'gamification' | 'leaderboard' | 'ai' | 'subscriptions' | 'payments' | 'reports' | 'settings';
      }
    }
    return 'profile';
  };
  
  const [activeTab, setActiveTab] = useState<'profile' | 'dashboard' | 'gamification' | 'leaderboard' | 'ai' | 'subscriptions' | 'payments' | 'reports' | 'settings'>(getInitialTab());

  useEffect(() => {
    // Проверяем, есть ли токен в URL (от Google OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      localStorage.setItem('accessToken', tokenFromUrl);
      // Триггерим событие для обновления хука useAuth
      window.dispatchEvent(new Event('authStateChanged'));
      // Убираем токен из URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // Редиректим на логин только после завершения загрузки и если пользователь не авторизован
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    // Проверяем, нужно ли показывать туториал
    if (!isLoading && isAuthenticated && user) {
      // Показываем туториал, если hasSeenTutorial явно false или undefined
      if (user.hasSeenTutorial === false || user.hasSeenTutorial === undefined) {
        setShowTutorial(true);
        setShowProfile(false);
      } else {
        setShowTutorial(false);
        setShowProfile(true);
      }
    }
    // Сбрасываем ошибку аватара при изменении пользователя или аватара
    if (user?.profileAvatar) {
      console.log('Profile avatar updated in ProfilePage:', {
        hasAvatar: !!user.profileAvatar,
        avatarLength: user.profileAvatar.length,
        avatarStart: user.profileAvatar.substring(0, 50)
      });
      // Обновляем key для принудительного перерендера изображения
      setAvatarKey(prev => prev + 1);
    }
    setAvatarError(false);
  }, [isLoading, isAuthenticated, user, user?.profileAvatar]);

  // Обрабатываем параметр tab из URL при монтировании и изменении URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tabFromUrl = searchParams?.get('tab');
      if (tabFromUrl && ['profile', 'dashboard', 'gamification', 'leaderboard', 'ai', 'subscriptions', 'payments', 'reports', 'settings'].includes(tabFromUrl)) {
        isTabFromUrl.current = true;
        setActiveTab(tabFromUrl as 'profile' | 'dashboard' | 'gamification' | 'leaderboard' | 'ai' | 'subscriptions' | 'payments' | 'reports' | 'settings');
        // Убираем параметр из URL после чтения
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('tab');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [searchParams]);

  // Сохраняем выбранную панель в sessionStorage при изменении, но только если это не было изменение через URL параметр
  useEffect(() => {
    if (typeof window !== 'undefined' && !isTabFromUrl.current && isTabFromUser.current) {
      sessionStorage.setItem('profileActiveTab', activeTab);
    }
    // Сбрасываем флаги после обработки
    isTabFromUrl.current = false;
    isTabFromUser.current = false;
  }, [activeTab]);

  // Слушаем событие обновления профиля
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('Profile update event received, refreshing auth...');
      refreshAuth();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [refreshAuth]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setShowProfile(true);
    refreshAuth();
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-xl font-semibold text-black">{t('loading')}</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Пока идет редирект
  }

  // Показываем туториал при первом входе
  if (showTutorial) {
    return (
      <div className="bg-white" style={{ paddingTop: 0 }}>
        <Tutorial onComplete={handleTutorialComplete} />
      </div>
    );
  }

  // Показываем личный кабинет
  return (
    <div className="min-h-screen bg-white profile-page">
      <Header />
      <div className="profile-page-container">
        <div className="profile-page-sidebar">
          <div className="profile-page-user">
            <div className="profile-page-user-avatar">
              {user?.profileAvatar && user.profileAvatar.trim() !== '' && !avatarError ? (
                <img 
                  key={`avatar-${user.id}-${avatarKey}-${user.profileAvatar.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '')}`}
                  src={user.profileAvatar.startsWith('data:') || user.profileAvatar.startsWith('http://') || user.profileAvatar.startsWith('https://') 
                    ? user.profileAvatar 
                    : `data:image/jpeg;base64,${user.profileAvatar}`}
                  alt={user?.name || 'Avatar'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', position: 'absolute', top: 0, left: 0 }}
                  onError={(e) => {
                    console.error('Avatar load error:', {
                      user: user?.id,
                      src: user.profileAvatar.substring(0, 50),
                      error: e
                    });
                    setAvatarError(true);
                  }}
                  onLoad={() => {
                    console.log('Avatar loaded successfully');
                    setAvatarError(false);
                  }}
                />
              ) : null}
              <div style={{ 
                display: (user?.profileAvatar && user.profileAvatar.trim() !== '' && !avatarError) ? 'none' : 'flex',
                width: '100%', 
                height: '100%', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 600,
                color: '#fff'
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="profile-page-user-info">
              <h3 className="profile-page-user-name">{user?.name || tCommon('user')}</h3>
              <p className="profile-page-user-email">{user?.email}</p>
            </div>
          </div>
          <nav className="profile-page-nav">
            <button
              className={`profile-page-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => {
                isTabFromUser.current = true;
                setActiveTab('profile');
              }}
            >
              {t('myProfile')}
            </button>
            <button
              className={`profile-page-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                isTabFromUser.current = true;
                setActiveTab('dashboard');
              }}
            >
              {t('myContribution')}
            </button>
            <button
              className={`profile-page-nav-item ${activeTab === 'gamification' ? 'active' : ''}`}
              onClick={() => {
                isTabFromUser.current = true;
                setActiveTab('gamification');
              }}
            >
              {t('myAchievements')}
            </button>
            <button
              className={`profile-page-nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => {
                isTabFromUser.current = true;
                setActiveTab('leaderboard');
              }}
            >
              {t('leaderboard')}
            </button>
            <button
              className={`profile-page-nav-item ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => {
                isTabFromUser.current = true;
                setActiveTab('ai');
              }}
            >
              AliusAI
            </button>
            <button
              className={`profile-page-nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => {
                isTabFromUser.current = true;
                setActiveTab('subscriptions');
              }}
            >
              {t('subscriptions')}
            </button>
            <button
              className={`profile-page-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => {
                isTabFromUser.current = true;
                setActiveTab('payments');
              }}
            >
              {t('payments')}
            </button>
            <button
              className={`profile-page-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => {
                isTabFromUser.current = true;
                setActiveTab('reports');
              }}
            >
              {t('reports')}
            </button>
            <button
              className={`profile-page-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => {
                isTabFromUser.current = true;
                setActiveTab('settings');
              }}
            >
              {t('settings')}
            </button>
          </nav>
        </div>
        <div className="profile-page-content">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <ProfileView />
              </motion.div>
            )}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <ProfileDashboard />
              </motion.div>
            )}
            {activeTab === 'gamification' && (
              <motion.div
                key="gamification"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <ProfileGamification />
              </motion.div>
            )}
            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <Leaderboard />
              </motion.div>
            )}
            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <ProfileAI />
              </motion.div>
            )}
            {activeTab === 'subscriptions' && (
              <motion.div
                key="subscriptions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <ProfileSubscriptions />
              </motion.div>
            )}
            {activeTab === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <ProfilePayments />
              </motion.div>
            )}
            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <ProfileReports />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <ProfileSettings />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}
