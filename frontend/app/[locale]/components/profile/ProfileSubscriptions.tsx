'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/src/routing';
import { getApiUrl } from '@/src/config';
import { useAuth } from '../../../contexts/AuthContext';

interface Subscription {
  id: string;
  planId: string;
  plan: {
    id: string;
    type: string;
    name: string;
    description: string;
    price: number;
    billingPeriod: string;
    features: string[];
    includesAI: boolean;
    includesAdvancedReports: boolean;
    includesPrioritySupport: boolean;
  };
  paymentMethod: {
    id: string;
    last4: string;
    brand: string;
    cardType: string;
  } | null;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  nextBillingDate: string;
  cancelledAt: string | null;
  expiresAt: string | null;
  amount: number;
  autoRenew: boolean;
  createdAt: string;
}

interface SubscriptionPlan {
  id: string;
  type: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: string;
  features: string[];
  includesAI: boolean;
  includesAdvancedReports: boolean;
  includesPrioritySupport: boolean;
}

interface PaymentMethod {
  id: string;
  cardType: string;
  last4: string;
  cardholderName: string | null;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  brand: string;
}

export default function ProfileSubscriptions() {
  const t = useTranslations('profilePage');
  const router = useRouter();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError(t('authRequired'));
        return;
      }

      // Загружаем подписки, планы и карты параллельно
      const [subscriptionsRes, plansRes, cardsRes] = await Promise.all([
        fetch(getApiUrl('/subscriptions'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(getApiUrl('/subscriptions/plans'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(getApiUrl('/payments/cards'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      if (subscriptionsRes.ok) {
        const subscriptionsData = await subscriptionsRes.json();
        if (subscriptionsData.success) {
          setSubscriptions(subscriptionsData.subscriptions || []);
        }
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        if (plansData.success) {
          setPlans(plansData.plans || []);
        }
      }

      if (cardsRes.ok) {
        const cardsData = await cardsRes.json();
        if (cardsData.success) {
          setPaymentMethods(cardsData.cards || []);
          // Устанавливаем первую карту по умолчанию, если есть
          if (cardsData.cards && cardsData.cards.length > 0) {
            const defaultCard = cardsData.cards.find((c: PaymentMethod) => c.isDefault) || cardsData.cards[0];
            setSelectedPaymentMethod(defaultCard.id);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(t('dataLoadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseClick = (plan: SubscriptionPlan) => {
    if (paymentMethods.length === 0) {
      // Если нет карт, перекидываем на страницу платежей через URL параметр
      router.push('/profile?tab=payments');
      return;
    }
    setSelectedPlan(plan);
    setShowPurchaseModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedPlan || !selectedPaymentMethod) return;

    try {
      setIsProcessing(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError(t('authRequired'));
        return;
      }

      const requestBody = {
        planId: selectedPlan.id,
        paymentMethodId: selectedPaymentMethod,
      };
      
      console.log('Creating subscription with:', requestBody);
      
      const res = await fetch(getApiUrl('/subscriptions'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setShowPurchaseModal(false);
          setSelectedPlan(null);
          setSelectedPaymentMethod(null);
          setError(null);
          // Обновляем данные
          await fetchData();
        }
      } else {
        const errorData = await res.json().catch(() => ({ message: t('unknownError') }));
        const errorMsg = errorData.message || errorData.error || t('subscriptionPurchaseError');
        setError(errorMsg);
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
        console.error('Subscription purchase error:', errorData);
      }
    } catch (err) {
      console.error('Error purchasing subscription:', err);
      const errorMsg = t('subscriptionPurchaseError');
      setError(errorMsg);
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelClick = (subscriptionId: string) => {
    setSubscriptionToCancel(subscriptionId);
    setShowCancelModal(true);
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionToCancel) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError(t('authRequired'));
        setErrorMessage(t('authRequired'));
        setShowErrorModal(true);
        setShowCancelModal(false);
        return;
      }

      const res = await fetch(getApiUrl(`/subscriptions/${subscriptionToCancel}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        setShowCancelModal(false);
        setSubscriptionToCancel(null);
        // Обновляем данные
        await fetchData();
      } else {
        const errorData = await res.json();
        const errorMsg = errorData.message || t('subscriptionCancelError');
        setError(errorMsg);
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
        setShowCancelModal(false);
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError(t('subscriptionCancelError'));
      setErrorMessage(t('subscriptionCancelError'));
      setShowErrorModal(true);
      setShowCancelModal(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: '#666' }}>Загрузка подписок...</div>
      </div>
    );
  }

  if (error && !subscriptions.length && !plans.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: '#d32f2f' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '32px', color: '#1a1a1a' }}>
        Мои подписки
      </h1>

      {/* Активные подписки */}
      {subscriptions.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: '#1a1a1a' }}>
            Активные подписки
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="profile-subscription-card-wrapper">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="profile-subscription-card"
                >
                  <div className="profile-subscription-card-content">
                    <div className="profile-subscription-info">
                      <div className="profile-subscription-header">
                        <h3 className="profile-subscription-title">
                          {subscription.plan.name}
                        </h3>
                        <div className="profile-subscription-status-badge">
                          <div style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                            background: subscription.status === 'active' ? '#e8f5e9' : '#fff3e0',
                            color: subscription.status === 'active' ? '#2e7d32' : '#f57c00',
                          }}>
                            {
                              subscription.status === 'active' ? 'Активна' :
                              subscription.status === 'paused' ? 'Приостановлена' :
                              'Отменена'
                            }
                          </div>
                          {subscription.status === 'active' && (
                            <button
                              onClick={() => handleCancelClick(subscription.id)}
                              className="profile-subscription-cancel-button profile-subscription-cancel-button-desktop"
                            >
                              Отменить подписку
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="profile-subscription-details">
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                          Сумма: {subscription.amount.toLocaleString('ru-RU')} ₽ / {
                            subscription.plan.billingPeriod === 'monthly' ? 'месяц' : 'год'
                          }
                        </div>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                          Следующий платеж: {new Date(subscription.nextBillingDate).toLocaleDateString('ru-RU')}
                        </div>
                        {subscription.paymentMethod && (
                          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                            Карта: {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
                          </div>
                        )}
                        {subscription.cancelledAt && (
                          <div style={{ fontSize: '14px', color: '#f57c00', marginTop: '8px' }}>
                            Подписка будет отменена: {new Date(subscription.expiresAt || subscription.nextBillingDate).toLocaleDateString('ru-RU')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
                {subscription.status === 'active' && (
                  <div className="profile-subscription-cancel-button-wrapper">
                    <button
                      onClick={() => handleCancelClick(subscription.id)}
                      className="profile-subscription-cancel-button"
                    >
                      Отменить подписку
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Доступные планы */}
      {plans.length > 0 && (
        <div className="profile-subscription-plans-section">
          <h2 className="profile-subscription-plans-title">
            Доступные планы
          </h2>
          <div className="profile-subscription-plans-grid">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="profile-subscription-plan-card"
              >
                {plan.type === 'premium' && (
                  <div className="profile-subscription-plan-badge">
                    Популярный
                  </div>
                )}
                <h3 className={`profile-subscription-plan-title ${plan.type === 'premium' ? 'profile-subscription-plan-title-with-badge' : ''}`}>
                  {plan.name}
                </h3>
                <div className="profile-subscription-plan-description">
                  {plan.description}
                </div>
                <div className="profile-subscription-plan-price">
                  <span className="profile-subscription-plan-price-amount">
                    {plan.price.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="profile-subscription-plan-price-period">
                    / {plan.billingPeriod === 'monthly' ? 'месяц' : 'год'}
                  </span>
                </div>
                <ul className="profile-subscription-plan-features">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="profile-subscription-plan-feature">
                      <span className="profile-subscription-plan-feature-icon">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePurchaseClick(plan)}
                  className={`profile-subscription-plan-button ${plan.type === 'premium' ? 'profile-subscription-plan-button-premium' : ''}`}
                >
                  {paymentMethods.length === 0 ? 'Добавить карту' : 'Оформить подписку'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Модальное окно покупки */}
      <AnimatePresence>
        {showPurchaseModal && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => !isProcessing && setShowPurchaseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: '#1a1a1a' }}>
                Оформление подписки: {selectedPlan.name}
              </h2>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#1a1a1a' }}>
                  Сумма: {selectedPlan.price.toLocaleString('ru-RU')} ₽ / {
                    selectedPlan.billingPeriod === 'monthly' ? 'месяц' : 'год'
                  }
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
                  Выберите карту для оплаты
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {paymentMethods.map((card) => (
                    <label
                      key={card.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        border: selectedPaymentMethod === card.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: selectedPaymentMethod === card.id ? '#e3f2fd' : '#fff',
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={card.id}
                        checked={selectedPaymentMethod === card.id}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        style={{ marginRight: '12px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: 500, color: '#1a1a1a' }}>
                          {card.brand} •••• {card.last4}
                        </div>
                        {card.isDefault && (
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            Основная карта
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setShowPurchaseModal(false);
                    router.push('/profile?tab=payments');
                  }}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '12px',
                    background: 'transparent',
                    border: '1px solid #1976d2',
                    borderRadius: '8px',
                    color: '#1976d2',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  + Добавить новую карту
                </button>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setSelectedPlan(null);
                    setSelectedPaymentMethod(null);
                  }}
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#333',
                    fontSize: '16px',
                    fontWeight: 500,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.6 : 1,
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={isProcessing || !selectedPaymentMethod}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: isProcessing || !selectedPaymentMethod ? '#ccc' : '#1976d2',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 500,
                    cursor: isProcessing || !selectedPaymentMethod ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isProcessing ? 'Обработка...' : 'Оформить подписку'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно подтверждения отмены */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
            }}
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '400px',
                width: '90%',
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                Отмена подписки
              </h2>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: '1.5' }}>
                Вы уверены, что хотите отменить подписку? Подписка останется активной до даты следующего списания.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSubscriptionToCancel(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#333',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleCancelSubscription}
                  style={{
                    padding: '10px 20px',
                    background: '#d32f2f',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Отменить подписку
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно ошибки */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
            }}
            onClick={() => {
              setShowErrorModal(false);
              setErrorMessage('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '400px',
                width: '90%',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#ffebee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#1a1a1a' }}>
                Ошибка
              </h2>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: '1.5' }}>
                {errorMessage || 'Произошла ошибка'}
              </p>
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setErrorMessage('');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1976d2',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Понятно
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
