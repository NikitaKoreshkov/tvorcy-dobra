'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { Link } from '@/src/routing';

export default function AIFeatureSection() {
  const t = useTranslations('homePage');
  const ref = useRef(null);
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isInView = useInView(ref, viewOptions);


  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
    }
  };

  return (
    <section className="ai-feature-section" ref={ref}>
      <div className="ai-feature-container">
        <motion.div
          className="ai-feature-content"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          <div className="ai-feature-text-block">
            <h2 className="premium-content-title">
              AliusAI — <span className="premium-title-accent">{t('coreOfSite')}</span>
            </h2>
            <p className="premium-content-text">
              {t('aiFeatureDescription')}
            </p>
            
            <motion.div
              className="ai-feature-list"
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={{
                visible: {
                  transition: { staggerChildren: 0.1, delayChildren: 0.4 }
                }
              }}
            >
              <motion.div
                className="ai-feature-item"
                variants={fadeInUp}
              >
                <div>
                  <h3 className="ai-feature-item-title">{t('instantAnswers')}</h3>
                  <p className="ai-feature-item-description">{t('instantAnswersDesc')}</p>
                </div>
              </motion.div>
              <motion.div
                className="ai-feature-item"
                variants={fadeInUp}
              >
                <div>
                  <h3 className="ai-feature-item-title">{t('personalization')}</h3>
                  <p className="ai-feature-item-description">{t('personalizationDesc')}</p>
                </div>
              </motion.div>
              <motion.div
                className="ai-feature-item"
                variants={fadeInUp}
              >
                <div>
                  <h3 className="ai-feature-item-title">{t('transparency')}</h3>
                  <p className="ai-feature-item-description">{t('transparencyDesc')}</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/alius-ai"
                className="ai-feature-button"
              >
                <span>{t('tryAliusAI')}</span>
                <Image
                  src="/images/ai.png"
                  alt="AliusAI"
                  width={20}
                  height={20}
                  className="object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="ai-feature-visual"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="ai-feature-visual-container">
              <div className="ai-feature-glow" />
              <div className="ai-feature-circle">
                <Image
                  src="/images/ai.png"
                  alt="AliusAI"
                  width={120}
                  height={120}
                  className="object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <motion.div
                className="ai-feature-particles"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="ai-feature-particle"
                    style={{
                      transform: `rotate(${i * 45}deg) translateY(-80px)`,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

