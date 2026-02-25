'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/src/routing';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CustomConfirm from '../../components/CustomConfirm';
import CustomNotification from '../../components/CustomNotification';
import { getApiUrl } from '@/src/config';
import { RepeatIcon } from '../../components/Icons';
import { useTranslations } from 'next-intl';

interface RecurringPayment {
  id: string;
  amount: number;
  currency: string;
  projectName: string;
  description: string | null;
  projectId: string | null;
  recurringPaymentId: string | null;
  nextPaymentDate: string | null;
  paymentMethod: {
    id: string;
    brand: string;
    last4: string;
  } | null;
  createdAt: string;
}

interface PaymentCard {
  id: string;
  brand: string;
  last4: string;
  isDefault: boolean;
}

export default function SubscriptionsPage() {
  const t = useTranslations('subscriptionsPage');
  const tCommon = useTranslations('common');
  const router = useRouter();
  
  // Получаем начальную вкладку из URL параметра
  const getInitialTab = (): 'active' | 'create' => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get('tab');
      if (tabFromUrl === 'create') {
        // Убираем параметр из URL после чтения
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('tab');
        window.history.replaceState({}, '', newUrl.toString());
        return 'create';
      }
    }
    return 'active';
  };
  
  const [activeTab, setActiveTab] = useState<'active' | 'create'>(getInitialTab());
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelPaymentId, setCancelPaymentId] = useState<string | null>(null);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);
  const buttonContainerRefs = useRef<Record<string, number>>({});

  // Обработка параметра tab из URL при монтировании и изменении URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get('tab');
      if (tabFromUrl === 'create') {
        setActiveTab('create');
        // Убираем параметр из URL после чтения
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('tab');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, []);

  // Для создания подписки
  const [formData, setFormData] = useState({
    projectName: '',
    amount: '',
    description: '',
    paymentMethodId: '',
    projectId: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  // Для редактирования подписки
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(null);
  const [editFormData, setEditFormData] = useState({
    projectName: '',
    amount: '',
    description: '',
    nextPaymentDate: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Для кастомных селектов
  const [isCardDropdownOpen, setIsCardDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<Array<{
    id: string;
    title: string;
    description: string;
    category: string;
  }>>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Загрузка проектов из API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const response = await fetch(getApiUrl('/projects?status=active'));
        const data = await response.json();
        if (data.success && data.projects) {
          const transformedProjects = data.projects.map((project: any) => ({
            id: project.id,
            title: project.title,
            description: project.description || '',
            category: project.category || 'Общее',
          }));
          setAvailableProjects(transformedProjects);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  // Фильтрация проектов по поиску
  const filteredProjects = availableProjects.filter(project =>
    project.title.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
    project.id.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
    project.category.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );

  // Загрузка регулярных платежей
  const fetchRecurringPayments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(getApiUrl('/transactions/recurring'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRecurringPayments(data.recurringPayments || []);
        }
      } else if (res.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/login');
      }
    } catch (err) {
      console.error('Error fetching recurring payments:', err);
    }
  };

  // Загрузка карт
  const fetchPaymentCards = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(getApiUrl('/payments/cards'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPaymentCards(data.cards || []);
        }
      }
    } catch (err) {
      console.error('Error fetching payment cards:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchRecurringPayments(), fetchPaymentCards()]);
      setIsLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Обработка отмены регулярного платежа
  const handleCancelRecurring = (paymentId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    const container = (event?.currentTarget as HTMLElement)?.closest('.recurring-payment-buttons') as HTMLElement;
    if (container && !buttonContainerRefs.current[paymentId]) {
      buttonContainerRefs.current[paymentId] = container.offsetWidth;
    }
    setCancelPaymentId(paymentId);
    setShowCancelConfirm(true);
  };

  // Фактическое удаление регулярного платежа
  const handleConfirmDelete = async (paymentId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(getApiUrl(`/transactions/recurring/${paymentId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        await fetchRecurringPayments();
        setCancelPaymentId(null);
        setShowCancelConfirm(false);
        buttonContainerRefs.current[paymentId] = 0;
        setNotification({
          isOpen: true,
          type: 'success',
          title: t('success'),
          message: t('subscriptionCancelled') || 'Подписка успешно отменена',
        });
      } else {
        const data = await res.json();
        setNotification({
          isOpen: true,
          type: 'error',
          title: t('error'),
          message: data.message || t('errorCancellingMessage'),
        });
        setCancelPaymentId(null);
        setShowCancelConfirm(false);
      }
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: t('error'),
        message: t('errorCancelling'),
      });
      setCancelPaymentId(null);
      setShowCancelConfirm(false);
      console.error('Error cancelling recurring payment:', err);
    }
  };

  // Отмена режима подтверждения при клике вне кнопок
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (confirmingPaymentId) {
        const target = e.target as HTMLElement;
        if (!target.closest('.recurring-payment-buttons')) {
          const paymentId = confirmingPaymentId;
          setConfirmingPaymentId(null);
          setTimeout(() => {
            buttonContainerRefs.current[paymentId] = 0;
          }, 250);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [confirmingPaymentId]);

  // Закрытие dropdown'ов при клике вне их
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isCardDropdownOpen && !target.closest('[data-card-dropdown]')) {
        setIsCardDropdownOpen(false);
      }
      if (isProjectDropdownOpen && !target.closest('[data-project-dropdown]')) {
        setIsProjectDropdownOpen(false);
      }
    };

    if (isCardDropdownOpen || isProjectDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isCardDropdownOpen, isProjectDropdownOpen]);

  // Открытие модального окна редактирования
  const handleEditClick = (payment: RecurringPayment) => {
    setEditingPayment(payment);
    setEditFormData({
      projectName: payment.projectName,
      amount: (payment.amount / 100).toString(),
      description: payment.description || '',
      nextPaymentDate: payment.nextPaymentDate 
        ? new Date(payment.nextPaymentDate).toISOString().split('T')[0]
        : '',
    });
    setShowEditModal(true);
  };

  // Обновление регулярного платежа
  const handleUpdateRecurring = async () => {
    if (!editingPayment) return;

    if (!editFormData.projectName || !editFormData.amount) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: t('error'),
        message: t('pleaseFillAllFields'),
      });
      return;
    }

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const amount = Math.round(parseFloat(editFormData.amount) * 100); // В копейках
      const nextPaymentDate = editFormData.nextPaymentDate 
        ? new Date(editFormData.nextPaymentDate).toISOString()
        : undefined;

      const res = await fetch(getApiUrl(`/transactions/recurring/${editingPayment.id}`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: editFormData.projectName,
          amount,
          description: editFormData.description || undefined,
          nextPaymentDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setShowEditModal(false);
          setEditingPayment(null);
          setEditFormData({
            projectName: '',
            amount: '',
            description: '',
            nextPaymentDate: '',
          });
          await fetchRecurringPayments();
          setNotification({
            isOpen: true,
            type: 'success',
            title: t('success'),
            message: t('subscriptionUpdated') || 'Подписка успешно обновлена',
          });
        }
      } else {
        const data = await res.json();
        setNotification({
          isOpen: true,
          type: 'error',
          title: t('error'),
          message: data.message || t('errorUpdating'),
        });
      }
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: t('error'),
        message: t('errorUpdating'),
      });
      console.error('Error updating recurring payment:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Создание регулярного пожертвования
  const handleCreateRecurring = async () => {
    if (!formData.projectName || !formData.amount || !formData.paymentMethodId) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: t('error'),
        message: t('pleaseFillAllFields'),
      });
      return;
    }

    try {
      setIsCreating(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Создаем регулярный платеж
      const amount = Math.round(parseFloat(formData.amount) * 100); // В копейках
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

      const res = await fetch(getApiUrl('/transactions/recurring'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'RUB',
          projectName: formData.projectName,
          description: formData.description || undefined,
          projectId: formData.projectId || undefined,
          paymentMethodId: formData.paymentMethodId,
          nextPaymentDate: nextPaymentDate.toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Очищаем форму
          setFormData({
            projectName: '',
            amount: '',
            description: '',
            paymentMethodId: '',
            projectId: '',
          });
          // Перезагружаем список
          await fetchRecurringPayments();
          // Переключаемся на вкладку активных подписок
          setActiveTab('active');
          setNotification({
            isOpen: true,
            type: 'success',
            title: t('success'),
            message: t('subscriptionCreated'),
          });
        }
      } else {
        const data = await res.json();
        setNotification({
          isOpen: true,
          type: 'error',
          title: t('error'),
          message: data.message || t('errorCreating'),
        });
      }
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: t('error'),
        message: t('errorCreating'),
      });
      console.error('Error creating recurring payment:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="profile-page-content subscriptions-page" style={{ marginLeft: 0, width: '100%', maxWidth: '1200px', margin: '0 auto', paddingTop: '120px', paddingBottom: '4rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="premium-content-header">
            <h1 className="premium-content-title">{t('heroTitle')}</h1>
            <p className="premium-content-intro">
              {t('heroDescription')}
            </p>
          </div>

          {/* Табы */}
          <div className="subscriptions-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <button
              onClick={() => setActiveTab('active')}
              className="subscription-tab-button subscription-tab-active"
              style={{
                padding: '1rem 2rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'active' ? '2px solid #1a1a1a' : '2px solid transparent',
                color: activeTab === 'active' ? '#1a1a1a' : '#6a6a6a',
                fontWeight: activeTab === 'active' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {isMobile ? (
                <>{t('activeSubscriptionsMobile')}</>
              ) : (
                <>{t('activeSubscriptions')} ({recurringPayments.length})</>
              )}
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className="subscription-tab-button subscription-tab-create"
              style={{
                padding: '1rem 2rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'create' ? '2px solid #1a1a1a' : '2px solid transparent',
                color: activeTab === 'create' ? '#1a1a1a' : '#6a6a6a',
                fontWeight: activeTab === 'create' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {isMobile ? (
                <>{t('createSubscriptionMobile')}</>
              ) : (
                <>{t('createSubscription')}</>
              )}
            </button>
          </div>

          {/* Активные подписки */}
          {activeTab === 'active' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <p style={{ fontSize: '1.125rem', color: '#6a6a6a' }}>{tCommon('loading')}</p>
                </div>
              ) : recurringPayments.length > 0 ? (
                <div className="subscriptions-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {recurringPayments.map((payment, index) => (
                    <motion.div
                      key={payment.id}
                      className="subscription-card premium-subscription-card-ultra"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ y: -8, scale: 1.002 }}
                      style={{
                        background: 'linear-gradient(145deg, #ffffff 0%, #fafbfc 25%, #f8f9fa 50%, #fafbfc 75%, #ffffff 100%)',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        borderRadius: '32px',
                        padding: '2.5rem 2.5rem 3rem 2.5rem',
                        boxShadow: `
                          0 1px 3px rgba(0, 0, 0, 0.04),
                          0 4px 12px rgba(0, 0, 0, 0.05),
                          0 12px 32px rgba(0, 0, 0, 0.06),
                          0 24px 64px rgba(0, 0, 0, 0.04),
                          inset 0 1px 0 rgba(255, 255, 255, 0.9)
                        `,
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(20px)',
                        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      {/* Премиум декоративные элементы */}
                      <div className="premium-card-decoration-1" style={{
                        position: 'absolute',
                        top: '-60px',
                        right: '-60px',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(26, 26, 26, 0.04) 0%, transparent 70%)',
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        filter: 'blur(40px)',
                      }} />
                      <div className="premium-card-decoration-2" style={{
                        position: 'absolute',
                        bottom: '-40px',
                        left: '-40px',
                        width: '150px',
                        height: '150px',
                        background: 'radial-gradient(circle, rgba(26, 26, 26, 0.03) 0%, transparent 70%)',
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        filter: 'blur(30px)',
                      }} />
                      <div className="premium-card-shine" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
                        pointerEvents: 'none',
                      }} />
                      
                      {/* Заголовок с бейджем */}
                      <div className="subscription-card-header premium-card-header">
                        <div className="subscription-card-header-left">
                          <div className="subscription-card-title-row">
                            <h3 className="subscription-card-title premium-card-title">
                              {payment.projectName}
                            </h3>
                            <motion.span 
                              className="subscription-card-status-badge premium-status-badge"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.2 + index * 0.1 }}
                            >
                              <span className="premium-status-dot"></span>
                              Активна
                            </motion.span>
                          </div>
                        </div>
                        <div className="subscription-card-amount premium-card-amount-header">
                          <div className="subscription-card-amount-label premium-amount-label">Сумма:</div>
                          <p className="subscription-card-amount-value premium-amount-value">
                            {(payment.amount / 100).toLocaleString('ru-RU')} ₽
                          </p>
                          <p className="subscription-card-amount-period premium-amount-period">
                            / месяц
                          </p>
                        </div>
                      </div>

                      {/* Премиум блок с деталями */}
                      <div className="subscription-card-details premium-card-details" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem',
                        marginTop: '2rem',
                        padding: '2rem',
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.015) 0%, rgba(0, 0, 0, 0.025) 100%)',
                        borderRadius: '20px',
                        position: 'relative',
                        border: '1px solid rgba(0, 0, 0, 0.04)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.8), 0 2px 8px rgba(0, 0, 0, 0.03)',
                      }}>
                        <div className="subscription-amount-mobile premium-detail-item">
                          <div className="premium-detail-label">
                            СУММА:
                          </div>
                          <div className="premium-detail-value">
                            {(payment.amount / 100).toLocaleString('ru-RU')} ₽ / месяц
                          </div>
                        </div>
                        {payment.nextPaymentDate && (
                          <div className="premium-detail-item">
                            <div className="premium-detail-label">
                              СЛЕДУЮЩИЙ ПЛАТЕЖ:
                            </div>
                            <div className="premium-detail-value">
                              {new Date(payment.nextPaymentDate).toLocaleDateString('ru-RU', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              })}
                            </div>
                          </div>
                        )}
                        {payment.paymentMethod && (
                          <div className="premium-detail-item">
                            <div className="premium-detail-label">
                              КАРТА:
                            </div>
                            <div className="premium-detail-value">
                              {payment.paymentMethod.brand} •••• {payment.paymentMethod.last4}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Премиум кнопки */}
                      <div 
                        className="recurring-payment-buttons subscription-card-buttons premium-card-buttons" 
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                          display: 'flex', 
                          gap: confirmingPaymentId === payment.id ? '0px' : '12px',
                          position: 'relative',
                          alignItems: 'center',
                          transition: 'gap 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                          minHeight: '48px',
                          maxWidth: '100%',
                          width: buttonContainerRefs.current[payment.id] && buttonContainerRefs.current[payment.id] > 0
                            ? `${buttonContainerRefs.current[payment.id]}px` 
                            : 'auto',
                          flexShrink: 1,
                          minWidth: 0,
                          overflow: 'visible',
                          boxSizing: 'border-box',
                          marginTop: '0.5rem',
                          padding: '8px',
                          margin: '0.5rem -8px -8px -8px',
                        }}
                      >
                        <motion.button
                          layout
                          initial={{ opacity: 1, scaleX: 1 }}
                          animate={{ 
                            opacity: confirmingPaymentId === payment.id ? 0 : 1,
                            scaleX: confirmingPaymentId === payment.id ? 0 : 1,
                            width: confirmingPaymentId === payment.id ? 0 : 'auto',
                          }}
                          transition={{ 
                            duration: 0.3, 
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(payment);
                          }}
                          className="premium-edit-button"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            padding: '14px 28px',
                            fontSize: '15px',
                            background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '16px',
                            cursor: confirmingPaymentId === payment.id ? 'default' : 'pointer',
                            color: '#1a1a1a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            transformOrigin: 'left center',
                            pointerEvents: confirmingPaymentId === payment.id ? 'none' : 'auto',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            fontWeight: 600,
                            letterSpacing: '-0.01em',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                          }}
                        >
                          {t('edit')}
                        </motion.button>
                        <motion.button
                          layout
                          initial={{ width: 'auto' }}
                          animate={{ 
                            width: confirmingPaymentId === payment.id ? '100%' : 'auto',
                            flex: confirmingPaymentId === payment.id ? 1 : 0,
                          }}
                          transition={{ 
                            duration: 0.3, 
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirmingPaymentId === payment.id) {
                              handleCancelRecurring(payment.id, e);
                            } else {
                              const container = (e.currentTarget as HTMLElement)?.closest('.recurring-payment-buttons') as HTMLElement;
                              if (container && !buttonContainerRefs.current[payment.id]) {
                                buttonContainerRefs.current[payment.id] = container.offsetWidth;
                              }
                              setConfirmingPaymentId(payment.id);
                            }
                          }}
                          className="premium-cancel-button"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            padding: '14px 28px',
                            fontSize: '15px',
                            background: confirmingPaymentId === payment.id 
                              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #c71f1f 100%)' 
                              : 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
                            border: confirmingPaymentId === payment.id 
                              ? '1px solid transparent' 
                              : '1px solid rgba(239, 68, 68, 0.25)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            color: confirmingPaymentId === payment.id ? '#ffffff' : '#ef4444',
                            fontWeight: confirmingPaymentId === payment.id ? 700 : 600,
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            transformOrigin: 'right center',
                            minWidth: confirmingPaymentId === payment.id ? 0 : 'fit-content',
                            maxWidth: '100%',
                            boxSizing: 'border-box',
                            flexShrink: 0,
                            overflow: 'hidden',
                            width: 'auto',
                            boxShadow: confirmingPaymentId === payment.id 
                              ? '0 4px 16px rgba(239, 68, 68, 0.35), 0 8px 24px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                              : '0 2px 8px rgba(239, 68, 68, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {confirmingPaymentId === payment.id ? t('delete') : t('cancel')}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  background: '#fafafa',
                  borderRadius: '20px',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                }}>
                  <p style={{ fontSize: '1.125rem', color: '#6a6a6a', margin: '0 0 1.5rem 0' }}>
                    {t('noSubscriptionsYet')}
                  </p>
                  <button
                    className="premium-button"
                    onClick={() => setActiveTab('create')}
                  >
                    {t('createFirst')}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Создание подписки */}
          {activeTab === 'create' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="subscription-create-form premium-create-form" style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #fafbfc 25%, #f8f9fa 50%, #fafbfc 75%, #ffffff 100%)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: '32px',
                padding: '3rem',
                boxShadow: `
                  0 1px 3px rgba(0, 0, 0, 0.04),
                  0 4px 12px rgba(0, 0, 0, 0.05),
                  0 12px 32px rgba(0, 0, 0, 0.06),
                  0 24px 64px rgba(0, 0, 0, 0.04),
                  inset 0 1px 0 rgba(255, 255, 255, 0.9)
                `,
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(20px)',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              }}>
                {/* Премиум декоративные элементы */}
                <div style={{
                  position: 'absolute',
                  top: '-60px',
                  right: '-60px',
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(26, 26, 26, 0.04) 0%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  filter: 'blur(40px)',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-40px',
                  left: '-40px',
                  width: '150px',
                  height: '150px',
                  background: 'radial-gradient(circle, rgba(26, 26, 26, 0.03) 0%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  filter: 'blur(30px)',
                }} />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
                
                <h2 className="premium-form-title" style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: 700, 
                  color: '#0a0a0a', 
                  margin: '0 0 2.5rem 0',
                  letterSpacing: '-0.03em',
                  lineHeight: '1.3',
                  position: 'relative',
                }}>
                  {t('createRecurring')}
                </h2>

                <div className="premium-form-fields" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2.5rem' }}>
                  <div className="premium-form-field">
                    <label className="premium-form-label" style={{ 
                      display: 'block', 
                      marginBottom: '0.75rem', 
                      fontSize: '0.8125rem', 
                      fontWeight: 600, 
                      color: '#0a0a0a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {t('project')} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      placeholder={t('projectPlaceholder')}
                      className="premium-form-input"
                      style={{
                        width: '100%',
                        padding: '1rem 1.25rem',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '16px',
                        fontSize: '1rem',
                        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                        color: '#0a0a0a',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.2)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                      }}
                    />
                  </div>

                  <div className="premium-form-field">
                    <label className="premium-form-label" style={{ 
                      display: 'block', 
                      marginBottom: '0.75rem', 
                      fontSize: '0.8125rem', 
                      fontWeight: 600, 
                      color: '#0a0a0a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {t('amountLabel')} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="1000"
                      min="1"
                      step="0.01"
                      className="premium-form-input"
                      style={{
                        width: '100%',
                        padding: '1rem 1.25rem',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '16px',
                        fontSize: '1rem',
                        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                        color: '#0a0a0a',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.2)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                      }}
                    />
                  </div>

                  <div className="premium-form-field">
                    <label className="premium-form-label" style={{ 
                      display: 'block', 
                      marginBottom: '0.75rem', 
                      fontSize: '0.8125rem', 
                      fontWeight: 600, 
                      color: '#0a0a0a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {t('description')} {t('optional') && <span style={{ color: '#6a6a6a', fontWeight: 400, textTransform: 'none', fontSize: '0.75rem' }}>({t('optional')})</span>}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t('descriptionPlaceholder')}
                      rows={3}
                      className="premium-form-textarea"
                      style={{
                        width: '100%',
                        padding: '1rem 1.25rem',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '16px',
                        fontSize: '1rem',
                        resize: 'vertical',
                        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                        color: '#0a0a0a',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                        fontFamily: 'inherit',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.2)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                      }}
                    />
                  </div>

                  <div className="premium-form-field">
                    <label className="premium-form-label" style={{ 
                      display: 'block', 
                      marginBottom: '0.75rem', 
                      fontSize: '0.8125rem', 
                      fontWeight: 600, 
                      color: '#0a0a0a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Платёжная карта <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    {paymentCards.length === 0 ? (
                      <div className="premium-no-cards-message" style={{ 
                        padding: '1.5rem', 
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.04) 100%)', 
                        borderRadius: '16px', 
                        border: '1px dashed rgba(0, 0, 0, 0.12)',
                        backdropFilter: 'blur(10px)',
                      }}>
                        <p style={{ margin: '0 0 1.25rem 0', color: '#6a6a6a', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                          У вас нет сохранённых карт. Пожалуйста, добавьте карту в разделе платежей.
                        </p>
                        <motion.button
                          className="premium-button"
                          onClick={() => router.push('/profile?tab=payments')}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          style={{ 
                            fontSize: '0.9375rem', 
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #0a0a0a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        >
                          Добавить карту
                        </motion.button>
                      </div>
                    ) : (
                      <div data-card-dropdown>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCardDropdownOpen(!isCardDropdownOpen);
                            setIsProjectDropdownOpen(false);
                          }}
                          className="premium-form-select"
                          style={{
                            width: '100%',
                            padding: '1rem 1.25rem',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '16px',
                            fontSize: '1rem',
                            background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            textAlign: 'left',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                          }}
                        >
                          <span style={{ color: formData.paymentMethodId ? '#1a1a1a' : '#999' }}>
                            {formData.paymentMethodId
                              ? (() => {
                                  const selected = paymentCards.find(c => c.id === formData.paymentMethodId);
                                  if (!selected) return t('selectCard');
                                  const defaultText = selected.isDefault ? ' (Default)' : '';
                                  return `${selected.brand} •••• ${selected.last4}${defaultText}`;
                                })()
                              : t('selectCard')}
                          </span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{
                              transform: isCardDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                              color: '#666',
                            }}
                          >
                            <path d="M4 6L8 10L12 6" />
                          </svg>
                        </button>
                        <AnimatePresence mode="wait">
                          {isCardDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{ opacity: 1, height: 'auto', marginTop: '8px' }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              transition={{ 
                                duration: 0.4, 
                                ease: [0.16, 1, 0.3, 1],
                                opacity: { duration: 0.3 },
                                height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                              }}
                              className="premium-dropdown premium-dropdown-mobile"
                              style={{
                                position: 'relative',
                                width: '100%',
                                overflow: 'hidden',
                                background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                                border: '1px solid rgba(0, 0, 0, 0.08)',
                                borderRadius: '16px',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
                                backdropFilter: 'blur(20px)',
                              }}
                            >
                              <div style={{ overflowY: 'auto', maxHeight: '300px', padding: '0.5rem 0' }}>
                            {paymentCards.map((card) => (
                              <button
                                key={card.id}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, paymentMethodId: card.id });
                                  setIsCardDropdownOpen(false);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem 1rem',
                                  background: formData.paymentMethodId === card.id ? '#f5f5f5' : 'transparent',
                                  border: 'none',
                                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  fontSize: '0.9375rem',
                                  color: '#1a1a1a',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                  transition: 'background 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  if (formData.paymentMethodId !== card.id) {
                                    e.currentTarget.style.background = '#fafafa';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (formData.paymentMethodId !== card.id) {
                                    e.currentTarget.style.background = 'transparent';
                                  }
                                }}
                              >
                                <span style={{ fontSize: '1.5rem' }}>💳</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: formData.paymentMethodId === card.id ? 600 : 400 }}>
                                    {card.brand} •••• {card.last4}
                                  </div>
                                  {card.isDefault && (
                                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                                      Основная карта
                                    </div>
                                  )}
                                </div>
                                {formData.paymentMethodId === card.id && (
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1a1a1a" strokeWidth="2">
                                    <path d="M13.5 4.5L6 12L2.5 8.5" />
                                  </svg>
                                )}
                              </button>
                            ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  <div className="premium-form-field">
                    <label className="premium-form-label" style={{ 
                      display: 'block', 
                      marginBottom: '0.75rem', 
                      fontSize: '0.8125rem', 
                      fontWeight: 600, 
                      color: '#0a0a0a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Выбор проекта
                    </label>
                    <div data-project-dropdown>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProjectDropdownOpen(!isProjectDropdownOpen);
                          setIsCardDropdownOpen(false);
                        }}
                        className="premium-form-select"
                        style={{
                          width: '100%',
                          padding: '1rem 1.25rem',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: '16px',
                          fontSize: '1rem',
                          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textAlign: 'left',
                          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                        }}
                      >
                        <span style={{ color: formData.projectId ? '#1a1a1a' : '#999' }}>
                          {formData.projectId
                            ? (() => {
                                const selected = availableProjects.find(p => p.id === formData.projectId);
                                return selected ? `${selected.title} (${selected.id})` : t('selectProject');
                              })()
                            : t('selectProjectOptional')}
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
                            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            color: '#666',
                          }}
                        >
                          <path d="M4 6L8 10L12 6" />
                        </svg>
                      </button>
                      <AnimatePresence mode="wait">
                        {isProjectDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: '8px' }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ 
                              duration: 0.4, 
                              ease: [0.16, 1, 0.3, 1],
                              opacity: { duration: 0.3 },
                              height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                            }}
                            className="premium-dropdown premium-dropdown-mobile"
                            style={{
                              position: 'relative',
                              width: '100%',
                              overflow: 'hidden',
                              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                              border: '1px solid rgba(0, 0, 0, 0.08)',
                              borderRadius: '16px',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
                              backdropFilter: 'blur(20px)',
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                          {/* Поиск проектов */}
                          <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                            <input
                              type="text"
                              value={projectSearchQuery}
                              onChange={(e) => setProjectSearchQuery(e.target.value)}
                              placeholder={t('searchProjects')}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                              }}
                            />
                          </div>
                          {/* Список проектов */}
                          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {isLoadingProjects ? (
                              <div style={{ padding: '2rem', textAlign: 'center', color: '#6a6a6a', fontSize: '0.875rem' }}>
                                {tCommon('loading')}
                              </div>
                            ) : filteredProjects.length > 0 ? (
                              filteredProjects.map((project) => (
                                <button
                                  key={project.id}
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, projectId: project.id, projectName: project.title });
                                    setIsProjectDropdownOpen(false);
                                    setProjectSearchQuery('');
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: formData.projectId === project.id ? '#f5f5f5' : 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'background 0.2s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (formData.projectId !== project.id) {
                                      e.currentTarget.style.background = '#fafafa';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (formData.projectId !== project.id) {
                                      e.currentTarget.style.background = 'transparent';
                                    }
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ 
                                        fontWeight: formData.projectId === project.id ? 600 : 500,
                                        fontSize: '0.9375rem',
                                        color: '#1a1a1a',
                                        marginBottom: '0.25rem',
                                      }}>
                                        {project.title}
                                      </div>
                                      <div style={{ 
                                        fontSize: '0.8125rem',
                                        color: '#666',
                                        marginBottom: '0.25rem',
                                      }}>
                                        {project.description}
                                      </div>
                                      <div style={{ 
                                        fontSize: '0.75rem',
                                        color: '#999',
                                      }}>
                                        {project.category} • {project.id}
                                      </div>
                                    </div>
                                    {formData.projectId === project.id && (
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1a1a1a" strokeWidth="2">
                                        <path d="M13.5 4.5L6 12L2.5 8.5" />
                                      </svg>
                                    )}
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '0.875rem' }}>
                                {t('noProjectsFound')}
                              </div>
                            )}
                          </div>
                          {/* Кнопка очистки выбора */}
                          {formData.projectId && (
                            <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, projectId: '' });
                                  setIsProjectDropdownOpen(false);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  background: 'transparent',
                                  border: '1px solid rgba(0, 0, 0, 0.1)',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                  color: '#666',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f5f5f5';
                                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                                }}
                              >
                                Очистить выбор
                              </button>
                            </div>
                          )}
                        </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="premium-form-buttons" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  <motion.button
                    type="button"
                    className="premium-form-submit-button"
                    onClick={handleCreateRecurring}
                    disabled={isCreating || paymentCards.length === 0}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                      fontSize: '1rem', 
                      padding: '14px 28px',
                      background: isCreating || paymentCards.length === 0
                        ? 'linear-gradient(135deg, #cccccc 0%, #aaaaaa 100%)'
                        : 'linear-gradient(135deg, #0a0a0a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '16px',
                      cursor: isCreating || paymentCards.length === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      letterSpacing: '-0.01em',
                      boxShadow: isCreating || paymentCards.length === 0
                        ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                        : '0 4px 16px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {isCreating ? t('creating') : t('createRecurring')}
                  </motion.button>
                  <motion.button
                    type="button"
                    className="premium-form-secondary-button"
                    onClick={() => router.push('/catalog')}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                      fontSize: '1rem', 
                      padding: '14px 28px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                      color: '#0a0a0a',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      letterSpacing: '-0.01em',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    Посмотреть проекты
                  </motion.button>
                  <motion.button
                    type="button"
                    className="premium-form-tertiary-button"
                    onClick={() => setActiveTab('active')}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '14px 28px',
                      background: 'transparent',
                      color: '#0a0a0a',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      fontSize: '1rem',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Назад к подпискам
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <CustomConfirm
        isOpen={showCancelConfirm}
        onClose={() => {
          setShowCancelConfirm(false);
          setCancelPaymentId(null);
          if (confirmingPaymentId) {
            const paymentId = confirmingPaymentId;
            setConfirmingPaymentId(null);
            setTimeout(() => {
              buttonContainerRefs.current[paymentId] = 0;
            }, 250);
          }
        }}
        onConfirm={() => {
          if (cancelPaymentId) {
            handleConfirmDelete(cancelPaymentId);
          }
        }}
        title={t('cancelSubscription')}
        message={t('cancelSubscriptionConfirm')}
        confirmText={t('cancelSubscription')}
        cancelText={t('keepSubscription')}
        type="danger"
      />

      {/* Модальное окно редактирования подписки */}
      <AnimatePresence>
        {showEditModal && editingPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
            onClick={() => !isUpdating && setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '3rem',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 2rem 0' }}>
                {t('editSubscriptionTitle')}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>
                    {t('project')} *
                  </label>
                  <input
                    type="text"
                    value={editFormData.projectName}
                    onChange={(e) => setEditFormData({ ...editFormData, projectName: e.target.value })}
                    placeholder={t('projectPlaceholder')}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>
                    {t('amountLabel')} *
                  </label>
                  <input
                    type="number"
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                    placeholder="1000"
                    min="1"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>
                    {t('description')}
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    placeholder={t('descriptionPlaceholder')}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>
                    Дата следующего платежа
                  </label>
                  <input
                    type="date"
                    value={editFormData.nextPaymentDate}
                    onChange={(e) => setEditFormData({ ...editFormData, nextPaymentDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="premium-button"
                  onClick={handleUpdateRecurring}
                  disabled={isUpdating}
                  style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem', flex: 1 }}
                >
                  {isUpdating ? t('saving') : t('save')}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPayment(null);
                    setEditFormData({
                      projectName: '',
                      amount: '',
                      description: '',
                      nextPaymentDate: '',
                    });
                  }}
                  disabled={isUpdating}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    color: '#1a1a1a',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    fontSize: '0.875rem',
                  }}
                >
                  {tCommon('cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomNotification
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
      <Footer />
    </div>
  );
}
