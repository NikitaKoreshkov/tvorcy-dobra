'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CreditCardIcon, DownloadIcon, RepeatIcon } from '../Icons';
import { getApiUrl } from '@/src/config';
import CustomNotification from '../CustomNotification';
import { useRouter } from '@/src/routing';

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

interface AddCardFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  type: 'one-time' | 'recurring';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
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

export default function ProfilePayments() {
  const t = useTranslations('profilePage');
  const router = useRouter();
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditRecurringModal, setShowEditRecurringModal] = useState(false);
  const [editingRecurringPayment, setEditingRecurringPayment] = useState<RecurringPayment | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
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
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<PaymentCard | null>(null);
  const [isDeletingCard, setIsDeletingCard] = useState(false);
  const buttonContainerRefs = useRef<Record<string, number>>({});
  const [formData, setFormData] = useState<AddCardFormData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    isDefault: false,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AddCardFormData, string>>>({});

  // Загрузка карт
  const fetchCards = async () => {
    try {
      setIsLoading(true);
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
          setCards(data.cards || []);
        }
      } else if (res.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Error fetching cards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка транзакций
  const fetchTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const url = new URL(getApiUrl('/transactions'));
      url.searchParams.append('sortBy', sortBy);
      url.searchParams.append('sortOrder', sortOrder);

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const trans = data.transactions || [];
          setTransactions(trans);
          
          // Если транзакций нет, создаем тестовые
          if (trans.length === 0) {
            await createTestTransactions();
          }
        }
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Загрузка регулярных платежей
  const fetchRecurringPayments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

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
      }
    } catch (err) {
      console.error('Error fetching recurring payments:', err);
    }
  };

  // Создание тестовых транзакций (если их нет)
  const createTestTransactions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(getApiUrl('/transactions/create-test'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Перезагружаем транзакции после создания
          setTimeout(async () => {
            await fetchTransactions();
            await fetchRecurringPayments();
          }, 500);
        }
      }
    } catch (err) {
      console.error('Error creating test transactions:', err);
    }
  };

  // Обновление регулярного платежа
  const handleUpdateRecurring = async (paymentId: string, updateData: {
    amount?: number;
    projectName?: string;
    description?: string;
    nextPaymentDate?: string;
  }) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(getApiUrl(`/transactions/recurring/${paymentId}`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        setShowEditRecurringModal(false);
        setEditingRecurringPayment(null);
        await fetchRecurringPayments();
        await fetchTransactions();
      } else {
        const data = await res.json();
        setError(data.message || t('paymentUpdateError'));
      }
    } catch (err) {
      setError(t('paymentUpdateError'));
      console.error('Error updating recurring payment:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Переключение режима подтверждения отмены
  const handleCancelRecurring = (paymentId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    // Сохраняем ширину контейнера перед слиянием
    const container = (event?.currentTarget as HTMLElement)?.closest('.recurring-payment-buttons') as HTMLElement;
    if (container && !buttonContainerRefs.current[paymentId]) {
      buttonContainerRefs.current[paymentId] = container.offsetWidth;
    }
    setConfirmingPaymentId(paymentId);
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
        await fetchTransactions();
        setConfirmingPaymentId(null);
        // Очищаем сохраненную ширину после удаления (элемент удаляется, анимация не нужна)
        buttonContainerRefs.current[paymentId] = 0;
      } else {
        let errorMessage = t('paymentCancelError');
        try {
          const data = await res.json();
          errorMessage = data.message || errorMessage;
        } catch (e) {
          errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
        }
        setError(errorMessage);
        setConfirmingPaymentId(null);
        // Очищаем сохраненную ширину после завершения обратной анимации
        setTimeout(() => {
          buttonContainerRefs.current[paymentId] = 0;
        }, 250);
        console.error('Delete request failed:', res.status, res.statusText, paymentId);
      }
    } catch (err) {
      setError(t('paymentCancelError'));
      setConfirmingPaymentId(null);
      // Очищаем сохраненную ширину после завершения обратной анимации
      setTimeout(() => {
        buttonContainerRefs.current[paymentId] = 0;
      }, 250);
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
          // Очищаем сохраненную ширину после завершения анимации
          setTimeout(() => {
            buttonContainerRefs.current[paymentId] = 0;
          }, 250);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [confirmingPaymentId]);

  // Закрытие dropdown сортировки при клике вне его
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.sort-dropdown-container')) {
        setIsSortDropdownOpen(false);
      }
    };

    if (isSortDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  // Скачивание квитанции
  const handleDownloadReceipt = async (transactionId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const url = getApiUrl(`/transactions/${transactionId}/receipt`);
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const html = await res.text();
        const blob = new Blob([html], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${transactionId.slice(0, 8)}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setNotification({
          isOpen: true,
          type: 'success',
          title: t('receiptDownloaded'),
          message: t('receiptDownloadedMessage'),
        });
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: t('receiptDownloadError'),
          message: t('receiptDownloadErrorMessage'),
        });
      }
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: t('receiptDownloadError'),
        message: t('receiptDownloadErrorGeneral'),
      });
      console.error('Error downloading receipt:', err);
    }
  };

  // Обработка изменения сортировки
  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC');
    } else {
      setSortBy(newSortBy);
      setSortOrder('DESC');
    }
    setIsSortDropdownOpen(false);
  };

  // Получение названия для сортировки
  const getSortLabel = (value: string) => {
    const labels: Record<string, string> = {
      'createdAt': 'Дате',
      'amount': 'Сумме',
      'status': 'Статусу',
      'projectName': 'Проекту',
    };
    return labels[value] || value;
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCards();
      await fetchTransactions();
      await fetchRecurringPayments();
    };
    
    loadData();
  }, []);

  // Перезагружаем транзакции при изменении сортировки
  useEffect(() => {
    if (!isLoadingTransactions) {
      fetchTransactions();
    }
  }, [sortBy, sortOrder]);

  // Валидация номера карты
  const validateCardNumber = (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    // Алгоритм Луна
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  // Форматирование номера карты
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AddCardFormData, string>> = {};

    if (!formData.cardNumber || !validateCardNumber(formData.cardNumber)) {
      errors.cardNumber = 'Неверный номер карты';
    }

    const month = parseInt(formData.expiryMonth, 10);
    if (!formData.expiryMonth || month < 1 || month > 12) {
      errors.expiryMonth = 'Неверный месяц';
    }

    const year = parseInt(formData.expiryYear, 10);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const fullYear = year < 100 ? 2000 + year : year; // Поддержка формата YY
    if (!formData.expiryYear || fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
      errors.expiryYear = 'Неверная дата истечения';
    }

    if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv)) {
      errors.cvv = 'CVV должен содержать 3-4 цифры';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Добавление карты
  const handleAddCard = async () => {
    setError(null);
    if (!validateForm()) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Ошибка валидации',
        message: 'Пожалуйста, проверьте корректность введённых данных',
      });
      return;
    }

    try {
      setIsAdding(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Ошибка авторизации',
          message: 'Необходима авторизация. Пожалуйста, войдите в систему',
        });
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      const res = await fetch(getApiUrl('/payments/cards'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          expiryMonth: formData.expiryMonth.padStart(2, '0'),
          expiryYear: formData.expiryYear,
          cvv: formData.cvv,
          cardholderName: formData.cardholderName || undefined,
          isDefault: formData.isDefault,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setShowAddModal(false);
        setFormData({
          cardNumber: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          cardholderName: '',
          isDefault: false,
        });
        setFormErrors({});
        await fetchCards();
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Успешно',
          message: 'Карта успешно добавлена',
        });
      } else {
        const errorMessage = data.message || 'Ошибка добавления карты';
        setError(errorMessage);
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Ошибка',
          message: errorMessage.includes('duplicate') || errorMessage.includes('уже существует') 
            ? 'Эта карта уже добавлена в систему' 
            : errorMessage,
        });
      }
    } catch (err) {
      const errorMsg = 'Ошибка при добавлении карты. Проверьте подключение к интернету';
      setError(errorMsg);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: errorMsg,
      });
      console.error('Error adding card:', err);
    } finally {
      setIsAdding(false);
    }
  };

  // Открытие модального окна подтверждения удаления карты
  const handleDeleteCardClick = (card: PaymentCard) => {
    setCardToDelete(card);
  };

  // Удаление карты
  const handleDeleteCard = async () => {
    if (!cardToDelete) return;

    try {
      setIsDeletingCard(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Ошибка авторизации',
          message: 'Необходима авторизация. Пожалуйста, войдите в систему',
        });
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      const res = await fetch(getApiUrl(`/payments/cards/${cardToDelete.id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        setCardToDelete(null);
        setError(null);
        await fetchCards();
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Успешно',
          message: 'Карта успешно удалена',
        });
      } else {
        const data = await res.json();
        const errorMessage = data.message || 'Ошибка удаления карты';
        setError(errorMessage);
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Ошибка',
          message: errorMessage.includes('in use') || errorMessage.includes('используется')
            ? 'Невозможно удалить карту, которая используется в активных подписках'
            : errorMessage,
        });
      }
    } catch (err) {
      const errorMsg = 'Ошибка при удалении карты. Проверьте подключение к интернету';
      setError(errorMsg);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: errorMsg,
      });
      console.error('Error deleting card:', err);
    } finally {
      setIsDeletingCard(false);
    }
  };

  // Установка основной карты
  const handleSetDefault = async (cardId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Ошибка авторизации',
          message: 'Необходима авторизация. Пожалуйста, войдите в систему',
        });
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      const res = await fetch(getApiUrl(`/payments/cards/${cardId}/default`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        await fetchCards();
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Успешно',
          message: 'Карта установлена как основная',
        });
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Ошибка',
          message: 'Не удалось установить карту как основную',
        });
      }
    } catch (err) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: 'Ошибка при установке основной карты. Проверьте подключение к интернету',
      });
      console.error('Error setting default card:', err);
    }
  };

  // Получение иконки карты
  const getCardIcon = (cardType: string): string => {
    switch (cardType) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'mir':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  if (isLoading) {
    return (
      <div className="profile-payments">
        <div className="premium-content-header">
          <h2 className="premium-content-title">Платежи и история транзакций</h2>
          <p className="premium-content-intro">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="profile-payments">
      <motion.div
        className="premium-content-header"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="premium-content-title">Платежи и история транзакций</h2>
        <p className="premium-content-intro">
          Управляйте вашими платёжными методами и просматривайте историю транзакций.
        </p>
      </motion.div>

      {/* Платёжные способы */}
        <motion.div
        className="profile-payment-methods"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
        <div className="profile-payment-methods-header">
          <h3 className="profile-section-title">Платёжные способы</h3>
          <button
            className="premium-button profile-payment-add-button"
            onClick={() => setShowAddModal(true)}
          >
            + Добавить карту
          </button>
        </div>

        {cards.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: '#fafafa',
            borderRadius: '12px',
            border: '1px dashed #e0e0e0',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
              У вас пока нет добавленных карт
            </p>
            <button
              className="premium-button"
              onClick={() => setShowAddModal(true)}
            >
              Добавить карту
            </button>
          </div>
        ) : (
          <div className="profile-payment-methods-list">
            {cards.map((card) => (
              <motion.div
                key={card.id}
                className={`profile-payment-method-card ${card.isDefault ? 'profile-payment-method-card-default' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="profile-payment-method-icon">
                  {getCardIcon(card.cardType)}
                </div>
                <div className="profile-payment-method-content">
                  <div className="profile-payment-method-header">
                    <h4 className="profile-payment-method-title">
                      {card.brand} •••• {card.last4}
                    </h4>
                    {card.isDefault && (
                      <span className="profile-payment-method-default-badge">
                        Основная
                      </span>
                    )}
                  </div>
                  {card.cardholderName && (
                    <p className="profile-payment-method-cardholder">
                      {card.cardholderName}
                    </p>
                  )}
                  <p className="profile-payment-method-expiry">
                    Истекает: {card.expiryMonth}/{card.expiryYear.slice(-2)}
                  </p>
                </div>
                <div className="profile-payment-method-actions">
                  {!card.isDefault && (
                    <button
                      className="profile-payment-method-action-button"
                      onClick={() => handleSetDefault(card.id)}
                    >
                      Сделать основной
                    </button>
                  )}
                  <button
                    className="profile-payment-method-action-button profile-payment-method-delete-button"
                    onClick={() => handleDeleteCardClick(card)}
                  >
                    Удалить
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Автопожертвования */}
      <motion.div
        className="profile-recurring-payments"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        style={{ marginTop: '40px' }}
      >
        <div className="profile-section-header">
          <h3 className="profile-section-title">Автопожертвования</h3>
          <button
            className="premium-button profile-section-action-button"
            onClick={() => router.push('/profile/subscriptions?tab=create')}
          >
            + Создать автопожертвование
          </button>
        </div>
        
        <div style={{
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          borderRadius: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a1a1a', margin: '0 0 0.75rem 0' }}>
            Настройте регулярные пожертвования
          </h4>
          <p style={{ fontSize: '0.9375rem', color: '#666', margin: '0 0 1.5rem 0', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
            Автоматически помогайте проектам каждый месяц. Управляйте подписками, изменяйте суммы и отменяйте в любое время.
          </p>
          <button
            className="premium-button"
            onClick={() => router.push('/profile/subscriptions')}
            style={{ fontSize: '0.9375rem', padding: '0.875rem 2rem' }}
          >
            Перейти к автопожертвованиям
          </button>
        </div>
      </motion.div>

      {/* Регулярные платежи */}
      {recurringPayments.length > 0 && (
        <motion.div
          className="profile-recurring-payments"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ marginTop: '40px' }}
        >
          <h3 className="profile-section-title">Регулярные пожертвования</h3>
          <div className="profile-recurring-payments-list">
            {recurringPayments.map((payment) => (
              <motion.div
                key={payment.id}
                className="profile-recurring-payment-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px',
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  overflow: 'hidden',
                  minWidth: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 16px)', flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'clamp(20px, 5vw, 32px)', flexShrink: 0, width: 'clamp(20px, 5vw, 32px)', height: 'clamp(20px, 5vw, 32px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RepeatIcon />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 600 }}>
                      {payment.projectName}
                    </h4>
                    <p style={{ margin: '4px 0', fontSize: 'clamp(14px, 3.5vw, 16px)', color: '#666' }}>
                      {(payment.amount / 100).toLocaleString('ru-RU')} ₽ ежемесячно
                    </p>
                    {payment.nextPaymentDate && (
                      <p style={{ margin: '4px 0', fontSize: 'clamp(12px, 3vw, 14px)', color: '#999' }}>
                        Следующий платёж: {new Date(payment.nextPaymentDate).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                    {payment.paymentMethod && (
                      <p style={{ margin: '4px 0', fontSize: 'clamp(12px, 3vw, 14px)', color: '#999' }}>
                        Карта: {payment.paymentMethod.brand} •••• {payment.paymentMethod.last4}
                      </p>
                    )}
                  </div>
                </div>
                <div 
                  className="recurring-payment-buttons" 
                  onClick={(e) => e.stopPropagation()}
                  style={{ 
                    display: 'flex', 
                    gap: confirmingPaymentId === payment.id ? '0px' : '8px',
                    position: 'relative',
                    alignItems: 'center',
                    transition: 'gap 0.2s cubic-bezier(0.25, 0.1, 0.25, 1), width 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    minHeight: '36px',
                    maxWidth: '100%',
                    width: buttonContainerRefs.current[payment.id] && buttonContainerRefs.current[payment.id] > 0
                      ? `${buttonContainerRefs.current[payment.id]}px` 
                      : 'auto',
                    flexShrink: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    boxSizing: 'border-box',
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
                      duration: 0.2, 
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    whileHover={confirmingPaymentId !== payment.id ? {} : {}}
                    whileTap={confirmingPaymentId !== payment.id ? {} : {}}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirmingPaymentId !== payment.id) {
                        setEditingRecurringPayment(payment);
                        setShowEditRecurringModal(true);
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (confirmingPaymentId !== payment.id) {
                        e.currentTarget.style.background = '#f5f5f5';
                        e.currentTarget.style.borderColor = '#d0d0d0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (confirmingPaymentId !== payment.id) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = '#e0e0e0';
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      background: 'transparent',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: confirmingPaymentId === payment.id ? 'default' : 'pointer',
                      color: '#666',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      transformOrigin: 'left center',
                      pointerEvents: confirmingPaymentId === payment.id ? 'none' : 'auto',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Изменить
                  </motion.button>
                  <motion.button
                    layout
                    initial={{ width: 'auto' }}
                    animate={{ 
                      width: confirmingPaymentId === payment.id ? '100%' : 'auto',
                      flex: confirmingPaymentId === payment.id ? 1 : 0,
                    }}
                    transition={{ 
                      duration: 0.2, 
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    whileHover={{}}
                    whileTap={{}}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirmingPaymentId === payment.id) {
                        handleConfirmDelete(payment.id, e);
                      } else {
                        handleCancelRecurring(payment.id, e);
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (confirmingPaymentId === payment.id) {
                        e.currentTarget.style.background = '#c0392b';
                      } else {
                        e.currentTarget.style.background = '#fff5f5';
                        e.currentTarget.style.borderColor = '#e74c3c';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (confirmingPaymentId === payment.id) {
                        e.currentTarget.style.background = '#e74c3c';
                      } else {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = '#e0e0e0';
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      background: confirmingPaymentId === payment.id ? '#e74c3c' : 'transparent',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: confirmingPaymentId === payment.id ? '#fff' : '#e74c3c',
                      fontWeight: confirmingPaymentId === payment.id ? 500 : 400,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                      transformOrigin: 'right center',
                      minWidth: confirmingPaymentId === payment.id ? 0 : 'fit-content',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      flexShrink: 1,
                      overflow: 'hidden',
                    }}
                  >
                    {confirmingPaymentId === payment.id ? 'Удалить' : 'Отменить'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* История транзакций */}
      <motion.div
        className="profile-transactions"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{ marginTop: '40px' }}
      >
        <div className="profile-transactions-header">
          <h3 className="profile-section-title">История транзакций</h3>
          <div className="profile-transactions-sort">
            <span style={{ fontSize: '14px', color: '#666', marginRight: '8px' }}>Сортировать по:</span>
            <div className="sort-dropdown-container" style={{ position: 'relative' }}>
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  background: '#fff',
                  color: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '140px',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d0d0d0';
                  e.currentTarget.style.background = '#fafafa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.background = '#fff';
                }}
              >
                <span>{getSortLabel(sortBy)}</span>
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 12 12" 
                  fill="none" 
                  style={{
                    transform: isSortDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <path d="M6 9L1 4H11L6 9Z" fill="currentColor" />
                </svg>
              </button>
              <AnimatePresence>
                {isSortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '4px',
                      background: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      zIndex: 1000,
                      minWidth: '140px',
                      overflow: 'hidden',
                    }}
                  >
                    {[
                      { value: 'createdAt', label: 'Дате' },
                      { value: 'amount', label: 'Сумме' },
                      { value: 'status', label: 'Статусу' },
                      { value: 'projectName', label: 'Проекту' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          fontSize: '14px',
                          textAlign: 'left',
                          background: sortBy === option.value ? '#f5f5f5' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#1a1a1a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (sortBy !== option.value) {
                            e.currentTarget.style.background = '#fafafa';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (sortBy !== option.value) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <span>{option.label}</span>
                        {sortBy === option.value && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC')}
              style={{
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                background: '#fff',
                color: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '36px',
                transition: 'all 0.2s ease',
              }}
              title={sortOrder === 'DESC' ? 'По убыванию' : 'По возрастанию'}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d0d0d0';
                e.currentTarget.style.background = '#fafafa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.background = '#fff';
              }}
            >
              {sortOrder === 'DESC' ? '↓' : '↑'}
            </button>
          </div>
        </div>
        {isLoadingTransactions ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            Загрузка транзакций...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: '#fafafa',
            borderRadius: '12px',
            border: '1px dashed #e0e0e0',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <p style={{ fontSize: '16px', color: '#666' }}>
              У вас пока нет транзакций
            </p>
          </div>
        ) : (
        <div className="profile-transactions-list">
          {transactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                className="profile-transaction-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="profile-transaction-content">
                  <div className="profile-transaction-header">
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                      {transaction.projectName}
                    </h4>
                {transaction.type === 'recurring' && (
                      <span style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        background: '#f0f0f0',
                        color: '#666',
                        borderRadius: '4px',
                        fontWeight: 500,
                      }}>
                        Регулярное
                      </span>
                    )}
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      background: transaction.status === 'completed' ? '#d4edda' : 
                                   transaction.status === 'pending' ? '#fff3cd' : 
                                   transaction.status === 'failed' ? '#f8d7da' : '#e2e3e5',
                      color: transaction.status === 'completed' ? '#155724' : 
                             transaction.status === 'pending' ? '#856404' : 
                             transaction.status === 'failed' ? '#721c24' : '#383d41',
                      borderRadius: '4px',
                      fontWeight: 500,
                    }}>
                      {transaction.status === 'completed' ? 'Завершено' :
                       transaction.status === 'pending' ? 'В обработке' :
                       transaction.status === 'failed' ? 'Ошибка' :
                       transaction.status === 'cancelled' ? 'Отменено' : 'Возврат'}
                    </span>
              </div>
                  {transaction.description && (
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                      {transaction.description}
                    </p>
                  )}
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#999' }}>
                    {new Date(transaction.createdAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {transaction.paymentMethod && (
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#999' }}>
                      Карта: {transaction.paymentMethod.brand} •••• {transaction.paymentMethod.last4}
                    </p>
                  )}
                </div>
                <div className="profile-transaction-actions">
                  <div className="profile-transaction-amount">
                    {(transaction.amount / 100).toLocaleString('ru-RU')} ₽
                  </div>
                  <button
                    className="profile-transaction-download-button"
                    onClick={() => handleDownloadReceipt(transaction.id)}
                    title="Скачать квитанцию"
                  >
                    <DownloadIcon />
                  </button>
                </div>
              </motion.div>
          ))}
        </div>
        )}
      </motion.div>


      {/* Модальное окно редактирования регулярного платежа */}
      <AnimatePresence>
        {showEditRecurringModal && editingRecurringPayment && (
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
            onClick={() => !isUpdating && setShowEditRecurringModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
            >
              <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>
                Изменить регулярный платёж
              </h3>

              {error && (
                <div style={{
                  padding: '12px',
                  background: '#fee',
                  border: '1px solid #fcc',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  color: '#c33',
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  Название проекта *
                </label>
                <input
                  type="text"
                  defaultValue={editingRecurringPayment.projectName}
                  id="edit-project-name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  Сумма (в рублях) *
                </label>
                <input
                  type="number"
                  defaultValue={editingRecurringPayment.amount / 100}
                  id="edit-amount"
                  min="1"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  Описание
                </label>
                <textarea
                  defaultValue={editingRecurringPayment.description || ''}
                  id="edit-description"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  Дата следующего платежа
                </label>
                <input
                  type="date"
                  defaultValue={editingRecurringPayment.nextPaymentDate ? new Date(editingRecurringPayment.nextPaymentDate).toISOString().split('T')[0] : ''}
                  id="edit-next-payment-date"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={async () => {
                    const projectName = (document.getElementById('edit-project-name') as HTMLInputElement)?.value;
                    const amount = parseFloat((document.getElementById('edit-amount') as HTMLInputElement)?.value || '0');
                    const description = (document.getElementById('edit-description') as HTMLTextAreaElement)?.value;
                    const nextPaymentDate = (document.getElementById('edit-next-payment-date') as HTMLInputElement)?.value;

                    if (!projectName || !amount || amount <= 0) {
                      setError('Заполните все обязательные поля');
                      return;
                    }

                    await handleUpdateRecurring(editingRecurringPayment.id, {
                      projectName,
                      amount: Math.round(amount * 100), // Конвертируем в копейки
                      description: description || undefined,
                      nextPaymentDate: nextPaymentDate || undefined,
                    });
                  }}
                  disabled={isUpdating}
                  className="premium-button"
                  style={{ flex: 1, padding: '14px', fontSize: '16px' }}
                >
                  {isUpdating ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  onClick={() => {
                    setShowEditRecurringModal(false);
                    setEditingRecurringPayment(null);
                    setError(null);
                  }}
                  disabled={isUpdating}
                  style={{
                    padding: '14px 24px',
                    fontSize: '16px',
                    background: 'transparent',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно добавления карты */}
      <AnimatePresence>
        {showAddModal && (
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
            onClick={() => !isAdding && setShowAddModal(false)}
          >
      <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="add-card-modal"
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxSizing: 'border-box',
              }}
            >
              <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>
                Добавить новую карту
              </h3>

              {error && (
                <div style={{
                  padding: '12px',
                  background: '#fee',
                  border: '1px solid #fcc',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  color: '#c33',
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  Номер карты *
                </label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value.replace(/\D/g, ''));
                    setFormData({ ...formData, cardNumber: formatted });
                    if (formErrors.cardNumber) {
                      setFormErrors({ ...formErrors, cardNumber: undefined });
                    }
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${formErrors.cardNumber ? '#e74c3c' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                />
                {formErrors.cardNumber && (
                  <p style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.cardNumber}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                    Месяц *
                  </label>
                  <input
                    type="text"
                    value={formData.expiryMonth}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                      setFormData({ ...formData, expiryMonth: value });
                      if (formErrors.expiryMonth) {
                        setFormErrors({ ...formErrors, expiryMonth: undefined });
                      }
                    }}
                    placeholder="MM"
                    maxLength={2}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${formErrors.expiryMonth ? '#e74c3c' : '#e0e0e0'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                    }}
                  />
                  {formErrors.expiryMonth && (
                    <p style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.expiryMonth}
                    </p>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                    Год *
                  </label>
                  <input
                    type="text"
                    value={formData.expiryYear}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setFormData({ ...formData, expiryYear: value });
                      if (formErrors.expiryYear) {
                        setFormErrors({ ...formErrors, expiryYear: undefined });
                      }
                    }}
                    placeholder="YYYY"
                    maxLength={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${formErrors.expiryYear ? '#e74c3c' : '#e0e0e0'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                    }}
                  />
                  {formErrors.expiryYear && (
                    <p style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.expiryYear}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  CVV *
                </label>
                <input
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setFormData({ ...formData, cvv: value });
                    if (formErrors.cvv) {
                      setFormErrors({ ...formErrors, cvv: undefined });
                    }
                  }}
                  placeholder="123"
                  maxLength={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${formErrors.cvv ? '#e74c3c' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                />
                {formErrors.cvv && (
                  <p style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.cvv}
                  </p>
                )}
            </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  Имя держателя карты
                </label>
                <input
                  type="text"
                  value={formData.cardholderName}
                  onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                  placeholder="Иван Иванов"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                />
            </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px' }}>Сделать основной картой</span>
                </label>
        </div>

              <div className="add-card-modal-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleAddCard}
                  disabled={isAdding}
                  className="premium-button add-card-submit-button"
                  style={{ flex: 1, padding: '14px', fontSize: '16px', minWidth: '120px' }}
                >
                  {isAdding ? 'Добавление...' : 'Добавить карту'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      cardNumber: '',
                      expiryMonth: '',
                      expiryYear: '',
                      cvv: '',
                      cardholderName: '',
                      isDefault: false,
                    });
                    setFormErrors({});
                    setError(null);
                  }}
                  disabled={isAdding}
                  className="add-card-cancel-button"
                  style={{
                    padding: '14px 24px',
                    fontSize: '16px',
                    background: 'transparent',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    minWidth: '120px',
                  }}
                >
                  Отмена
                </button>
            </div>
            </motion.div>
      </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно подтверждения удаления карты */}
      <AnimatePresence>
        {cardToDelete && (
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
            onClick={() => !isDeletingCard && setCardToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                boxSizing: 'border-box',
              }}
              className="delete-card-modal"
            >
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 600, 
                marginBottom: '16px',
                color: '#1a1a1a',
              }}>
                Удалить карту?
              </h3>
              
              <p style={{ 
                fontSize: '16px', 
                color: '#666', 
                marginBottom: '24px',
                lineHeight: '1.5',
                wordBreak: 'break-word',
              }}>
                Вы уверены, что хотите удалить карту <strong>{cardToDelete.brand} •••• {cardToDelete.last4}</strong>? Это действие нельзя отменить.
              </p>

              {error && (
                <div style={{
                  padding: '12px',
                  background: '#fee',
                  border: '1px solid #fcc',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  color: '#c33',
                  fontSize: '14px',
                }}>
                  {error}
                </div>
              )}

              <div className="delete-card-modal-buttons" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setCardToDelete(null);
                    setError(null);
                  }}
                  disabled={isDeletingCard}
                  className="delete-card-cancel-button"
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    background: 'transparent',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: isDeletingCard ? 'not-allowed' : 'pointer',
                    color: '#666',
                    opacity: isDeletingCard ? 0.5 : 1,
                    whiteSpace: 'nowrap',
                    flex: '0 0 auto',
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleDeleteCard}
                  disabled={isDeletingCard}
                  className="delete-card-confirm-button"
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    background: '#e74c3c',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isDeletingCard ? 'not-allowed' : 'pointer',
                    color: '#fff',
                    fontWeight: 500,
                    opacity: isDeletingCard ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    flex: '0 0 auto',
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeletingCard) {
                      e.currentTarget.style.background = '#c0392b';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDeletingCard) {
                      e.currentTarget.style.background = '#e74c3c';
                    }
                  }}
                >
                  {isDeletingCard ? 'Удаление...' : 'Удалить'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    <CustomNotification
      isOpen={notification.isOpen}
      onClose={() => setNotification({ ...notification, isOpen: false })}
      type={notification.type}
      title={notification.title}
      message={notification.message}
    />
    </>
  );
}
