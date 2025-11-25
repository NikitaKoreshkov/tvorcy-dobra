'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';

// Simple arrow icon component
const ArrowRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function GlobalNotFound() {
  const nextRouter = useNextRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [locale, setLocale] = useState('ru');

  useEffect(() => {
    // Determine locale from path and redirect to localized 404
    const path = window.location.pathname;
    const localeMatch = path.match(/^\/(ru|en)/);
    const detectedLocale = localeMatch ? localeMatch[1] : 'ru';
    setLocale(detectedLocale);
    
    // Redirect to localized 404 page if not already there
    if (!path.includes('/not-found')) {
      nextRouter.replace(`/${detectedLocale}/not-found`);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [nextRouter]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Animated cold bright glares */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large cold glares */}
        {[
          { x: 20, y: 15, size: 600, color: 'rgba(100, 200, 255, 0.4)' },
          { x: 80, y: 60, size: 800, color: 'rgba(150, 220, 255, 0.3)' },
          { x: 50, y: 85, size: 700, color: 'rgba(120, 180, 255, 0.35)' },
        ].map((glare, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              left: `${glare.x}%`,
              top: `${glare.y}%`,
              width: glare.size,
              height: glare.size,
              background: `radial-gradient(circle, ${glare.color}, transparent 70%)`,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 100, 0],
              y: [0, (Math.random() - 0.5) * 100, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 2,
            }}
          />
        ))}
        
        {/* Mouse-following cold glare */}
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 400,
            height: 400,
            background: 'radial-gradient(circle, rgba(100, 200, 255, 0.2), transparent 70%)',
            left: mousePosition.x,
            top: mousePosition.y,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            left: mousePosition.x,
            top: mousePosition.y,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Large 404 on full background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <motion.h1
          className="text-[30rem] md:text-[45rem] lg:text-[60rem] font-bold text-white/10 select-none tracking-tight leading-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          404
        </motion.h1>
      </div>

      {/* Glass panel with content */}
      <div className="absolute inset-0 flex items-center justify-center px-6 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="relative max-w-4xl w-full"
        >
          {/* Glass panel */}
          <div 
            className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 md:p-16 shadow-2xl"
            style={{
              boxShadow: '0 8px 32px 0 rgba(100, 200, 255, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* Glass reflection effect */}
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-3xl pointer-events-none" />
            
            <div className="relative z-10 text-center">

              {/* Title */}
              <motion.h2
                className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Страница не найдена
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                К сожалению, страница, которую вы ищете, не существует или была перемещена.
              </motion.p>

              {/* Actions */}
              <motion.div
                className="flex flex-wrap gap-4 justify-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <a
                    href={`/${locale}`}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full font-semibold hover:bg-white/30 transition-all shadow-lg hover:shadow-xl"
                  >
                    <span>На главную</span>
                    <span className="w-5 h-5 group-hover:translate-x-1 transition-transform inline-flex items-center justify-center">
                      <ArrowRightIcon />
                    </span>
                  </a>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <a
                    href={`/${locale}/programs`}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition-all shadow-sm hover:shadow-md"
                  >
                    Посмотреть проекты
                  </a>
                </motion.div>
              </motion.div>

              {/* Helpful links grid */}
              <motion.div
                className="mt-12 pt-8 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <p className="text-white/60 mb-6 text-base font-medium">Полезные ссылки:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                  {[
                    { href: '/about', label: 'О фонде' },
                    { href: '/programs', label: 'Программы' },
                    { href: '/reports', label: 'Отчёты' },
                    { href: '/contacts', label: 'Контакты' },
                  ].map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                    >
                      <a
                        href={`/${locale}${link.href}`}
                        className="block px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white/70 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all text-center font-medium text-sm"
                      >
                        {link.label}
                      </a>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
