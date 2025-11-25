'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/src/routing';
import { useSearchParams } from 'next/navigation';
import { getApiUrl } from '@/src/config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import { Link } from '@/src/routing';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { HeartIcon, MapPinIcon, UsersIcon, CheckIcon, ArrowRightIcon, CreditCardIcon } from '../components/Icons';
import CustomNotification from '../components/CustomNotification';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../../contexts/AuthContext';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  location: string;
  raised: number;
  goal: number;
  donors: number;
  urgency?: string;
  metadata?: {
    fullDescription?: string;
    name?: string;
    daysLeft?: number;
  };
}

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

export default function DonatePage() {
  const t = useTranslations('donatePage');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, refreshAuth } = useAuth();
  const projectId = searchParams?.get('projectId');

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [otherProjects, setOtherProjects] = useState<Project[]>([]);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  
  // Payment cards state
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [showCardSelector, setShowCardSelector] = useState(false);
  
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
  const [showLoginModal, setShowLoginModal] = useState(false);

  const heroRef = useRef(null);
  const formRef = useRef(null);
  const projectsRef = useRef(null);
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isHeroInView = useInView(heroRef, viewOptions);
  const isFormInView = useInView(formRef, viewOptions);
  const isProjectsInView = useInView(projectsRef, viewOptions);

  // Загрузка выбранного проекта
  useEffect(() => {
    const loadSelectedProject = async () => {
      if (!projectId) {
        setIsLoadingProject(false);
        return;
      }

      setIsLoadingProject(true);
      try {
        const response = await fetch(getApiUrl(`/projects/${projectId}`));
        const data = await response.json();

        if (data.success && data.project) {
          const projectData: Project = {
            id: data.project.id,
            title: data.project.title,
            description: data.project.description,
            image: data.project.image || '/images/q.jpg',
            category: data.project.category || 'Общее',
            location: data.project.location || '',
            raised: Number(data.project.raised) || 0,
            goal: Number(data.project.goal) || 0,
            donors: data.project.donors || 0,
            urgency: data.project.urgency,
            metadata: data.project.metadata || {},
          };
          setSelectedProject(projectData);
        }
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setIsLoadingProject(false);
      }
    };

    loadSelectedProject();
  }, [projectId]);

  // Загрузка других проектов
  useEffect(() => {
    const loadOtherProjects = async () => {
      try {
        const excludeId = projectId ? `&exclude=${projectId}` : '';
        const response = await fetch(getApiUrl(`/projects?status=active&limit=6&sortBy=newest${excludeId}`));
        const data = await response.json();
        
        if (data.success && data.projects) {
          const transformedProjects: Project[] = data.projects.map((project: any) => ({
            id: project.id,
            title: project.title,
            description: project.description,
            image: project.image || '/images/q.jpg',
            category: project.category || 'Общее',
            location: project.location || '',
            raised: Number(project.raised) || 0,
            goal: Number(project.goal) || 0,
            donors: project.donors || 0,
            urgency: project.urgency,
            metadata: project.metadata || {},
          }));
          setOtherProjects(transformedProjects);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadOtherProjects();
  }, [projectId]);

  // Загрузка карт пользователя
  useEffect(() => {
    if (isAuthenticated) {
      loadPaymentCards();
    }
  }, [isAuthenticated]);

  const loadPaymentCards = async () => {
    setIsLoadingCards(true);
    try {
      const token = localStorage.getItem('accessToken');
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

  const suggestedAmounts = [500, 1000, 2500, 5000, 10000];

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1).replace('.0', '')}М ₽`;
    } else if (amount >= 1000) {
      return `${Math.round(amount / 1000)}К ₽`;
    }
    return `${amount.toLocaleString('ru-RU')} ₽`;
  };

  const handleDonate = async () => {
    const amount = selectedAmount || (customAmount ? parseInt(customAmount) : null);
    if (!amount || amount <= 0) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: t('error'),
        message: t('errorCreatingDonation'),
      });
      return;
    }

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Проверяем наличие карт
    if (paymentCards.length === 0) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: t('error'),
        message: t('addPaymentCardDesc'),
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
        message: t('addPaymentCardDesc'),
      });
      return;
    }

    if (isRecurring) {
      if (selectedProject) {
        router.push(`/profile/subscriptions?create=true&projectId=${selectedProject.id}&amount=${amount}`);
      } else {
        router.push(`/profile/subscriptions?create=true&amount=${amount}`);
      }
      return;
    }

    setIsDonating(true);
    try {
      const token = localStorage.getItem('accessToken');
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
          projectName: selectedProject?.title || 'Общий фонд',
          description: selectedProject 
            ? `Пожертвование для проекта: ${selectedProject.title}`
            : t('oneTimeDonation'),
          projectId: selectedProject?.id || null,
          paymentMethodId: selectedCard.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('donationCreationError') }));
        throw new Error(errorData.message || t('donationCreationError'));
      }

      const data = await response.json();
      
      // Обновляем профиль пользователя
      await refreshAuth();

      setNotification({
        isOpen: true,
        type: 'success',
        title: t('thankYouDonationTitle'),
        message: t('thankYouDonationMessage', { amount: formatAmount(amount), projectName: selectedProject ? `"${selectedProject.title}"` : '' }),
      });

      // Обновляем проект, если он был выбран
      if (selectedProject && data.success) {
        setSelectedProject({
          ...selectedProject,
          raised: selectedProject.raised + amount,
          donors: selectedProject.donors + 1,
        });
      }

      // Очищаем форму
      setSelectedAmount(null);
      setCustomAmount('');
    } catch (error) {
      console.error('Error creating donation:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: t('error'),
        message: error instanceof Error ? error.message : t('donationCreationError'),
      });
    } finally {
      setIsDonating(false);
    }
  };

  const getProgress = (raised: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min(Math.round((raised / goal) * 100), 100);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <Header />
      
      {/* Breadcrumbs */}
      <div className="w-full bg-white border-b border-gray-200 pt-20" style={{ position: 'static' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
          <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Link href="/" className="text-gray-600 hover:text-black transition-colors duration-200 font-medium truncate">
              {t('breadcrumbHome')}
            </Link>
            <span className="text-gray-400">/</span>
            {selectedProject && (
              <>
                <Link href="/catalog" className="text-gray-600 hover:text-black transition-colors duration-200 font-medium truncate">
                  {t('breadcrumbCatalog')}
                </Link>
                <span className="text-gray-400">/</span>
                <Link href={`/projects/${selectedProject.id}`} className="text-gray-600 hover:text-black transition-colors duration-200 font-medium truncate max-w-[120px] sm:max-w-[200px] md:max-w-md">
                  {selectedProject.title}
                </Link>
                <span className="text-gray-400">/</span>
              </>
            )}
            <span className="text-black font-semibold truncate">{t('breadcrumbDonation')}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative mt-16 sm:mt-20 md:mt-24 pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-10 md:pb-12 lg:mt-28 lg:pt-20 lg:pb-16 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-12 sm:-top-24 -right-12 sm:-right-24 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-gradient-to-br from-black/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 sm:-bottom-24 -left-12 sm:-left-24 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-gradient-to-br from-black/5 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold mb-4 sm:mb-6 tracking-tight text-black leading-tight">
              {selectedProject ? (
                <>
                  {t('supportProject')}<br />
                  <span className="bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
                    &quot;{selectedProject.title}&quot;
                  </span>
                </>
              ) : (
                t('makeDonation')
              )}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
              {selectedProject 
                ? t('projectDescription')
                : t('generalDescription')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Selected Project Info */}
      {selectedProject && (
        <section className="pb-6 sm:pb-8">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <motion.div
              className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={isFormInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6 p-4 sm:p-6 lg:p-8">
                <div className="relative w-full md:w-48 h-40 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0">
                  <Image
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 192px"
                  />
                </div>
                <div className="flex-1">
                  <Link 
                    href={`/projects/${selectedProject.id}`}
                    className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-2 sm:mb-3 hover:text-gray-700 transition-colors inline-block leading-tight"
                  >
                    {selectedProject.title}
                  </Link>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-5 md:mb-6 leading-relaxed">{selectedProject.description}</p>
                  <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-5 md:gap-6 mb-5 sm:mb-6 md:mb-8">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-5 md:gap-6 text-xs sm:text-sm text-gray-500">
                      {selectedProject.location && (
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 flex-shrink-0">
                            <MapPinIcon />
                          </div>
                          <span className="truncate max-w-[120px] sm:max-w-none">{selectedProject.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 flex-shrink-0">
                          <UsersIcon />
                        </div>
                        <span className="whitespace-nowrap">{selectedProject.donors} {t('donors')}</span>
                      </div>
                    </div>
                    {selectedProject.urgency && (
                      <div className={`px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0 ${
                        selectedProject.urgency === 'Экстренные случаи' || selectedProject.urgency === 'Emergency cases'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedProject.urgency === 'Экстренные случаи' ? t('emergencyCases') : selectedProject.urgency === 'Обычные' ? t('regular') : selectedProject.urgency}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                      <span className="font-semibold">{getProgress(selectedProject.raised, selectedProject.goal)}% {t('collected')}</span>
                      <span className="font-bold text-black">{formatAmount(selectedProject.raised)} {t('from')} {formatAmount(selectedProject.goal)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 sm:h-3 overflow-hidden shadow-inner">
                      <motion.div
                        className="bg-gradient-to-r from-black via-gray-800 to-black h-2.5 sm:h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgress(selectedProject.raised, selectedProject.goal)}%` }}
                        transition={{ duration: 1.5, ease: [0.6, -0.05, 0.01, 0.99] }}
                      >
                        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Donation Form Section */}
      <section ref={formRef} className="py-6 sm:py-8 lg:py-12">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl border border-gray-100"
            initial={{ opacity: 0, y: 40 }}
            animate={isFormInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            {/* Section Header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="w-1 h-8 sm:h-10 md:h-12 bg-gradient-to-b from-black to-gray-400 rounded-full"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
                {t('donationAmount')}
              </h2>
            </div>

            {/* Suggested Amounts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
              {suggestedAmounts.map((amount) => (
                <motion.button
                  key={amount}
                  className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                    selectedAmount === amount
                      ? 'bg-black text-white shadow-lg scale-105'
                      : 'bg-gray-50 border-2 border-gray-200 text-black hover:border-black hover:shadow-md'
                  }`}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {formatAmount(amount)}
                </motion.button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="mb-6 sm:mb-8">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                {t('orEnterAmount')}
              </label>
              <input
                type="number"
                className="w-full px-5 sm:px-6 py-3.5 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white text-black placeholder-gray-400 font-medium focus:outline-none focus:border-black transition-colors text-sm sm:text-base md:text-lg placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base"
                placeholder={t('enterAmount')}
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                min="1"
              />
            </div>

            {/* Payment Card Selection */}
            {isAuthenticated && (
              <div className="mb-6 sm:mb-8">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  {t('paymentMethod')}
                </label>
                
                {isLoadingCards ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 sm:border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                  </div>
                ) : paymentCards.length === 0 ? (
                  <motion.div
                    className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl sm:rounded-2xl p-4 sm:p-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600">
                          <CreditCardIcon />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-orange-900 mb-1 sm:mb-2">
                          {t('addPaymentCard')}
                        </h3>
                        <p className="text-orange-700 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
                          {t('addPaymentCardDesc')}
                        </p>
                        <button
                          onClick={() => router.push('/profile?tab=payments')}
                          className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg sm:rounded-xl font-semibold transition-colors duration-200 text-sm sm:text-base"
                        >
                          <div className="w-4 h-4 sm:w-5 sm:h-5">
                            <CreditCardIcon />
                          </div>
                          <span>{t('addCard')}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {paymentCards.map((card) => (
                      <motion.button
                        key={card.id}
                        className={`w-full p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 text-left ${
                          selectedCard?.id === card.id
                            ? 'border-black bg-black text-white shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedCard(card)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                            selectedCard?.id === card.id
                              ? 'bg-white/20'
                              : 'bg-gray-100'
                          }`}>
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 ${
                              selectedCard?.id === card.id ? 'text-white' : 'text-gray-700'
                            }`}>
                              <CreditCardIcon />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-0.5 sm:mb-1">
                              <span className="font-bold text-sm sm:text-base md:text-lg truncate">
                                {card.brand} •••• {card.last4}
                              </span>
                              {card.isDefault && (
                                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                                  selectedCard?.id === card.id
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {t('defaultCard')}
                                </span>
                              )}
                            </div>
                            <div className={`text-xs sm:text-sm truncate ${
                              selectedCard?.id === card.id ? 'text-white/70' : 'text-gray-500'
                            }`}>
                              {card.cardholderName || t('noName')} • {t('expires')} {card.expiryMonth}/{card.expiryYear}
                            </div>
                          </div>
                          {selectedCard?.id === card.id && (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black flex items-center justify-center">
                                <CheckIcon />
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                    
                    <button
                      onClick={() => router.push('/profile?tab=payments')}
                      className="w-full p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-all duration-200 text-gray-600 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>{t('addNewCard')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Recurring Donation */}
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer rounded-lg border-gray-300 text-black focus:ring-black focus:ring-offset-2 flex-shrink-0"
              />
              <label htmlFor="recurring" className="cursor-pointer flex-1 min-w-0">
                <div className="font-semibold text-black mb-0.5 sm:mb-1 text-sm sm:text-base">
                  {t('recurringDonation')}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {t('recurringDescription')}
                </div>
              </label>
            </div>

            {/* Donate Button */}
            <button
              className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-black via-gray-900 to-black text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 group relative overflow-hidden"
              onClick={handleDonate}
              disabled={isDonating || (!selectedAmount && !customAmount) || (isAuthenticated && paymentCards.length > 0 && !selectedCard)}
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {isDonating ? (
                <>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t('processing')}</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                    <HeartIcon />
                  </div>
                  <span>{isRecurring ? t('subscribeToRecurring') : t('donate')}</span>
                </>
              )}
            </button>

            {!isAuthenticated && (
              <p className="text-center text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6 px-2">
                {t('requiresAuth')}{' '}
                <Link href={`/login?redirect=/donate${projectId ? `?projectId=${projectId}` : ''}`} className="text-black underline font-semibold hover:text-gray-700">
                  {t('authorization')}
                </Link>
              </p>
            )}

            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
                <CheckIcon />
              </div>
              <span>{t('paymentsProtected')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Other Projects Section */}
      <section ref={projectsRef} className="py-8 sm:py-10 md:py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {otherProjects.length > 0 ? (
            <>
              <motion.div
                className="text-center mb-8 sm:mb-10 md:mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={isProjectsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 tracking-tight text-black">
                  {t('otherProjects')}
                </h2>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
                  {t('otherProjectsDesc')}
                </p>
              </motion.div>

              {isLoadingProjects ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-2xl sm:rounded-3xl h-80 sm:h-96 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {otherProjects.map((project, index) => {
                  const progress = getProgress(project.raised, project.goal);
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isProjectsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Link
                        href={`/projects/${project.id}`}
                        className="group bg-white border border-gray-200 rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-2xl hover:border-gray-300 transition-all duration-500 block"
                      >
                        <div className="relative w-full h-40 sm:h-48 md:h-56 overflow-hidden">
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          {project.urgency && (
                            <div className={`absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold ${
                              project.urgency === 'Экстренные случаи' || project.urgency === 'Emergency cases'
                                ? 'bg-red-500/90 text-white' 
                                : 'bg-white/90 text-gray-900'
                            }`}>
                              {project.urgency === 'Экстренные случаи' ? t('emergencyCases') : project.urgency === 'Обычные' ? t('regular') : project.urgency}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                        
                        <div className="p-4 sm:p-5 md:p-6">
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-black mb-2 sm:mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors leading-tight">
                            {project.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 md:mb-5 line-clamp-2 leading-relaxed">
                            {project.description}
                          </p>
                          
                          {/* Progress bar */}
                          <div className="mb-3 sm:mb-4">
                            <div className="flex justify-between text-[10px] sm:text-xs text-gray-600 mb-1.5 sm:mb-2 font-medium">
                              <span>{progress}% {t('collected')}</span>
                              <span>{project.donors} {t('donors')}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 sm:h-2.5 overflow-hidden shadow-inner">
                              <div
                                className="bg-gradient-to-r from-black via-gray-800 to-black h-2 sm:h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Amount */}
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold text-black text-sm sm:text-base md:text-lg">
                                {formatAmount(project.raised)}
                              </div>
                              <div className="text-[10px] sm:text-xs text-gray-500">
                                {t('from')} {formatAmount(project.goal)}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 text-xs sm:text-sm font-medium group-hover:text-black transition-colors">
                              <span>{t('support')}</span>
                              <div className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform">
                                <ArrowRightIcon />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}

              <motion.div
                className="text-center mt-8 sm:mt-10 md:mt-12"
                initial={{ opacity: 0 }}
                animate={isProjectsInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link 
                  href="/catalog" 
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-black text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  <span>{t('viewAllProjects')}</span>
                  <div className="w-4 h-4 sm:w-5 sm:h-5">
                    <ArrowRightIcon />
                  </div>
                </Link>
              </motion.div>
            </>
          ) : (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isProjectsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-black px-2">
                Хотите помочь ещё?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                Посмотрите другие проекты, которым тоже нужна ваша поддержка
              </p>
              <Link 
                href="/catalog" 
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-black text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <span>Перейти в каталог проектов</span>
                <div className="w-4 h-4 sm:w-5 sm:h-5">
                  <ArrowRightIcon />
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
      
      <CustomNotification
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectPath={projectId ? `/donate?projectId=${projectId}` : '/donate'}
      />
    </main>
  );
}
