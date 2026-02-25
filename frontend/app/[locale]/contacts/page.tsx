'use client';

import { useTranslations } from 'next-intl';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { MailIcon, PhoneIcon, MapPinIcon, UsersIcon, MessageIcon, ClockIcon, ArrowRightIcon } from '../components/Icons';
import CustomNotification from '../components/CustomNotification';

export default function ContactsPage() {
  const t = useTranslations('contactsPage');
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const heroRef = useRef(null);
  
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isInView1 = useInView(ref1, viewOptions);
  const isInView2 = useInView(ref2, viewOptions);
  const isInView3 = useInView(ref3, viewOptions);
  const isHeroInView = useInView(heroRef, viewOptions);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    // Здесь будет логика отправки формы
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({ name: '', email: '', message: '' });
      setNotification({
        isOpen: true,
        type: 'success',
        title: t('messageSentTitle'),
        message: t('messageSentMessage'),
      });
    }, 1000);
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

      {/* Contact Info Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50/50" ref={ref1}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {t('ourContactsTitle')} <span className="text-black/70"></span>
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              {t('ourContactsDescription')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: MailIcon,
                title: t('emailTitle'),
                items: [
                  { label: t('generalQuestions'), value: t('emailGeneralValue'), link: `mailto:${t('emailGeneralValue')}` },
                  { label: t('partnership'), value: t('emailPartnershipValue'), link: `mailto:${t('emailPartnershipValue')}` },
                ],
                description: t('emailDescription'),
              },
              {
                icon: PhoneIcon,
                title: t('phoneTitle'),
                items: t('phoneValue') ? [
                  { label: t('hotline'), value: t('phoneValue'), link: `tel:${t('phoneValue').replace(/\s/g, '')}` },
                ] : [],
                description: t('phoneDescription'),
                time: t('phoneValue') ? t('workingHours') : undefined,
              },
              {
                icon: MapPinIcon,
                title: t('addressTitle'),
                items: [
                  { label: t('office'), value: t('addressValue'), link: '#' },
                ],
                description: t('addressDescription'),
              },
              {
                icon: UsersIcon,
                title: t('socialNetworksTitle'),
                items: [
                  { label: t('socialTelegram'), value: t('socialTelegramValue'), link: t('socialTelegramValue') ? `https://t.me/${t('socialTelegramValue').replace('@', '')}` : '#' },
                  { label: t('socialWhatsApp'), value: t('socialWhatsAppValue'), link: t('socialWhatsAppValue') ? `https://wa.me/${t('socialWhatsAppValue').replace(/[\s()\-]/g, '')}` : '#' },
                ],
                description: t('socialNetworksDescription'),
              },
            ].map((contact, index) => {
              const IconComponent = contact.icon;
              return (
                <motion.div
                  key={index}
                  className="group bg-white rounded-3xl p-6 lg:p-8 border-2 border-black/5 hover:border-black/10 transition-all duration-500"
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center mb-4 group-hover:bg-black/10 group-hover:scale-110 transition-all">
                    <IconComponent className="w-7 h-7 text-black/70" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-black">{contact.title}</h3>
                  {contact.items.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {contact.items.map((item, idx) => (
                        <div key={idx}>
                          <div className="text-xs font-medium text-black/50 mb-1">{item.label}</div>
                          <a
                            href={item.link}
                            className="text-black font-medium hover:text-black/70 transition-colors block"
                          >
                            {item.value}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  {contact.time && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-black/60">
                      <ClockIcon className="w-4 h-4" />
                      <span>{contact.time}</span>
                    </div>
                  )}
                  <p className="text-sm text-black/60 leading-relaxed">{contact.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 lg:py-32 bg-white" ref={ref3}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {t('feedbackFormTitle')} <span className="text-black/70"></span>
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              {t('feedbackFormDescription')}
            </p>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-3xl p-8 lg:p-10 border-2 border-black/5 shadow-xl"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black/70 mb-2">{t('yourName')}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-black/5 bg-gray-50 text-black placeholder-black/40 font-medium focus:outline-none focus:border-black/20 transition-colors"
                  placeholder={t('enterYourName')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black/70 mb-2">{t('email')}</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-black/5 bg-gray-50 text-black placeholder-black/40 font-medium focus:outline-none focus:border-black/20 transition-colors"
                  placeholder={t('yourEmailPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black/70 mb-2">{t('message')}</label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-black/5 bg-gray-50 text-black placeholder-black/40 font-medium focus:outline-none focus:border-black/20 transition-colors resize-none"
                  placeholder={t('writeYourMessage')}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-black text-white rounded-2xl font-medium hover:bg-black/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t('sending')}</span>
                  </>
                ) : (
                  <>
                    <MessageIcon className="w-5 h-5" />
                    <span>{t('sendMessage')}</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Map Section Placeholder */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50/50" ref={ref2}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="bg-white rounded-3xl p-8 lg:p-12 border-2 border-black/5 shadow-xl"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center">
                <MapPinIcon className="w-6 h-6 text-black/70" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-black">{t('ourOffice')}</h3>
                <p className="text-black/60">{t('addressValue')}</p>
              </div>
            </div>
            <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border-2 border-black/5">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=39.723062%2C43.585525&z=12&pt=39.723062%2C43.585525&l=map"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                style={{ position: 'relative' }}
                title={t('ourOffice')}
              ></iframe>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      <CustomNotification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </main>
  );
}
