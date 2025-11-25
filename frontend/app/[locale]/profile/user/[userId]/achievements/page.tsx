'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useRouter } from '@/src/routing';
import { getApiUrl } from '@/src/config';
import { StarIcon, HeartIcon, CheckIcon } from '../../../../components/Icons';
import { useTranslations } from 'next-intl';

interface Achievement {
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
}

const iconMap: Record<string, any> = {
  heart: HeartIcon,
  star: StarIcon,
  check: CheckIcon,
  trophy: StarIcon,
  fire: StarIcon,
};

export default function UserAchievementsPage() {
  const t = useTranslations('userAchievementsPage');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const locale = params.locale as string;
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) return;

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
            setAchievements(data.profile.achievements);
            setUserName(data.profile.userName || tCommon('user'));
          }
        }
      } catch (err) {
        console.error('Error fetching achievements:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchAchievements();
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

  return (
    <div style={{ minHeight: '100vh', background: '#1b2838', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Кнопка назад */}
        <button
          onClick={() => router.push(`/profile/user/${userId}`)}
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
          {t('backToProfile')}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: '#16202d',
            borderRadius: '4px',
            padding: '30px',
            marginTop: '60px',
          }}
        >
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{
              fontSize: '28px',
              color: '#c7d5e0',
              marginBottom: '8px',
              fontWeight: 300,
            }}>
              {t('allAchievements')}
            </h1>
            {userName && (
              <p style={{
                fontSize: '14px',
                color: '#8f98a0',
                margin: 0,
              }}>
                {userName}
              </p>
            )}
          </div>
          {achievements.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#8f98a0',
            }}>
              <p style={{ fontSize: '16px', margin: 0 }}>
                {t('noAchievements')}
              </p>
            </div>
          ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {achievements.map((achievement, index) => {
              const IconComponent = iconMap[achievement.icon] || StarIcon;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  style={{
                    background: achievement.isCompleted
                      ? (achievement.code === 'all_achievements'
                        ? 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)'
                        : '#1b2838')
                      : '#0e1621',
                    border: achievement.isCompleted
                      ? (achievement.code === 'all_achievements'
                        ? '2px solid #ffd700'
                        : '1px solid #66c0f4')
                      : '1px solid #2a475e',
                    borderRadius: '4px',
                    padding: '20px',
                    textAlign: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (achievement.isCompleted) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = achievement.code === 'all_achievements'
                        ? '0 8px 20px rgba(255, 215, 0, 0.4)'
                        : '0 8px 20px rgba(102, 192, 244, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {achievement.code === 'all_achievements' && achievement.isCompleted && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      fontSize: '24px',
                      filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))',
                    }}>
                      👑
                    </div>
                  )}
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '12px',
                    opacity: achievement.isCompleted ? 1 : 0.4,
                    color: achievement.isCompleted
                      ? (achievement.code === 'all_achievements' ? '#1a1a1a' : '#66c0f4')
                      : '#4c6b22',
                  }}>
                    <IconComponent />
                  </div>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    margin: '0 0 8px',
                    color: achievement.isCompleted
                      ? (achievement.code === 'all_achievements' ? '#1a1a1a' : '#c7d5e0')
                      : '#8f98a0',
                  }}>
                    {achievement.name}
                  </h4>
                  {achievement.description && (
                    <p style={{
                      fontSize: '12px',
                      color: achievement.isCompleted
                        ? (achievement.code === 'all_achievements' ? '#333' : '#8f98a0')
                        : '#6a6a6a',
                      margin: '0 0 8px',
                      lineHeight: '1.4',
                    }}>
                      {achievement.description}
                    </p>
                  )}
                  {achievement.isCompleted && achievement.completedAt && (
                    <p style={{
                      fontSize: '11px',
                      color: achievement.code === 'all_achievements' ? '#333' : '#8f98a0',
                      margin: '8px 0 0',
                    }}>
                      {new Date(achievement.completedAt).toLocaleDateString('ru-RU')}
                    </p>
                  )}
                  {!achievement.isCompleted && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{
                        height: '4px',
                        background: '#0e1621',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${achievement.progressPercent}%`,
                          background: '#66c0f4',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <p style={{
                        fontSize: '11px',
                        color: '#8f98a0',
                        margin: '4px 0 0',
                      }}>
                        {achievement.progressPercent}%
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

