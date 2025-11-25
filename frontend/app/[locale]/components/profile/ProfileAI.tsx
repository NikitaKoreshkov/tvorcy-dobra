'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/src/routing';
import { useState, useEffect } from 'react';

export default function ProfileAI() {
  const t = useTranslations('profilePage.ai');
  const router = useRouter();
  const [autoMessage, setAutoMessage] = useState<string | null>(null);

  const recommendations = [
    {
      id: 1,
      title: t('recommendationTitle'),
      text: t('recommendationText'),
      action: t('viewProjects'),
    },
    {
      id: 2,
      title: t('autoReportTitle'),
      text: t('autoReportText'),
      action: t('openReport'),
    },
    {
      id: 3,
      title: t('habitsAnalysisTitle'),
      text: t('habitsAnalysisText'),
      action: t('configure'),
    },
  ];

  // Проверяем наличие автосообщения при монтировании компонента
  useEffect(() => {
    const savedMessage = sessionStorage.getItem('aliusAutoMessage');
    if (savedMessage) {
      setAutoMessage(savedMessage);
      sessionStorage.removeItem('aliusAutoMessage');
    }
  }, []);

  const handleAction = (rec: typeof recommendations[0]) => {
    switch (rec.id) {
      case 1:
        // Кнопка "Посмотреть проекты" - переход на страницу каталога
        router.push('/catalog');
        break;
      case 2:
        // Кнопка "Открыть отчёт" - переход на ИИ страницу с автосообщением
        const reportMessage = t('showMonthlyReport');
        sessionStorage.setItem('aliusAutoMessage', reportMessage);
        router.push('/alius-ai');
        break;
      case 3:
        // Кнопка "Настроить" - переход на страницу подписок
        router.push('/profile/subscriptions');
        break;
      default:
        break;
    }
  };

  return (
    <div className="profile-ai">
      <motion.div
        className="premium-content-header"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="premium-content-title">AliusAI – персональный ассистент добра</h2>
        <p className="premium-content-intro">
          Ваш персональный помощник в мире добрых дел. Я помогу вам найти подходящие проекты и отслеживать ваш вклад.
        </p>
      </motion.div>

      <div className="profile-ai-recommendations">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            className="profile-ai-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
          >
            <h3 className="profile-ai-card-title">{rec.title}</h3>
            <p className="profile-ai-card-text">{rec.text}</p>
            <button 
              className="premium-button"
              onClick={() => handleAction(rec)}
            >
              {rec.action}
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="profile-ai-cta"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Link href="/alius-ai" className="premium-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Открыть AliusAI
        </Link>
      </motion.div>
    </div>
  );
}

