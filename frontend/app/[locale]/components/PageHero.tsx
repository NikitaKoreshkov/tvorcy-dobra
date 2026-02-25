'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string;
}

export default function PageHero({ title, subtitle, image = '/images/q.jpg' }: PageHeroProps) {
  return (
    <section className="page-hero-section">
      <div className="page-hero-image-container">
        <Image
          src={image}
          alt={title}
          fill
          className="page-hero-image"
          priority
          quality={85}
          sizes="100vw"
        />
        <div className="page-hero-overlay">
          <div className="page-hero-content">
            <motion.h1
              className="page-hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                className="page-hero-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

