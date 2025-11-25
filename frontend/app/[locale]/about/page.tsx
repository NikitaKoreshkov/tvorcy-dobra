'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { Link } from '@/src/routing';
import { useTranslations } from 'next-intl';
import { EducationIcon, HealthIcon, EcologyIcon, SupportIcon, ArrowRightIcon } from '../components/Icons';

export default function AboutPage() {
  const t = useTranslations('aboutPage');
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const founderRef = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const ref6 = useRef(null);
  const ref7 = useRef(null);
  const heroRef = useRef(null);
  
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isInView1 = useInView(ref1, viewOptions);
  const isInView2 = useInView(ref2, viewOptions);
  const isFounderInView = useInView(founderRef, viewOptions);
  const isInView3 = useInView(ref3, viewOptions);
  const isInView4 = useInView(ref4, viewOptions);
  const isInView5 = useInView(ref5, viewOptions);
  const isInView6 = useInView(ref6, viewOptions);
  const isInView7 = useInView(ref7, viewOptions);
  const isHeroInView = useInView(heroRef, viewOptions);

  const { scrollYProgress } = useScroll();
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const [activeRoadmap, setActiveRoadmap] = useState<number | null>(null);


  const roadmap = [
    { year: t('year2025'), title: t('roadmap2025'), description: t('roadmap2025Desc') },
    { year: t('year2026'), title: t('roadmap2026'), description: t('roadmap2026Desc') },
    { year: t('year2027'), title: t('roadmap2027'), description: t('roadmap2027Desc') },
    { year: t('year2028'), title: t('roadmap2028'), description: t('roadmap2028Desc') },
    { year: t('year2029'), title: t('roadmap2029'), description: t('roadmap2029Desc') },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section - без большого изображения */}
      <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight text-black">
              {t('heroTitle')}
              <br />
              {t('heroSubtitle')}
            </h1>
            <p className="text-xl lg:text-2xl text-black/60 max-w-3xl mx-auto leading-relaxed">
              {t('heroDescription')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section - с изображением и текстом */}
      <section className="py-20 lg:py-32 bg-white" ref={ref1}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 1, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-black">
                {t('missionTitle')}
                <span className="block text-black/70">{t('missionSubtitle')}</span>
              </h2>
              <div className="space-y-4 text-lg text-black/70 leading-relaxed">
                <p>
                  {t('missionP1')}
                </p>
                <p>
                  {t('missionP2')}
                </p>
                <p className="font-semibold text-black">
                  {t('missionP3')}
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/profile?tab=subscriptions"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-black/90 transition-all"
                >
                  {t('manageSubscriptions')}
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/support"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-black/10 text-black rounded-full font-medium hover:border-black/20 transition-all"
                >
                  {t('supportFund')}
                </Link>
              </div>
            </motion.div>
            <motion.div
              className="relative"
              style={{ y: imageY }}
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={isInView1 ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.9, x: 50 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-black/10">
                <Image
                  src="/images/22.jpg"
                  alt="О фонде"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50/50" ref={founderRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isFounderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight text-black">
              {t('founderTitle')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-black/60 max-w-2xl mx-auto px-2">
              {t('founderSubtitle')}
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16 lg:items-start">
            {/* Photo */}
            <div className="relative order-2 lg:order-1 lg:sticky lg:top-32" style={{ alignSelf: 'flex-start' }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isFounderInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 1, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
                <div 
                  className="relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-black/10"
                >
                <Image
                  src="/images/21.jpg"
                  alt={t('founderName')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </motion.div>
            </div>

            {/* Text Content */}
            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              animate={isFounderInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10 shadow-xl border border-black/10">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-black">
                    {t('founderName')}
                  </h3>
                  <p className="text-base sm:text-lg text-black/60 font-medium">
                    {t('founderAge')}
                  </p>
                </div>
                
                <div className="space-y-3 sm:space-y-4 md:space-y-5 text-black/80 leading-relaxed">
                  <p className="text-sm sm:text-base md:text-base lg:text-lg">
                    {t('founderP1')}
                  </p>
                  <p className="text-sm sm:text-base md:text-base lg:text-lg">
                    {t('founderP2')}
                  </p>
                  <p className="text-sm sm:text-base md:text-base lg:text-lg">
                    {t('founderP3')}
                  </p>
                  <p className="text-sm sm:text-base md:text-base lg:text-lg">
                    {t('founderP4')}
                  </p>
                  <p className="text-sm sm:text-base md:text-base lg:text-lg font-semibold text-black">
                    {t('founderP5')}
                  </p>
                  <p className="text-sm sm:text-base md:text-base lg:text-lg">
                    {t('founderP6')}
                  </p>
                  <p className="text-sm sm:text-base md:text-base lg:text-lg">
                    {t('founderP7')}
                  </p>
                  
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-black/10">
                    <p className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-black text-center italic px-2">
                      &quot;{t('founderQuote')}&quot;
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section - уникальный дизайн */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50/50 to-white" ref={ref2}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {t('valuesTitle')}
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              {t('valuesDescription')}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {[
              {
                number: '01',
                title: t('value1Title'),
                text: t('value1Text'),
              },
              {
                number: '02',
                title: t('value2Title'),
                text: t('value2Text'),
              },
              {
                number: '03',
                title: t('value3Title'),
                text: t('value3Text'),
              },
              {
                number: '04',
                title: t('value4Title'),
                text: t('value4Text'),
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                className="group relative bg-white rounded-3xl p-8 lg:p-10 border-2 border-black/10 hover:border-black/20 hover:shadow-2xl transition-all duration-500 overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: index * 0.15, ease: [0.6, -0.05, 0.01, 0.99] }}
                whileHover={{ y: -10, scale: 1.01 }}
              >
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-6xl font-bold text-black/5">{value.number}</div>
                    <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-black/30"></div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-black">{value.title}</h3>
                  <p className="text-black/70 leading-relaxed">{value.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section - интерактивная временная линия */}
      <section className="py-20 lg:py-32 bg-white" ref={ref3}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-black">
              {t('timelineTitle')} <span className="text-black/70">{t('timelineTitleHighlight')}</span>
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              {t('timelineDescription')}
            </p>
          </motion.div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-black/10 hidden lg:block"></div>
            <div className="space-y-12 lg:space-y-16">
              {roadmap.map((item, index) => (
                <motion.div
                  key={index}
                  className="relative lg:pl-32 group cursor-pointer"
                  initial={{ opacity: 0, x: -50 }}
                  animate={isInView3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: [0.6, -0.05, 0.01, 0.99] }}
                  onMouseEnter={() => setActiveRoadmap(index)}
                  onMouseLeave={() => setActiveRoadmap(null)}
                >
                  <div className="absolute left-0 top-0 w-16 h-16 rounded-full bg-white border-4 border-black/10 flex items-center justify-center group-hover:border-black/30 transition-all duration-300 hidden lg:flex">
                    <div className={`w-3 h-3 rounded-full bg-black/30 group-hover:bg-black/50 transition-all duration-300 ${activeRoadmap === index ? 'scale-150' : ''}`}></div>
                  </div>
                  <div className={`bg-white rounded-2xl p-6 lg:p-8 border-2 border-black/5 group-hover:border-black/20 transition-all duration-300 ${activeRoadmap === index ? 'shadow-xl scale-[1.02]' : ''}`}>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-2xl font-bold text-black">{item.year}</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-black/10 to-transparent"></div>
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold mb-2 text-black">{item.title}</h3>
                    <p className="text-black/70 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50/50" ref={ref4}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {t('achievementsTitle')}
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              {t('achievementsDescription')}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: EducationIcon,
                title: t('achievement1Title'),
                text: t('achievement1Text'),
              },
              {
                icon: HealthIcon,
                title: t('achievement2Title'),
                text: t('achievement2Text'),
              },
              {
                icon: EcologyIcon,
                title: t('achievement3Title'),
                text: t('achievement3Text'),
              },
              {
                icon: SupportIcon,
                title: t('achievement4Title'),
                text: t('achievement4Text'),
              },
            ].map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <motion.div
                  key={index}
                  className="group relative bg-white rounded-3xl p-6 lg:p-8 border border-black/5 hover:border-black/10 transition-all duration-500 overflow-hidden"
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: [0.6, -0.05, 0.01, 0.99] }}
                  whileHover={{ y: -6, scale: 1.02 }}
                >
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 mb-4 text-black/40 group-hover:text-black/70 transition-colors">
                      <IconComponent />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-black">{achievement.title}</h3>
                    <p className="text-black/70 leading-relaxed">{achievement.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50/50 to-white" ref={ref6}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView6 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-black">
              {t('impactTitle')}
              <span className="block text-black/70">{t('impactTitleHighlight')}</span>
            </h2>
            <p className="text-xl text-black/70 leading-relaxed mb-6">
              {t('impactP1')}
            </p>
            <p className="text-lg text-black/60 leading-relaxed">
              {t('impactP2')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 lg:py-32 bg-white" ref={ref7}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView7 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {t('ctaTitle')}
            </h2>
            <p className="text-xl text-black/60 mb-8 max-w-2xl mx-auto">
              {t('ctaDescription')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/support"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-black/90 transition-all"
              >
                {t('ctaSupportFund')}
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contacts"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-black/10 text-black rounded-full font-medium hover:border-black/20 transition-all"
              >
                {t('ctaContactUs')}
              </Link>
              <Link
                href="/profile/subscriptions"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-black/10 text-black rounded-full font-medium hover:border-black/20 transition-all"
              >
                {t('ctaMySubscriptions')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
