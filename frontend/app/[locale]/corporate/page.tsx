'use client';

import { useTranslations } from 'next-intl';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from '@/src/routing';
import { BuildingIcon, HandshakeIcon, ChartIcon, StarIcon, CheckIcon, UsersIcon, ArrowRightIcon } from '../components/Icons';

export default function CorporatePage() {
  const t = useTranslations('corporatePage');
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const heroRef = useRef(null);
  
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isInView1 = useInView(ref1, viewOptions);
  const isInView2 = useInView(ref2, viewOptions);
  const isInView3 = useInView(ref3, viewOptions);
  const isInView4 = useInView(ref4, viewOptions);
  const isInView5 = useInView(ref5, viewOptions);
  const isHeroInView = useInView(heroRef, viewOptions);

  const benefits = [
    {
      icon: BuildingIcon,
      title: t('benefit1Title'),
      description: t('benefit1Description'),
    },
    {
      icon: UsersIcon,
      title: t('benefit2Title'),
      description: t('benefit2Description'),
    },
    {
      icon: ChartIcon,
      title: t('benefit3Title'),
      description: t('benefit3Description'),
    },
    {
      icon: StarIcon,
      title: t('benefit4Title'),
      description: t('benefit4Description'),
    },
  ];

  const partnershipTypes = [
    {
      number: '01',
      title: t('financialPartnershipTitle'),
      description: t('financialPartnershipDescription'),
      features: [
        t('financialPartnershipFeature1'),
        t('financialPartnershipFeature2'),
        t('financialPartnershipFeature3'),
        t('financialPartnershipFeature4'),
      ],
      image: '/images/42.jpg',
    },
    {
      number: '02',
      title: t('strategicPartnershipTitle'),
      description: t('strategicPartnershipDescription'),
      features: [
        t('strategicPartnershipFeature1'),
        t('strategicPartnershipFeature2'),
        t('strategicPartnershipFeature3'),
        t('strategicPartnershipFeature4'),
      ],
      image: '/images/43.jpg',
    },
    {
      number: '03',
      title: t('projectPartnershipTitle'),
      description: t('projectPartnershipDescription'),
      features: [
        t('projectPartnershipFeature1'),
        t('projectPartnershipFeature2'),
        t('projectPartnershipFeature3'),
        t('projectPartnershipFeature4'),
      ],
      image: '/images/44.jpg',
    },
  ];

  const steps = [
    {
      number: '01',
      title: t('step1Title'),
      description: t('step1Description'),
    },
    {
      number: '02',
      title: t('step2Title'),
      description: t('step2Description'),
    },
    {
      number: '03',
      title: t('step3Title'),
      description: t('step3Description'),
    },
    {
      number: '04',
      title: t('step4Title'),
      description: t('step4Description'),
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
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
              <span className="text-black/70">{t('heroSubtitle')}</span>
            </h1>
            <p className="text-xl lg:text-2xl text-black/60 max-w-3xl mx-auto leading-relaxed">
              {t('heroDescription')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50/50" ref={ref1}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 1, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-black">
                {t('changeWorldTitle')}
                <br />
                <span className="text-black/70">{t('changeWorldSubtitle')}</span>
              </h2>
              <p className="text-xl text-black/70 leading-relaxed">
                {t('changeWorldDescription')}
              </p>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={isInView1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-black/10">
                <Image
                  src="/images/40.jpg"
                  alt="Корпоративное партнерство"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32 bg-white" ref={ref2}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-black">
              {t('benefitsTitle')} <span className="text-black/70"></span>
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              {t('benefitsDescription')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <motion.div
                  key={index}
                  className="group bg-white rounded-3xl p-6 lg:p-8 border border-black/5 hover:border-black/10 transition-all duration-500"
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: [0.6, -0.05, 0.01, 0.99] }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center mb-4 group-hover:bg-black/10 group-hover:scale-110 transition-all">
                      <IconComponent className="w-7 h-7 text-black/70" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-black">{benefit.title}</h3>
                    <p className="text-black/70 leading-relaxed">{benefit.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50/50 to-white" ref={ref3}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-black">
              {t('partnershipFormatsTitle')} <span className="text-black/70"></span>
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              {t('partnershipFormatsDescription')}
            </p>
          </motion.div>

          <div className="space-y-12">
            {partnershipTypes.map((type, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                    !isEven ? 'lg:grid-flow-dense' : ''
                  }`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.8, delay: index * 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
                >
                  <motion.div
                    className={`${!isEven ? 'lg:col-start-2' : ''}`}
                  >
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group border border-black/10">
                      <div className="absolute inset-0 bg-black/5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <Image
                        src={type.image}
                        alt={type.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute top-6 left-6 z-20">
                        <div className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-black/10">
                          <span className="text-sm font-bold text-black">{type.number}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div className={`${!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                    <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-black">{type.title}</h3>
                    <p className="text-lg text-black/70 mb-6 leading-relaxed">{type.description}</p>
                    <div className="space-y-3">
                      {type.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckIcon className="w-3 h-3 text-black/70" />
                          </div>
                          <span className="text-black/70">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-white" ref={ref4}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-black">
              {t('howToStartCooperationTitle')} <span className="text-black/70"></span>
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              {t('howToStartCooperationDescription')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="group bg-white rounded-3xl p-6 lg:p-8 border border-black/5 hover:border-black/10 transition-all duration-500"
                initial={{ opacity: 0, y: 40 }}
                animate={isInView4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.6, -0.05, 0.01, 0.99] }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="text-6xl font-bold text-black/5 mb-4">{step.number}</div>
                  <h3 className="text-xl font-bold mb-3 text-black">{step.title}</h3>
                  <p className="text-black/70 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50/50" ref={ref5}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <div className="bg-black rounded-3xl p-12 lg:p-16 text-white">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                <HandshakeIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-white">
                {t('readyToPartnerTitle')}
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                {t('readyToPartnerDescription')}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/contacts"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all"
                >
                  {t('contactUsButton')}
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-full font-medium hover:border-white/50 transition-all"
                >
                  {t('viewProjectsButton')}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
