'use client';

import { useTranslations } from 'next-intl';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from '@/src/routing';

export default function JoinPage() {
  const t = useTranslations('joinPage');
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isInView1 = useInView(ref1, viewOptions);
  const isInView2 = useInView(ref2, viewOptions);
  const isInView3 = useInView(ref3, viewOptions);

  return (
    <main className="min-h-screen">
      <Header />
      <PageHero 
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        image="/images/q.jpg"
      />
      
      {/* Intro Section */}
      <section className="page-content-section" ref={ref1}>
        <div className="page-content-container">
          <motion.div
            className="page-content"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="page-content-title">{t('howToJoinTitle')}</h2>
            <p className="page-content-text">
              {t('howToJoinText1')}
            </p>
            <p className="page-content-text">
              {t('howToJoinText2')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Join Options with Images */}
      <section className="page-content-section page-content-section-alt" ref={ref2}>
        <div className="page-content-container">
          <div className="page-content-grid page-content-grid-large">
            <motion.div
              className="page-content-item page-content-item-sticky"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <div className="page-content-item-image-wrapper">
                <Image
                  src="/images/q2.jpg"
                  alt="Стать донором"
                  fill
                  className="page-content-item-image"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="page-content-item-number">01</div>
              <h3 className="page-content-item-title">{t('donorTitle')}</h3>
              <p className="page-content-item-text">
                {t('donorText1')}
              </p>
              <p className="page-content-item-text">
                {t('donorText2')}
              </p>
            </motion.div>

            <motion.div
              className="page-content-item page-content-item-sticky"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <div className="page-content-item-image-wrapper">
                <Image
                  src="/images/q.jpg"
                  alt="Стать волонтером"
                  fill
                  className="page-content-item-image"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="page-content-item-number">02</div>
              <h3 className="page-content-item-title">{t('volunteerTitle')}</h3>
              <p className="page-content-item-text">
                {t('volunteerText1')}
              </p>
              <p className="page-content-item-text">
                {t('volunteerText2')}
              </p>
            </motion.div>

            <motion.div
              className="page-content-item page-content-item-sticky"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <div className="page-content-item-image-wrapper">
                <Image
                  src="/images/t.png"
                  alt={t('partnerTitle')}
                  fill
                  className="page-content-item-image"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="page-content-item-number">03</div>
              <h3 className="page-content-item-title">{t('partnerTitle')}</h3>
              <p className="page-content-item-text">
                {t('partnerText1')}
              </p>
              <p className="page-content-item-text">
                {t('partnerText2')}
              </p>
            </motion.div>

            <motion.div
              className="page-content-item page-content-item-sticky"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <div className="page-content-item-image-wrapper">
                <Image
                  src="/images/q2.jpg"
                  alt={t('proposeProjectTitle')}
                  fill
                  className="page-content-item-image"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="page-content-item-number">04</div>
              <h3 className="page-content-item-title">{t('proposeProjectTitle')}</h3>
              <p className="page-content-item-text">
                {t('proposeProjectText1')}
              </p>
              <p className="page-content-item-text">
                {t('proposeProjectText2')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section with Image */}
      <section className="page-content-section" ref={ref3}>
        <div className="page-content-container">
          <div className="page-content-with-image page-content-with-image-reverse">
            <motion.div
              className="page-content-image-block"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <div className="page-content-image-wrapper">
                <Image
                  src="/images/q.jpg"
                  alt="Присоединяйтесь к нам"
                  fill
                  className="page-content-image"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </motion.div>
            <motion.div
              className="page-content-text-block"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <h2 className="page-content-title">{t('startNowTitle')}</h2>
              <p className="page-content-text">
                {t('startNowText1')}
              </p>
              <p className="page-content-text">
                {t('startNowText2')}
              </p>
              <div className="page-content-buttons" style={{ marginTop: '2rem' }}>
                <Link href="/support" className="page-content-button">
                  {t('supportProjectButton')}
                </Link>
                <Link href="/contacts" className="page-content-button-secondary">
                  {t('contactUsButton')}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
