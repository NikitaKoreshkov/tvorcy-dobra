'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { getApiUrl } from '@/src/config';
import Image from 'next/image';

interface TopUser {
  userId: string;
  name: string;
  email: string;
  totalDonated: number;
  projectsCount: number;
  achievementsCount: number;
  hasMasterAchievement: boolean;
  rank: number;
  country?: string;
  profileAvatar?: string | null;
  profileBackground?: string | null;
}

const medals = ['🥇', '🥈', '🥉'];
const medalColors = [
  'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
  'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)',
];

export default function TopUsersSection() {
  const t = useTranslations('homePage');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(getApiUrl('/gamification/leaderboard/top3'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.leaderboard) {
            console.log('Top 3 users loaded:', data.leaderboard.length);
            console.log('Users data:', data.leaderboard.map(u => ({ name: u.name, rank: u.rank, totalDonated: u.totalDonated })));
            setTopUsers(data.leaderboard);
          } else {
            console.warn('Top 3 users: success is false or leaderboard is missing', data);
          }
        } else {
          console.error('Top 3 users fetch failed:', res.status, res.statusText);
        }
      } catch (err) {
        console.error('Error fetching top users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  const formatAmount = (amount: number) => {
    // amount приходит в копейках, конвертируем в рубли
    const amountInRubles = amount / 100;
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amountInRubles);
  };

  // Форматирование для мобильных (сокращенный формат)
  const formatAmountMobile = (amount: number) => {
    // amount приходит в копейках, конвертируем в рубли
    const amountInRubles = amount / 100;
    
    if (amountInRubles >= 1000000) {
      const millions = amountInRubles / 1000000;
      return `${millions.toFixed(1).replace('.0', '')}м ₽`;
    } else if (amountInRubles >= 1000) {
      const thousands = amountInRubles / 1000;
      return `${thousands.toFixed(1).replace('.0', '')}к ₽`;
    }
    return `${amountInRubles.toLocaleString('ru-RU')} ₽`;
  };

  if (isLoading) {
    return (
      <section className="top-users-section" ref={ref}>
        <div className="top-users-container">
          <div className="top-users-header">
            <p className="top-users-title">{t('top3Donors')}</p>
            <p className="top-users-subtitle">
              {t('top3DonorsDesc')}
            </p>
          </div>
          <div className="top-users-grid">
            <div className="top-user-card skeleton top-user-card-second" />
            <div className="top-user-card skeleton top-user-card-first top-user-card-center" />
            <div className="top-user-card skeleton top-user-card-third" />
          </div>
        </div>
      </section>
    );
  }

  if (topUsers.length === 0) {
    return null;
  }

  return (
    <section className="top-users-section" ref={ref}>
      <div className="top-users-container">
        <motion.div
          className="top-users-header"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <p className="top-users-title">{t('top3Donors')}</p>
          <p className="top-users-subtitle">
            {t('top3DonorsDesc')}
          </p>
        </motion.div>

        <div className="top-users-grid">
          {/* Топ-2 (слева) */}
          {topUsers[1] && (
            <motion.div
              key={topUsers[1].userId}
              className="top-user-card top-user-card-second"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              {/* Medal Badge */}
              <div
                className="top-user-medal"
                style={{ background: medalColors[1] }}
              >
                <span className="top-user-medal-emoji">{medals[1]}</span>
                <span className="top-user-medal-rank">#{topUsers[1].rank}</span>
              </div>

              {/* Avatar */}
              <div className="top-user-avatar-wrapper">
                {topUsers[1].profileAvatar ? (
                  <Image
                    src={topUsers[1].profileAvatar}
                    alt={topUsers[1].name}
                    width={120}
                    height={120}
                    className="top-user-avatar"
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="top-user-avatar-placeholder">
                    {topUsers[1].name.charAt(0).toUpperCase()}
                  </div>
                )}
                {topUsers[1].hasMasterAchievement && (
                  <div className="top-user-crown">👑</div>
                )}
              </div>

              {/* User Info */}
              <div className="top-user-info">
                <h3 className="top-user-name">{topUsers[1].name}</h3>
                {topUsers[1].country && (
                  <p className="top-user-country">📍 {topUsers[1].country}</p>
                )}
              </div>

              {/* Stats */}
              <div className="top-user-stats">
                <div className="top-user-stat">
                  <span className="top-user-stat-value top-user-stat-value-desktop">
                    {formatAmount(topUsers[1].totalDonated)}
                  </span>
                  <span className="top-user-stat-value top-user-stat-value-mobile">
                    {formatAmountMobile(topUsers[1].totalDonated)}
                  </span>
                  <span className="top-user-stat-label">Пожертвовано</span>
                </div>
                <div className="top-user-stat">
                  <span className="top-user-stat-value">{topUsers[1].projectsCount}</span>
                  <span className="top-user-stat-label">Проектов</span>
                </div>
                <div className="top-user-stat">
                  <span className="top-user-stat-value">
                    {topUsers[1].achievementsCount}
                  </span>
                  <span className="top-user-stat-label">Достижений</span>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="top-user-decoration"></div>
            </motion.div>
          )}

          {/* Топ-1 (по центру) */}
          {topUsers[0] && (
            <motion.div
              key={topUsers[0].userId}
              className="top-user-card top-user-card-first top-user-card-center"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -12, scale: 1.05 }}
            >
              {/* Medal Badge */}
              <div
                className="top-user-medal"
                style={{ background: medalColors[0] }}
              >
                <span className="top-user-medal-emoji">{medals[0]}</span>
                <span className="top-user-medal-rank">#{topUsers[0].rank}</span>
              </div>

              {/* Avatar */}
              <div className="top-user-avatar-wrapper">
                {topUsers[0].profileAvatar ? (
                  <Image
                    src={topUsers[0].profileAvatar}
                    alt={topUsers[0].name}
                    width={140}
                    height={140}
                    className="top-user-avatar top-user-avatar-center"
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="top-user-avatar-placeholder top-user-avatar-center">
                    {topUsers[0].name.charAt(0).toUpperCase()}
                  </div>
                )}
                {topUsers[0].hasMasterAchievement && (
                  <div className="top-user-crown">👑</div>
                )}
              </div>

              {/* User Info */}
              <div className="top-user-info">
                <h3 className="top-user-name top-user-name-center">{topUsers[0].name}</h3>
                {topUsers[0].country && (
                  <p className="top-user-country">📍 {topUsers[0].country}</p>
                )}
              </div>

              {/* Stats */}
              <div className="top-user-stats">
                <div className="top-user-stat">
                  <span className="top-user-stat-value top-user-stat-value-desktop">
                    {formatAmount(topUsers[0].totalDonated)}
                  </span>
                  <span className="top-user-stat-value top-user-stat-value-mobile">
                    {formatAmountMobile(topUsers[0].totalDonated)}
                  </span>
                  <span className="top-user-stat-label">Пожертвовано</span>
                </div>
                <div className="top-user-stat">
                  <span className="top-user-stat-value">{topUsers[0].projectsCount}</span>
                  <span className="top-user-stat-label">Проектов</span>
                </div>
                <div className="top-user-stat">
                  <span className="top-user-stat-value">
                    {topUsers[0].achievementsCount}
                  </span>
                  <span className="top-user-stat-label">Достижений</span>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="top-user-decoration"></div>
            </motion.div>
          )}

          {/* Топ-3 (справа) */}
          {topUsers[2] && (
            <motion.div
              key={topUsers[2].userId}
              className="top-user-card top-user-card-third"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              {/* Medal Badge */}
              <div
                className="top-user-medal"
                style={{ background: medalColors[2] }}
              >
                <span className="top-user-medal-emoji">{medals[2]}</span>
                <span className="top-user-medal-rank">#{topUsers[2].rank}</span>
              </div>

              {/* Avatar */}
              <div className="top-user-avatar-wrapper">
                {topUsers[2].profileAvatar ? (
                  <Image
                    src={topUsers[2].profileAvatar}
                    alt={topUsers[2].name}
                    width={120}
                    height={120}
                    className="top-user-avatar"
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="top-user-avatar-placeholder">
                    {topUsers[2].name.charAt(0).toUpperCase()}
                  </div>
                )}
                {topUsers[2].hasMasterAchievement && (
                  <div className="top-user-crown">👑</div>
                )}
              </div>

              {/* User Info */}
              <div className="top-user-info">
                <h3 className="top-user-name">{topUsers[2].name}</h3>
                {topUsers[2].country && (
                  <p className="top-user-country">📍 {topUsers[2].country}</p>
                )}
              </div>

              {/* Stats */}
              <div className="top-user-stats">
                <div className="top-user-stat">
                  <span className="top-user-stat-value top-user-stat-value-desktop">
                    {formatAmount(topUsers[2].totalDonated)}
                  </span>
                  <span className="top-user-stat-value top-user-stat-value-mobile">
                    {formatAmountMobile(topUsers[2].totalDonated)}
                  </span>
                  <span className="top-user-stat-label">Пожертвовано</span>
                </div>
                <div className="top-user-stat">
                  <span className="top-user-stat-value">{topUsers[2].projectsCount}</span>
                  <span className="top-user-stat-label">Проектов</span>
                </div>
                <div className="top-user-stat">
                  <span className="top-user-stat-value">
                    {topUsers[2].achievementsCount}
                  </span>
                  <span className="top-user-stat-label">Достижений</span>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="top-user-decoration"></div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

