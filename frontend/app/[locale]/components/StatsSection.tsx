'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function StatsSection() {
  const t = useTranslations('homePage');
  const ref = useRef(null);
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isInView = useInView(ref, viewOptions);

  const stats = [
    { value: '150+', label: t('projectsSupported') },
    { value: '2.5М+', label: t('fundsRaised') },
    { value: '50К+', label: t('peopleHelped') },
    { value: '50+', label: t('partners') },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
    }
  };

  return (
    <section className="stats-section" ref={ref}>
      <div className="stats-container">
        <motion.div
          className="stats-grid"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            visible: {
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="stat-item"
              variants={fadeInUp}
            >
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

