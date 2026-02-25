'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CalendarIcon, UsersIcon, ChartIcon } from '../Icons';

interface ProjectStatsProps {
  raised: number;
  goal: number;
  donors: number;
  progress: number;
  daysLeft?: number;
  isInView: boolean;
}

export default function ProjectStats({
  raised,
  goal,
  donors,
  progress,
  daysLeft,
  isInView
}: ProjectStatsProps) {
  const t = useTranslations('projectPage');
  // Функция для форматирования больших чисел
  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1).replace('.0', '')}М ₽`;
    } else if (amount >= 1000) {
      return `${Math.round(amount / 1000)}К ₽`;
    }
    return `${amount.toLocaleString('ru-RU')} ₽`;
  };

  const stats = [
    {
      label: t('collected'),
      value: formatAmount(raised),
      sublabel: `${t('from')} ${formatAmount(goal)}`,
      icon: ChartIcon,
      color: 'from-green-500/10 to-emerald-500/10',
      iconColor: 'text-green-600'
    },
    {
      label: t('progress'),
      value: `${progress}%`,
      sublabel: t('achieved'),
      icon: ChartIcon,
      color: 'from-blue-500/10 to-cyan-500/10',
      iconColor: 'text-blue-600'
    },
    {
      label: t('donors'),
      value: donors.toString(),
      sublabel: t('supported'),
      icon: UsersIcon,
      color: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'text-purple-600'
    }
  ];

  if (daysLeft !== undefined) {
    stats.push({
      label: t('remaining'),
      value: `${daysLeft}`,
      sublabel: t('days'),
      icon: CalendarIcon,
      color: 'from-orange-500/10 to-amber-500/10',
      iconColor: 'text-orange-600'
    });
  }

  return (
    <motion.div
      className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-12 sm:-top-24 -right-12 sm:-right-24 w-24 sm:w-48 h-24 sm:h-48 bg-gradient-to-br from-black/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 sm:-bottom-24 -left-12 sm:-left-24 w-24 sm:w-48 h-24 sm:h-48 bg-gradient-to-br from-black/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-4 sm:p-6 md:p-8 lg:p-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className={`relative bg-gradient-to-br ${stat.color} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 backdrop-blur-sm border border-gray-100`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 ${stat.iconColor} mb-2 sm:mb-3 md:mb-4`}>
                  <Icon />
                </div>
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black mb-0.5 sm:mb-1 tracking-tight leading-tight break-words">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium mb-0.5 sm:mb-1">{stat.label}</div>
                <div className="text-[10px] sm:text-xs text-gray-500 break-words">{stat.sublabel}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-xs sm:text-sm font-semibold text-gray-900">{t('collectionProgress')}</span>
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">{progress}%</span>
          </div>
          
          <div className="relative w-full h-3 sm:h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200"></div>
            
            {/* Progress bar with animation */}
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-black via-gray-800 to-black rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: [0.6, -0.05, 0.01, 0.99], delay: 0.3 }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </motion.div>
          </div>

          <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 font-medium">
            <span className="truncate pr-1">{t('collected')}: {raised.toLocaleString('en-US')} ₽</span>
            <span className="truncate pl-1">{t('goal')}: {goal.toLocaleString('en-US')} ₽</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

