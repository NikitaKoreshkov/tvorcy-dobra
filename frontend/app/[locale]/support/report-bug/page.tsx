'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CustomSelect from '../../components/CustomSelect';
import CustomNotification from '../../components/CustomNotification';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { Link } from '@/src/routing';
import { ArrowRightIcon } from '../../components/Icons';
import { useTranslations } from 'next-intl';

export default function ReportBugPage() {
  const t = useTranslations('reportBugPage');
  const heroRef = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isHeroInView = useInView(heroRef, viewOptions);
  const isInView1 = useInView(ref1, viewOptions);
  const isInView2 = useInView(ref2, viewOptions);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    description: '',
    steps: '',
    browser: '',
    device: '',
    priority: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ 
        name: '', 
        email: '', 
        subject: '', 
        description: '', 
        steps: '',
        browser: '',
        device: '',
        priority: 'medium',
      });
      setNotification({
        isOpen: true,
        type: 'success',
        title: t('messageSent'),
        message: t('thankYouMessage'),
      });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
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

      {/* Form Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50/50" ref={ref1}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-black">
              {t('reportProblem')}
            </h2>
            <p className="text-xl text-black/60 leading-relaxed">
              {t('reportDescription')}
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl p-6 lg:p-8 border-2 border-black/5 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h3 className="text-lg font-bold text-black mb-4">{t('helpfulTips')}</h3>
            <ul className="space-y-2 text-black/70 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 flex-shrink-0"></span>
                <span>{t('tip1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 flex-shrink-0"></span>
                <span>{t('tip2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 flex-shrink-0"></span>
                <span>{t('tip3')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 flex-shrink-0"></span>
                <span>{t('tip4')}</span>
              </li>
            </ul>
          </motion.div>

          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-black rounded-3xl p-8 lg:p-12 text-white text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <span className="text-4xl">✓</span>
                </motion.div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                  {t('thankYouTitle')}
                </h3>
                <p className="text-xl text-white/70 mb-8 leading-relaxed">
                  {t('thankYouText')}
                </p>
                <p className="text-white/70 leading-relaxed mb-8">
                  {t('responseTime')}
                </p>
                <motion.button
                  onClick={() => setIsSubmitted(false)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('sendAnother')}
                  <ArrowRightIcon className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl p-8 lg:p-10 border-2 border-black/5"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
              >
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-black/70 mb-2">
                      {t('yourName')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-black/5 bg-gray-50 text-black placeholder-black/40 font-medium focus:outline-none focus:border-black/20 transition-colors"
                      placeholder={t('enterYourName')}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-black/70 mb-2">
                      {t('email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-black/5 bg-gray-50 text-black placeholder-black/40 font-medium focus:outline-none focus:border-black/20 transition-colors"
                      placeholder={t('emailPlaceholder')}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="subject" className="block text-sm font-medium text-black/70 mb-2">
                    {t('problemSubject')} *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={t('subjectPlaceholder')}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-black/5 bg-gray-50 text-black placeholder-black/40 font-medium focus:outline-none focus:border-black/20 transition-colors"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <CustomSelect
                    id="browser"
                    name="browser"
                    label={t('browser')}
                    value={formData.browser}
                    onChange={(value) => handleSelectChange('browser', value)}
                    placeholder={t('browserPlaceholder')}
                    options={[
                      { value: 'chrome', label: 'Google Chrome' },
                      { value: 'firefox', label: 'Mozilla Firefox' },
                      { value: 'safari', label: 'Safari' },
                      { value: 'edge', label: 'Microsoft Edge' },
                      { value: 'opera', label: 'Opera' },
                      { value: 'other', label: 'Другой' },
                    ]}
                  />

                  <CustomSelect
                    id="device"
                    name="device"
                    label={t('device')}
                    value={formData.device}
                    onChange={(value) => handleSelectChange('device', value)}
                    placeholder={t('devicePlaceholder')}
                    options={[
                      { value: 'desktop', label: 'Компьютер (Windows)' },
                      { value: 'mac', label: 'Компьютер (Mac)' },
                      { value: 'mobile-android', label: 'Мобильный (Android)' },
                      { value: 'mobile-ios', label: 'Мобильный (iOS)' },
                      { value: 'tablet', label: 'Планшет' },
                      { value: 'other', label: 'Другое' },
                    ]}
                  />
                </div>

                <div className="mb-6">
                  <CustomSelect
                    id="priority"
                    name="priority"
                    label={t('priority')}
                    value={formData.priority}
                    onChange={(value) => handleSelectChange('priority', value)}
                    options={[
                      { value: 'low', label: t('priorityLow') },
                      { value: 'medium', label: t('priorityMedium') },
                      { value: 'high', label: t('priorityHigh') },
                    ]}
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="description" className="block text-sm font-medium text-black/70 mb-2">
                    {t('detailedDescription')} *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={6}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={t('descriptionPlaceholder')}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-black/5 bg-gray-50 text-black placeholder-black/40 font-medium focus:outline-none focus:border-black/20 transition-colors resize-none"
                  />
                </div>

                <div className="mb-8">
                  <label htmlFor="steps" className="block text-sm font-medium text-black/70 mb-2">
                    {t('stepsToReproduce')}
                  </label>
                  <textarea
                    id="steps"
                    name="steps"
                    rows={5}
                    value={formData.steps}
                    onChange={handleChange}
                    placeholder={t('stepsPlaceholder')}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-black/5 bg-gray-50 text-black placeholder-black/40 font-medium focus:outline-none focus:border-black/20 transition-colors resize-none"
                  />
                  <p className="text-sm text-black/50 mt-2">
                    {t('stepsDescription')}
                  </p>
                </div>

                <div className="mb-8 p-4 rounded-2xl bg-gray-50 border-2 border-black/5">
                  <p className="text-sm text-black/70 leading-relaxed">
                    <strong className="text-black">{t('note')}</strong> {t('noteText')} <a href="mailto:info@творцыдобра.рф" className="text-black underline font-medium">info@творцыдобра.рф</a> {t('withSubject')}
                  </p>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 bg-black text-white rounded-2xl font-medium hover:bg-black/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t('submitting')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('sendMessage')}</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 lg:py-32 bg-white" ref={ref2}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            className="bg-black rounded-3xl p-8 lg:p-12 text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 tracking-tight">
              {t('otherWays')}
            </h2>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              {t('otherWaysText')}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2">{t('email')}</h3>
                <a href="mailto:info@творцыдобра.рф" className="text-white/70 hover:text-white transition-colors underline">
                  info@творцыдобра.рф
                </a>
                <p className="text-white/60 text-sm mt-2">{t('response24h')}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">{t('phone')}</h3>
                <span className="text-white/70">
                  {t('phoneValue') || t('phoneDescription')}
                </span>
                <p className="text-white/60 text-sm mt-2">{t('hours')}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">{t('helpCenter')}</h3>
                <Link href="/support/help-center" className="text-white/70 hover:text-white transition-colors underline">
                  {t('faq')}
                </Link>
                <p className="text-white/60 text-sm mt-2">{t('answerExists')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <CustomNotification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
      <Footer />
    </main>
  );
}
