'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAuth } from '../../../contexts/AuthContext';
import { getApiUrl } from '@/src/config';
import { useRouter } from '@/src/routing';
import Tutorial from '../Tutorial';
import NextImage from 'next/image';
import CustomSelect from '../CustomSelect';

// Типы для drag and drop
interface DraggableItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  aspectRatio: '3:4' | '16:9' | '9:16' | '27:9';
}

export default function ProfileSettings() {
  const t = useTranslations('profilePage');
  const { user, logout, refreshAuth } = useAuth();
  const router = useRouter();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialKey, setTutorialKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Профиль
  const [name, setName] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileBackground, setProfileBackground] = useState('');
  const [profileBackgroundType, setProfileBackgroundType] = useState<'color' | 'image'>('color');
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState('#1b2838');
  
  // Фон всей страницы
  const [pageBackground, setPageBackground] = useState('');
  const [pageBackgroundType, setPageBackgroundType] = useState<'color' | 'image' | 'video'>('color');
  const [selectedPageBackgroundColor, setSelectedPageBackgroundColor] = useState('#1b2838');
  const pageBackgroundFileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOverPageBackground, setIsDraggingOverPageBackground] = useState(false);
  const [draggableItems, setDraggableItems] = useState<DraggableItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [isDraggingOverBackground, setIsDraggingOverBackground] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Мобильная адаптивность
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileColorPanel, setShowProfileColorPanel] = useState(false);
  const [showPageColorPanel, setShowPageColorPanel] = useState(false);
  
  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Биометрия
  const [hasBiometric, setHasBiometric] = useState(false);
  const [isCheckingBiometric, setIsCheckingBiometric] = useState(false);
  
  // Уведомления
  const [notificationSettings, setNotificationSettings] = useState({
    emailNewProjects: true,
    emailReports: true,
    emailNews: false,
    emailAchievements: true,
    emailGoalReminders: true,
    emailGoalCompleted: true,
  });
  
  // Цели
  const [goals, setGoals] = useState<any[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    description: '',
    targetValue: '',
    unit: 'людей',
    deadline: '',
  });
  const [showDeleteGoalModal, setShowDeleteGoalModal] = useState(false);
  const [goalIdToDelete, setGoalIdToDelete] = useState<string | null>(null);
  
  // Смена пароля
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordMethod, setPasswordMethod] = useState<'biometric' | 'code' | null>(null);
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [passwordCode, setPasswordCode] = useState(['', '', '', '', '', '']);
  const [codeVerified, setCodeVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Удаление аккаунта
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // Выход из аккаунта
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Кастомные уведомления
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);

  // Загрузка данных
  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user?.id]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // Загружаем профиль
      const profileRes = await fetch(getApiUrl('/settings/profile'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        console.log('Profile data loaded:', profileData);
        if (profileData.success && profileData.user) {
          const u = profileData.user;
          console.log('Setting profile data:', {
            name: u.name,
            description: u.profileDescription,
            avatar: u.profileAvatar,
            background: u.profileBackground,
            pageBackground: u.pageBackground,
            photos: u.profilePhotos,
          });
          setName(u.name || '');
          setProfileDescription(u.profileDescription || '');
          // Игнорируем blob URLs для аватара (они не работают после перезагрузки)
          if (u.profileAvatar && !u.profileAvatar.startsWith('blob:')) {
            // Если это base64 без префикса, добавляем его
            let avatarUrl = u.profileAvatar;
            if (avatarUrl && !avatarUrl.startsWith('data:') && !avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
              // Предполагаем, что это base64 изображение
              avatarUrl = `data:image/jpeg;base64,${avatarUrl}`;
            }
            setProfileAvatar(avatarUrl);
            console.log('Setting avatar URL:', avatarUrl);
          } else {
            setProfileAvatar('');
          }
          
          // Определяем тип фона мини-профиля: если это hex цвет (начинается с #) или короткий цвет - это цвет
          if (u.profileBackground) {
            const bg = u.profileBackground;
            // Игнорируем blob URLs (они не работают после перезагрузки)
            if (bg.startsWith('blob:')) {
              setProfileBackgroundType('color');
              setProfileBackground('');
              setSelectedBackgroundColor('#1b2838');
            } else if (bg.startsWith('#') || /^[a-zA-Z]+$/.test(bg)) {
              // Проверяем, является ли это цветом (hex код или короткое название)
              setProfileBackgroundType('color');
              setSelectedBackgroundColor(bg);
              setProfileBackground('');
            } else {
              // Это URL изображения или base64 (видео не поддерживается для мини-профиля)
              setProfileBackgroundType('image');
              setProfileBackground(bg);
            }
          } else {
            setProfileBackgroundType('color');
            setProfileBackground('');
            setSelectedBackgroundColor('#1b2838'); // Значение по умолчанию
          }
          
          // Определяем тип фона всей страницы
          if (u.pageBackground) {
            const bg = u.pageBackground;
            // Игнорируем blob URLs (они не работают после перезагрузки)
            if (bg.startsWith('blob:')) {
              setPageBackgroundType('color');
              setPageBackground('');
              setSelectedPageBackgroundColor('#1b2838');
            } else if (bg.startsWith('#') || /^[a-zA-Z]+$/.test(bg)) {
              // Проверяем, является ли это цветом (hex код или короткое название)
              setPageBackgroundType('color');
              setSelectedPageBackgroundColor(bg);
              setPageBackground('');
            } else {
              // Это URL изображения, видео или base64
              setPageBackgroundType(bg.match(/\.(mp4|webm|mov|avi)$/i) || bg.startsWith('data:video/') ? 'video' : 'image');
              setPageBackground(bg);
            }
          } else {
            setPageBackgroundType('color');
            setPageBackground('');
            setSelectedPageBackgroundColor('#1b2838'); // Значение по умолчанию
          }
          
          // Загружаем фотки (игнорируем blob URLs)
          if (u.profilePhotos && Array.isArray(u.profilePhotos) && u.profilePhotos.length > 0) {
            console.log('Loading photos:', u.profilePhotos);
            // Фильтруем blob URLs и оставляем только валидные URL или base64
            const validPhotos = u.profilePhotos.filter((url: string) => !url.startsWith('blob:'));
            if (validPhotos.length > 0) {
              const items: DraggableItem[] = validPhotos.map((url: string, index: number) => ({
                id: `photo-${index}`,
                type: 'photo',
                url,
                aspectRatio: '16:9', // По умолчанию
              }));
              setDraggableItems(items);
            } else {
              console.log('All photos are blob URLs, ignoring');
              setDraggableItems([]);
            }
          } else {
            console.log('No photos found or empty array');
            setDraggableItems([]);
          }
        }
      } else {
        console.error('Failed to load profile:', profileRes.status, profileRes.statusText);
      }

      // Загружаем биометрию
      const biometricRes = await fetch(getApiUrl('/settings/biometric'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (biometricRes.ok) {
        const biometricData = await biometricRes.json();
        setHasBiometric(biometricData.hasBiometric || false);
      }

      // Загружаем настройки уведомлений
      const notificationsRes = await fetch(getApiUrl('/settings/notifications'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        if (notificationsData.success && notificationsData.settings) {
          setNotificationSettings(notificationsData.settings);
        }
      }

      // Загружаем цели
      const goalsRes = await fetch(getApiUrl('/settings/goals'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        if (goalsData.success && goalsData.goals) {
          setGoals(goalsData.goals);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Сохранение профиля
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // Конвертируем blob URLs в base64 перед сохранением (с сжатием для изображений)
      let finalProfileAvatar: string | null = null;
      if (profileAvatar) {
        if (profileAvatar.startsWith('blob:')) {
          finalProfileAvatar = await blobUrlToBase64(profileAvatar, true);
        } else {
          finalProfileAvatar = profileAvatar;
        }
      }

      // Конвертируем фотографии (с сжатием)
      const profilePhotos: string[] = [];
      for (const item of draggableItems) {
        if (item.url.startsWith('blob:')) {
          const base64 = await blobUrlToBase64(item.url, item.type === 'photo');
          if (base64) profilePhotos.push(base64);
        } else {
          profilePhotos.push(item.url);
        }
      }

      // Определяем фон мини-профиля: если цвет - отправляем цвет, если изображение - отправляем URL/base64
      let finalProfileBackground: string | null = null;
      if (profileBackgroundType === 'color') {
        finalProfileBackground = selectedBackgroundColor;
      } else if (profileBackground) {
        if (profileBackground.startsWith('blob:')) {
          finalProfileBackground = await blobUrlToBase64(profileBackground, true);
        } else {
          finalProfileBackground = profileBackground;
        }
      }

      // Определяем фон всей страницы: если цвет - отправляем цвет, если изображение/видео - отправляем URL/base64
      let finalPageBackground: string | null = null;
      if (pageBackgroundType === 'color') {
        finalPageBackground = selectedPageBackgroundColor;
      } else if (pageBackground) {
        if (pageBackground.startsWith('blob:')) {
          // Для видео не сжимаем
          const isImage = pageBackgroundType === 'image';
          finalPageBackground = await blobUrlToBase64(pageBackground, isImage);
        } else {
          finalPageBackground = pageBackground;
        }
      }

      const requestBody = {
        name: name || null,
        profileDescription: profileDescription || null,
        profileAvatar: finalProfileAvatar,
        profileBackground: finalProfileBackground,
        pageBackground: finalPageBackground,
        profilePhotos: profilePhotos.length > 0 ? profilePhotos : null,
      };

      console.log('Saving profile with data:', {
        name,
        description: profileDescription,
        avatar: profileAvatar,
        profileBackgroundType: profileBackgroundType,
        profileBackgroundValue: finalProfileBackground,
        pageBackgroundType: pageBackgroundType,
        pageBackgroundValue: finalPageBackground,
        photosCount: profilePhotos.length,
        requestBody,
      });

      const res = await fetch(getApiUrl('/settings/profile'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        console.log('Profile saved successfully, refreshing auth...');
        await refreshAuth();
        // Даем время на обновление контекста
        await new Promise(resolve => setTimeout(resolve, 100));
        // Перезагружаем данные профиля, чтобы получить обновленный аватар с сервера
        await loadSettings();
        console.log('Profile data reloaded');
        // Триггерим событие для обновления компонента профиля
        window.dispatchEvent(new Event('profileUpdated'));
        setModalTitle(t('success'));
        setModalMessage(t('profileSaved'));
        setShowSuccessModal(true);
      } else {
        const errorData = await res.json();
        setModalTitle(t('error'));
        setModalMessage(errorData.message || t('profileSaveError'));
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setModalTitle(t('error'));
      setModalMessage(t('profileSaveError'));
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Drag and Drop для фоток
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(itemId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const items = [...draggableItems];
    const draggedIndex = items.findIndex(item => item.id === draggedItem);
    const targetIndex = items.findIndex(item => item.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      [items[draggedIndex], items[targetIndex]] = [items[targetIndex], items[draggedIndex]];
      setDraggableItems(items);
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Сжатие изображения
  const compressImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Вычисляем новые размеры с сохранением пропорций
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not compress image'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Конвертация blob URL в base64 с сжатием
  const blobUrlToBase64 = async (blobUrl: string, isImage: boolean = true): Promise<string | null> => {
    try {
      // Проверяем, является ли это blob URL
      if (!blobUrl.startsWith('blob:')) {
        return blobUrl; // Уже не blob URL, возвращаем как есть
      }
      
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      
      // Если это изображение, сжимаем его
      if (isImage && blob.type.startsWith('image/')) {
        const file = new File([blob], 'image.jpg', { type: blob.type });
        const compressedFile = await compressImage(file, 1920, 1080, 0.8);
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(compressedFile);
        });
      }
      
      // Для не-изображений или если сжатие не требуется
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting blob to base64:', error);
      return null;
    }
  };

  // Загрузка файлов
  const handleFileUpload = (type: 'avatar' | 'background' | 'pageBackground' | 'photo' | 'video', file: File) => {
    // В реальном проекте здесь должна быть загрузка на сервер (S3, Cloudinary и т.д.)
    // Сейчас просто создаем URL из файла
    const url = URL.createObjectURL(file);
    
    if (type === 'avatar') {
      setProfileAvatar(url);
    } else if (type === 'background') {
      setProfileBackground(url);
      setProfileBackgroundType('image');
    } else if (type === 'pageBackground') {
      setPageBackground(url);
      // Определяем тип по расширению файла
      if (file.type.startsWith('video/')) {
        setPageBackgroundType('video');
      } else {
        setPageBackgroundType('image');
      }
    } else if (type === 'photo') {
      if (draggableItems.length < 3) {
        const newItem: DraggableItem = {
          id: `photo-${Date.now()}`,
          type: 'photo',
          url,
          aspectRatio: '16:9',
        };
        setDraggableItems([...draggableItems, newItem]);
      } else {
        setModalTitle(t('warning'));
        setModalMessage(t('max3Photos'));
        setShowErrorModal(true);
      }
    } else if (type === 'video') {
      if (draggableItems.length < 3) {
        const newItem: DraggableItem = {
          id: `video-${Date.now()}`,
          type: 'video',
          url,
          aspectRatio: '16:9',
        };
        setDraggableItems([...draggableItems, newItem]);
      } else {
        setModalTitle(t('warning'));
        setModalMessage(t('max3Photos'));
        setShowErrorModal(true);
      }
    }
  };

  // Удаление фотки
  const handleRemoveItem = (itemId: string) => {
    setDraggableItems(draggableItems.filter(item => item.id !== itemId));
  };

  // Изменение соотношения сторон
  const handleAspectRatioChange = (itemId: string, ratio: '3:4' | '16:9' | '9:16' | '27:9') => {
    setDraggableItems(draggableItems.map(item =>
      item.id === itemId ? { ...item, aspectRatio: ratio } : item
    ));
  };

  // Сохранение настроек уведомлений
  const handleSaveNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(getApiUrl('/settings/notifications'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationSettings),
      });

      if (res.ok) {
        setModalTitle(t('success'));
        setModalMessage(t('notificationsSaved'));
        setShowSuccessModal(true);
      } else {
        setModalTitle(t('error'));
        setModalMessage(t('notificationsSaveError'));
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
      setModalTitle(t('error'));
      setModalMessage(t('notificationsSaveError'));
      setShowErrorModal(true);
    }
  };

  // Создание цели
  const handleCreateGoal = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(getApiUrl('/settings/goals'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: goalForm.description,
          targetValue: parseInt(goalForm.targetValue),
          unit: goalForm.unit,
          deadline: new Date(goalForm.deadline).toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setGoals([...goals, data.goal]);
          setShowGoalModal(false);
          setGoalForm({
            description: '',
            targetValue: '',
            unit: 'людей',
            deadline: '',
          });
        }
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  // Открытие модального окна удаления цели
  const handleDeleteGoal = (goalId: string) => {
    setGoalIdToDelete(goalId);
    setShowDeleteGoalModal(true);
  };

  // Подтверждение удаления цели
  const confirmDeleteGoal = async () => {
    if (!goalIdToDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(getApiUrl(`/settings/goals/${goalIdToDelete}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setGoals(goals.filter(g => g.id !== goalIdToDelete));
        setModalTitle('Успешно');
        setModalMessage('Цель успешно удалена');
        setShowSuccessModal(true);
        setShowDeleteGoalModal(false);
        setGoalIdToDelete(null);
      } else {
        setModalTitle('Ошибка');
        setModalMessage('Не удалось удалить цель');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      setModalTitle('Ошибка');
      setModalMessage('Произошла ошибка при удалении цели');
      setShowErrorModal(true);
    }
  };

  // Отправка кода для смены пароля
  const handleSendPasswordCode = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(getApiUrl('/settings/password/send-code'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setCodeSent(true);
        setResendCooldown(30);
        const interval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending code:', error);
    }
  };

  // Верификация кода
  const handleVerifyCode = async (codeToVerify?: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // Берем код из параметра или из состояния, убираем все нецифровые символы
      const code = (codeToVerify || passwordCode.join('')).replace(/[^\d]/g, '');
      console.log('Verifying code:', code, 'Length:', code.length);
      
      if (code.length !== 6) {
        console.log('Code length is not 6:', code.length);
        setModalTitle(t('error'));
        setModalMessage(t('enter6DigitCode'));
        setShowErrorModal(true);
        return;
      }

      // Проверяем код через временный запрос с невалидным паролем (слишком коротким)
      // Если код верный, получим ошибку про валидацию пароля (значит код правильный)
      // Если код неверный, получим ошибку про код
      const res = await fetch(getApiUrl('/settings/password/change-with-code'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          newPassword: '123', // Намеренно короткий пароль, чтобы запрос не был успешным
        }),
      });

      const responseData = await res.json().catch(() => ({}));
      
      // Если код верный, получим ошибку про валидацию пароля (пароль слишком короткий)
      // Если код неверный, получим ошибку про код
      if (res.ok) {
        // Если запрос успешен (не должно быть с коротким паролем), значит код верный
        // Но это не должно произойти, так как пароль слишком короткий
        setCodeVerified(true);
        return;
      }

      if (responseData.message) {
        const message = responseData.message.toLowerCase();
        // Проверяем, что ошибка про пароль (значит код верный)
        if (message.includes('парол') || message.includes('password') || message.includes('не менее') || message.includes('должен быть')) {
          // Ошибка про валидацию пароля - значит код верный!
          setCodeVerified(true);
          return;
        } else if (message.includes('код') || message.includes('code') || message.includes('неверн') || message.includes('invalid')) {
          // Ошибка про код - код неверный
          setModalTitle(t('error'));
          setModalMessage(responseData.message || t('invalidCode'));
          setShowErrorModal(true);
          setPasswordCode(['', '', '', '', '', '']);
          return;
        }
      }

      // Неизвестная ошибка - считаем код неверным
      setModalTitle(t('error'));
      setModalMessage(t('invalidCode'));
      setShowErrorModal(true);
      setPasswordCode(['', '', '', '', '', '']);
    } catch (error) {
      console.error('Error verifying code:', error);
      setModalTitle(t('error'));
      setModalMessage(t('codeVerificationError'));
      setShowErrorModal(true);
    }
  };

  // Смена пароля с кодом
  const handleChangePasswordWithCode = async () => {
    if (newPassword !== confirmPassword) {
      setModalTitle(t('error'));
      setModalMessage(t('passwordsDoNotMatch'));
      setShowErrorModal(true);
      return;
    }

    if (newPassword.length < 8) {
      setModalTitle(t('error'));
      setModalMessage(t('passwordMinLength'));
      setShowErrorModal(true);
      return;
    }

    // Валидация: минимум одна заглавная буква, одна строчная буква и одна цифра
    const hasUpperLowerAndNumber = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword);
    if (!hasUpperLowerAndNumber) {
      setModalTitle('Ошибка');
      setModalMessage('Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру');
      setShowErrorModal(true);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // Очищаем код от всех нецифровых символов
      const code = passwordCode.join('').replace(/[^\d]/g, '');
      
      if (code.length !== 6) {
        setModalTitle(t('error'));
        setModalMessage(t('enter6DigitCode'));
        setShowErrorModal(true);
        return;
      }

      const res = await fetch(getApiUrl('/settings/password/change-with-code'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          newPassword,
        }),
      });

      if (res.ok) {
        setModalTitle(t('success'));
        setModalMessage(t('passwordChanged'));
        setShowSuccessModal(true);
        setShowPasswordModal(false);
        setPasswordMethod(null);
        setPasswordCode(['', '', '', '', '', '']);
        setNewPassword('');
        setConfirmPassword('');
        setCodeSent(false);
        setCodeVerified(false);
      } else {
        const errorData = await res.json();
        setModalTitle(t('error'));
        setModalMessage(errorData.message || t('passwordChangeError'));
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setModalTitle(t('error'));
      setModalMessage(t('passwordChangeError'));
      setShowErrorModal(true);
    }
  };

  // Проверка биометрии (вызывается сразу при выборе метода)
  const handleVerifyBiometric = async () => {
    try {
      // Проверяем биометрию
      if (!window.PublicKeyCredential) {
        setModalTitle(t('error'));
        setModalMessage(t('biometricNotSupported'));
        setShowErrorModal(true);
        return;
      }

      // Получаем challenge
      const challengeRes = await fetch(getApiUrl('/auth/biometric/login-challenge'), {
        method: 'POST',
      });

      if (!challengeRes.ok) {
        throw new Error(t('biometricError'));
      }

      const { challenge } = await challengeRes.json();

      // Определяем rpId - должен совпадать с rpId, используемым при регистрации
      const hostname = window.location.hostname;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isPunycode = hostname.startsWith('xn--');
      
      // Используем ту же логику, что и при регистрации
      let rpId: string;
      if (isPunycode && isMobileDevice) {
        // Для Punycode на мобильных - используем полный hostname
        rpId = hostname;
      } else if (isMobileDevice && hostname.includes('.')) {
        const parts = hostname.split('.');
        rpId = parts.length > 2 ? parts.slice(-2).join('.') : hostname;
      } else {
        rpId = hostname.split('.').slice(-2).join('.');
      }
      
      console.log('🌐 Hostname:', hostname);
      console.log('📱 Is mobile:', isMobileDevice);
      console.log('🔤 Is Punycode:', isPunycode);
      console.log('🌐 Using rpId:', rpId);

      // Аутентифицируемся с биометрией
      // Используем одинаковые параметры для всех устройств для максимальной совместимости
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
          rpId: rpId, // Критично - должен совпадать с регистрацией
          userVerification: 'preferred' as const, // Используем 'preferred' для гибкости
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error(t('biometricFailed'));
      }

      // Отправляем на сервер для проверки
      const response = credential.response as AuthenticatorAssertionResponse;
      const credentialId = Array.from(new Uint8Array(credential.rawId));
      const clientDataJSON = Array.from(new Uint8Array(response.clientDataJSON));
      const authenticatorData = Array.from(new Uint8Array(response.authenticatorData));
      const signature = Array.from(new Uint8Array(response.signature));

      const loginRes = await fetch(getApiUrl('/auth/biometric/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentialId,
          clientDataJSON,
          authenticatorData,
          signature,
          challenge,
        }),
      });

      if (!loginRes.ok) {
        throw new Error(t('biometricFailed'));
      }

      // Если биометрия успешна, разрешаем ввод пароля
      setBiometricVerified(true);
    } catch (error: any) {
      console.error('Error verifying biometric:', error);
      setModalTitle('Ошибка');
      setModalMessage(error.message || t('biometricError'));
      setShowErrorModal(true);
      setPasswordMethod(null);
      setBiometricVerified(false);
    }
  };

  // Смена пароля с биометрией (вызывается после успешной проверки биометрии)
  const handleChangePasswordWithBiometric = async () => {
    if (!biometricVerified) {
      setModalTitle('Ошибка');
      setModalMessage(t('confirmBiometricFirst'));
      setShowErrorModal(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setModalTitle('Ошибка');
      setModalMessage(t('passwordsDoNotMatch'));
      setShowErrorModal(true);
      return;
    }

    if (newPassword.length < 8) {
      setModalTitle('Ошибка');
      setModalMessage('Пароль должен быть не менее 8 символов');
      setShowErrorModal(true);
      return;
    }

    // Валидация: минимум одна заглавная буква, одна строчная буква и одна цифра
    const hasUpperLowerAndNumber = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword);
    if (!hasUpperLowerAndNumber) {
      setModalTitle('Ошибка');
      setModalMessage('Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру');
      setShowErrorModal(true);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      // Меняем пароль
      const changePasswordRes = await fetch(getApiUrl('/settings/password/change-with-biometric'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword,
        }),
      });

      if (changePasswordRes.ok) {
        setModalTitle(t('success'));
        setModalMessage(t('passwordChanged'));
        setShowSuccessModal(true);
        setShowPasswordModal(false);
        setPasswordMethod(null);
        setBiometricVerified(false);
        setNewPassword('');
        setConfirmPassword('');
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        const errorData = await changePasswordRes.json();
        setModalTitle(t('error'));
        setModalMessage(errorData.message || t('passwordChangeError'));
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error('Error changing password with biometric:', error);
      setModalTitle('Ошибка');
      setModalMessage(t('passwordChangeError'));
      setShowErrorModal(true);
    }
  };

  // Отключение биометрии
  const handleDisableBiometric = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setModalTitle('Подтверждение');
    setModalMessage('Вы уверены, что хотите отключить биометрию?');
    setConfirmCallback(async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const res = await fetch(getApiUrl('/settings/biometric'), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          setHasBiometric(false);
          // Перезагружаем данные биометрии с сервера для синхронизации
          const refreshRes = await fetch(getApiUrl('/settings/biometric'), {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            setHasBiometric(refreshData.hasBiometric || false);
          }
          // Модалка подтверждения закроется автоматически после выполнения callback
        } else {
          setModalTitle(t('error'));
          setModalMessage('Ошибка отключения биометрии');
          setShowErrorModal(true);
        }
      } catch (error) {
        console.error('Error disabling biometric:', error);
        setModalTitle(t('error'));
        setModalMessage('Ошибка отключения биометрии');
        setShowErrorModal(true);
      }
    });
    setShowConfirmModal(true);
  };

  // Удаление аккаунта
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'УДАЛИТЬ') {
      setModalTitle('Ошибка');
      setModalMessage('Введите "УДАЛИТЬ" для подтверждения');
      setShowErrorModal(true);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(getApiUrl('/settings/account'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setModalTitle(t('success'));
        setModalMessage('Аккаунт успешно удален');
        setShowSuccessModal(true);
        // Очищаем токен и данные пользователя сразу
        localStorage.removeItem('accessToken');
        setTimeout(() => {
          logout();
          router.push('/');
        }, 1500);
      } else {
        let errorMessage = 'Ошибка удаления аккаунта';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Если не удалось распарсить JSON, используем статус
          if (res.status === 500) {
            errorMessage = 'Внутренняя ошибка сервера. Попробуйте позже.';
          } else if (res.status === 429) {
            errorMessage = 'Слишком много запросов. Попробуйте позже.';
          }
        }
        setModalTitle(t('error'));
        setModalMessage(errorMessage);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setModalTitle('Ошибка');
      setModalMessage('Ошибка удаления аккаунта');
      setShowErrorModal(true);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: '#666' }}>Загрузка настроек...</div>
      </div>
    );
  }

  return (
    <div className="profile-settings-container" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="profile-settings-header"
      >
        <h1 className="profile-settings-main-title" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px', color: '#1a1a1a' }}>
          Настройки
        </h1>
        <p className="profile-settings-main-description" style={{ fontSize: '16px', color: '#666', marginBottom: '40px' }}>
          Управляйте своим профилем и настройками аккаунта
        </p>
      </motion.div>

      {/* Секция профиля */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="profile-settings-card"
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h2 className="profile-settings-card-title" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: '#1a1a1a' }}>
          Профиль
        </h2>

        {/* Имя и аватар */}
        <div className="profile-settings-avatar-name-row" style={{ display: 'flex', gap: '24px', marginBottom: '24px', alignItems: 'flex-start' }}>
          <div className="profile-settings-avatar-wrapper">
            <label className="profile-settings-label" style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
              Аватар
            </label>
            <div className="profile-settings-avatar" style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', background: '#f0f0f0', cursor: 'pointer' }}>
              {profileAvatar ? (
                <img 
                  key={profileAvatar} 
                  src={profileAvatar} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    console.error('Avatar image load error:', profileAvatar);
                    // Если изображение не загрузилось, сбрасываем аватар
                    setProfileAvatar('');
                  }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#999' }}>
                  {name ? name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('avatar', file);
                }}
              />
            </div>
          </div>
          <div className="profile-settings-name-field" style={{ flex: 1 }}>
            <label className="profile-settings-label" style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
              Имя
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="profile-settings-input"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
              }}
              placeholder="Введите ваше имя"
            />
          </div>
        </div>

        {/* Описание */}
        <div className="profile-settings-field" style={{ marginBottom: '24px' }}>
          <label className="profile-settings-label" style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
            Описание профиля
          </label>
          <textarea
            value={profileDescription}
            onChange={(e) => setProfileDescription(e.target.value)}
            className="profile-settings-input"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              minHeight: '100px',
              resize: 'vertical',
            }}
            placeholder="Расскажите о себе"
          />
        </div>

        {/* Фон мини-профиля */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
            Фон мини-профиля (где аватар, имя и уровень)
          </label>
          {/* Показываем текущий фон, если он установлен */}
          {(profileBackground || (profileBackgroundType === 'color' && selectedBackgroundColor)) && (
            <div style={{ 
              marginBottom: '12px', 
              padding: '12px', 
              background: '#f5f5f5', 
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Текущий фон:
              </div>
              {profileBackgroundType === 'color' ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    background: selectedBackgroundColor,
                    border: '1px solid #e0e0e0',
                  }} />
                  <span style={{ fontSize: '14px', color: '#333' }}>
                    Цвет: {selectedBackgroundColor}
                  </span>
                </div>
              ) : profileBackground ? (
                <div style={{ 
                  maxWidth: '200px', 
                  borderRadius: '4px', 
                  overflow: 'hidden',
                  border: '1px solid #e0e0e0',
                }}>
                  <img src={profileBackground} alt="Current background" style={{ width: '100%', display: 'block' }} />
                </div>
              ) : null}
            </div>
          )}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '12px',
            flexDirection: isMobile ? 'column' : 'row',
          }}>
            <button
              onClick={() => {
                setProfileBackgroundType('color');
                if (isMobile && !showProfileColorPanel) {
                  setShowProfileColorPanel(true);
                }
              }}
              style={{
                padding: '8px 16px',
                border: `2px solid ${profileBackgroundType === 'color' ? '#1976d2' : '#e0e0e0'}`,
                borderRadius: '8px',
                background: profileBackgroundType === 'color' ? '#e3f2fd' : '#fff',
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              Цвет
            </button>
            <button
              onClick={() => {
                setProfileBackgroundType('image');
                if (isMobile) {
                  setShowProfileColorPanel(false);
                }
              }}
              style={{
                padding: '8px 16px',
                border: `2px solid ${profileBackgroundType === 'image' ? '#1976d2' : '#e0e0e0'}`,
                borderRadius: '8px',
                background: profileBackgroundType === 'image' ? '#e3f2fd' : '#fff',
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              Изображение
            </button>
          </div>
          {profileBackgroundType === 'color' && (
            <>
              {isMobile ? (
                <div style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => setShowProfileColorPanel(!showProfileColorPanel)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      background: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    <span>Цвета</span>
                    <span>{showProfileColorPanel ? '▼' : '▶'}</span>
                  </button>
                  {showProfileColorPanel && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      flexWrap: 'wrap',
                      marginTop: '12px',
                      padding: '12px',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                    }}>
                      {['#1b2838', '#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7'].map(color => (
                        <div
                          key={color}
                          onClick={() => setSelectedBackgroundColor(color)}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            background: color,
                            cursor: 'pointer',
                            border: selectedBackgroundColor === color ? '3px solid #1976d2' : '2px solid #e0e0e0',
                          }}
                        />
                      ))}
                      <input
                        type="color"
                        value={selectedBackgroundColor}
                        onChange={(e) => setSelectedBackgroundColor(e.target.value)}
                        style={{ width: '48px', height: '48px', border: 'none', cursor: 'pointer' }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['#1b2838', '#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7'].map(color => (
                    <div
                      key={color}
                      onClick={() => setSelectedBackgroundColor(color)}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        background: color,
                        cursor: 'pointer',
                        border: selectedBackgroundColor === color ? '3px solid #1976d2' : '2px solid #e0e0e0',
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={selectedBackgroundColor}
                    onChange={(e) => setSelectedBackgroundColor(e.target.value)}
                    style={{ width: '48px', height: '48px', border: 'none', cursor: 'pointer' }}
                  />
                </div>
              )}
            </>
          )}
          {profileBackgroundType === 'image' && (
            <div>
                <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('background', file);
                }}
                style={{ display: 'none' }}
              />
              {profileBackground ? (
                <div style={{ marginTop: '12px', maxWidth: '500px', position: 'relative' }}>
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e0e0e0' }}>
                    <img src={profileBackground} alt="Background" style={{ width: '100%', display: 'block' }} />
                    <button
                      onClick={() => {
                        setProfileBackground('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        color: '#fff',
                        fontSize: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(211, 47, 47, 0.8)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      marginTop: '12px',
                      padding: '10px 20px',
                      background: '#f5f5f5',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      color: '#333',
                    }}
                  >
                    Изменить изображение
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOverBackground(true);
                  }}
                  onDragLeave={() => setIsDraggingOverBackground(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOverBackground(false);
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      handleFileUpload('background', file);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    marginTop: '12px',
                    padding: '60px 40px',
                    border: `2px dashed ${isDraggingOverBackground ? '#1976d2' : '#e0e0e0'}`,
                    borderRadius: '12px',
                    background: isDraggingOverBackground ? '#e3f2fd' : '#fafafa',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isDraggingOverBackground) {
                      e.currentTarget.style.borderColor = '#1976d2';
                      e.currentTarget.style.background = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDraggingOverBackground) {
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.background = '#fafafa';
                    }
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    🖼️
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                    {isDraggingOverBackground ? 'Отпустите файл здесь' : 'Загрузить изображение'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    Перетащите файл сюда или нажмите для выбора
                  </div>
                  <div style={{ fontSize: '12px', color: '#bbb', marginTop: '8px' }}>
                    PNG, JPG, GIF до 10MB
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Фон всей страницы */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
            Фон всей страницы
          </label>
          {/* Показываем текущий фон, если он установлен */}
          {(pageBackground || (pageBackgroundType === 'color' && selectedPageBackgroundColor)) && (
            <div style={{ 
              marginBottom: '12px', 
              padding: '12px', 
              background: '#f5f5f5', 
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Текущий фон:
              </div>
              {pageBackgroundType === 'color' ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    background: selectedPageBackgroundColor,
                    border: '1px solid #e0e0e0',
                  }} />
                  <span style={{ fontSize: '14px', color: '#333' }}>
                    Цвет: {selectedPageBackgroundColor}
                  </span>
                </div>
              ) : pageBackground ? (
                <div style={{ 
                  maxWidth: '200px', 
                  borderRadius: '4px', 
                  overflow: 'hidden',
                  border: '1px solid #e0e0e0',
                }}>
                  {pageBackgroundType === 'image' ? (
                    <img src={pageBackground} alt="Current background" style={{ width: '100%', display: 'block' }} />
                  ) : (
                    <video src={pageBackground} style={{ width: '100%', display: 'block' }} muted />
                  )}
                </div>
              ) : null}
            </div>
          )}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '12px',
            flexDirection: isMobile ? 'column' : 'row',
          }}>
            <button
              onClick={() => {
                setPageBackgroundType('color');
                if (isMobile && !showPageColorPanel) {
                  setShowPageColorPanel(true);
                }
              }}
              style={{
                padding: '8px 16px',
                border: `2px solid ${pageBackgroundType === 'color' ? '#1976d2' : '#e0e0e0'}`,
                borderRadius: '8px',
                background: pageBackgroundType === 'color' ? '#e3f2fd' : '#fff',
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              Цвет
            </button>
            <button
              onClick={() => {
                setPageBackgroundType('image');
                if (isMobile) {
                  setShowPageColorPanel(false);
                }
              }}
              style={{
                padding: '8px 16px',
                border: `2px solid ${pageBackgroundType === 'image' ? '#1976d2' : '#e0e0e0'}`,
                borderRadius: '8px',
                background: pageBackgroundType === 'image' ? '#e3f2fd' : '#fff',
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              Изображение
            </button>
            <button
              onClick={() => {
                setPageBackgroundType('video');
                if (isMobile) {
                  setShowPageColorPanel(false);
                }
              }}
              style={{
                padding: '8px 16px',
                border: `2px solid ${pageBackgroundType === 'video' ? '#1976d2' : '#e0e0e0'}`,
                borderRadius: '8px',
                background: pageBackgroundType === 'video' ? '#e3f2fd' : '#fff',
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              Видео
            </button>
          </div>
          {pageBackgroundType === 'color' && (
            <>
              {isMobile ? (
                <div style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => setShowPageColorPanel(!showPageColorPanel)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      background: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    <span>Цвета</span>
                    <span>{showPageColorPanel ? '▼' : '▶'}</span>
                  </button>
                  {showPageColorPanel && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      flexWrap: 'wrap',
                      marginTop: '12px',
                      padding: '12px',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                    }}>
                      {['#1b2838', '#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7'].map(color => (
                        <div
                          key={color}
                          onClick={() => setSelectedPageBackgroundColor(color)}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            background: color,
                            cursor: 'pointer',
                            border: selectedPageBackgroundColor === color ? '3px solid #1976d2' : '2px solid #e0e0e0',
                          }}
                        />
                      ))}
                      <input
                        type="color"
                        value={selectedPageBackgroundColor}
                        onChange={(e) => setSelectedPageBackgroundColor(e.target.value)}
                        style={{ width: '48px', height: '48px', border: 'none', cursor: 'pointer' }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['#1b2838', '#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7'].map(color => (
                    <div
                      key={color}
                      onClick={() => setSelectedPageBackgroundColor(color)}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        background: color,
                        cursor: 'pointer',
                        border: selectedPageBackgroundColor === color ? '3px solid #1976d2' : '2px solid #e0e0e0',
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={selectedPageBackgroundColor}
                    onChange={(e) => setSelectedPageBackgroundColor(e.target.value)}
                    style={{ width: '48px', height: '48px', border: 'none', cursor: 'pointer' }}
                  />
                </div>
              )}
            </>
          )}
          {(pageBackgroundType === 'image' || pageBackgroundType === 'video') && (
            <div>
              <input
                ref={pageBackgroundFileInputRef}
                type="file"
                accept={pageBackgroundType === 'image' ? 'image/*' : 'video/*'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('pageBackground', file);
                }}
                style={{ display: 'none' }}
              />
              {pageBackground ? (
                <div style={{ marginTop: '12px', maxWidth: '500px', position: 'relative' }}>
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e0e0e0' }}>
                    {pageBackgroundType === 'image' ? (
                      <img src={pageBackground} alt="Page Background" style={{ width: '100%', display: 'block' }} />
                    ) : (
                      <video src={pageBackground} controls style={{ width: '100%', display: 'block' }} />
                    )}
                    <button
                      onClick={() => {
                        setPageBackground('');
                        if (pageBackgroundFileInputRef.current) pageBackgroundFileInputRef.current.value = '';
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        color: '#fff',
                        fontSize: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(211, 47, 47, 0.8)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <button
                    onClick={() => pageBackgroundFileInputRef.current?.click()}
                    style={{
                      marginTop: '12px',
                      padding: '10px 20px',
                      background: '#f5f5f5',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      color: '#333',
                    }}
                  >
                    Изменить {pageBackgroundType === 'image' ? 'изображение' : 'видео'}
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOverPageBackground(true);
                  }}
                  onDragLeave={() => setIsDraggingOverPageBackground(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOverPageBackground(false);
                    const file = e.dataTransfer.files[0];
                    if (file && (
                      (pageBackgroundType === 'image' && file.type.startsWith('image/')) ||
                      (pageBackgroundType === 'video' && file.type.startsWith('video/'))
                    )) {
                      handleFileUpload('pageBackground', file);
                    }
                  }}
                  onClick={() => pageBackgroundFileInputRef.current?.click()}
                  style={{
                    marginTop: '12px',
                    padding: '60px 40px',
                    border: `2px dashed ${isDraggingOverPageBackground ? '#1976d2' : '#e0e0e0'}`,
                    borderRadius: '12px',
                    background: isDraggingOverPageBackground ? '#e3f2fd' : '#fafafa',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isDraggingOverPageBackground) {
                      e.currentTarget.style.borderColor = '#1976d2';
                      e.currentTarget.style.background = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDraggingOverPageBackground) {
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.background = '#fafafa';
                    }
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    {pageBackgroundType === 'image' ? '🖼️' : '🎥'}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                    {isDraggingOverPageBackground ? 'Отпустите файл здесь' : `Загрузить ${pageBackgroundType === 'image' ? 'изображение' : 'видео'}`}
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    Перетащите файл сюда или нажмите для выбора
                  </div>
                  <div style={{ fontSize: '12px', color: '#bbb', marginTop: '8px' }}>
                    {pageBackgroundType === 'image' ? 'PNG, JPG, GIF до 10MB' : 'MP4, WebM до 50MB'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Фотки с drag and drop */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
            Фотографии профиля (максимум 3)
          </label>
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginBottom: '12px',
            fontStyle: 'italic',
          }}>
            {t('clickPhotoToDelete')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
            {[0, 1, 2].map(index => {
              const item = draggableItems[index];
              return (
                <div
                  key={index}
                  draggable={!!item}
                  onDragStart={(e) => item && handleDragStart(e, item.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    item && handleDragOver(e, item.id);
                  }}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => {
                    const targetItem = draggableItems[index];
                    if (targetItem) handleDrop(e, targetItem.id);
                  }}
                  onClick={(e) => {
                    // Удаление по клику на фото, если клик не на элементах управления
                    if (item && !(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('select') && !(e.target as HTMLElement).closest('[role="listbox"]')) {
                      handleRemoveItem(item.id);
                    }
                  }}
                  style={{
                    aspectRatio: item?.aspectRatio === '3:4' ? '3/4' : item?.aspectRatio === '16:9' ? '16/9' : item?.aspectRatio === '9:16' ? '9/16' : '27/9',
                    background: '#f0f0f0',
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: dragOverItem === item?.id ? '2px dashed #1976d2' : '2px dashed #e0e0e0',
                    cursor: item ? 'pointer' : 'pointer',
                    opacity: draggedItem === item?.id ? 0.5 : 1,
                  }}
                >
                  {item ? (
                    <>
                      {item.type === 'photo' ? (
                        <img 
                          src={item.url} 
                          alt={`Photo ${index + 1}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                        />
                      ) : (
                        <video 
                          src={item.url} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                        />
                      )}
                      <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px', pointerEvents: 'auto' }}>
                        <div onClick={(e) => e.stopPropagation()} style={{ minWidth: '80px' }}>
                          <CustomSelect
                            value={item.aspectRatio}
                            onChange={(value) => handleAspectRatioChange(item.id, value as any)}
                            options={[
                              { value: '3:4', label: '3:4' },
                              { value: '16:9', label: '16:9' },
                              { value: '9:16', label: '9:16' },
                              { value: '27:9', label: '27:9' },
                            ]}
                          />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.id);
                          }}
                          style={{
                            padding: '4px 8px',
                            background: '#d32f2f',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  ) : (
                    <label
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ fontSize: '24px' }}>+</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>Добавить фото</div>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const type = file.type.startsWith('image/') ? 'photo' : 'video';
                            handleFileUpload(type, file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          style={{
            padding: '12px 24px',
            background: isSaving ? '#ccc' : '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 500,
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить профиль'}
        </button>
      </motion.div>

      {/* Обучение */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
          Обучение
        </h2>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
          Пройдите обучение, чтобы узнать больше о платформе и её возможностях
        </p>
        <button
          onClick={() => {
            setTutorialKey(prev => prev + 1);
            setShowTutorial(true);
          }}
          style={{
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          🎓 Пройти обучение
        </button>
      </motion.div>

      {/* Биометрия */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="profile-settings-card profile-settings-biometric-card"
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h2 className="profile-settings-card-title" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a', wordBreak: 'break-word' }}>
          Биометрическая аутентификация
        </h2>
        <div className="profile-settings-biometric-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div className="profile-settings-biometric-text" style={{ flex: 1, minWidth: 0 }}>
            <p className="profile-settings-biometric-status" style={{ fontSize: '16px', color: '#666', marginBottom: '8px', wordBreak: 'break-word' }}>
              {hasBiometric ? '✅ Биометрия включена' : '❌ Биометрия отключена'}
            </p>
            <p className="profile-settings-biometric-description" style={{ fontSize: '14px', color: '#999', wordBreak: 'break-word' }}>
              Используйте Face ID, Touch ID или отпечаток пальца для быстрого входа
            </p>
          </div>
          {hasBiometric ? (
            <button
              className="profile-settings-biometric-button profile-settings-biometric-disable-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDisableBiometric(e);
              }}
              style={{
                padding: '10px 20px',
                background: '#fff',
                border: '1px solid #d32f2f',
                borderRadius: '8px',
                color: '#d32f2f',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Отключить
            </button>
          ) : (
            <button
              className="profile-settings-biometric-button profile-settings-biometric-enable-button"
              onClick={() => {
                setModalTitle('Информация');
                setModalMessage('Для включения биометрии используйте страницу регистрации или настройки безопасности');
                setShowErrorModal(true);
              }}
              style={{
                padding: '10px 20px',
                background: '#1976d2',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Включить
            </button>
          )}
        </div>
      </motion.div>

      {/* Уведомления */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: '#1a1a1a' }}>
          Уведомления
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {[
            { key: 'emailNewProjects', label: 'Уведомления о новых проектах' },
            { key: 'emailReports', label: 'Отчёты о результатах' },
            { key: 'emailNews', label: 'Новости и обновления' },
            { key: 'emailAchievements', label: 'Уведомления о достижениях' },
            { key: 'emailGoalReminders', label: 'Напоминания о целях' },
            { key: 'emailGoalCompleted', label: 'Уведомления о выполнении целей' },
          ].map(({ key, label }) => (
            <label
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <input
                type="checkbox"
                checked={notificationSettings[key as keyof typeof notificationSettings]}
                onChange={(e) => {
                  setNotificationSettings({
                    ...notificationSettings,
                    [key]: e.target.checked,
                  });
                }}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '16px', color: '#333' }}>{label}</span>
            </label>
          ))}
        </div>
        <button
          onClick={handleSaveNotifications}
          style={{
            padding: '12px 24px',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Сохранить настройки
        </button>
      </motion.div>

      {/* Цели */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="profile-settings-card profile-settings-goals-card"
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div className="profile-settings-goals-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 className="profile-settings-card-title" style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a1a' }}>
            Цели
          </h2>
          <button
            className="profile-settings-add-goal-button"
            onClick={() => setShowGoalModal(true)}
            style={{
              padding: '10px 20px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            + Добавить цель
          </button>
        </div>
        {goals.length === 0 ? (
          <p className="profile-settings-goals-empty" style={{ fontSize: '16px', color: '#999', textAlign: 'center', padding: '40px' }}>
            У вас пока нет целей
          </p>
        ) : (
          <div className="profile-settings-goals-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {goals.map((goal) => {
              const progress = (goal.currentValue / goal.targetValue) * 100;
              const isOverdue = new Date(goal.deadline) < new Date() && goal.status === 'active';
              return (
                <div
                  key={goal.id}
                  className="profile-settings-goal-card"
                  style={{
                    padding: '20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    background: isOverdue ? '#fff3e0' : '#fff',
                  }}
                >
                  <div className="profile-settings-goal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div className="profile-settings-goal-content" style={{ flex: 1, minWidth: 0 }}>
                      <h3 className="profile-settings-goal-title" style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px', color: '#1a1a1a', wordBreak: 'break-word' }}>
                        {goal.description}
                      </h3>
                      <p className="profile-settings-goal-progress" style={{ fontSize: '14px', color: '#666', wordBreak: 'break-word' }}>
                        {goal.currentValue} из {goal.targetValue} {goal.unit}
                      </p>
                      <p className="profile-settings-goal-deadline" style={{ fontSize: '12px', color: '#999', marginTop: '4px', wordBreak: 'break-word' }}>
                        Срок: {new Date(goal.deadline).toLocaleDateString('ru-RU')}
                        {isOverdue && <span style={{ color: '#f57c00', marginLeft: '8px' }}>⚠️ Просрочено</span>}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div className="profile-settings-goal-status" style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: goal.status === 'completed' ? '#e8f5e9' : goal.status === 'cancelled' ? '#ffebee' : '#e3f2fd',
                      color: goal.status === 'completed' ? '#2e7d32' : goal.status === 'cancelled' ? '#c62828' : '#1976d2',
                      whiteSpace: 'nowrap',
                    }}>
                      {goal.status === 'completed' ? 'Выполнено' : goal.status === 'cancelled' ? 'Отменено' : 'Активна'}
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 500,
                          background: '#ffebee',
                          color: '#c62828',
                          border: 'none',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ffcdd2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#ffebee';
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                  <div className="profile-settings-goal-progress-bar-container" style={{ marginTop: '12px' }}>
                    <div className="profile-settings-goal-progress-bar" style={{
                      width: '100%',
                      height: '8px',
                      background: '#e0e0e0',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${Math.min(progress, 100)}%`,
                        height: '100%',
                        background: goal.status === 'completed' ? '#4caf50' : '#1976d2',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <p className="profile-settings-goal-progress-text" style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      Прогресс: {Math.round(progress)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Безопасность */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: '#1a1a1a' }}>
          Безопасность
        </h2>
        <button
          onClick={() => {
            setShowPasswordModal(true);
            setPasswordMethod(null);
          }}
          style={{
            padding: '12px 24px',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Изменить пароль
        </button>
      </motion.div>

      {/* Выход и удаление */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="profile-settings-card profile-settings-account-card"
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h2 className="profile-settings-card-title" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: '#1a1a1a' }}>
          Аккаунт
        </h2>
        <div className="profile-settings-account-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="profile-settings-logout-button"
            onClick={() => setShowLogoutModal(true)}
            style={{
              padding: '12px 24px',
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              color: '#333',
            }}
          >
            Выйти из аккаунта
          </button>
          <button
            className="profile-settings-delete-account-button"
            onClick={() => setShowDeleteModal(true)}
            style={{
              padding: '12px 24px',
              background: '#fff',
              border: '1px solid #ffebee',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              color: '#d32f2f',
            }}
          >
            Удалить аккаунт
          </button>
        </div>
      </motion.div>

      {/* Модальное окно туториала */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: '#fff',
            }}
          >
            <Tutorial
              key={tutorialKey}
              onComplete={() => {
                setShowTutorial(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно создания цели */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGoalModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="create-goal-modal"
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
              }}
            >
              <h3 className="create-goal-modal-title" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: '#1a1a1a' }}>
                Новая цель
              </h3>
              <div className="create-goal-modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label className="create-goal-modal-label" style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
                    Описание
                  </label>
                  <input
                    type="text"
                    className="create-goal-modal-input"
                    value={goalForm.description}
                    onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                    placeholder="Например: Помочь 10 людям"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px',
                    }}
                  />
                </div>
                <div className="create-goal-modal-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div className="create-goal-modal-field" style={{ flex: 1, minWidth: 0 }}>
                    <label className="create-goal-modal-label" style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
                      Целевое значение
                    </label>
                    <input
                      type="number"
                      className="create-goal-modal-input"
                      value={goalForm.targetValue}
                      onChange={(e) => setGoalForm({ ...goalForm, targetValue: e.target.value })}
                      placeholder="10"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '16px',
                      }}
                    />
                  </div>
                  <div className="create-goal-modal-field" style={{ flex: 1, minWidth: 0 }}>
                    <label className="create-goal-modal-label" style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
                      Единица
                    </label>
                    <input
                      type="text"
                      className="create-goal-modal-input"
                      value={goalForm.unit}
                      onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                      placeholder="людей"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '16px',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="create-goal-modal-label" style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
                    Срок выполнения
                  </label>
                  <input
                    type="date"
                    className="create-goal-modal-input"
                    value={goalForm.deadline}
                    onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px',
                    }}
                  />
                </div>
              </div>
              <div className="create-goal-modal-buttons" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  className="create-goal-cancel-button"
                  onClick={() => {
                    setShowGoalModal(false);
                    setGoalForm({
                      description: '',
                      targetValue: '',
                      unit: 'людей',
                      deadline: '',
                    });
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    color: '#333',
                  }}
                >
                  Отмена
                </button>
                <button
                  className="create-goal-submit-button"
                  onClick={handleCreateGoal}
                  style={{
                    padding: '10px 20px',
                    background: '#1976d2',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    color: '#fff',
                  }}
                >
                  Создать
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно смены пароля */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordMethod(null);
                setPasswordCode(['', '', '', '', '', '']);
                setNewPassword('');
                setConfirmPassword('');
                setCodeSent(false);
                setCodeVerified(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
              }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
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
                maxWidth: '500px',
                width: '90%',
              }}
            >
              <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: '#1a1a1a' }}>
                Изменить пароль
              </h3>
              {!passwordMethod ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                    Выберите способ подтверждения:
                  </p>
                  {hasBiometric && (
                    <button
                      onClick={async () => {
                        setPasswordMethod('biometric');
                        setBiometricVerified(false);
                        await handleVerifyBiometric();
                      }}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Использовать биометрию
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setPasswordMethod('code');
                      handleSendPasswordCode();
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#fff',
                      color: '#1976d2',
                      border: '1px solid #1976d2',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Получить код на email
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordMethod(null);
                      setCodeVerified(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#f5f5f5',
                      color: '#333',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Отмена
                  </button>
                </div>
              ) : passwordMethod === 'code' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {!codeVerified ? (
                    <>
                      {codeSent ? (
                        <>
                          <p style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
                            Код отправлен на {user?.email}
                          </p>
                          <div 
                            className="password-code-container"
                            style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}
                            onPaste={(e) => {
                              e.preventDefault();
                              // Убираем все нецифровые символы (пробелы, дефисы, скобки и т.д.)
                              const pastedText = e.clipboardData.getData('text')
                                .replace(/[^\d]/g, '') // Убираем все кроме цифр
                                .slice(0, 6);
                              console.log('Pasted text:', pastedText, 'Length:', pastedText.length);
                              if (pastedText.length > 0) {
                                const newCode = ['', '', '', '', '', ''];
                                for (let i = 0; i < pastedText.length && i < 6; i++) {
                                  newCode[i] = pastedText[i];
                                }
                                setPasswordCode(newCode);
                                // Фокус на последний заполненный input
                                const inputs = e.currentTarget.querySelectorAll('input');
                                const focusIndex = Math.min(pastedText.length - 1, 5);
                                if (inputs[focusIndex]) {
                                  (inputs[focusIndex] as HTMLInputElement).focus();
                                }
                                // Автоматически показываем поля пароля если код полный
                                if (pastedText.length === 6) {
                                  console.log('Code is complete, showing password fields');
                                  setCodeVerified(true);
                                }
                              }
                            }}
                          >
                            {passwordCode.map((digit, index) => (
                              <input
                                key={index}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '');
                                  if (value) {
                                    const newCode = [...passwordCode];
                                    newCode[index] = value;
                                    setPasswordCode(newCode);
                                    // Автоматически показываем поля пароля если код полный
                                    const fullCode = [...newCode];
                                    if (fullCode.join('').length === 6) {
                                      setCodeVerified(true);
                                    }
                                    if (index < 5) {
                                      const target = e.target as HTMLInputElement;
                                      const nextInput = target.nextElementSibling as HTMLInputElement;
                                      if (nextInput) nextInput.focus();
                                    }
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Backspace' && !passwordCode[index] && index > 0) {
                                    const newCode = [...passwordCode];
                                    newCode[index - 1] = '';
                                    setPasswordCode(newCode);
                                    // Скрываем поля пароля если код стал неполным
                                    const fullCode = [...newCode];
                                    if (fullCode.join('').length < 6) {
                                      setCodeVerified(false);
                                    }
                                    const target = e.target as HTMLInputElement;
                                    const prevInput = target.previousElementSibling as HTMLInputElement;
                                    if (prevInput) prevInput.focus();
                                  } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                                    // Разрешаем вставку через Ctrl+V / Cmd+V
                                    e.preventDefault();
                                    navigator.clipboard.readText().then((text) => {
                                      // Убираем все нецифровые символы (пробелы, дефисы, скобки и т.д.)
                                      const pastedText = text
                                        .replace(/[^\d]/g, '') // Убираем все кроме цифр
                                        .slice(0, 6);
                                      console.log('Pasted via Ctrl+V:', pastedText, 'Length:', pastedText.length);
                                      if (pastedText.length > 0) {
                                        const newCode = ['', '', '', '', '', ''];
                                        for (let i = 0; i < pastedText.length && i < 6; i++) {
                                          newCode[i] = pastedText[i];
                                        }
                                        setPasswordCode(newCode);
                                        // Фокус на последний заполненный input
                                        const inputs = document.querySelectorAll('.code-input');
                                        const focusIndex = Math.min(pastedText.length - 1, 5);
                                        if (inputs[focusIndex]) {
                                          (inputs[focusIndex] as HTMLInputElement).focus();
                                        }
                                        // Автоматически показываем поля пароля если код полный
                                        if (pastedText.length === 6) {
                                          console.log('Code is complete via Ctrl+V, showing password fields');
                                          setCodeVerified(true);
                                        }
                                      }
                                    });
                                  }
                                }}
                                className="code-input password-code-input"
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  textAlign: 'center',
                                  fontSize: '24px',
                                  border: '2px solid #e0e0e0',
                                  borderRadius: '8px',
                                  transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#1976d2';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = '#e0e0e0';
                                }}
                              />
                            ))}
                          </div>
                          {resendCooldown > 0 ? (
                            <p style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>
                              Повторная отправка через {resendCooldown} сек
                            </p>
                          ) : (
                            <button
                              onClick={handleSendPasswordCode}
                              style={{
                                padding: '8px',
                                background: 'transparent',
                                border: 'none',
                                color: '#1976d2',
                                fontSize: '14px',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                              }}
                            >
                              Не пришел код? Отправить снова
                            </button>
                          )}
                        </>
                      ) : (
                        <p style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
                          Отправка кода...
                        </p>
                      )}
                      <button
                        onClick={() => {
                          setPasswordMethod(null);
                          setPasswordCode(['', '', '', '', '', '']);
                          setCodeSent(false);
                          setCodeVerified(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: '#f5f5f5',
                          color: '#333',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        Назад
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
                      Новый пароль
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 40px 12px 16px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '16px',
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowNewPassword(prev => {
                            const newVal = !prev;
                            console.log('Setting showNewPassword to:', newVal, 'will show:', newVal ? 'close.png' : 'open.png');
                            return newVal;
                          });
                        }}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <img
                          key={`eye-new-${showNewPassword}`}
                          src={`${showNewPassword ? '/images/close.png' : '/images/open.png'}?t=${showNewPassword ? '1' : '0'}`}
                          alt={showNewPassword ? 'Скрыть пароль' : 'Показать пароль'}
                          width={20}
                          height={20}
                          style={{ display: 'block' }}
                          onLoad={() => console.log('Image loaded:', showNewPassword ? 'close.png' : 'open.png')}
                          onError={(e) => console.error('Image error:', e.currentTarget.src)}
                        />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
                      Подтвердите пароль
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 40px 12px 16px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '16px',
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowConfirmPassword(prev => !prev);
                        }}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <img
                          key={`eye-confirm-${showConfirmPassword}`}
                          src={`${showConfirmPassword ? '/images/close.png' : '/images/open.png'}?t=${showConfirmPassword ? '1' : '0'}`}
                          alt={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                          width={20}
                          height={20}
                          style={{ display: 'block' }}
                        />
                      </button>
                    </div>
                  </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => {
                            setCodeVerified(false);
                            setPasswordCode(['', '', '', '', '', '']);
                            setNewPassword('');
                            setConfirmPassword('');
                            setShowNewPassword(false);
                            setShowConfirmPassword(false);
                          }}
                          style={{
                            flex: 1,
                            padding: '12px',
                            background: '#f5f5f5',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: 'pointer',
                          }}
                        >
                          Назад
                        </button>
                        <button
                          onClick={handleChangePasswordWithCode}
                          disabled={!newPassword || !confirmPassword}
                          style={{
                            flex: 1,
                            padding: '12px',
                            background: newPassword && confirmPassword ? '#1976d2' : '#ccc',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: newPassword && confirmPassword ? 'pointer' : 'not-allowed',
                          }}
                        >
                          Изменить пароль
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {!biometricVerified ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                        Подтвердите свою личность с помощью биометрии
                      </p>
                      <p style={{ fontSize: '12px', color: '#999' }}>
                        Ожидание подтверждения биометрии...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
                          Новый пароль
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px 40px 12px 16px',
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              fontSize: '16px',
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowNewPassword(prev => !prev);
                            }}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <img
                              key={`eye-biometric-new-${showNewPassword}`}
                              src={`${showNewPassword ? '/images/close.png' : '/images/open.png'}?t=${showNewPassword ? '1' : '0'}`}
                              alt={showNewPassword ? 'Скрыть пароль' : 'Показать пароль'}
                              width={20}
                              height={20}
                              style={{ display: 'block' }}
                            />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
                          Подтвердите пароль
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px 40px 12px 16px',
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              fontSize: '16px',
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowConfirmPassword(prev => !prev);
                            }}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <img
                              key={`eye-biometric-confirm-${showConfirmPassword}`}
                              src={`${showConfirmPassword ? '/images/close.png' : '/images/open.png'}?t=${showConfirmPassword ? '1' : '0'}`}
                              alt={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                              width={20}
                              height={20}
                              style={{ display: 'block' }}
                            />
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => {
                            setPasswordMethod(null);
                            setBiometricVerified(false);
                            setNewPassword('');
                            setConfirmPassword('');
                            setShowNewPassword(false);
                            setShowConfirmPassword(false);
                          }}
                          style={{
                            flex: 1,
                            padding: '12px',
                            background: '#f5f5f5',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: 'pointer',
                          }}
                        >
                          Назад
                        </button>
                        <button
                          onClick={handleChangePasswordWithBiometric}
                          disabled={!newPassword || !confirmPassword}
                          style={{
                            flex: 1,
                            padding: '12px',
                            background: newPassword && confirmPassword ? '#1976d2' : '#ccc',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: newPassword && confirmPassword ? 'pointer' : 'not-allowed',
                          }}
                        >
                          Изменить пароль
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно выхода */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
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
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                Выйти из аккаунта?
              </h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
                Вы уверены, что хотите выйти из аккаунта?
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowLogoutModal(false);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Выйти
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно удаления аккаунта */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteConfirmText('');
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="delete-account-modal"
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ffebee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                margin: '0 auto 24px',
              }}>
                <span style={{ fontSize: '32px' }}>⚠️</span>
              </div>
              <h3 className="delete-account-modal-title" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a', textAlign: 'center' }}>
                Удаление аккаунта
              </h3>
              <p className="delete-account-modal-text" style={{ fontSize: '14px', color: '#666', marginBottom: '24px', textAlign: 'center', lineHeight: '1.6' }}>
                Это действие необратимо. Все ваши данные будут безвозвратно удалены.
              </p>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
                  Для подтверждения введите <strong>УДАЛИТЬ</strong>
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="УДАЛИТЬ"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                />
              </div>
              <div className="delete-account-modal-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  className="delete-account-cancel-button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Отмена
                </button>
                <button
                  className="delete-account-confirm-button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'УДАЛИТЬ'}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: deleteConfirmText === 'УДАЛИТЬ' ? '#d32f2f' : '#ccc',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: deleteConfirmText === 'УДАЛИТЬ' ? 'pointer' : 'not-allowed',
                  }}
                >
                  Удалить аккаунт
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно подтверждения удаления цели */}
      <AnimatePresence>
        {showDeleteGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowDeleteGoalModal(false);
              setGoalIdToDelete(null);
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
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
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                Удалить цель?
              </h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
                Вы уверены, что хотите удалить эту цель? Это действие нельзя отменить.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowDeleteGoalModal(false);
                    setGoalIdToDelete(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e0e0e0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f5f5f5';
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={confirmDeleteGoal}
                  style={{
                    padding: '10px 20px',
                    background: '#d32f2f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#b71c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#d32f2f';
                  }}
                >
                  Удалить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно успеха */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={async () => {
              setShowSuccessModal(false);
              // Если это сообщение о биометрии, обновляем данные
              if (modalMessage.includes('Биометрия')) {
                const token = localStorage.getItem('accessToken');
                if (token) {
                  const refreshRes = await fetch(getApiUrl('/settings/biometric'), {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  });
                  if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    setHasBiometric(refreshData.hasBiometric || false);
                  }
                }
              }
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
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
                textAlign: 'center',
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#e8f5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <span style={{ fontSize: '32px' }}>✅</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#1a1a1a' }}>
                {modalTitle}
              </h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
                {modalMessage}
              </p>
              <button
                onClick={async () => {
                  setShowSuccessModal(false);
                  // Если это сообщение о биометрии, обновляем данные
                  if (modalMessage.includes('Биометрия')) {
                    const token = localStorage.getItem('accessToken');
                    if (token) {
                      const refreshRes = await fetch(getApiUrl('/settings/biometric'), {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                        },
                      });
                      if (refreshRes.ok) {
                        const refreshData = await refreshRes.json();
                        setHasBiometric(refreshData.hasBiometric || false);
                      }
                    }
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                ОК
              </button>
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
            onClick={() => setShowErrorModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
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
                textAlign: 'center',
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ffebee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <span style={{ fontSize: '32px' }}>⚠️</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#1a1a1a' }}>
                {modalTitle}
              </h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
                {modalMessage}
              </p>
              <button
                onClick={() => setShowErrorModal(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#d32f2f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
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

      {/* Модальное окно подтверждения */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowConfirmModal(false);
                setConfirmCallback(null);
              }
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
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
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                {modalTitle}
              </h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
                {modalMessage}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmCallback(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    color: '#333',
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={async () => {
                    if (confirmCallback) {
                      await confirmCallback();
                    }
                    setShowConfirmModal(false);
                    setConfirmCallback(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Подтвердить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
