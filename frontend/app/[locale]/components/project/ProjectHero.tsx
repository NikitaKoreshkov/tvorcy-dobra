'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface ProjectHeroProps {
  title: string;
  description: string;
  image: string;
  category: string;
  urgency?: string;
  isInView: boolean;
}

export default function ProjectHero({
  title,
  description,
  image,
  category,
  urgency,
  isInView
}: ProjectHeroProps) {
  const t = useTranslations('projectPage');
  
  // Translate urgency if needed
  const translatedUrgency = urgency === 'Экстренные случаи' || urgency === 'Emergency cases'
    ? t('emergencyCases')
    : urgency === 'Обычные' || urgency === 'Regular projects'
    ? t('regularProjects')
    : urgency;
  
  return (
    <section className="relative w-full h-[40vh] min-h-[280px] sm:h-[45vh] sm:min-h-[350px] md:h-[50vh] md:min-h-[400px] lg:h-[60vh] lg:min-h-[500px] max-h-[700px] overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover opacity-40"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Urgency Badge */}
      {urgency && (
        <motion.div
          className={`absolute top-3 right-3 sm:top-4 sm:right-4 md:top-8 md:right-8 z-10 px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 backdrop-blur-md rounded-full text-xs sm:text-sm font-semibold shadow-lg ${
            urgency === 'Экстренные случаи' || urgency === 'Emergency cases'
              ? 'bg-red-500/90 text-white ring-2 ring-red-300/50'
              : 'bg-white/90 text-gray-900 ring-2 ring-white/30'
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {translatedUrgency}
        </motion.div>
      )}

      {/* Content Container */}
      <div className="relative h-full flex items-end z-10">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-6 sm:pb-8 md:pb-12 lg:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight tracking-tight">
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 max-w-4xl leading-relaxed font-light">
                {description}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 lg:h-32 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}

