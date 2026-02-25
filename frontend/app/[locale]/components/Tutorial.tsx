'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/src/routing';
import { useTranslations } from 'next-intl';
import { useAuth } from '../../contexts/AuthContext';
import BiometricPanel from './BiometricPanel';

interface TutorialProps {
  onComplete: () => void;
}

export default function Tutorial({ onComplete }: TutorialProps) {
  const t = useTranslations('common.tutorial');
  const { user, markTutorialSeen } = useAuth();
  const [currentStep, setCurrentStep] = useState<'welcome' | 'name' | 'work' | 'biometric' | 'scroll' | 'sections' | 'thanks' | 'complete'>('welcome');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [showScrollText, setShowScrollText] = useState(false);
  const [showSections, setShowSections] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [thanksCountdown, setThanksCountdown] = useState(3);
  const [isScrollDisabled, setIsScrollDisabled] = useState(false);
  const [displayedText2, setDisplayedText2] = useState('');
  const [isTyping2, setIsTyping2] = useState(false);
  const [hasStartedWelcome, setHasStartedWelcome] = useState(false);
  const [hasStartedName, setHasStartedName] = useState(false);
  const [hasStartedWork, setHasStartedWork] = useState(false);
  const [hasStartedScroll, setHasStartedScroll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const displayedTextRef = useRef<string>('');
  const welcomeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const thanksCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedWelcomeRef = useRef(false);
  const timerExecutedRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const typeTextRef = useRef<((targetText: string, onComplete: () => void) => void) | null>(null);
  const deleteTextRef = useRef<((onComplete: () => void) => void) | null>(null);
  const isMountedRef = useRef(true);
  const shouldExecuteRef = useRef(true);

  // Формируем тексты с учетом того, что user может быть еще не загружен
  const welcomeText = user?.name 
    ? t('welcomeWithName', { name: user.name.toUpperCase() })
    : t('welcome');
  const nameText = t('nameText');
  const workText = t('workText');
  const scrollText = t('scrollText');
  const thanksText = t('thanksText');
  const thanksText2 = t('thanksText2');

  // Функция для выделения ключевых слов в тексте
  const highlightKeywords = useCallback((text: string, currentStep: string) => {
    if (!text || text.trim().length === 0 || text === '\u00A0') {
      return [{ text, highlight: false }];
    }
    
    const parts: Array<{ text: string; highlight: boolean }> = [];
    
    // Определяем ключевые слова в зависимости от шага
    // Выделяем только имя пользователя и ALIUS-AI
    let keywords: string[] = [];
    if (currentStep === 'welcome' && user?.name) {
      keywords = [user.name.toUpperCase()];
    } else if (currentStep === 'name') {
      keywords = ['ALIUS-AI'];
    }
    
    if (keywords.length === 0) {
      return [{ text, highlight: false }];
    }
    
    // Находим все совпадения ключевых слов в тексте
    const matches: Array<{ start: number; end: number; word: string }> = [];
    
    keywords.forEach(keyword => {
      let searchIndex = 0;
      while (true) {
        const index = text.toUpperCase().indexOf(keyword.toUpperCase(), searchIndex);
        if (index === -1) break;
        matches.push({ start: index, end: index + keyword.length, word: keyword });
        searchIndex = index + 1;
      }
    });
    
    // Сортируем совпадения по позиции
    matches.sort((a, b) => a.start - b.start);
    
    // Удаляем перекрывающиеся совпадения (оставляем первое)
    const filteredMatches: Array<{ start: number; end: number; word: string }> = [];
    let lastEnd = 0;
    matches.forEach(match => {
      if (match.start >= lastEnd) {
        filteredMatches.push(match);
        lastEnd = match.end;
      }
    });
    
    if (filteredMatches.length === 0) {
      return [{ text, highlight: false }];
    }
    
    // Создаем части текста
    let lastIndex = 0;
    filteredMatches.forEach((match) => {
      // Текст до ключевого слова
      if (match.start > lastIndex) {
        parts.push({ text: text.slice(lastIndex, match.start), highlight: false });
      }
      // Ключевое слово
      parts.push({ text: text.slice(match.start, match.end), highlight: true });
      lastIndex = match.end;
    });
    
    // Текст после последнего ключевого слова
    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), highlight: false });
    }
    
    return parts.length > 0 ? parts : [{ text, highlight: false }];
  }, [user?.name]);

  // Функция для обертки слов в span, чтобы они не разрывались
  const wrapWords = useCallback((text: string) => {
    if (!text || text.trim().length === 0) {
      return <span>{text}</span>;
    }
    const words = text.split(/(\s+)/);
    return words.map((word, index) => {
      if (word.trim() === '') {
        return <span key={index}>{word}</span>;
      }
      // Для длинных слов (более 10 символов) добавляем специальный класс
      const isLongWord = word.length > 10;
      return (
        <span key={index} className={`tutorial-word ${isLongWord ? 'tutorial-word-long' : ''}`}>
          {word}
        </span>
      );
    });
  }, []);

  const typeText = useCallback((targetText: string, onComplete: () => void) => {
    // Очищаем предыдущий timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (!targetText || targetText.trim().length === 0) {
      console.warn('Tutorial typeText: empty text provided');
      return;
    }

    // Устанавливаем начальные состояния
    setIsDeleting(false);
    setIsTyping(true);
    displayedTextRef.current = '';
    setDisplayedText('');

    const text = targetText;
    let index = 0;
    
    // Рекурсивная функция для печати
    const typeNextChar = () => {
      index += 1;
      
      if (index <= text.length) {
        const newText = text.slice(0, index);
        displayedTextRef.current = newText;
        setDisplayedText(newText);
        
        // Планируем следующий символ
        typingTimeoutRef.current = setTimeout(typeNextChar, 50);
      } else {
        // Завершили печать
        typingTimeoutRef.current = null;
        setIsTyping(false);
        
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    };
    
    // Запускаем печать первого символа с небольшой задержкой
    // чтобы убедиться, что состояние обновилось
    typingTimeoutRef.current = setTimeout(() => {
      typeNextChar();
    }, 10);
  }, []);

  const deleteText = useCallback((onComplete: () => void) => {
    // Очищаем предыдущий timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    setIsDeleting(true);
    setIsTyping(false);

    // Получаем текущий текст из ref
    const originalText = displayedTextRef.current;
    let currentLength = originalText.length;

    // Рекурсивная функция для удаления
    const deleteNextChar = () => {
      currentLength -= 1;
      
      if (currentLength >= 0) {
        const newText = originalText.slice(0, currentLength);
        displayedTextRef.current = newText;
        setDisplayedText(newText);
        
        // Планируем удаление следующего символа
        typingTimeoutRef.current = setTimeout(deleteNextChar, 30);
      } else {
        typingTimeoutRef.current = null;
        setIsDeleting(false);
        displayedTextRef.current = '';
        setDisplayedText('');
        onComplete();
      }
    };
    
    // Запускаем удаление первого символа
    deleteNextChar();
  }, []);

  // Обновляем refs при изменении функций
  useEffect(() => {
    typeTextRef.current = typeText;
    deleteTextRef.current = deleteText;
  }, [typeText, deleteText]);

  const handleComplete = useCallback(async () => {
    await markTutorialSeen();
    onComplete();
  }, [markTutorialSeen, onComplete]);

  // Проверка на мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Функция для показа панели благодарности
  const showThanksPanel = useCallback(() => {
    setHasScrolledToBottom(true);
    setIsScrollDisabled(true);
    if (sectionsRef.current) {
      sectionsRef.current.style.overflow = 'hidden';
      sectionsRef.current.style.pointerEvents = 'none';
    }
    
    setTimeout(() => {
      setShowThanks(true);
      displayedTextRef.current = '';
      setDisplayedText('');
      setIsTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      let thanksIndex = 0;
      const textToType = thanksText;
      
      const typeThanksChar = () => {
        thanksIndex += 1;
        if (thanksIndex <= textToType.length) {
          const newText = textToType.slice(0, thanksIndex);
          displayedTextRef.current = newText;
          setDisplayedText(newText);
          
          typingTimeoutRef.current = setTimeout(typeThanksChar, 50);
        } else {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          setIsTyping(false);
          
          // Печатаем вторую строку
          setIsTyping2(true);
          let thanksIndex2 = 0;
          const textToType2 = thanksText2;
          
          const typeThanksChar2 = () => {
            thanksIndex2 += 1;
            if (thanksIndex2 <= textToType2.length) {
              setDisplayedText2(textToType2.slice(0, thanksIndex2));
              typingTimeoutRef.current = setTimeout(typeThanksChar2, 50);
            } else {
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              setIsTyping2(false);
              
              // Запускаем таймер обратного отсчета
              setThanksCountdown(3);
              let countdown = 3;
              thanksCountdownIntervalRef.current = setInterval(() => {
                countdown -= 1;
                setThanksCountdown(countdown);
                
                if (countdown <= 0) {
                  if (thanksCountdownIntervalRef.current) {
                    clearInterval(thanksCountdownIntervalRef.current);
                    thanksCountdownIntervalRef.current = null;
                  }
                  handleComplete();
                }
              }, 1000);
            }
          };
          
          typingTimeoutRef.current = setTimeout(typeThanksChar2, 50);
        }
      };
      
      typingTimeoutRef.current = setTimeout(typeThanksChar, 50);
    }, 500);
  }, [thanksText, thanksText2, handleComplete]);

  // Запускаем печать при монтировании и изменении шага
  useEffect(() => {
    // Запускаем только один раз, если еще не начали (используем ref для защиты от двойного запуска в StrictMode)
    if (currentStep === 'welcome' && !hasStartedWelcomeRef.current) {
      hasStartedWelcomeRef.current = true;
      setHasStartedWelcome(true);
      
      // Используем имя пользователя, если оно доступно, иначе просто приветствие
      const text = user?.name 
        ? t('welcomeWithName', { name: user.name.toUpperCase() })
        : t('welcome');
      
      console.log('Tutorial: Starting welcome step with text:', text);
      console.log('Tutorial: typeText function exists:', typeof typeText === 'function');
      
      // Устанавливаем флаг выполнения в ref
      shouldExecuteRef.current = true;
      
      // Запускаем сразу, без задержки - компонент уже смонтирован
      // Используем микротаск для гарантии, что состояние обновлено
      Promise.resolve().then(() => {
        // Проверяем, что компонент все еще смонтирован
        if (!isMountedRef.current) {
          console.log('Tutorial: Component unmounted, skipping typeText');
          return;
        }
        
        // Проверяем флаг из ref
        if (!shouldExecuteRef.current) {
          console.log('Tutorial: Execution was canceled');
          return;
        }
        
        // Проверяем ref еще раз для надежности
        if (!hasStartedWelcomeRef.current) {
          console.log('Tutorial: Tutorial was reset, skipping typeText');
          return;
        }
        
        console.log('Tutorial: Starting typeText with text:', text);
        const currentTypeText = typeTextRef.current || typeText;
        const currentDeleteText = deleteTextRef.current || deleteText;
        
        console.log('Tutorial: typeText from ref:', typeof currentTypeText, 'from closure:', typeof typeText);
        
        if (typeof currentTypeText === 'function') {
          try {
            console.log('Tutorial: Calling typeText now');
            currentTypeText(text, () => {
              console.log('Tutorial: typeText completed');
          setTimeout(() => {
                console.log('Tutorial: Starting deleteText');
                if (typeof currentDeleteText === 'function') {
                  currentDeleteText(() => {
                    console.log('Tutorial: deleteText completed, moving to name step');
              setCurrentStep('name');
            });
                } else {
                  console.error('Tutorial: deleteText is not a function');
                  setCurrentStep('name');
                }
          }, 2000);
        });
          } catch (error) {
            console.error('Tutorial: Error calling typeText:', error);
    }
        } else {
          console.error('Tutorial: typeText is not a function, type:', typeof currentTypeText);
        }
      });

      // Cleanup функция - отменяем выполнение только если это реальное размонтирование
      // В StrictMode не отменяем, чтобы Promise успел выполниться
      return () => {
        console.log('Tutorial: Cleanup called (component unmounting)');
        // Не сбрасываем shouldExecuteRef здесь, так как в StrictMode это вызовется до выполнения Promise
        // Сбросим только при реальном размонтировании в основном cleanup эффекте
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Запускаем только один раз при монтировании

  useEffect(() => {
    if (currentStep === 'name' && !hasStartedName) {
      setHasStartedName(true);
      typeText(nameText, () => {
        setTimeout(() => {
          deleteText(() => {
            setCurrentStep('work');
          });
        }, 2000);
      });
    }
  }, [currentStep, hasStartedName, nameText, typeText, deleteText]);

  useEffect(() => {
    if (currentStep === 'work' && !hasStartedWork) {
      setHasStartedWork(true);
      typeText(workText, () => {
        setTimeout(() => {
          deleteText(() => {
            // Всегда показываем биометрию в туториале, даже если она уже подключена
            // Пользователь может пропустить её, если захочет
            setShowBiometric(true);
            setCurrentStep('biometric');
          });
        }, 2000);
      });
    }
  }, [currentStep, hasStartedWork, workText, typeText, deleteText]);

  useEffect(() => {
    if (currentStep === 'scroll' && !showScrollText && !hasStartedScroll) {
      setHasStartedScroll(true);
      setShowScrollText(true);
      typeText(scrollText, () => {
        setCurrentStep('sections');
        setShowSections(true);
      });
    }
  }, [currentStep, scrollText, showScrollText, hasStartedScroll, typeText]);

  useEffect(() => {
    if (!showSections || hasScrolledToBottom) return;
    // На мобильных устройствах отключаем автоматическое переключение
    if (isMobile) return;

    const checkScroll = () => {
      // Проверяем скролл внутри контейнера секций
      if (sectionsRef.current) {
        const element = sectionsRef.current;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        
        // Проверяем, когда текст 4-й секции начинает подниматься (появляется в viewport)
        const sections = element.querySelectorAll('.tutorial-section');
        if (sections.length >= 4 && !isScrollDisabled) {
          const fourthSection = sections[3]; // 4-я секция (индекс 3)
          
          if (fourthSection) {
            // Находим именно текстовый блок 4-й секции, а не фотографии
            const fourthSectionText = fourthSection.querySelector('.tutorial-section-text-sticky');
            
            if (fourthSectionText) {
              const fourthTextRect = fourthSectionText.getBoundingClientRect();
              const containerRect = element.getBoundingClientRect();
              
              // Проверяем, когда текст 4-й секции полностью виден в viewport
              // Скролл отключаем только когда текст находится в верхней части viewport и полностью виден
              const fourthTextTopRelative = fourthTextRect.top - containerRect.top;
              const fourthTextBottomRelative = fourthTextRect.bottom - containerRect.top;
              const viewportHeight = containerRect.height;
              
              // Если текст 4-й секции полностью виден (его верхняя часть в верхней части viewport, а нижняя еще видна)
              // Это означает, что пользователь доскроллил до текста 4-й секции и он полностью виден
              if (fourthTextTopRelative <= viewportHeight * 0.1 && fourthTextBottomRelative <= viewportHeight * 0.9) {
                showThanksPanel();
              }
            }
          }
        }
        
        // Более строгая проверка - пользователь должен быть практически в самом низу (50px отступ)
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        const allSectionsVisible = sections.length >= 4;
        
        if (isAtBottom && allSectionsVisible && !hasScrolledToBottom) {
          showThanksPanel();
        }
      }
    };

    const element = sectionsRef.current;
    if (element && !isScrollDisabled) {
      // Проверяем скролл внутри контейнера секций
      element.addEventListener('scroll', checkScroll);
      // Проверяем сразу с задержкой, чтобы дать время контенту отрендериться
      const checkTimeout = setTimeout(checkScroll, 1000);
      
      return () => {
        element.removeEventListener('scroll', checkScroll);
        clearTimeout(checkTimeout);
      };
    }
  }, [showSections, hasScrolledToBottom, isScrollDisabled, isMobile, showThanksPanel]);

  const handleBiometricSkip = () => {
    setShowBiometric(false);
    setCurrentStep('scroll');
  };

  const handleBiometricComplete = () => {
    setShowBiometric(false);
    setCurrentStep('scroll');
  };

  // Cleanup при размонтировании
  useEffect(() => {
    isMountedRef.current = true;
    shouldExecuteRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      // Сбрасываем refs при размонтировании
      hasStartedWelcomeRef.current = false;
      timerExecutedRef.current = false;
      shouldExecuteRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (welcomeTimerRef.current) {
        clearTimeout(welcomeTimerRef.current);
        welcomeTimerRef.current = null;
      }
      if (thanksCountdownIntervalRef.current) {
        clearInterval(thanksCountdownIntervalRef.current);
        thanksCountdownIntervalRef.current = null;
      }
    };
  }, []);

  // Блокировка скролла во время анимации печати
  useEffect(() => {
    const isAnimating = isTyping || isDeleting || isTyping2;
    
    if (isAnimating) {
      // Сохраняем текущую позицию скролла
      const scrollY = window.scrollY;
      // Блокируем скролл
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Восстанавливаем скролл
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup при размонтировании
    return () => {
      if (isAnimating) {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    };
  }, [isTyping, isDeleting, isTyping2]);

  // Отладочный вывод
  useEffect(() => {
    console.log('Tutorial render state:', {
      currentStep,
      hasStartedWelcome,
      displayedText,
      isTyping,
      isDeleting,
      user: user?.name || 'no user'
    });
  }, [currentStep, hasStartedWelcome, displayedText, isTyping, isDeleting, user]);

  return (
    <div className="tutorial-container">
      {/* Большой текст печати */}
      {(currentStep === 'welcome' || currentStep === 'name' || currentStep === 'work') && (
        <div className="tutorial-typing-container">
          <motion.h1
            className="tutorial-typing-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            key={currentStep}
          >
            {highlightKeywords(displayedText || '\u00A0', currentStep).map((part, index) => {
              // Разбиваем текст на слова и пробелы, чтобы каждое слово было в отдельном span
              const words = part.text.split(/(\s+)/);
              return words.map((word, wordIndex) => {
                if (word.trim() === '') {
                  // Пробелы оставляем как есть
                  return <span key={`${index}-${wordIndex}`}>{word}</span>;
                }
                return (
                  <span
                    key={`${index}-${wordIndex}`}
                    className={part.highlight ? 'tutorial-keyword' : 'tutorial-word'}
                  >
                    {word}
                  </span>
                );
              });
            })}
            {isTyping && !isDeleting && (
              <span className="tutorial-cursor">|</span>
            )}
          </motion.h1>
        </div>
      )}

      {/* Панель биометрии */}
      <AnimatePresence>
        {showBiometric && (
          <BiometricPanel
            onSkip={handleBiometricSkip}
            onComplete={handleBiometricComplete}
          />
        )}
      </AnimatePresence>

      {/* Please follow below text */}
      {showScrollText && currentStep === 'scroll' && (
        <motion.div
          className="tutorial-scroll-text-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="tutorial-scroll-text">{wrapWords(displayedText)}</h2>
        </motion.div>
      )}

      {/* Секции туториала */}
      {showSections && (
        <motion.div 
          ref={sectionsRef} 
          className="tutorial-sections-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Секция ALIUS-AI */}
          <TutorialSection
            title="ALIUS-AI"
            content={
              <div className="premium-content-text-wrapper">
                <p className="premium-content-text">
                  Я — <Link href="/alius-ai" className="tutorial-link">AliusAI</Link>, интеллектуальное ядро платформы DO:GOOD.
                </p>
                <p className="premium-content-text">
                  Моя задача — объединять все функции сайта в единый, понятный и живой интерфейс.
                </p>
                <p className="premium-content-text">
                  Через меня вы можете:
                </p>
                <div className="premium-content-text">
                  <ul>
                    <li>находить и поддерживать проекты;</li>
                    <li>отслеживать результаты своих пожертвований;</li>
                    <li>взаимодействовать с фондами и участниками сообщества.</li>
                  </ul>
                </div>
                <p className="premium-content-text premium-text-highlight">
                  Я создан, чтобы помогать вам делать добро осознанно, прозрачно и с максимальным эффектом.
                </p>
              </div>
            }
            images={['/images/50.jpg', '/images/52.jpg', '/images/53.jpg']}
            imagePosition="right"
          />

          {/* Секция о фонде */}
          <TutorialSection
            title={t('aboutFoundation')}
            content={
              <div className="premium-content-text-wrapper">
                <p className="premium-content-text">
                  Мы — фонд, который делает добро осмысленным и сильным.
                </p>
                <p className="premium-content-text">
                  Наша миссия — поддерживать проекты, способные изменить жизнь,
                  подарить устойчивость, вдохновение и веру в будущее.
                </p>
                <p className="premium-content-text">
                  Мы верим, что системные решения рождаются из человеческого участия —
                  из заботы, ответственности и желания действовать.
                </p>
                <p className="premium-content-text premium-text-highlight">
                  Каждый вклад здесь становится частью большого движения,
                  где добро — не случайность, а закономерность.
                </p>
              </div>
            }
            images={['/images/54.jpg', '/images/55.jpg', '/images/56.jpg']}
            imagePosition="right"
          />

          {/* Секция о проектах */}
          <TutorialSection
            title="Как выбрать проект"
            content={
              <div className="premium-content-text-wrapper">
                <p className="premium-content-text">
                  Каждый проект — это история, к которой вы можете прикоснуться.
                </p>
                <p className="premium-content-text">
                  На <Link href="/programs" className="tutorial-link">странице каталога</Link> вы найдёте инициативы с чёткими целями и результатами, которые меняют жизни.
                </p>
                <p className="premium-content-text">
                  Выберите тот, что ближе вашим ценностям, — а мы обеспечим безопасную и прозрачную поддержку в один клик.
                </p>
                <p className="premium-content-text premium-text-highlight">
                  Ваш выбор имеет значение. Каждое пожертвование — это шаг к реальным изменениям, которые вы можете увидеть и почувствовать.
                </p>
              </div>
            }
            images={['/images/11.jpg', '/images/12.jpg', '/images/13.jpg']}
            imagePosition="right"
          />

          {/* Секция о доверии */}
          <TutorialSection
            title="Почему нам можно доверять"
            content={
              <div className="premium-content-text-wrapper">
                <p className="premium-content-text">
                  Нам доверяют, потому что мы действуем открыто.
                </p>
                <p className="premium-content-text">
                  Каждый проект проходит тщательную проверку, а каждое пожертвование можно отследить от начала до результата.
                </p>
                <p className="premium-content-text">
                  Мы обеспечиваем:
                </p>
                <div className="premium-content-text">
                  <ul>
                    <li>прозрачность всех финансовых потоков;</li>
                    <li>честные отчёты о достигнутых результатах;</li>
                    <li>эффективность и ответственность на каждом этапе;</li>
                    <li>профессиональную команду, для которой доверие — не обещание, а принцип.</li>
                  </ul>
                </div>
                <p className="premium-content-text premium-text-highlight">
                  Доверие — это не то, что мы просим, а то, что мы заслуживаем каждый день своей работой.
                </p>
              </div>
            }
            images={['/images/40.jpg', '/images/42.jpg', '/images/43.jpg']}
            imagePosition="right"
          />

          {/* Кнопка "Завершить обучение" только на мобильных */}
          {isMobile && (
            <motion.div
              className="tutorial-complete-button-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                padding: '2rem 1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%'
              }}
            >
              <button
                onClick={showThanksPanel}
                className="premium-button"
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(6, 95, 70, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(6, 95, 70, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 95, 70, 0.3)';
                }}
              >
                {t('completeTutorial')}
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Текст благодарности */}
      {showThanks && (
        <motion.div
          className="tutorial-thanks-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 1000, 
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <motion.div
            className="tutorial-typing-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ 
              maxWidth: '1200px', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '2rem'
            }}
          >
            <div className="tutorial-thanks-text-container" style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              marginBottom: '4rem'
            }}>
              <motion.h1
                className="tutorial-typing-text tutorial-thanks-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ 
                  lineHeight: '1.3',
                  marginBottom: '0.75rem',
                  textAlign: 'center',
                  display: 'block',
                  width: '100%',
                  margin: '0 auto',
                  overflowWrap: 'normal',
                  wordBreak: 'normal'
                }}
              >
                {wrapWords(displayedText)}
                {isTyping && (
                  <span className="tutorial-cursor">|</span>
                )}
              </motion.h1>
              <motion.h1
                className="tutorial-typing-text tutorial-thanks-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ 
                  lineHeight: '1.3',
                  textAlign: 'center',
                  display: 'block',
                  width: '100%',
                  margin: '0 auto',
                  overflowWrap: 'normal',
                  wordBreak: 'normal'
                }}
              >
                {wrapWords(displayedText2)}
                {isTyping2 && (
                  <span className="tutorial-cursor">|</span>
                )}
              </motion.h1>
            </div>
            {!isTyping && !isTyping2 && displayedText && displayedText2 && (
              <motion.div
                className="tutorial-thanks-countdown"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                style={{
                  marginTop: '3rem',
                  textAlign: 'center',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <p className="tutorial-thanks-countdown-text">
                  Через {thanksCountdown} секунд мы
                </p>
                <p className="tutorial-thanks-countdown-text">
                  переведем вас на главную страницу
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}>
                  {[0, 1, 2].map((index) => {
                    const animationStyles = thanksCountdown > index ? {
                      animationName: 'pulse',
                      animationDuration: '1s',
                      animationTimingFunction: 'ease-in-out',
                      animationIterationCount: 'infinite',
                      animationDelay: `${index * 0.2}s`
                    } : {
                      animation: 'none'
                    };
                    
                    return (
                      <div
                        key={index}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: thanksCountdown > index ? '#4ade80' : '#0a0a0a',
                          transition: 'background 0.3s ease',
                          ...animationStyles
                        }}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

interface TutorialSectionProps {
  title: string;
  content: React.ReactNode;
  images: string[];
  imagePosition: 'left' | 'right';
}

function TutorialSection({ title, content, images, imagePosition }: TutorialSectionProps) {
  return (
    <section className="tutorial-section">
      <div className="tutorial-section-content">
        {imagePosition === 'left' && images.length > 0 && (
          <div className="tutorial-section-images-stack">
            {images.map((img, idx) => (
              <div key={idx} className="tutorial-section-image-item">
                <div className="tutorial-section-image-wrapper">
                <Image
                  src={img}
                  alt={`${title} - изображение ${idx + 1}`}
                  fill
                  className="tutorial-section-image"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="tutorial-section-text-sticky">
          <h3 className="tutorial-section-title">{title}</h3>
          <div className="tutorial-section-paragraph">{content}</div>
        </div>

        {imagePosition === 'right' && images.length > 0 && (
          <div className="tutorial-section-images-stack">
            {images.map((img, idx) => (
              <div key={idx} className="tutorial-section-image-item">
                <div className="tutorial-section-image-wrapper">
                <Image
                  src={img}
                  alt={`${title} - изображение ${idx + 1}`}
                  fill
                  className="tutorial-section-image"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
