'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from '@/src/routing';
import Image from 'next/image';

export default function CTASection() {
  const t = useTranslations('homePage');
  const ref = useRef(null);
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isInView = useInView(ref, viewOptions);

  return (
    <section className="cta-section" ref={ref}>
      <div className="cta-container">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          <h2 className="cta-title">{t('joinUs')}</h2>
          <p className="cta-description">
            {t('joinUsDescription')}
          </p>
          <Link href="/catalog" className="cta-button">
            <span className="cta-button-text">{t('makeContribution')}</span>
            <Image
              src="/images/t.png"
              alt=""
              width={20}
              height={20}
              className="cta-button-icon"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

