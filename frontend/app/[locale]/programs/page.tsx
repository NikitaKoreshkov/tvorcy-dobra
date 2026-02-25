'use client';

import { useTranslations } from 'next-intl';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Link } from '@/src/routing';
import { EducationIcon, HealthIcon, SupportIcon, ChartIcon, StarIcon, HeartIcon, MapPinIcon, ArrowRightIcon, CheckIcon, FilterIcon, XIcon } from '../components/Icons';

export default function ProgramsPage() {
  const t = useTranslations('programsPage');
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const ref6 = useRef(null);
  const heroRef = useRef(null);
  
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isInView1 = useInView(ref1, viewOptions);
  const isInView2 = useInView(ref2, viewOptions);
  const isInView3 = useInView(ref3, viewOptions);
  const isInView4 = useInView(ref4, viewOptions);
  const isInView5 = useInView(ref5, viewOptions);
  const isInView6 = useInView(ref6, viewOptions);
  const isHeroInView = useInView(heroRef, viewOptions);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredProgram, setHoveredProgram] = useState<number | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Блокируем скролл body когда панель открыта
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFilterOpen]);

  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  const programs = [
    {
      id: 1,
      number: '01',
      icon: HealthIcon,
      title: t('program1Title'),
      category: 'sports',
      image: '/images/2.jpg',
      description: t('program1Description'),
      details: [
        t('program1Detail1'),
        t('program1Detail2'),
        t('program1Detail3'),
        t('program1Detail4'),
      ],
      stats: { projects: 0, people: '0', regions: 0 },
    },
    {
      id: 2,
      number: '02',
      icon: EducationIcon,
      title: t('program2Title'),
      category: 'mothers',
      image: '/images/3.jpg',
      description: t('program2Description'),
      details: [
        t('program2Detail1'),
        t('program2Detail2'),
        t('program2Detail3'),
        t('program2Detail4'),
      ],
      stats: { projects: 0, people: '0', regions: 0 },
    },
    {
      id: 3,
      number: '03',
      icon: SupportIcon,
      title: t('program3Title'),
      category: 'support',
      image: '/images/4.jpg',
      description: t('program3Description'),
      details: [
        t('program3Detail1'),
        t('program3Detail2'),
        t('program3Detail3'),
        t('program3Detail4'),
      ],
      stats: { projects: 0, people: '0', regions: 0 },
    },
  ];

  const filteredPrograms = selectedCategory
    ? programs.filter(p => p.category === selectedCategory)
    : programs;

  const successStories = [
    {
      title: t('digitalEducationCenterTitle'),
      category: t('educationProgramTitle'),
      description: t('digitalEducationCenterDescription'),
      impact: t('digitalEducationCenterImpact'),
      icon: EducationIcon,
      image: '/images/2.jpg',
    },
    {
      title: t('rehabilitationProgramTitle'),
      category: t('healthcareProgramTitle'),
      description: t('rehabilitationProgramDescription'),
      impact: t('rehabilitationProgramImpact'),
      icon: HealthIcon,
      image: '/images/3.jpg',
    },
    {
      title: t('familySupportCenterTitle'),
      category: t('socialSupportProgramTitle'),
      description: t('familySupportCenterDescription'),
      impact: t('familySupportCenterImpact'),
      icon: SupportIcon,
      image: '/images/4.jpg',
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
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-black via-black to-black/70 bg-clip-text text-transparent">
                {t('heroTitle')}
              </span>
              <br />
              <span className="text-black/70">{t('heroSubtitle')}</span>
            </h1>
            <p className="text-xl lg:text-2xl text-black/60 max-w-3xl mx-auto leading-relaxed">
              {t('heroDescription')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Container for sticky filter and programs */}
      <div className="relative">
        {/* Category Filter */}
        <section className="py-8 premium-glass sticky top-20 z-40 border-b border-black/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Desktop: Show all buttons */}
            <div className="hidden lg:flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCategory === null
                    ? 'bg-black text-white'
                    : 'bg-white/80 backdrop-blur-sm border border-black/10 text-black/70 hover:border-black/20'
                }`}
              >
                {t('allDirections')}
              </button>
              {programs.map((program) => (
                <button
                  key={program.id}
                  onClick={() => setSelectedCategory(program.category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    selectedCategory === program.category
                      ? 'bg-black text-white'
                      : 'bg-white/80 backdrop-blur-sm border border-black/10 text-black/70 hover:border-black/20'
                  }`}
                >
                  {program.title}
                </button>
              ))}
            </div>

            {/* Mobile: Single button to open panel */}
            <div className="lg:hidden flex justify-center">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === null
                    ? 'bg-black text-white'
                    : 'bg-white/80 backdrop-blur-sm border border-black/10 text-black/70'
                }`}
              >
                <FilterIcon />
                <span>
                  {selectedCategory === null 
                    ? t('allDirections')
                    : programs.find(p => p.category === selectedCategory)?.title || t('allDirections')
                  }
                </span>
              </button>
            </div>
          </div>
        </section>

      {/* Mobile Filter Panel */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-500 ${
        isMobileFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMobileFilterOpen(false)}
        />
        
        {/* Panel */}
        <div
          className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isMobileFilterOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{
            willChange: 'transform',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-black">{t('allDirections')}</h2>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            >
              <XIcon />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setIsMobileFilterOpen(false);
                }}
                className={`w-full px-6 py-3 rounded-full font-medium transition-all text-left ${
                  selectedCategory === null
                    ? 'bg-black text-white'
                    : 'bg-white border border-black/10 text-black/70 hover:border-black/20'
                }`}
              >
                {t('allDirections')}
              </button>
              {programs.map((program) => (
                <button
                  key={program.id}
                  onClick={() => {
                    setSelectedCategory(program.category);
                    setIsMobileFilterOpen(false);
                  }}
                  className={`w-full px-6 py-3 rounded-full font-medium transition-all text-left ${
                    selectedCategory === program.category
                      ? 'bg-black text-white'
                      : 'bg-white border border-black/10 text-black/70 hover:border-black/20'
                  }`}
                >
                  {program.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

        {/* Programs Grid */}
        <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50/50 to-white" ref={ref2}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="space-y-24">
              {filteredPrograms.map((program, index) => {
              const IconComponent = program.icon;
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={program.id}
                  className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                    !isEven ? 'lg:grid-flow-dense' : ''
                  }`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.8, delay: index * 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
                  onMouseEnter={() => setHoveredProgram(program.id)}
                  onMouseLeave={() => setHoveredProgram(null)}
                >
                  <motion.div
                    className={`${!isEven ? 'lg:col-start-2' : ''}`}
                  >
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group">
                      <div className="absolute inset-0 bg-black/5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <Image
                        src={program.image}
                        alt={program.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute top-6 left-6 z-20">
                        <div className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-black/10">
                          <span className="text-sm font-bold text-black">{program.number}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div className={`${!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center border-2 border-black/10">
                        <IconComponent className="w-7 h-7 text-black/70" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-black/50 mb-1">{t('directionLabel')}</div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-black">{program.title}</h2>
                      </div>
                    </div>
                    
                    <p className="text-lg text-black/70 mb-6 leading-relaxed">{program.description}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-white rounded-2xl p-4 border border-black/5">
                        <div className="text-2xl font-bold text-black mb-1">{program.stats.projects}</div>
                        <div className="text-xs text-black/60">{t('projects')}</div>
                      </div>
                      <div className="bg-white rounded-2xl p-4 border border-black/5">
                        <div className="text-2xl font-bold text-black mb-1">{program.stats.people}</div>
                        <div className="text-xs text-black/60">{t('people')}</div>
                      </div>
                      <div className="bg-white rounded-2xl p-4 border border-black/5">
                        <div className="text-2xl font-bold text-black mb-1">{program.stats.regions}</div>
                        <div className="text-xs text-black/60">{t('regions')}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      {program.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckIcon className="w-3 h-3 text-black/70" />
                          </div>
                          <span className="text-black/70">{detail}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Link
                      href="/catalog"
                      className="group inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-black/90 transition-all"
                    >
                      {t('viewProjects')}
                      <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </motion.div>
              );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Success Stories */}
      <section className="py-20 lg:py-32 bg-white" ref={ref3}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {t('successStoriesTitle')} <span className="text-black/70">{t('successStoriesTitleHighlight')}</span>
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              {t('successStoriesDescription')}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {successStories.map((story, index) => {
              const IconComponent = story.icon;
              return (
                <motion.div
                  key={index}
                  className="group relative bg-white rounded-3xl overflow-hidden border border-black/5 hover:border-black/10 transition-all duration-500 flex flex-col h-full"
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  transition={{ duration: 0.8, delay: index * 0.15 + 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div className="relative aspect-video overflow-hidden flex-shrink-0">
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-4 left-4">
                      <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-black/10">
                        <span className="text-xs font-medium text-black/70">{story.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 lg:p-8 flex flex-col flex-grow">
                    <div className="w-10 h-10 mb-4 text-black/40">
                      <IconComponent />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-black">{story.title}</h3>
                    <p className="text-black/70 mb-4 leading-relaxed flex-grow">{story.description}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-black/60 mt-auto">
                      <span>{t('result')}:</span>
                      <span className="text-black font-bold">{story.impact}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selection Process */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50/50" ref={ref6}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView6 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {t('selectionProcessTitle')} <span className="text-black/70">{t('selectionProcessTitleHighlight')}</span> {t('selectionProcessSubtitle')}
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              {t('selectionProcessDescription')}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                number: '1',
                title: t('step1Title'),
                text: t('step1Text'),
              },
              {
                number: '2',
                title: t('step2Title'),
                text: t('step2Text'),
              },
              {
                number: '3',
                title: t('step3Title'),
                text: t('step3Text'),
              },
              {
                number: '4',
                title: t('step4Title'),
                text: t('step4Text'),
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-3xl p-6 lg:p-8 border border-black/5 hover:border-black/10 transition-all duration-500"
                initial={{ opacity: 0, y: 40 }}
                animate={isInView6 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.8, delay: index * 0.1 + 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-4 text-2xl font-bold text-black">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3 text-black">{step.title}</h3>
                <p className="text-black/70 leading-relaxed">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-white" ref={ref4}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
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
                href="/catalog"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-black/90 transition-all"
              >
                {t('submitApplication')}
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/profile?tab=subscriptions"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-black/10 text-black rounded-full font-medium hover:border-black/20 transition-all"
              >
                {t('mySubscriptions')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
