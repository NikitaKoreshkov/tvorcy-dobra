'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MapPinIcon, UsersIcon, HeartIcon } from '../Icons';

interface ProjectDetailsProps {
  location?: string;
  age?: string;
  disabilityType?: string;
  organizerName?: string;
  tags?: string[];
  isInView: boolean;
}

export default function ProjectDetails({
  location,
  age,
  disabilityType,
  organizerName,
  tags,
  isInView
}: ProjectDetailsProps) {
  const t = useTranslations('projectPage');
  const tCatalog = useTranslations('catalogPage');
  
  const details = [
    { label: tCatalog('region'), value: location, icon: MapPinIcon },
    { label: tCatalog('age'), value: age, icon: UsersIcon },
    { label: t('needsType'), value: disabilityType, icon: HeartIcon },
    { label: tCatalog('organizer'), value: organizerName, icon: UsersIcon }
  ].filter(detail => detail.value);

  if (details.length === 0 && (!tags || tags.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Details Card */}
      {details.length > 0 && (
        <motion.div
          className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
              <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-black to-gray-400 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">{tCatalog('projectDetails')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {details.map((detail, index) => {
                const Icon = detail.icon;
                return (
                  <motion.div
                    key={detail.label}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-700">
                        <Icon />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">{detail.label}</div>
                      <div className="text-black font-semibold text-sm sm:text-base md:text-lg break-words">{detail.value}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tags Card */}
      {tags && tags.length > 0 && (
        <motion.div
          className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-black to-gray-400 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">{tCatalog('tags')}</h2>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {tags.map((tag, index) => (
                <motion.span
                  key={index}
                  className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-br from-gray-50 to-white border border-gray-200 text-gray-800 rounded-full text-xs sm:text-sm font-medium hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-default"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

