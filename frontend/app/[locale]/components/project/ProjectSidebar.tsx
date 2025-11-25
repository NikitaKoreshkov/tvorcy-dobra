'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { HeartIcon, RepeatIcon, ShareIcon } from '../Icons';
import { useAuth } from '@/app/contexts/AuthContext';
import LoginModal from '../LoginModal';

interface ProjectSidebarProps {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  urgency?: string;
  status?: string;
  createdAt?: string;
  isInView: boolean;
  onDonate: () => void;
  onSubscribe: () => void;
  onShare: () => void;
}

export default function ProjectSidebar({
  projectId,
  projectTitle,
  projectDescription,
  urgency,
  status,
  createdAt,
  isInView,
  onDonate,
  onSubscribe,
  onShare
}: ProjectSidebarProps) {
  const t = useTranslations('projectPage');
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleDonateClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    onDonate();
  };

  const handleSubscribeClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    onSubscribe();
  };
  
  // Translate urgency if needed
  const translatedUrgency = urgency === 'Экстренные случаи' || urgency === 'Emergency cases'
    ? t('emergencyCases')
    : urgency === 'Обычные' || urgency === 'Regular projects'
    ? t('regularProjects')
    : urgency;
  const getStatusLabel = (status?: string) => {
    if (!status) return null;
    switch (status) {
      case 'active': return 'Активен';
      case 'completed': return 'Завершен';
      case 'draft': return 'Черновик';
      default: return 'Архив';
    }
  };

  const statusLabel = getStatusLabel(status);

  return (
    <div className="space-y-4 sm:space-y-6 !static">
      {/* Quick Support Card */}
      <motion.div
        className="bg-gradient-to-br from-black via-gray-900 to-black text-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-gradient-to-br from-white to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-gradient-to-br from-white to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 backdrop-blur-sm border border-white/20">
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white flex-shrink-0">
                <HeartIcon />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">Быстрая поддержка</h3>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
              Ваше пожертвование поможет изменить жизни людей. Каждый вклад имеет значение.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={handleDonateClick}
              className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-white text-black rounded-lg sm:rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-start gap-2.5 sm:gap-3 group shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform group-hover:scale-110">
                <HeartIcon />
              </div>
              <span>Поддержать проект</span>
            </button>

            <button
              onClick={handleSubscribeClick}
              className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-white/10 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-start gap-2.5 sm:gap-3 group backdrop-blur-sm border border-white/20 text-sm sm:text-base"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform group-hover:scale-110">
                <RepeatIcon />
              </div>
              <span>Регулярная поддержка</span>
            </button>

            <button
              onClick={onShare}
              className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-transparent text-white rounded-lg sm:rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-start gap-2.5 sm:gap-3 group border border-white/30 text-sm sm:text-base"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform group-hover:scale-110">
                <ShareIcon />
              </div>
              <span>Поделиться</span>
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
            <p className="text-white/50 text-[10px] sm:text-xs text-center leading-relaxed">
              Все платежи защищены и обрабатываются через безопасные платежные системы
            </p>
          </div>
        </div>
      </motion.div>

      {/* Project Info Card */}
      <motion.div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">Информация</h3>
          <div className="space-y-3 sm:space-y-4">
            {urgency && (
              <div className="pb-3 sm:pb-4 border-b border-gray-100">
                <div className="text-xs sm:text-sm text-gray-600 mb-1.5 font-medium">{t('urgency')}</div>
                <div className={`inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold ${
                  urgency === 'Экстренные случаи' || urgency === 'Emergency cases'
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current mr-1.5 sm:mr-2"></span>
                  {translatedUrgency}
                </div>
              </div>
            )}
            {statusLabel && (
              <div className="pb-3 sm:pb-4 border-b border-gray-100">
                <div className="text-xs sm:text-sm text-gray-600 mb-1.5 font-medium">Статус</div>
                <div className={`inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold ${
                  status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : status === 'completed' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current mr-1.5 sm:mr-2"></span>
                  {statusLabel}
                </div>
              </div>
            )}
            {createdAt && (
              <div>
                <div className="text-xs sm:text-sm text-gray-600 mb-1.5 font-medium">Дата создания</div>
                <div className="text-black font-semibold text-sm sm:text-base">
                  {new Date(createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectPath={`/donate?projectId=${projectId}`}
      />
    </div>
  );
}

