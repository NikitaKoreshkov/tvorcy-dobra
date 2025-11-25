'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { StarIcon, HeartIcon, CheckIcon } from '../Icons';
import { getApiUrl } from '@/src/config';

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

interface GamificationData {
  achievements: Achievement[];
  level: string;
  nextLevel: string;
  levelProgress: number;
}

const iconMap: Record<string, any> = {
  heart: HeartIcon,
  star: StarIcon,
  check: CheckIcon,
  trophy: StarIcon,
  fire: StarIcon,
};

export default function ProfileGamification() {
  const t = useTranslations('profilePage');
  const [data, setData] = useState<GamificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError(t('authRequired'));
          return;
        }

        const res = await fetch(getApiUrl('/gamification'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const response = await res.json();
          if (response.success) {
            setData({
              achievements: response.achievements,
              level: response.level,
              nextLevel: response.nextLevel,
              levelProgress: response.levelProgress,
            });
          } else {
            setError(t('dataFetchError'));
          }
        } else if (res.status === 401) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        } else {
          setError(t('dataLoadError'));
        }
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError(t('dataLoadError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  // Используем данные из API или значения по умолчанию
  const achievements = data?.achievements || [];
  const level = data?.level || t('beginner');
  const nextLevel = data?.nextLevel || 'Friend';
  const progress = data?.levelProgress || 0;

  return (
    <div className="profile-gamification">
      <motion.div
        className="premium-content-header"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="premium-content-title">Достижения</h2>
        <p className="premium-content-intro">
          Отслеживайте свой прогресс и получайте награды за ваши добрые дела.
        </p>
      </motion.div>

      {/* Уровень */}
      <motion.div
        className="profile-level-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <div className="profile-level-info">
          <h3 className="profile-level-title">Ваш уровень</h3>
          <p className="profile-level-name">{level}</p>
          <p className="profile-level-next">Следующий уровень: {nextLevel}</p>
        </div>
        <div className="profile-level-progress">
          <div className="profile-level-progress-bar">
            <div
              className="profile-level-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="profile-level-progress-text">{progress}% до следующего уровня</p>
        </div>
      </motion.div>

      {/* Значки */}
      <motion.div
        className="profile-badges"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h3 className="profile-section-title">Значки</h3>
        <div className="profile-badges-grid">
          {achievements.map((achievement, index) => {
            const IconComponent = iconMap[achievement.icon] || StarIcon;
            return (
              <motion.div
                key={achievement.id}
                className={`profile-badge-card ${achievement.isCompleted ? 'profile-badge-earned' : 'profile-badge-locked'}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{
                  background: achievement.code === 'all_achievements' && achievement.isCompleted
                    ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
                    : undefined,
                  border: achievement.code === 'all_achievements' && achievement.isCompleted
                    ? '2px solid #ffd700'
                    : undefined,
                  boxShadow: achievement.code === 'all_achievements' && achievement.isCompleted
                    ? '0 8px 24px rgba(255, 215, 0, 0.3)'
                    : undefined,
                  position: 'relative',
                }}
              >
                {achievement.code === 'all_achievements' && achievement.isCompleted && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    fontSize: '32px',
                    filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))',
                    zIndex: 10,
                  }}>
                    👑
                  </div>
                )}
                <div className="profile-badge-icon" style={{
                  opacity: achievement.isCompleted ? 1 : 0.3,
                }}>
                  <IconComponent />
                </div>
                <h4 className="profile-badge-name" style={{
                  color: achievement.code === 'all_achievements' && achievement.isCompleted
                    ? '#1a1a1a'
                    : achievement.isCompleted
                    ? '#1a1a1a'
                    : '#999',
                }}>{achievement.name}</h4>
                {achievement.description && (
                  <p className="profile-badge-description" style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {achievement.description}
                  </p>
                )}
                {achievement.isCompleted && achievement.completedAt && (
                  <p className="profile-badge-date">
                    Получено: {new Date(achievement.completedAt).toLocaleDateString('ru-RU')}
                  </p>
                )}
                {!achievement.isCompleted && (
                  <div className="profile-badge-progress">
                    <div className="profile-badge-progress-bar">
                      <div
                        className="profile-badge-progress-fill"
                        style={{ width: `${achievement.progressPercent}%` }}
                      />
                    </div>
                    <p className="profile-badge-progress-text">
                      {achievement.progressPercent}% ({achievement.currentProgress} / {achievement.targetValue})
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        {isLoading && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            Загрузка достижений...
          </div>
        )}
        {error && !isLoading && (
          <div style={{ 
            padding: '20px', 
            background: '#fee', 
            border: '1px solid #fcc', 
            borderRadius: '8px', 
            color: '#c33',
            marginTop: '20px',
          }}>
            {error}
          </div>
        )}
      </motion.div>

      {/* Мотивационное сообщение */}
      <motion.div
        className="profile-motivation-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <p className="profile-motivation-text">
          Сегодня вы снова сделали мир чуть лучше 💛
        </p>
      </motion.div>
    </div>
  );
}

