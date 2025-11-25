'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { getApiUrl } from '@/src/config';
import { useAuth } from '../../../contexts/AuthContext';

interface LeaderboardUser {
  userId: string;
  name: string;
  email: string;
  totalDonated: number;
  projectsCount: number;
  achievementsCount: number;
  hasMasterAchievement: boolean;
  rank: number;
  country?: string;
}

export default function Leaderboard() {
  const t = useTranslations('profilePage');
  const { user: currentUser } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<{
    globalRank: number;
    countryRank: number | null;
    totalUsers: number;
    countryUsers: number | null;
  } | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError(t('authRequired'));
          return;
        }

        // Получаем глобальный рейтинг
        const res = await fetch(getApiUrl('/gamification/leaderboard/global?limit=100'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setLeaderboard(data.leaderboard);
          }
        }

        // Получаем позицию пользователя
        const rankRes = await fetch(getApiUrl('/gamification/leaderboard/rank'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (rankRes.ok) {
          const rankData = await rankRes.json();
          if (rankData.success) {
            setUserRank(rankData);
          }
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(t('leaderboardLoadError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="profile-leaderboard">
      <motion.div
        className="premium-content-header"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="premium-content-title">Мировой рейтинг</h2>
        <p className="premium-content-intro">
          Топ доноров, которые делают мир лучше каждый день.
        </p>
      </motion.div>

      {/* Позиция пользователя */}
      {userRank && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            color: '#fff',
          }}
        >
          <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600 }}>
            Ваша позиция
          </h3>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
                Ваша позиция
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700 }}>
                #{userRank.globalRank}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                из {userRank.totalUsers} пользователей
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Таблица рейтинга */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
            Загрузка рейтинга...
          </div>
        ) : error ? (
          <div style={{
            padding: '20px',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c33',
          }}>
            {error}
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            background: '#fafafa',
            borderRadius: '12px',
            border: '1px dashed #e0e0e0',
          }}>
            <p style={{ fontSize: '16px', color: '#666' }}>
              Пока нет данных в рейтинге
            </p>
          </div>
        ) : (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 120px 100px 100px',
              gap: '16px',
              padding: '16px 24px',
              background: '#fafafa',
              borderBottom: '1px solid #e0e0e0',
              fontWeight: 600,
              fontSize: '14px',
              color: '#666',
            }}>
              <div>Место</div>
              <div>Имя</div>
              <div style={{ textAlign: 'right' }}>Сумма</div>
              <div style={{ textAlign: 'center' }}>Проекты</div>
              <div style={{ textAlign: 'center' }}>Достижения</div>
            </div>
            <AnimatePresence>
              {leaderboard.map((user, index) => (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 120px 100px 100px',
                    gap: '16px',
                    padding: '20px 24px',
                    borderBottom: index < leaderboard.length - 1 ? '1px solid #f0f0f0' : 'none',
                    alignItems: 'center',
                    background: user.userId === currentUser?.id ? '#f8f9ff' : '#fff',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    // Переход на страницу профиля пользователя
                    if (typeof window !== 'undefined') {
                      window.location.href = `/${locale}/profile/user/${user.userId}`;
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (user.userId !== currentUser?.id) {
                      e.currentTarget.style.background = '#fafafa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (user.userId !== currentUser?.id) {
                      e.currentTarget.style.background = '#fff';
                    }
                  }}
                >
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: user.rank <= 3 ? '#ffa500' : '#666',
                  }}>
                    {getRankIcon(user.rank)}
                  </div>
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: user.hasMasterAchievement
                          ? '#ffd700'
                          : user.userId === currentUser?.id
                          ? '#667eea'
                          : '#1a1a1a',
                        textShadow: user.hasMasterAchievement
                          ? '0 0 8px rgba(255, 215, 0, 0.5)'
                          : 'none',
                      }}>
                        {user.name}
                      </span>
                      {user.hasMasterAchievement && (
                        <span style={{
                          fontSize: '18px',
                          filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))',
                        }}>
                          👑
                        </span>
                      )}
                    </div>
                    {user.country && (
                      <div style={{
                        fontSize: '12px',
                        color: '#999',
                        marginTop: '4px',
                      }}>
                        {user.country}
                      </div>
                    )}
                  </div>
                  <div style={{
                    textAlign: 'right',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                  }}>
                    {(user.totalDonated / 100).toLocaleString('ru-RU')} ₽
                  </div>
                  <div style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#666',
                  }}>
                    {user.projectsCount}
                  </div>
                  <div style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#666',
                  }}>
                    {user.achievementsCount}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}

