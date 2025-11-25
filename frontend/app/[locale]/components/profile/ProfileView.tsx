'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/src/routing';
import { useAuth } from '../../../contexts/AuthContext';
import { getApiUrl } from '@/src/config';
import { StarIcon, HeartIcon, CheckIcon } from '../Icons';

interface UserProfile {
  totalDonated: number;
  projectsCount: number;
  transactionsCount: number;
  achievementsCount: number;
  hasMasterAchievement: boolean;
  level: string;
  globalRank: number;
  countryRank: number | null;
  country: string | null;
  userName: string;
  userEmail: string;
  profileDescription: string | null;
  profileAvatar: string | null;
  profileBackground: string | null;
  pageBackground: string | null;
  profilePhotos: string[];
  profileVideo: string | null;
  showcaseAchievements: string[];
  isOnline: boolean;
  achievements: Array<{
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    targetValue: number;
    currentProgress: number;
    isCompleted: boolean;
    completedAt: Date | null;
    progressPercent: number;
  }>;
}

const iconMap: Record<string, any> = {
  heart: HeartIcon,
  star: StarIcon,
  check: CheckIcon,
  trophy: StarIcon,
  fire: StarIcon,
};

export default function ProfileView() {
  const t = useTranslations('profilePage');
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnProfilePage, setIsOnProfilePage] = useState(false);

  // Проверяем, что мы на странице профиля
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const onProfilePage = pathname.includes('/profile');
      setIsOnProfilePage(onProfilePage);
      if (!onProfilePage) {
        setIsLoading(false);
        return;
      }
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      // Проверяем, что мы на странице профиля, а не на главной
      if (typeof window === 'undefined') return;
      if (!window.location.pathname.includes('/profile')) {
        console.warn('ProfileView rendered outside profile page, skipping fetch');
        setIsLoading(false);
        return;
      }

      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError(t('authRequired'));
          setIsLoading(false);
          return;
        }

        const res = await fetch(getApiUrl(`/gamification/profile/${user.id}`), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.profile) {
            setProfile(data.profile);
          } else {
            setError(t('profileNotFound'));
          }
        } else if (res.status === 401) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        } else {
          setError(t('profileLoadError'));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(t('profileLoadError'));
      } finally {
        setIsLoading(false);
      }
    };

    if (isOnProfilePage) {
      fetchProfile();
    }
  }, [user?.id, isOnProfilePage]);

  // Не рендерим ничего, если не на странице профиля
  if (!isOnProfilePage) {
    return null;
  }

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#1b2838', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#c7d5e0'
      }}>
        Загрузка профиля...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ minHeight: '100vh', background: '#1b2838', padding: '20px', color: '#c7d5e0' }}>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
            {error || t('profileNotFound')}
          </h2>
        </div>
      </div>
    );
  }

  const completedAchievements = profile.achievements.filter(a => a.isCompleted);
  const levelNumber = Math.floor(completedAchievements.length / 5) + 1;

  // Функция для определения цвета уровня (каждые 5 уровней - новый цвет)
  const getLevelColor = (level: number) => {
    const levelGroup = Math.floor((level - 1) / 5);
    const colors = [
      { gradient: 'linear-gradient(135deg, #66c0f4 0%, #4a90e2 100%)', color: '#66c0f4', shadow: 'rgba(102, 192, 244, 0.6)' }, // 1-5: синий
      { gradient: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', color: '#4caf50', shadow: 'rgba(76, 175, 80, 0.6)' }, // 6-10: зеленый
      { gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: '#ff9800', shadow: 'rgba(255, 152, 0, 0.6)' }, // 11-15: оранжевый
      { gradient: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', color: '#9c27b0', shadow: 'rgba(156, 39, 176, 0.6)' }, // 16-20: фиолетовый
      { gradient: 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)', color: '#ffd700', shadow: 'rgba(255, 215, 0, 0.8)' }, // 21+: золотой
    ];
    return colors[Math.min(levelGroup, colors.length - 1)];
  };

  const levelColors = getLevelColor(levelNumber);

  // Получаем главные достижения (из showcase или первые 3 выполненных)
  const mainAchievements = profile.showcaseAchievements.length > 0
    ? profile.achievements.filter(a => 
        profile.showcaseAchievements.includes(a.id) && a.isCompleted
      ).slice(0, 3)
    : completedAchievements.slice(0, 3);

  // Определяем фон всей страницы
  const getPageBackgroundStyle = () => {
    if (!profile.pageBackground) {
      return { background: '#1b2838' };
    }
    
    // Проверяем, является ли это цветом
    if (profile.pageBackground.startsWith('#') || /^[a-zA-Z]+$/.test(profile.pageBackground)) {
      return { background: profile.pageBackground };
    }
    
    // Это URL изображения или видео
    const isVideo = profile.pageBackground.match(/\.(mp4|webm|mov|avi)$/i);
    if (isVideo) {
      return {
        position: 'relative' as const,
        background: '#1b2838',
      };
    }
    
    return {
      backgroundImage: `url(${profile.pageBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  };

  return (
    <div className="profile-view-container" style={{ minHeight: '100vh', padding: '20px', ...getPageBackgroundStyle() }}>
      {profile.pageBackground && profile.pageBackground.match(/\.(mp4|webm|mov|avi)$/i) && (
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
          }}
        >
          <source src={profile.pageBackground} />
        </video>
      )}
      {/* Профиль Header - большой баннер с фоном */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="profile-view-header"
        style={{
          background: profile.profileBackground
            ? `url(${profile.profileBackground}) center/cover`
            : profile.hasMasterAchievement
            ? 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)'
            : 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '200px',
        }}
      >
        {profile.profileBackground && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(27, 40, 56, 0.7), rgba(27, 40, 56, 0.9))',
          }} />
        )}
        <div className="profile-view-header-inner" style={{
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Аватар */}
          <div className="profile-view-avatar-wrapper" style={{
            position: 'relative',
            flexShrink: 0,
          }}>
            <div style={{
              width: '184px',
              height: '184px',
              borderRadius: '4px',
              background: profile.hasMasterAchievement
                ? 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)'
                : 'linear-gradient(135deg, #66c0f4 0%, #4a90e2 100%)',
              padding: '4px',
              boxShadow: profile.hasMasterAchievement
                ? '0 0 20px rgba(255, 215, 0, 0.6)'
                : '0 0 15px rgba(102, 192, 244, 0.4)',
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '2px',
                background: '#1b2838',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '72px',
                fontWeight: 700,
                color: '#fff',
                overflow: 'hidden',
              }}>
                {profile.profileAvatar ? (
                  <img 
                    src={profile.profileAvatar} 
                    alt={profile.userName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  profile.userName.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            {profile.hasMasterAchievement && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                fontSize: '32px',
                filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 1))',
              }}>
                👑
              </div>
            )}
          </div>

          {/* Информация о пользователе */}
          <div className="profile-view-user-info" style={{ flex: 1, color: '#fff', minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
            }}>
              <h1 style={{
                fontSize: '26px',
                fontWeight: 300,
                margin: 0,
                color: profile.hasMasterAchievement ? '#ffd700' : '#fff',
                textShadow: profile.hasMasterAchievement
                  ? '0 0 10px rgba(255, 215, 0, 0.8)'
                  : '0 2px 4px rgba(0,0,0,0.3)',
              }}>
                {profile.userName}
              </h1>
            </div>
            
            {profile.country && (
              <div style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '8px',
              }}>
                📍 {profile.country}
              </div>
            )}

            {profile.profileDescription && (
              <div className="profile-view-description" style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '12px',
                lineHeight: '1.5',
                maxWidth: '500px',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
              }}>
                {profile.profileDescription}
              </div>
            )}

            <div style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '12px',
            }}>
              {profile.level}
            </div>

            {/* Статус онлайн */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '2px',
              fontSize: '12px',
              color: profile.isOnline ? '#66c0f4' : '#8f98a0',
              marginBottom: '12px',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: profile.isOnline ? '#66c0f4' : '#8f98a0',
                boxShadow: profile.isOnline ? '0 0 6px rgba(102, 192, 244, 0.8)' : 'none',
              }} />
              {profile.isOnline ? t('online') : t('offline')}
            </div>
          </div>

          {/* Уровень и ранг */}
          <div className="profile-view-level-wrapper" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '8px',
            flexShrink: 0,
          }}>
            <div style={{
              position: 'relative',
              width: '84px',
              height: '84px',
            }}>
              {/* Внешний круг с градиентом */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: profile.hasMasterAchievement
                  ? 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)'
                  : levelColors.gradient,
                padding: '3px',
                boxShadow: profile.hasMasterAchievement
                  ? '0 0 20px rgba(255, 215, 0, 0.5)'
                  : '0 0 15px ' + levelColors.shadow,
              }}>
                {/* Внутренний круг */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: '#1b2838',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 700,
                  color: profile.hasMasterAchievement ? '#ffd700' : levelColors.color,
                  textShadow: profile.hasMasterAchievement
                    ? '0 0 10px rgba(255, 215, 0, 0.8)'
                    : '0 0 8px ' + levelColors.shadow,
                }}>
                  {levelNumber}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Основной контент - две колонки */}
      <div className="profile-view-content-grid" style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '16px',
      }}>
        {/* Левая колонка */}
        <div>
          {/* Статистика */}
          <motion.div
            className="profile-view-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              background: '#16202d',
              borderRadius: '4px',
            }}
          >
            <h3 style={{
              fontSize: '14px',
              fontWeight: 400,
              color: '#66c0f4',
              marginBottom: '12px',
              textTransform: 'uppercase',
            }}>
              Статистика
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '4px',
                }}>
                  {(profile.totalDonated / 100).toLocaleString('ru-RU')} ₽
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#8f98a0',
                }}>
                  Всего пожертвовано
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '4px',
                }}>
                  {profile.projectsCount}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#8f98a0',
                }}>
                  Проектов поддержано
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '4px',
                }}>
                  {profile.achievementsCount}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#8f98a0',
                }}>
                  Достижений получено
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '4px',
                }}>
                  #{profile.globalRank}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#8f98a0',
                }}>
                  Глобальный рейтинг
                </div>
              </div>
            </div>
          </motion.div>

          {/* Витрина достижений */}
          {mainAchievements.length > 0 && (
            <motion.div
              className="profile-view-panel"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                background: '#16202d',
                borderRadius: '4px',
              }}
            >
              <h3 style={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#66c0f4',
                marginBottom: '12px',
                textTransform: 'uppercase',
              }}>
                Витрина достижений
              </h3>
              <div className="profile-achievements-container" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {mainAchievements.map((achievement) => {
                  const IconComponent = iconMap[achievement.icon] || StarIcon;
                  return (
                    <div
                      key={achievement.id}
                      className="profile-achievement-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px',
                        background: '#1b2838',
                        borderRadius: '4px',
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffd700',
                      }}>
                        <IconComponent />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#fff',
                        }}>
                          {achievement.name}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          color: '#8f98a0',
                        }}>
                          {achievement.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {completedAchievements.length > 3 && (
                <button
                  onClick={() => router.push(`/profile/user/${user?.id}/achievements`)}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '8px',
                    background: '#66c0f4',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  Показать все достижения ({completedAchievements.length})
                </button>
              )}
            </motion.div>
          )}

          {/* Фотографии - для мобильных (под витриной достижений) */}
          {profile.profilePhotos && profile.profilePhotos.length > 0 && (
            <motion.div
              className="profile-view-panel profile-view-photos profile-view-photos-mobile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{
                background: '#16202d',
                borderRadius: '4px',
              }}
            >
              <h3 style={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#66c0f4',
                marginBottom: '12px',
                textTransform: 'uppercase',
              }}>
                Фотографии
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                {profile.profilePhotos.slice(0, 3).map((photo, index) => (
                  <div
                    key={index}
                    style={{
                      width: '100%',
                      aspectRatio: '27/9',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      background: '#1b2838',
                    }}
                  >
                    <img
                      src={photo}
                      alt={`Фото ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Правая колонка */}
        <div>
          {/* Фотографии - для десктопа */}
          {profile.profilePhotos && profile.profilePhotos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="profile-view-photos profile-view-photos-desktop"
              style={{
                background: '#16202d',
                borderRadius: '4px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <h3 style={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#66c0f4',
                marginBottom: '12px',
                textTransform: 'uppercase',
              }}>
                Фотографии
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                {profile.profilePhotos.slice(0, 3).map((photo, index) => (
                  <div
                    key={index}
                    style={{
                      width: '100%',
                      aspectRatio: '27/9',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      background: '#1b2838',
                    }}
                  >
                    <img
                      src={photo}
                      alt={`Фото ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Видео */}
          {profile.profileVideo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                background: '#16202d',
                borderRadius: '4px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <h3 style={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#66c0f4',
                marginBottom: '12px',
                textTransform: 'uppercase',
              }}>
                Видео
              </h3>
              <div style={{
                aspectRatio: '16/9',
                borderRadius: '4px',
                overflow: 'hidden',
                background: '#1b2838',
              }}>
                <video
                  src={profile.profileVideo}
                  controls
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

