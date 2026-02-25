'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { Link } from '@/src/routing';
import { ArrowRightIcon } from '../../components/Icons';
import { useTranslations } from 'next-intl';

export default function HelpCenterPage() {
  const t = useTranslations('helpCenterPage');
  const heroRef = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isHeroInView = useInView(heroRef, viewOptions);
  const isInView1 = useInView(ref1, viewOptions);
  const isInView2 = useInView(ref2, viewOptions);

  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const faqCategories = [
    {
      title: t('category1Title'),
      questions: [
        {
          q: t('category1Q1'),
          a: t('category1A1'),
        },
        {
          q: t('category1Q2'),
          a: t('category1A2'),
        },
        {
          q: t('category1Q3'),
          a: t('category1A3'),
        },
        {
          q: t('category1Q4'),
          a: t('category1A4'),
        },
      ],
    },
    {
      title: t('category2Title'),
      questions: [
        {
          q: t('category2Q1'),
          a: t('category2A1'),
        },
        {
          q: t('category2Q2'),
          a: t('category2A2'),
        },
        {
          q: t('category2Q3'),
          a: t('category2A3'),
        },
        {
          q: t('category2Q4'),
          a: t('category2A4'),
        },
        {
          q: t('category2Q5'),
          a: t('category2A5'),
        },
        {
          q: t('category2Q6'),
          a: t('category2A6'),
        },
        {
          q: t('category2Q7'),
          a: t('category2A7'),
        },
        {
          q: t('category2Q8'),
          a: t('category2A8'),
        },
        {
          q: t('category2Q9'),
          a: t('category2A9'),
        },
      ],
    },
    {
      title: t('category3Title'),
      questions: [
        {
          q: t('category3Q1'),
          a: t('category3A1'),
        },
        {
          q: t('category3Q2'),
          a: t('category3A2'),
        },
        {
          q: t('category3Q3'),
          a: t('category3A3'),
        },
        {
          q: t('category3Q4'),
          a: t('category3A4'),
        },
        {
          q: t('category3Q5'),
          a: t('category3A5'),
        },
      ],
    },
    {
      title: t('category4Title'),
      questions: [
        {
          q: t('category4Q1'),
          a: t('category4A1'),
        },
        {
          q: t('category4Q2'),
          a: t('category4A2'),
        },
        {
          q: t('category4Q3'),
          a: t('category4A3'),
        },
        {
          q: t('category4Q4'),
          a: t('category4A4'),
        },
        {
          q: t('category4Q5'),
          a: t('category4A5'),
        },
      ],
    },
    {
      title: t('category5Title'),
      questions: [
        {
          q: t('category5Q1'),
          a: t('category5A1'),
        },
        {
          q: t('category5Q2'),
          a: t('category5A2'),
        },
        {
          q: t('category5Q3'),
          a: t('category5A3'),
        },
        {
          q: t('category5Q4'),
          a: t('category5A4'),
        },
        {
          q: t('category5Q5'),
          a: t('category5A5'),
        },
        {
          q: t('category5Q6'),
          a: t('category5A6'),
        },
      ],
    },
    {
      title: t('category6Title'),
      questions: [
        {
          q: t('category6Q1'),
          a: t('category6A1'),
        },
        {
          q: t('category6Q2'),
          a: t('category6A2'),
        },
        {
          q: t('category6Q3'),
          a: t('category6A3'),
        },
        {
          q: t('category6Q4'),
          a: t('category6A4'),
        },
        {
          q: t('category6Q5'),
          a: t('category6A5'),
        },
      ],
    },
    {
      title: t('category7Title'),
      questions: [
        {
          q: t('category7Q1'),
          a: t('category7A1'),
        },
        {
          q: t('category7Q2'),
          a: t('category7A2'),
        },
        {
          q: t('category7Q3'),
          a: t('category7A3'),
        },
        {
          q: t('category7Q4'),
          a: t('category7A4'),
        },
        {
          q: t('category7Q5'),
          a: t('category7A5'),
        },
      ],
    },
    {
      title: t('category8Title'),
      questions: [
        {
          q: t('category8Q1'),
          a: t('category8A1'),
        },
        {
          q: t('category8Q2'),
          a: t('category8A2'),
        },
        {
          q: t('category8Q3'),
          a: t('category8A3'),
        },
        {
          q: t('category8Q4'),
          a: t('category8A4'),
        },
      ],
    },
  ];

  const toggleCategory = (title: string) => {
    setOpenCategory(openCategory === title ? null : title);
  };

  const toggleQuestion = (key: string) => {
    setOpenQuestion(openQuestion === key ? null : key);
  };

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
              <span className="text-black/70">{t('heroTitleHighlight')}</span>
            </h1>
            <p className="text-xl lg:text-2xl text-black/60 max-w-3xl mx-auto leading-relaxed">
              {t('heroDescription')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50/50" ref={ref1}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-black">
              {t('faqTitle')}
            </h2>
            <p className="text-xl text-black/60 leading-relaxed">
              {t('faqDescription')}
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                className="bg-white rounded-3xl border-2 border-black/5 overflow-hidden group"
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={isInView1 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
                transition={{ 
                  duration: 0.6, 
                  delay: categoryIndex * 0.08, 
                  ease: [0.6, -0.05, 0.01, 0.99] 
                }}
                whileHover={{ y: -4, borderColor: 'rgba(0, 0, 0, 0.1)' }}
              >
                <motion.button
                  onClick={() => toggleCategory(category.title)}
                  className="w-full px-6 lg:px-8 py-6 flex items-center justify-between text-left hover:bg-black/5 transition-colors"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className="text-xl lg:text-2xl font-bold text-black">{category.title}</h3>
                  <motion.div
                    animate={{ rotate: openCategory === category.title ? 90 : 0 }}
                    transition={{ duration: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
                  >
                    <ArrowRightIcon className="w-5 h-5 text-black/40" />
                  </motion.div>
                </motion.button>
                
                <AnimatePresence>
                  {openCategory === category.title && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 lg:px-8 pb-6 space-y-4">
                        {category.questions.map((item, questionIndex) => {
                          const questionKey = `${category.title}-${questionIndex}`;
                          return (
                            <motion.div
                              key={questionIndex}
                              className="border-t border-black/5 pt-4"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ 
                                duration: 0.4, 
                                delay: questionIndex * 0.05,
                                ease: [0.6, -0.05, 0.01, 0.99]
                              }}
                            >
                              <motion.button
                                onClick={() => toggleQuestion(questionKey)}
                                className="w-full flex items-start justify-between gap-4 text-left group/question"
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <h4 className="text-lg font-semibold text-black flex-1 group-hover/question:text-black/80 transition-colors">
                                  {item.q}
                                </h4>
                                <motion.div
                                  animate={{ rotate: openQuestion === questionKey ? 90 : 0 }}
                                  transition={{ duration: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
                                >
                                  <ArrowRightIcon className="w-4 h-4 text-black/40 mt-1 flex-shrink-0" />
                                </motion.div>
                              </motion.button>
                              <AnimatePresence>
                                {openQuestion === questionKey && (
                                  <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
                                    className="mt-3 text-black/70 leading-relaxed overflow-hidden"
                                  >
                                    {item.a}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-20 lg:py-32 bg-white" ref={ref2}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            className="bg-black rounded-3xl p-8 lg:p-12 text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 tracking-tight">
              {t('needMoreHelp')}
            </h2>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              {t('needMoreHelpText')}
            </p>
            <div className="space-y-4 mb-8">
              <div>
                <span className="text-white/60">{t('emailLabel')} </span>
                <a 
                  href="mailto:info@творцыдобра.рф" 
                  className="text-white font-medium hover:text-white/80 transition-colors underline"
                >
                  info@творцыдобра.рф
                </a>
              </div>
              <div>
                <span className="text-white/60">{t('phoneLabel')} </span>
                <span className="text-white font-medium">
                  {t('phoneValue') || t('phoneDescription')}
                </span>
              </div>
              <div>
                <span className="text-white/60">{t('hoursLabel')} </span>
                <span className="text-white">{t('hours24')}</span>
              </div>
            </div>
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-xl font-bold mb-4">{t('usefulLinks')}</h3>
              <div className="flex flex-wrap gap-4">
                <Link href="/support/release-notes" className="text-white/70 hover:text-white transition-colors underline">
                  {t('releaseNotes')}
                </Link>
                <Link href="/support/report-bug" className="text-white/70 hover:text-white transition-colors underline">
                  {t('reportBug')}
                </Link>
                <Link href="/legal/user-agreement" className="text-white/70 hover:text-white transition-colors underline">
                  {t('userAgreement')}
                </Link>
                <Link href="/legal/privacy-policy" className="text-white/70 hover:text-white transition-colors underline">
                  {t('privacyPolicy')}
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
