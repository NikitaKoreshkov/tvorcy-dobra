'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChartIcon, HeartIcon, CheckIcon } from '../Icons';
import { getApiUrl } from '@/src/config';

// Функция для форматирования суммы в сокращенном виде для мобильных
const formatAmountMobile = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1).replace('.0', '')}м`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1).replace('.0', '')}к`;
  }
  return amount.toString();
};

interface DashboardData {
  totalDonated: number;
  projectsCount: number;
  countriesCount: number;
  recentDonations: Array<{
    id: string;
    project: string;
    amount: number;
    date: string;
    status: string;
  }>;
  totalPlatformAmount: number;
}

export default function ProfileDashboard() {
  const t = useTranslations('profilePage');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError(t('authRequired'));
          return;
        }

        const res = await fetch(getApiUrl('/transactions/dashboard'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.dashboard) {
            setDashboardData(data.dashboard);
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
        console.error('Error fetching dashboard data:', err);
        setError(t('dataLoadError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Используем данные из API или значения по умолчанию
  const totalDonated = dashboardData?.totalDonated || 0;
  const projectsCount = dashboardData?.projectsCount || 0;
  const countriesCount = dashboardData?.countriesCount || 0;
  const recentDonations = dashboardData?.recentDonations || [];
  const totalPlatformAmount = dashboardData?.totalPlatformAmount || 0;

  return (
    <div className="profile-dashboard">
      <motion.div
        className="premium-content-header"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="premium-content-title">Мой вклад</h2>
        <p className="premium-content-intro">
          Ваша поддержка помогает нам создавать устойчивые изменения и решать важные социальные проблемы.
        </p>
      </motion.div>

      {/* Статистика */}
      <div className="profile-stats-grid">
        <motion.div
          className="profile-stat-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="profile-stat-icon">
            <ChartIcon />
          </div>
          <div className="profile-stat-value">{totalDonated.toLocaleString('ru-RU')} ₽</div>
          <div className="profile-stat-label">Общая сумма пожертвований</div>
        </motion.div>

        <motion.div
          className="profile-stat-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="profile-stat-icon">
            <HeartIcon />
          </div>
          <div className="profile-stat-value">{projectsCount}</div>
          <div className="profile-stat-label">Проектов поддержано</div>
        </motion.div>

        <motion.div
          className="profile-stat-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="profile-stat-icon">
            <CheckIcon />
          </div>
          <div className="profile-stat-value">{countriesCount}</div>
          <div className="profile-stat-label">Стран охвачено</div>
        </motion.div>
      </div>

      {/* Прогресс */}
      <motion.div
        className="profile-progress-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <h3 className="profile-progress-title">
          Вы помогли {projectsCount} проектам в {countriesCount} странах
        </h3>
        <div className="profile-progress-bar">
          <div 
            className="profile-progress-fill"
            style={{ width: `${(projectsCount / 10) * 100}%` }}
          />
        </div>
      </motion.div>

      {/* Последние пожертвования */}
      <motion.div
        className="profile-donations-section"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <h3 className="profile-section-title">Последние пожертвования</h3>
        <div className="profile-donations-list">
          {recentDonations.map((donation) => (
            <div key={donation.id} className="profile-donation-card">
              <div className="profile-donation-info">
                <h4 className="profile-donation-project">{donation.project}</h4>
                <p className="profile-donation-date">{donation.date}</p>
              </div>
              <div className="profile-donation-details">
                <div className="profile-donation-amount">
                  <span className="profile-donation-amount-desktop">{donation.amount.toLocaleString('ru-RU')} ₽</span>
                  <span className="profile-donation-amount-mobile">{formatAmountMobile(donation.amount)} ₽</span>
                </div>
                <div className={`profile-donation-status profile-donation-status-${donation.status === 'Завершено' ? 'completed' : 'active'}`}>
                  {donation.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Общий эффект */}
      <motion.div
        className="profile-impact-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <h3 className="profile-impact-title">
          Благодаря участникам как вы, собрано уже {totalPlatformAmount.toLocaleString('ru-RU')} ₽
        </h3>
        <p className="profile-impact-text">
          Ваша поддержка помогает нам создавать реальные изменения в жизни людей и развивать общество.
        </p>
      </motion.div>

      {/* Состояние загрузки или ошибки */}
      {isLoading && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Загрузка данных...
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
    </div>
  );
}

