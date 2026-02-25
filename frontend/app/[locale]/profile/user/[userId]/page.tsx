'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useRouter } from '@/src/routing';
import { getApiUrl } from '@/src/config';
import { StarIcon, HeartIcon, CheckIcon } from '../../../components/Icons';
import { useTranslations } from 'next-intl';

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

export default function UserProfilePage() {
  const t = useTranslations('userProfilePage');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError(t('authRequired'));
          return;
        }

        const res = await fetch(getApiUrl(`/gamification/profile/${userId}`), {
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
          setError(t('errorLoading'));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(t('errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

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
        {t('loading')}
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ minHeight: '100vh', background: '#1b2838', padding: '20px' }}>
        <button
          onClick={() => router.push(`/${params.locale}/profile`)}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '10px 20px',
            background: '#66c0f4',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            zIndex: 1000,
          }}
        >
          {t('back')}
        </button>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          color: '#c7d5e0'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
              {error || t('profileNotFound')}
            </h2>
          </div>
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
    <div style={{ minHeight: '100vh', ...getPageBackgroundStyle() }}>
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
      {/* Кнопка назад */}
      <button
        onClick={() => router.push(`/profile`)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          background: '#66c0f4',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          zIndex: 1000,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#4a90e2';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#66c0f4';
        }}
      >
        {t('back')}
      </button>

      <div style={{ 
        maxWidth: '940px', 
        margin: '0 auto', 
        padding: '20px',
        paddingTop: '80px'
      }}>
        {/* Профиль Header - большой баннер с фоном */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: profile.profileBackground
              ? `url(${profile.profileBackground}) center/cover`
              : profile.hasMasterAchievement
              ? 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)'
              : 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            borderRadius: '4px',
            padding: '20px',
            marginBottom: '16px',
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
          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'flex-start',
            position: 'relative',
            zIndex: 1,
          }}>
            {/* Аватар */}
            <div style={{
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
                {profile.profileAvatar ? (
                  <img
                    src={profile.profileAvatar}
                    alt={profile.userName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '2px',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#171a21',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '72px',
                    color: profile.hasMasterAchievement ? '#ffd700' : '#66c0f4',
                    fontWeight: 700,
                  }}>
                    {profile.userName.charAt(0).toUpperCase()}
                  </div>
                )}
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
            <div style={{ flex: 1, color: '#fff' }}>
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
                  color: '#fff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
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
                <div style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '12px',
                  lineHeight: '1.5',
                  maxWidth: '500px',
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
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '8px',
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '16px',
        }}>
          {/* Левая колонка */}
          <div>
            {/* Статистика */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                background: '#16202d',
                borderRadius: '4px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{
                fontSize: '14px',
                color: '#66c0f4',
                marginBottom: '12px',
                fontWeight: 500,
              }}>
                {tCommon('stats') || 'Statistics'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '24px', color: '#c7d5e0', fontWeight: 300 }}>
                    {(profile.totalDonated / 100).toLocaleString('en-US')} ₽
                  </div>
                  <div style={{ fontSize: '11px', color: '#8f98a0', marginTop: '4px' }}>
                    {t('totalDonated')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', color: '#c7d5e0', fontWeight: 300 }}>
                    {profile.projectsCount}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8f98a0', marginTop: '4px' }}>
                    {t('projectsSupported')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', color: '#c7d5e0', fontWeight: 300 }}>
                    #{profile.globalRank}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8f98a0', marginTop: '4px' }}>
                    {t('globalRank')}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Бейджи */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                background: '#16202d',
                borderRadius: '4px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{
                fontSize: '14px',
                color: '#66c0f4',
                marginBottom: '12px',
                fontWeight: 500,
              }}>
                Бейджи
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.hasMasterAchievement && (
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)',
                  }}>
                    👑
                  </div>
                )}
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: profile.hasMasterAchievement
                    ? 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)'
                    : levelColors.gradient,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#fff',
                  boxShadow: profile.hasMasterAchievement
                    ? '0 0 15px rgba(255, 215, 0, 0.5)'
                    : '0 0 10px ' + levelColors.shadow,
                }}>
                  {levelNumber}
                </div>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: '#4c6b22',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#fff',
                }}>
                  {profile.achievementsCount}
                </div>
              </div>
            </motion.div>

            {/* Витрина достижений */}
            {mainAchievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{
                  background: '#16202d',
                  borderRadius: '4px',
                  padding: '16px',
                  marginBottom: '16px',
                }}
              >
                <div style={{
                  fontSize: '14px',
                  color: '#66c0f4',
                  marginBottom: '12px',
                  fontWeight: 500,
                }}>
                  Витрина достижений
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                }}>
                  {mainAchievements.map((achievement) => {
                    const IconComponent = iconMap[achievement.icon] || StarIcon;
                    return (
                      <div
                        key={achievement.id}
                        style={{
                          aspectRatio: '1',
                          background: achievement.code === 'all_achievements'
                            ? 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)'
                            : '#1b2838',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: achievement.code === 'all_achievements'
                            ? '2px solid #ffd700'
                            : '1px solid #66c0f4',
                          boxShadow: achievement.code === 'all_achievements'
                            ? '0 0 10px rgba(255, 215, 0, 0.5)'
                            : 'none',
                          position: 'relative',
                        }}
                        title={achievement.name}
                      >
                        <div style={{
                          color: achievement.code === 'all_achievements' ? '#1a1a1a' : '#66c0f4',
                          fontSize: '32px',
                        }}>
                          <IconComponent />
                        </div>
                        {achievement.code === 'all_achievements' && (
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            fontSize: '16px',
                          }}>
                            👑
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {completedAchievements.length > 3 && (
                  <button
                    onClick={() => router.push(`/profile/user/${userId}/achievements`)}
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
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#4a90e2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#66c0f4';
                    }}
                  >
                    {t('viewAllAchievements')} ({completedAchievements.length})
                  </button>
                )}
              </motion.div>
            )}
          </div>

          {/* Правая колонка */}
          <div>
            {/* Фотографии */}
            {profile.profilePhotos && profile.profilePhotos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  background: '#16202d',
                  borderRadius: '4px',
                  padding: '20px',
                  marginBottom: '16px',
                }}
              >
                <div style={{
                  fontSize: '18px',
                  color: '#c7d5e0',
                  marginBottom: '16px',
                  fontWeight: 300,
                }}>
                  Фотографии
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}>
                  {profile.profilePhotos.map((photo, index) => (
                    <div
                      key={index}
                      style={{
                        width: '100%',
                        aspectRatio: '27/9',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '1px solid #2a475e',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.borderColor = '#66c0f4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = '#2a475e';
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  background: '#16202d',
                  borderRadius: '4px',
                  padding: '20px',
                  marginBottom: '16px',
                }}
              >
                <div style={{
                  fontSize: '18px',
                  color: '#c7d5e0',
                  marginBottom: '16px',
                  fontWeight: 300,
                }}>
                  Видео
                </div>
                <div style={{
                  position: 'relative',
                  paddingBottom: '56.25%',
                  height: 0,
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid #2a475e',
                }}>
                  <video
                    src={profile.profileVideo}
                    controls
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
