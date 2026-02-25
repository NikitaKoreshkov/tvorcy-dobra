'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link, useRouter } from '@/src/routing';
import { useState } from 'react';

export default function ProfileProjects() {
  const t = useTranslations('profilePage.projects');
  const router = useRouter();
  const [tooltip, setTooltip] = useState<{ projectId: number; button: 'donate' | 'share' } | null>(null);

  // Мок данные - в будущем будут получаться с API
  const projects = [
    {
      id: 1,
      name: t('project1Name'),
      description: t('project1Description'),
      image: '/images/q.jpg',
      goal: 50000,
      current: 50000,
      status: 'completed',
      date: '2024-01-15',
      yourDonation: 500,
    },
    {
      id: 2,
      name: t('project2Name'),
      description: t('project2Description'),
      image: '/images/q2.jpg',
      goal: 100000,
      current: 75000,
      status: 'active',
      date: '2024-01-10',
      yourDonation: 1000,
    },
    {
      id: 3,
      name: t('project3Name'),
      description: t('project3Description'),
      image: '/images/t.png',
      goal: 80000,
      current: 80000,
      status: 'completed',
      date: '2024-01-05',
      yourDonation: 2500,
    },
  ];

  return (
    <div className="profile-projects">
      <motion.div
        className="premium-content-header"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="premium-content-title">Проекты, которым я помог</h2>
        <p className="premium-content-intro">
          Здесь вы можете увидеть все проекты, которые вы поддержали, и отслеживать их прогресс.
        </p>
      </motion.div>

      <div className="profile-projects-grid">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            className="profile-project-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
          >
            <div className="profile-project-image-wrapper">
              <Image
                src={project.image}
                alt={project.name}
                fill
                className="profile-project-image"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {project.status === 'completed' && (
                <div className="profile-project-badge profile-project-badge-completed">
                  Завершён
                </div>
              )}
              {project.status === 'active' && (
                <div className="profile-project-badge profile-project-badge-active">
                  Сбор продолжается
                </div>
              )}
            </div>
            <div className="profile-project-content">
              <h3 className="profile-project-title">{project.name}</h3>
              <p className="profile-project-description">{project.description}</p>
              
              {project.status === 'completed' && (
                <div className="profile-project-report">
                  <p className="profile-project-report-text">
                    Ваши {project.yourDonation.toLocaleString('ru-RU')} ₽ помогли обеспечить водой 3 семьи в Непале.
                  </p>
                </div>
              )}

              <div className="profile-project-progress">
                <div className="profile-project-progress-bar">
                  <div
                    className="profile-project-progress-fill"
                    style={{ width: `${(project.current / project.goal) * 100}%` }}
                  />
                </div>
                <div className="profile-project-progress-text">
                  {project.current.toLocaleString('ru-RU')} ₽ из {project.goal.toLocaleString('ru-RU')} ₽
                </div>
              </div>

              <div className="profile-project-actions">
                <div className="profile-project-button-wrapper">
                  <button 
                    className={`premium-button profile-project-donate-button ${project.status === 'completed' ? 'disabled' : ''}`}
                    disabled={project.status === 'completed'}
                    onClick={() => {
                      if (project.status !== 'completed') {
                        // Переход на страницу доната (тестовая страница)
                        router.push('/programs');
                      }
                    }}
                    onMouseEnter={() => {
                      if (project.status === 'completed') {
                        setTooltip({ projectId: project.id, button: 'donate' });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    Пожертвовать
                  </button>
                  {tooltip?.projectId === project.id && tooltip?.button === 'donate' && (
                    <div className="profile-project-tooltip">
                      Проект завершён
                    </div>
                  )}
                </div>
                <div className="profile-project-button-wrapper">
                  <button 
                    className={`profile-project-share ${project.status === 'completed' ? 'disabled' : ''}`}
                    disabled={project.status === 'completed'}
                    onClick={() => {
                      if (project.status !== 'completed') {
                        // Логика поделиться
                        if (typeof navigator !== 'undefined' && navigator.share) {
                          navigator.share({
                            title: project.name,
                            text: project.description,
                            url: window.location.href,
                          }).catch(() => {});
                        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          // Fallback: копировать в буфер обмена
                          navigator.clipboard.writeText(window.location.href);
                        }
                      }
                    }}
                    onMouseEnter={() => {
                      if (project.status === 'completed') {
                        setTooltip({ projectId: project.id, button: 'share' });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    Поделиться
                  </button>
                  {tooltip?.projectId === project.id && tooltip?.button === 'share' && (
                    <div className="profile-project-tooltip">
                      Проект завершён
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

