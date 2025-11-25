'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Link, useRouter } from '@/src/routing';
import { CreditCardIcon, RepeatIcon, BuildingIcon, UsersIcon, HeartIcon, CheckIcon, DocumentIcon, ChartIcon, StarIcon, HandshakeIcon, ArrowRightIcon } from '../components/Icons';
import CustomNotification from '../components/CustomNotification';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl } from '@/src/config';
import { useTranslations } from 'next-intl';

export default function SupportPage() {
  const t = useTranslations('supportPage');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { isAuthenticated, refreshAuth } = useAuth();
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

  // Payment cards interface
  interface PaymentCard {
    id: string;
    cardType: string;
    last4: string;
    cardholderName: string | null;
    expiryMonth: string;
    expiryYear: string;
    isDefault: boolean;
    brand: string;
    createdAt: string;
  }

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Project selection state
  const [selectedProject, setSelectedProject] = useState<{id: string, name: string} | null>(null);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [projects, setProjects] = useState<Array<{id: string, name: string}>>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  
  // Payment cards state
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  // Загрузка проектов
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch(getApiUrl('/projects'));
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.projects) {
          // Преобразуем проекты в нужный формат
          const formattedProjects = data.projects.map((project: any) => ({
            id: project.id,
            name: project.title || project.name || project.translations?.[0]?.name || `Проект #${project.id}`
          }));
          setProjects(formattedProjects);
        } else if (Array.isArray(data)) {
          // Если API возвращает массив напрямую
          const formattedProjects = data.map((project: any) => ({
            id: project.id,
            name: project.title || project.name || project.translations?.[0]?.name || `Проект #${project.id}`
          }));
          setProjects(formattedProjects);
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Загрузка карт пользователя
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      loadPaymentCards();
    }
  }, [isAuthenticated]);

  const loadPaymentCards = async () => {
    if (typeof window === 'undefined') return;
    setIsLoadingCards(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        setIsLoadingCards(false);
        return;
      }

      const response = await fetch(getApiUrl('/payments/cards'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch payment cards:', response.status);
        setIsLoadingCards(false);
        return;
      }

      const data = await response.json();
      if (data.success && data.cards) {
        setPaymentCards(data.cards);
        // Выбираем карту по умолчанию, если есть
        const defaultCard = data.cards.find((card: PaymentCard) => card.isDefault);
        if (defaultCard) {
          setSelectedCard(defaultCard);
        } else if (data.cards.length > 0) {
          setSelectedCard(data.cards[0]);
        }
      }
    } catch (error) {
      console.error('Error loading payment cards:', error);
    } finally {
      setIsLoadingCards(false);
    }
  };
  
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

  const handleDonate = async () => {
    const amount = selectedAmount || (customAmount ? parseInt(customAmount) : null);
    if (!amount || amount <= 0) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: t('error'),
        message: t('pleaseEnterAmount'),
      });
      return;
    }

    if (!isAuthenticated) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: t('authRequired'),
        message: t('authRequiredForDonation'),
      });
      router.push('/login');
      return;
    }

    // Проверяем наличие карт
    if (paymentCards.length === 0) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: t('error'),
        message: t('addPaymentCardDesc') || 'Пожалуйста, добавьте карту для оплаты',
      });
      setTimeout(() => {
        router.push('/profile?tab=payments');
      }, 2000);
      return;
    }

    if (!selectedCard) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: t('error'),
        message: t('addPaymentCardDesc') || 'Пожалуйста, выберите карту для оплаты',
      });
      return;
    }

    if (isRecurring) {
      // Перенаправляем на страницу подписок для создания регулярного пожертвования
      router.push('/profile/subscriptions?create=true');
      return;
    }

    // Обработка разового пожертвования
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        throw new Error(t('authorizationTokenNotFound'));
      }

      const response = await fetch(getApiUrl('/transactions'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'RUB',
          projectName: t('generalFund'),
          description: t('oneTimeDonation'),
          paymentMethodId: selectedCard.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('donationCreationError') }));
        throw new Error(errorData.message || t('donationCreationError'));
      }

      const data = await response.json();
      
      // Обновляем профиль пользователя для обновления баланса и достижений
      await refreshAuth();

      // Показываем уведомление об успехе
      setNotification({
        isOpen: true,
        type: 'success',
        title: t('thankYou'),
        message: t('donationSuccess', { amount: amount.toLocaleString() }),
      });

      // Очищаем форму
      setSelectedAmount(null);
      setCustomAmount('');
    } catch (error) {
      console.error('Error creating donation:', error);
      
      // Определяем более понятное сообщение об ошибке
      let errorMessage = t('donationCreationError');
      let errorTitle = t('error');
      
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('insufficient funds') || message.includes('недостаточно средств')) {
          errorTitle = t('insufficientFundsTitle') || 'Недостаточно средств';
          errorMessage = t('insufficientFundsMessage') || 'На выбранной карте недостаточно средств для совершения платежа';
        } else if (message.includes('card') || message.includes('карт')) {
          errorTitle = t('cardErrorTitle') || 'Ошибка карты';
          errorMessage = t('cardErrorMessage') || 'Проблема с выбранной картой. Попробуйте другую карту или обратитесь в банк';
        } else if (message.includes('network') || message.includes('сет')) {
          errorTitle = t('networkErrorTitle') || 'Ошибка сети';
          errorMessage = t('networkErrorMessage') || 'Проверьте подключение к интернету и попробуйте снова';
        } else if (message.includes('authorization') || message.includes('авторизаци')) {
          errorTitle = t('authErrorTitle') || 'Ошибка авторизации';
          errorMessage = t('authErrorMessage') || 'Пожалуйста, войдите в систему снова';
          setTimeout(() => router.push('/login'), 2000);
        } else {
          errorMessage = error.message;
        }
      }
      
      setNotification({
        isOpen: true,
        type: 'error',
        title: errorTitle,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
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
              <span className="text-black/70">{t('heroTitleHighlight')}</span>
            </h1>
            <p className="text-xl lg:text-2xl text-black/60 max-w-3xl mx-auto leading-relaxed">
              {t('heroDescription')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50/50" ref={ref2}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {t('howToHelp')}
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                number: t('option1Number'),
                icon: CreditCardIcon,
                title: t('option1Title'),
                image: '/images/31.jpg',
                description: t('option1Description'),
                link: '#donate',
              },
              {
                number: t('option2Number'),
                icon: RepeatIcon,
                title: t('option2Title'),
                image: '/images/32.jpg',
                description: t('option2Description'),
                link: '/profile/subscriptions?tab=create',
              },
              {
                number: t('option3Number'),
                icon: BuildingIcon,
                title: t('option3Title'),
                image: '/images/33.jpg',
                description: t('option3Description'),
                link: '/corporate',
              },
              {
                number: t('option4Number'),
                icon: UsersIcon,
                title: t('option4Title'),
                image: '/images/34.jpg',
                description: t('option4Description'),
                link: '/contacts',
              },
            ].map((option, index) => {
              const IconComponent = option.icon;
              return (
                <motion.div
                  key={index}
                  className="group relative bg-white rounded-3xl overflow-hidden border-2 border-black/5 hover:border-black/10 transition-all duration-500 flex flex-col h-full"
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: [0.6, -0.05, 0.01, 0.99] }}
                  whileHover={{ y: -8, scale: 1.01 }}
                >
                  <div className="relative aspect-video overflow-hidden flex-shrink-0">
                    <Image
                      src={option.image}
                      alt={option.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                    <div className="absolute top-4 left-4">
                      <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-black/10">
                        <span className="text-xs font-bold text-black">{option.number}</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="p-6 lg:p-8 flex flex-col flex-grow">
                    <div className="w-12 h-12 mb-4 text-black/40">
                      <IconComponent />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-black">{option.title}</h3>
                    <p className="text-black/70 mb-4 leading-relaxed flex-grow">{option.description}</p>
                    <Link
                      href={option.link}
                      className="group/link inline-flex items-center gap-2 text-black font-medium hover:text-black/70 transition-colors mt-auto"
                    >
                      <span>{t('learnMore')}</span>
                      <ArrowRightIcon className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Donation Form Section */}
      <section id="donate" className="py-20 lg:py-32 bg-white" ref={ref3}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {t('makeDonation')}
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              {t('makeDonationDescription')}
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl p-8 lg:p-10 border-2 border-black/5 shadow-xl"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            {/* Project Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-black/70 mb-3">
                {t('selectProjectLabel')}
              </label>
              <div>
                <button
                  type="button"
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-black/5 bg-gray-50 text-black hover:border-black/20 transition-all font-medium text-left flex items-center justify-between"
                >
                  <span className={selectedProject ? 'text-black' : 'text-black/40'}>
                    {selectedProject ? selectedProject.name : t('selectProjectPlaceholder')}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      transform: isProjectDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      color: '#666',
                    }}
                  >
                    <path d="M4 6L8 10L12 6" />
                  </svg>
                </button>
                <AnimatePresence>
                  {isProjectDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: 'hidden' }}
                      className="mt-2"
                    >
                      <div className="bg-white border-2 border-black/5 rounded-2xl shadow-lg">
                        <div className="max-h-[300px] overflow-y-auto p-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProject(null);
                              setIsProjectDropdownOpen(false);
                            }}
                            className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors text-black/60 font-medium rounded-xl"
                          >
                            {t('noProjectSelected')}
                          </button>
                          {isLoadingProjects ? (
                            <div className="px-6 py-4 text-center text-black/40">
                              {t('loading')}
                            </div>
                          ) : (
                            projects.map((project) => (
                              <button
                                key={project.id}
                                type="button"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setIsProjectDropdownOpen(false);
                                }}
                                className={`w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors font-medium rounded-xl ${
                                  selectedProject?.id === project.id ? 'bg-gray-100 text-black' : 'text-black/70'
                                }`}
                              >
                                {project.name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[500, 1000, 2500, 5000].map((amount) => (
                <button
                  key={amount}
                  className={`px-6 py-4 rounded-2xl font-medium transition-all ${
                    selectedAmount === amount
                      ? 'bg-black text-white'
                      : 'bg-gray-50 border-2 border-black/5 text-black hover:border-black/20'
                  }`}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                >
                  {amount.toLocaleString('ru-RU')} ₽
                </button>
              ))}
            </div>
            <input
              type="number"
              className="w-full px-6 py-4 rounded-2xl border-2 border-black/5 bg-gray-50 text-black placeholder-black/40 font-medium mb-6 focus:outline-none focus:border-black/20 transition-colors"
              placeholder={t('orEnterAmount')}
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
            />
            {/* Payment Card Selection */}
            {isAuthenticated && (
              <div className="mb-8 support-payment-cards-wrapper">
                <label className="block text-sm font-semibold text-black/70 mb-3 support-payment-method-label">
                  {t('paymentMethod') || 'Способ оплаты'}
                </label>
                
                {isLoadingCards ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                  </div>
                ) : paymentCards.length === 0 ? (
                  <motion.div
                    className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6 support-add-card-message"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 support-add-card-icon">
                        <div className="w-6 h-6 text-orange-600">
                          <CreditCardIcon />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-orange-900 mb-2 support-add-card-title">
                          {t('addPaymentCard') || 'Добавить карту'}
                        </h3>
                        <p className="text-orange-700 mb-4 text-sm leading-relaxed support-add-card-description">
                          {t('addPaymentCardDesc') || 'Для совершения пожертвования необходимо добавить карту'}
                        </p>
                        <button
                          onClick={() => router.push('/profile?tab=payments')}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-colors duration-200 support-add-card-button"
                        >
                          <div className="w-5 h-5">
                            <CreditCardIcon />
                          </div>
                          <span>{t('addCard') || 'Добавить карту'}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-3 support-payment-cards-list">
                    {paymentCards.map((card) => (
                      <motion.button
                        key={card.id}
                        className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left support-payment-card ${
                          selectedCard?.id === card.id
                            ? 'border-black bg-black text-white shadow-lg support-payment-card-selected'
                            : 'border-black/10 bg-white hover:border-black/20 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedCard(card)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-4 support-payment-card-content">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 support-payment-card-icon ${
                            selectedCard?.id === card.id
                              ? 'bg-white/20'
                              : 'bg-black/5'
                          }`}>
                            <div className={`w-6 h-6 ${
                              selectedCard?.id === card.id ? 'text-white' : 'text-black/70'
                            }`}>
                              <CreditCardIcon />
                            </div>
                          </div>
                          <div className="flex-1 support-payment-card-info min-w-0">
                            <div className="flex items-center gap-3 mb-1 support-payment-card-header">
                              <span className="font-bold text-lg support-payment-card-brand truncate">
                                {card.brand} •••• {card.last4}
                              </span>
                              {card.isDefault && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold support-payment-card-default whitespace-nowrap flex-shrink-0 ${
                                  selectedCard?.id === card.id
                                    ? 'bg-white/20 text-white'
                                    : 'bg-black/10 text-black/70'
                                }`}>
                                  {t('defaultCard') || 'По умолчанию'}
                                </span>
                              )}
                            </div>
                            <div className={`text-sm support-payment-card-details ${
                              selectedCard?.id === card.id ? 'text-white/70' : 'text-black/50'
                            }`}>
                              {card.cardholderName || t('noName') || 'Без имени'} • {t('expires') || 'Истекает'} {card.expiryMonth}/{card.expiryYear}
                            </div>
                          </div>
                          {selectedCard?.id === card.id && (
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 support-payment-card-check">
                              <CheckIcon className="w-4 h-4 text-black" />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                    
                    <button
                      onClick={() => router.push('/profile?tab=payments')}
                      className="w-full p-5 rounded-2xl border-2 border-dashed border-black/20 bg-white hover:border-black/30 hover:bg-black/5 transition-all duration-200 text-black/70 font-semibold flex items-center justify-center gap-2 support-add-new-card-button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>{t('addNewCard') || 'Добавить новую карту'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mb-8 p-4 rounded-2xl bg-gray-50 border-2 border-black/5">
              <label htmlFor="recurring" className="flex items-center gap-3 cursor-pointer">
                <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                    className="absolute opacity-0 cursor-pointer w-5 h-5"
              />
                  <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    isRecurring 
                      ? 'bg-black border-black' 
                      : 'bg-white border-gray-300'
                  }`}>
                    {isRecurring && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-black/70 font-medium">
                {t('makeRecurring')}
                </span>
              </label>
            </div>
            <button
              className="w-full px-8 py-4 bg-black text-white rounded-2xl font-medium hover:bg-black/90 transition-all mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={handleDonate}
              disabled={isLoading || (isAuthenticated && paymentCards.length > 0 && !selectedCard)}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t('processing')}</span>
                </>
              ) : (
                <>
                  {isRecurring ? t('subscribeToRecurring') : t('donate')}
                </>
              )}
            </button>
            {!isAuthenticated && (
              <p className="text-center text-sm text-black/50">
                {t('authRequiredMessage')}{' '}
                <Link href="/login" className="text-black underline font-medium">
                  {t('authRequired')}
                </Link>
              </p>
            )}
            <p className="text-center text-sm text-black/50 mt-4">
              {t('paymentsProtected')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50/50" ref={ref4}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {t('whySupportUs')}
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              {t('whySupportUsDescription')}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: HeartIcon,
                title: t('benefit1Title'),
                text: t('benefit1Text'),
              },
              {
                icon: CheckIcon,
                title: t('benefit2Title'),
                text: t('benefit2Text'),
              },
              {
                icon: DocumentIcon,
                title: t('benefit3Title'),
                text: t('benefit3Text'),
              },
              {
                icon: ChartIcon,
                title: t('benefit4Title'),
                text: t('benefit4Text'),
              },
              {
                icon: StarIcon,
                title: t('benefit5Title'),
                text: t('benefit5Text'),
              },
              {
                icon: HandshakeIcon,
                title: t('benefit6Title'),
                text: t('benefit6Text'),
              },
            ].map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <motion.div
                  key={index}
                  className="group bg-white rounded-3xl p-6 lg:p-8 border border-black/5 hover:border-black/10 transition-all duration-500"
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: [0.6, -0.05, 0.01, 0.99] }}
                  whileHover={{ y: -6, scale: 1.02 }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center mb-4 group-hover:bg-black/10 group-hover:scale-110 transition-all">
                    <IconComponent className="w-7 h-7 text-black/70" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-black">{benefit.title}</h3>
                  <p className="text-black/70 leading-relaxed">{benefit.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-white" ref={ref5}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView5 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 1, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                {t('chooseProject')}
              </h2>
              <p className="text-lg text-black/70 leading-relaxed mb-6">
                {t('chooseProjectDescription')}
              </p>
              <Link
                href="/catalog"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-black/90 transition-all"
              >
                {t('selectProject')}
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={isInView5 ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.9, x: 50 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-black/5 z-10"></div>
                <Image
                  src="/images/q.jpg"
                  alt={t('chooseProject')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          </div>
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
