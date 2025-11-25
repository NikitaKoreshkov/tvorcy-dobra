'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { Link } from '@/src/routing';
import { ArrowRightIcon } from '../../components/Icons';
import { useTranslations } from 'next-intl';

export default function ReleaseNotesPage() {
  const t = useTranslations('releaseNotesPage');
  const heroRef = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isHeroInView = useInView(heroRef, viewOptions);
  const isInView1 = useInView(ref1, viewOptions);
  const isInView2 = useInView(ref2, viewOptions);

  const [expandedVersion, setExpandedVersion] = useState<string | null>('2.2.0');

  const releases = [
    {
      version: '2.2.0',
      date: '20 декабря 2024',
      type: 'feature',
      features: [
        'Добавлена расширенная система фильтрации проектов по множественным критериям',
        'Улучшена производительность загрузки страниц на 40%',
        'Добавлена возможность экспорта отчетов в различных форматах (PDF, Excel, CSV)',
        'Реализована система push-уведомлений в браузере',
        'Добавлена темная тема интерфейса',
        'Улучшена мобильная версия для планшетов',
      ],
      improvements: [
        'Оптимизирована работа с большими объемами данных',
        'Улучшена безопасность платежных операций',
        'Обновлен дизайн карточек проектов',
      ],
      fixes: [
        'Исправлена ошибка с отображением суммы пожертвований в некоторых браузерах',
        'Устранена проблема с загрузкой изображений на медленных соединениях',
        'Исправлена работа фильтров в личном кабинете',
      ],
    },
    {
      version: '2.1.0',
      date: '15 декабря 2024',
      type: 'major',
      features: [
        'Добавлен интеллектуальный помощник AliusAI (бета-версия)',
        'Реализована система геймификации с достижениями и наградами',
        'Добавлен рейтинг благотворителей',
        'Улучшена система отчетности о пожертвованиях с детальной аналитикой',
        'Обновлен дизайн личного кабинета с улучшенной навигацией',
        'Добавлена возможность персонализации профиля пользователя',
        'Реализована система регулярных пожертвований (подписок)',
        'Добавлены расширенные настройки приватности профиля',
      ],
      improvements: [
        'Полностью переработан интерфейс личного кабинета',
        'Улучшена система поиска проектов',
        'Оптимизирована работа с изображениями',
        'Добавлена поддержка дополнительных языков интерфейса',
      ],
      fixes: [
        'Исправлены проблемы с отображением на мобильных устройствах',
        'Устранены ошибки при обработке платежей',
        'Исправлена работа системы уведомлений',
      ],
    },
    {
      version: '2.0.0',
      date: '1 ноября 2024',
      type: 'major',
      features: [
        'Полностью обновленный интерфейс платформы с современным дизайном',
        'Новая система подписок и регулярных пожертвований',
        'Расширенные возможности профиля пользователя',
        'Улучшенная система безопасности платежей с двухфакторной аутентификацией',
        'Добавлена интеграция с популярными платежными системами',
        'Реализована система рекомендаций проектов на основе интересов пользователя',
        'Добавлена возможность создания коллективных пожертвований',
        'Новая система отчетности с интерактивными графиками и диаграммами',
      ],
      improvements: [
        'Полностью переработана архитектура платформы',
        'Улучшена производительность и скорость загрузки',
        'Оптимизирована работа на мобильных устройствах',
        'Добавлена поддержка PWA (Progressive Web App)',
      ],
      fixes: [
        'Исправлены все критические ошибки безопасности',
        'Устранены проблемы с совместимостью браузеров',
        'Исправлена работа системы уведомлений',
      ],
    },
    {
      version: '1.8.0',
      date: '15 октября 2024',
      type: 'feature',
      features: [
        'Добавлена система поиска по проектам с умными фильтрами',
        'Реализована возможность сохранения избранных проектов',
        'Добавлена функция сравнения проектов',
        'Улучшена система комментариев и обратной связи',
        'Добавлена интеграция с социальными сетями для шаринга',
      ],
      improvements: [
        'Улучшена производительность поиска',
        'Оптимизирована работа с базой данных',
        'Обновлен дизайн форм обратной связи',
      ],
      fixes: [
        'Исправлена ошибка с отображением дат в отчетах',
        'Устранена проблема с загрузкой комментариев',
      ],
    },
    {
      version: '1.7.0',
      date: '1 октября 2024',
      type: 'feature',
      features: [
        'Добавлена система уведомлений в реальном времени',
        'Реализована возможность подписки на обновления проектов',
        'Добавлена функция напоминаний о регулярных пожертвованиях',
        'Улучшена система email-рассылок',
      ],
      improvements: [
        'Оптимизирована работа системы уведомлений',
        'Улучшена доставляемость email-сообщений',
      ],
      fixes: [
        'Исправлена проблема с дублированием уведомлений',
        'Устранена ошибка с отправкой email на некоторые домены',
      ],
    },
    {
      version: '1.6.0',
      date: '15 сентября 2024',
      type: 'feature',
      features: [
        'Добавлена система достижений и геймификации',
        'Реализована возможность создания персональных целей по пожертвованиям',
        'Добавлена интеграция с календарем для планирования пожертвований',
        'Улучшена система статистики в личном кабинете',
      ],
      improvements: [
        'Обновлен дизайн дашборда личного кабинета',
        'Улучшена визуализация статистики',
      ],
      fixes: [
        'Исправлена ошибка с расчетом статистики',
        'Устранена проблема с отображением графиков',
      ],
    },
    {
      version: '1.5.0',
      date: '10 сентября 2024',
      type: 'feature',
      features: [
        'Новые способы оплаты: электронные кошельки и криптовалюты',
        'Улучшена мобильная версия сайта с адаптивным дизайном',
        'Оптимизирована производительность платформы на 30%',
        'Добавлена поддержка нескольких валют',
        'Реализована система кэширования для ускорения загрузки',
      ],
      improvements: [
        'Улучшена работа на устройствах с низкой скоростью интернета',
        'Оптимизирована загрузка изображений',
        'Обновлен алгоритм рекомендаций проектов',
      ],
      fixes: [
        'Исправлены проблемы с отображением на iOS устройствах',
        'Устранена ошибка с обработкой платежей в некоторых регионах',
        'Исправлена работа системы восстановления пароля',
      ],
    },
    {
      version: '1.4.0',
      date: '1 августа 2024',
      type: 'feature',
      features: [
        'Добавлена система комментариев к проектам',
        'Реализована возможность задавать вопросы организаторам проектов',
        'Добавлена функция оценки проектов пользователями',
        'Улучшена система модерации контента',
      ],
      improvements: [
        'Обновлен интерфейс страниц проектов',
        'Улучшена система фильтрации комментариев',
      ],
      fixes: [
        'Исправлена проблема с отображением длинных комментариев',
        'Устранена ошибка с модерацией контента',
      ],
    },
    {
      version: '1.3.0',
      date: '15 июля 2024',
      type: 'feature',
      features: [
        'Добавлена система отчетов о реализации проектов',
        'Реализована возможность просмотра истории изменений проектов',
        'Добавлена функция экспорта данных о пожертвованиях',
        'Улучшена система документооборота',
      ],
      improvements: [
        'Обновлен формат отчетов',
        'Улучшена читаемость документов',
      ],
      fixes: [
        'Исправлена ошибка с генерацией отчетов',
        'Устранена проблема с экспортом данных',
      ],
    },
    {
      version: '1.2.0',
      date: '1 июля 2024',
      type: 'feature',
      features: [
        'Добавлена система регулярных пожертвований',
        'Реализована возможность управления подписками',
        'Добавлена функция приостановки регулярных платежей',
        'Улучшена система уведомлений о платежах',
      ],
      improvements: [
        'Обновлен интерфейс управления подписками',
        'Улучшена система обработки регулярных платежей',
      ],
      fixes: [
        'Исправлена ошибка с автоматическим списанием средств',
        'Устранена проблема с уведомлениями о платежах',
      ],
    },
    {
      version: '1.1.0',
      date: '15 июня 2024',
      type: 'feature',
      features: [
        'Добавлена система личного кабинета',
        'Реализована возможность просмотра истории пожертвований',
        'Добавлена функция настройки профиля',
        'Улучшена система безопасности аккаунта',
      ],
      improvements: [
        'Обновлен дизайн личного кабинета',
        'Улучшена навигация по разделам',
      ],
      fixes: [
        'Исправлена ошибка с отображением истории',
        'Устранена проблема с настройками профиля',
      ],
    },
    {
      version: '1.0.0',
      date: '1 июня 2024',
      type: 'major',
      features: [
        'Первая публичная версия платформы Творцы Добра',
        'Базовый функционал для пожертвований с поддержкой банковских карт',
        'Система проектов и программ с детальными описаниями',
        'Личный кабинет пользователя с базовыми функциями',
        'Система категоризации проектов',
        'Базовая система отчетности',
        'Интеграция с платежными системами',
        'Адаптивный дизайн для мобильных устройств',
        'Многоязычная поддержка (русский и английский)',
        'Система регистрации и авторизации пользователей',
      ],
      improvements: [],
      fixes: [],
    },
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'major':
        return t('majorUpdate');
      case 'feature':
        return t('typeFeature');
      case 'bugfix':
        return t('typeBugfix');
      default:
        return t('typeUpdate');
    }
  };

  const toggleVersion = (version: string) => {
    setExpandedVersion(expandedVersion === version ? null : version);
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

      {/* Releases Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50/50" ref={ref1}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-black">
              {t('updateHistory')}
            </h2>
            <p className="text-xl text-black/60 leading-relaxed">
              {t('updateHistoryDescription')}
            </p>
          </motion.div>

          <div className="space-y-4">
            {releases.map((release, index) => (
              <motion.div
                key={release.version}
                className={`bg-white rounded-3xl border-2 overflow-hidden ${
                  expandedVersion === release.version 
                    ? 'border-black/20 shadow-xl' 
                    : 'border-black/5'
                }`}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={isInView1 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.05, 
                  ease: [0.6, -0.05, 0.01, 0.99] 
                }}
                whileHover={{ y: -4 }}
              >
                <motion.button
                  onClick={() => toggleVersion(release.version)}
                  className="w-full px-6 lg:px-8 py-6 flex items-center justify-between text-left hover:bg-black/5 transition-colors"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <h3 className="text-2xl lg:text-3xl font-bold text-black">
                      {t('version')} {release.version}
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-black text-white text-sm font-medium">
                      {getTypeLabel(release.type)}
                    </span>
                    <span className="text-black/60 text-sm lg:text-base">
                      {release.date}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedVersion === release.version ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRightIcon className="w-5 h-5 text-black/40" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {expandedVersion === release.version && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 lg:px-8 pb-6 space-y-6 border-t border-black/5 pt-6">
                        {release.features.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <h4 className="text-lg font-bold text-black mb-4">✨ {t('features')}</h4>
                            <ul className="space-y-2">
                              {release.features.map((feature, idx) => (
                                <motion.li
                                  key={idx}
                                  className="flex items-start gap-3 text-black/70"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.15 + idx * 0.03 }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 flex-shrink-0"></span>
                                  <span className="leading-relaxed">{feature}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </motion.div>
                        )}

                        {release.improvements.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <h4 className="text-lg font-bold text-black mb-4">⚡ {t('improvements')}</h4>
                            <ul className="space-y-2">
                              {release.improvements.map((improvement, idx) => (
                                <motion.li
                                  key={idx}
                                  className="flex items-start gap-3 text-black/70"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.25 + idx * 0.03 }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-black/60 mt-2 flex-shrink-0"></span>
                                  <span className="leading-relaxed">{improvement}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </motion.div>
                        )}

                        {release.fixes.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <h4 className="text-lg font-bold text-black mb-4">🐛 {t('fixes')}</h4>
                            <ul className="space-y-2">
                              {release.fixes.map((fix, idx) => (
                                <motion.li
                                  key={idx}
                                  className="flex items-start gap-3 text-black/70"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.35 + idx * 0.03 }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-black/40 mt-2 flex-shrink-0"></span>
                                  <span className="leading-relaxed">{fix}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-white" ref={ref2}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            className="bg-black rounded-3xl p-8 lg:p-12 text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 tracking-tight">
              Следите за обновлениями
            </h2>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Мы постоянно работаем над улучшением платформы. Следите за новыми версиями и обновлениями, 
              чтобы быть в курсе всех новых возможностей и улучшений.
            </p>
            <p className="text-white/70 leading-relaxed">
              Вы можете подписаться на уведомления о новых версиях в настройках личного кабинета. 
              Также мы публикуем информацию о важных обновлениях в наших социальных сетях.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
