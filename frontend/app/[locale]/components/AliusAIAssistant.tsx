'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useAuth } from '../../contexts/AuthContext';

type ChatState = 'closed' | 'opening' | 'open';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function AliusAIAssistant() {
  const t = useTranslations('common.aliusAI');
  const [chatState, setChatState] = useState<ChatState>('closed');
  const [isMounted, setIsMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const circleButtonRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Автопрокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Показываем приветствие при открытии чата
  useEffect(() => {
    if (chatState === 'open' && messages.length === 0) {
      setTimeout(() => {
        typeMessage(getWelcomeMessage());
      }, 150);
    }
  }, [chatState]);

  const getWelcomeMessage = () => {
    const userName = user?.name || 'друг';
    const greetings = [
      `Привет, ${userName}! 👋 Я AliusAI, ваш персональный ассистент по благотворительности. Чем могу помочь?`,
      `Здравствуйте, ${userName}! 🌟 Рад вас видеть! Готов помочь вам сделать мир лучше. Что вас интересует?`,
      `Добро пожаловать, ${userName}! 💚 Я здесь, чтобы помочь вам найти проекты, отслеживать ваши пожертвования и отвечать на вопросы.`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const typeMessage = async (text: string) => {
    setIsTyping(true);
    const newMessage: Message = {
      id: Date.now().toString(),
      text: '',
      sender: 'bot',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);

    // Эффект печатания
    for (let i = 0; i <= text.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 10));
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, text: text.slice(0, i) }
            : msg
        )
      );
    }
    
    setIsTyping(false);
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Простые ответы на популярные вопросы
    // Check both Russian and English keywords
    if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return t('greeting');
    }
    
    if (lowerMessage.includes('помощь') || lowerMessage.includes('помог') || lowerMessage.includes('help')) {
      return t('help');
    }
    
    if (lowerMessage.includes('проект') || lowerMessage.includes('project')) {
      return t('projects');
    }
    
    if (lowerMessage.includes('достижени') || lowerMessage.includes('achievement')) {
      return t('achievements');
    }
    
    if (lowerMessage.includes('подписк') || lowerMessage.includes('subscription')) {
      return t('subscriptions');
    }
    
    if (lowerMessage.includes('спасибо') || lowerMessage.includes('благодар') || lowerMessage.includes('thank')) {
      return t('thanks');
    }
    
    if ((lowerMessage.includes('как') && lowerMessage.includes('дела')) || lowerMessage.includes('how are you')) {
      return t('howAreYou');
    }
    
    // Дефолтный ответ
    const defaultResponses = [
      t('default1'),
      t('default2'),
      t('default3'),
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Получаем ответ бота с задержкой
    setTimeout(() => {
      const response = getBotResponse(userMessage.text);
      typeMessage(response);
    }, 250);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Слушаем событие для открытия чата из других компонентов
  useEffect(() => {
    const handleOpenChat = () => {
      if (chatState === 'closed') {
        setChatState('opening');
        setTimeout(() => setChatState('open'), 75);
      }
    };

    window.addEventListener('openAliusChat', handleOpenChat);
    return () => window.removeEventListener('openAliusChat', handleOpenChat);
  }, [chatState]);

  // Закрытие чата при клике вне окна
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chatState === 'open') {
        const target = e.target as HTMLElement;
        // Проверяем, что клик был вне окна чата
        if (
          chatWindowRef.current &&
          !chatWindowRef.current.contains(target)
        ) {
          setChatState('closed');
        }
      }
    };

    if (chatState === 'open') {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [chatState]);

  const handleClick = () => {
    if (chatState === 'closed') {
      setChatState('opening');
      setTimeout(() => setChatState('open'), 75);
    } else {
      setChatState('closed');
      // Не очищаем сообщения при закрытии, чтобы история сохранялась
    }
  };



  if (!isMounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 alius-assistant-container">
      {/* Чат окно */}
      <AnimatePresence mode="wait">
        {chatState === 'open' && (
          <motion.div
            key="chat-window"
            ref={chatWindowRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="alius-chat-window"
          >
            {/* Фоновые частицы для эффекта ИИ */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: Math.random() * 4 + 2 + 'px',
                    height: Math.random() * 4 + 2 + 'px',
                    background: `rgba(74, 222, 128, ${Math.random() * 0.3 + 0.1})`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.2, 0.6, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            <div className="alius-chat-header">
              <div className="alius-chat-header-content">
                <div className="alius-chat-avatar">
                  <Image
                    src="/images/ai.png"
                    alt="AliusAI"
                    width={24}
                    height={24}
                    className="object-contain"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </div>
                <div>
                  <div className="alius-chat-name">AliusAI</div>
                  <div className="alius-chat-status">Ваш ИИ ассистент</div>
                </div>
              </div>
              <button
                onClick={handleClick}
                className="alius-chat-close"
                aria-label="Закрыть чат"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="alius-chat-messages">
              {messages.length === 0 && !isTyping && (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  <div className="text-center">
                    <div className="mb-2">💬</div>
                    <div>Загрузка...</div>
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.1 }}
                  className={`alius-chat-message ${
                    message.sender === 'bot' 
                      ? 'alius-chat-message-bot' 
                      : 'alius-chat-message-user'
                  }`}
                >
                  <div className="alius-chat-message-content">
                    {message.text.split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                    {message.sender === 'bot' && message.id === messages[messages.length - 1]?.id && isTyping && (
                      <motion.span
                        animate={{ opacity: [1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          repeatType: 'reverse',
                          ease: 'easeInOut',
                        }}
                        className="inline-block ml-1"
                      >
                        |
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="alius-chat-input-wrapper">
              <input
                type="text"
                placeholder="Напишите сообщение..."
                className="alius-chat-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isTyping}
              />
              <button 
                className="alius-chat-send"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                style={{ 
                  opacity: (!inputValue.trim() || isTyping) ? 0.5 : 1,
                  cursor: (!inputValue.trim() || isTyping) ? 'not-allowed' : 'pointer'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Круг с иконкой */}
      <AnimatePresence mode="wait">
        {chatState === 'closed' && (
          <motion.div
            key="circle-container"
            ref={circleButtonRef}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex items-end gap-0 relative alius-circle-container"
            style={{ position: 'fixed', bottom: '24px', right: '24px' }}
          >
            {/* Основной круг */}
            <motion.div
              className="relative flex-shrink-0 cursor-pointer alius-circle-button"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%)',
                boxShadow: 
                  '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.05)',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClick}
            >
              {/* Иконка с легким покачиванием */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center alius-circle-icon-wrapper"
                initial={{ opacity: 1 }}
                animate={{
                  y: [0, -2, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  y: {
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                  rotate: {
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  src="/images/ai.png"
                  alt="AliusAI"
                  width={28}
                  height={28}
                  className="object-contain alius-circle-icon"
                  style={{ 
                    filter: 'brightness(0) invert(1)',
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
              </motion.div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
