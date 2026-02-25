'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { HeartIcon, RepeatIcon, ShareIcon, ArrowRightIcon } from '../Icons';
import { Link } from '@/src/routing';
import { useAuth } from '@/app/contexts/AuthContext';
import LoginModal from '../LoginModal';

interface ProjectActionsProps {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  isInView: boolean;
  onDonate: () => void;
  onSubscribe: () => void;
  onShare: () => void;
}

export default function ProjectActions({
  projectId,
  projectTitle,
  projectDescription,
  isInView,
  onDonate,
  onSubscribe,
  onShare
}: ProjectActionsProps) {
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
  
  const actions = [
    {
      label: t('supportProject'),
      description: t('oneTimeDonation'),
      icon: HeartIcon,
      onClick: handleDonateClick,
      primary: true,
      color: 'from-black to-gray-900'
    },
    {
      label: t('regularSupport'),
      description: t('monthlyDonation'),
      icon: RepeatIcon,
      onClick: handleSubscribeClick,
      primary: false,
      color: 'from-blue-600 to-blue-800'
    },
    {
      label: t('share'),
      description: t('tellFriends'),
      icon: ShareIcon,
      onClick: onShare,
      primary: false,
      color: 'from-purple-600 to-purple-800'
    }
  ];

  return (
    <motion.div
      className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-gradient-to-br from-black/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
          <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-black to-gray-400 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">{t('howToHelp')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                onClick={action.onClick}
                className={`group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-left transition-all duration-300 ${
                  action.primary
                    ? 'bg-gradient-to-br from-black to-gray-900 text-white shadow-lg hover:shadow-2xl'
                    : 'bg-white border-2 border-gray-200 text-black hover:border-gray-300 hover:shadow-lg'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                {/* Background effect for primary button */}
                {action.primary && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                )}

                <div className="relative">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300 ${
                    action.primary
                      ? 'bg-white/10 group-hover:bg-white/20'
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 transition-transform group-hover:scale-110">
                      <Icon />
                    </div>
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-bold mb-1">{action.label}</h3>
                  <p className={`text-xs sm:text-sm ${action.primary ? 'text-white/70' : 'text-gray-600'}`}>
                    {action.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className={`absolute top-4 sm:top-6 right-4 sm:right-6 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 ${
                    action.primary ? 'text-white' : 'text-black'
                  }`}>
                    <ArrowRightIcon />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Link to catalog */}
        <Link
          href="/catalog"
          className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-200 text-black rounded-xl sm:rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 group text-sm sm:text-base"
        >
          <span>{t('viewOtherProjects')}</span>
          <div className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1">
            <ArrowRightIcon />
          </div>
        </Link>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectPath={`/donate?projectId=${projectId}`}
      />
    </motion.div>
  );
}

