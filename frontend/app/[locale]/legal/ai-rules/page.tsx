'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { DocumentIcon, CheckIcon, ArrowRightIcon } from '../../components/Icons';
import { Link } from '@/src/routing';
import { useTranslations } from 'next-intl';

export default function AIRulesPage() {
  const t = useTranslations('aiRulesPage');
  const ref = useRef(null);
  const heroRef = useRef(null);
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isInView = useInView(ref, viewOptions);
  const isHeroInView = useInView(heroRef, viewOptions);

  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const sections = [
    {
      title: t('section1Title'),
      content: [
        t('section1Content1'),
      ],
    },
    {
      title: t('section2Title'),
      content: [
        t('section2Content1'),
        t('section2Content2'),
        t('section2Content3'),
        t('section2Content4'),
        t('section2Content5'),
        t('section2Content6'),
      ],
    },
    {
      title: t('section3Title'),
      content: [
        t('section3Content1'),
        t('section3Content2'),
        t('section3Content3'),
      ],
    },
    {
      title: t('section4Title'),
      content: [
        t('section4Content1'),
        t('section4Content2'),
        t('section4Content3'),
      ],
    },
    {
      title: t('section5Title'),
      content: [
        t('section5Content1'),
        t('section5Content2'),
        t('section5Content3'),
        t('section5Content4'),
        t('section5Content5'),
      ],
    },
    {
      title: t('section6Title'),
      content: [
        t('section6Content1'),
      ],
    },
    {
      title: t('section7Title'),
      content: [
        t('section7Content1'),
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-28 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
        
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
              <span className="text-black/70">{t('heroTitleHighlight')}</span>
            </h1>
            <p className="text-xl lg:text-2xl text-black/60 max-w-3xl mx-auto leading-relaxed">
              {t('heroDescription')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50/50" ref={ref}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            className="bg-white rounded-3xl p-8 lg:p-12 border-2 border-black/5 shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center">
                <DocumentIcon className="w-7 h-7 text-black/70" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">{t('artificialIntelligence')}</h2>
                <p className="text-black/60">{t('lastUpdated')} {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-4">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="border-2 border-black/5 rounded-2xl overflow-hidden transition-all hover:border-black/10"
                >
                  <button
                    onClick={() => toggleSection(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <h3 className="text-lg font-bold text-black">{section.title}</h3>
                    <motion.div
                      animate={{ rotate: expandedSections.has(index) ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowRightIcon className="w-5 h-5 text-black/40" />
                    </motion.div>
                  </button>
                  {expandedSections.has(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 py-4 space-y-3"
                    >
                      {section.content.map((paragraph, pIndex) => (
                        <div key={pIndex} className="flex items-start gap-3">
                          <CheckIcon className="w-5 h-5 text-black/70 flex-shrink-0 mt-0.5" />
                          <p className="text-black/70 leading-relaxed">
                            {paragraph.includes('Privacy Policy') ? (
                              <>
                                {paragraph.split('Privacy Policy')[0]}
                                <Link href="/legal/privacy-policy" className="text-black underline font-medium">
                                  {t('section4Content4')}
                                </Link>
                                {paragraph.split('Privacy Policy')[1]}
                              </>
                            ) : (
                              paragraph
                            )}
                          </p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-black/5">
              <p className="text-sm text-black/50">
                {t('dateLastUpdated')} {new Date().toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
