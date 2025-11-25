'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/routing';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export default function Hero() {
  const t = useTranslations('hero');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
    layoutEffect: false,
  });

  // Параллакс для изображения - двигается медленнее
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  
  // Текст остается на месте или двигается медленнее
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <section className="hero-section" ref={containerRef}>
      <motion.div 
        className="hero-image-container"
        style={{ y: imageY }}
      >
        <Image
          src="/images/q.jpg"
          alt="Hero"
          fill
          className="hero-image"
          priority
          quality={85}
          sizes="100vw"
        />
        <motion.div 
          className="hero-overlay"
          style={{ y: textY }}
        >
          <div className="hero-content-wrapper">
            <motion.div 
              className="hero-text-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <motion.h1 
                className="hero-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              >
                {t('title')}
              </motion.h1>
              <motion.p 
                className="hero-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              >
                {t('subtitle')}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
              >
                <Link href="/catalog" className="hero-cta-button">
                  <span className="hero-cta-text">{t('cta')}</span>
                  <Image
                    src="/images/t.png"
                    alt=""
                    width={20}
                    height={20}
                    className="hero-cta-icon"
                  />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

