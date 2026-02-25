'use client';

import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRef, useEffect, useState } from 'react';

interface Testimonial {
  id: number;
  name: string;
  role?: string;
  text: string;
  avatar?: string;
}

export default function SponsorsSection() {
  const t = useTranslations('homePage.sponsors');
  const ref = useRef(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isInView = useInView(ref, viewOptions);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const positionRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Список отзывов (можно заменить на реальные данные)
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: t('testimonial1Name'),
      role: t('testimonial1Role'),
      text: t('testimonial1Text'),
      avatar: null,
    },
    {
      id: 2,
      name: t('testimonial2Name'),
      role: t('testimonial2Role'),
      text: t('testimonial2Text'),
      avatar: null,
    },
    {
      id: 3,
      name: t('testimonial3Name'),
      role: t('testimonial3Role'),
      text: t('testimonial3Text'),
      avatar: null,
    },
    {
      id: 4,
      name: t('testimonial4Name'),
      role: t('testimonial4Role'),
      text: t('testimonial4Text'),
      avatar: null,
    },
    {
      id: 5,
      name: t('testimonial5Name'),
      role: t('testimonial5Role'),
      text: t('testimonial5Text'),
      avatar: null,
    },
    {
      id: 6,
      name: t('testimonial6Name'),
      role: t('testimonial6Role'),
      text: t('testimonial6Text'),
      avatar: null,
    },
  ];

  // Дублируем отзывы для бесконечной карусели
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  useEffect(() => {
    if (!trackRef.current || !isInView) return;

    const track = trackRef.current;
    const speed = isMobile ? 0.8 : 0.3; // Скорость движения (пикселей за кадр) - быстрее на мобильных и планшетах

    const animate = () => {
      // Останавливаем анимацию если наведена карточка
      if (hoveredIndex !== null) {
        animationRef.current = null;
        return;
      }

      positionRef.current -= speed;
      
      // Если прошли половину пути, сбрасываем позицию для бесконечного цикла
      const trackWidth = track.scrollWidth / 3; // Делим на 3, так как у нас 3 копии
      if (Math.abs(positionRef.current) >= trackWidth) {
        positionRef.current = 0;
      }

      track.style.transform = `translateX(${positionRef.current}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    // Запускаем анимацию только если нет hover
    if (hoveredIndex === null) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isInView, hoveredIndex, isMobile]);

  return (
    <section className="sponsors-section" ref={ref}>
      <div className="sponsors-container">
        <motion.p
          className="sponsors-text"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          {t('trustText')}
        </motion.p>

        <motion.div
          className="sponsors-carousel-wrapper"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          <div className="sponsors-carousel-overflow">
            <div className="sponsors-carousel-track" ref={trackRef}>
              {duplicatedTestimonials.map((testimonial, index) => (
                <motion.div
                  key={`${testimonial.id}-${index}`}
                  className="testimonial-item"
                  onMouseEnter={() => {
                    setHoveredIndex(index);
                    // Останавливаем анимацию
                    if (animationRef.current) {
                      cancelAnimationFrame(animationRef.current);
                      animationRef.current = null;
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    // Возобновляем анимацию
                    if (trackRef.current && isInView) {
                      const track = trackRef.current;
                      const speed = isMobile ? 0.8 : 0.3;
                      const animate = () => {
                        positionRef.current -= speed;
                        const trackWidth = track.scrollWidth / 3;
                        if (Math.abs(positionRef.current) >= trackWidth) {
                          positionRef.current = 0;
                        }
                        track.style.transform = `translateX(${positionRef.current}px)`;
                        animationRef.current = requestAnimationFrame(animate);
                      };
                      animationRef.current = requestAnimationFrame(animate);
                    }
                  }}
                >
                  <div className="testimonial-card">
                    <div className="testimonial-content">
                      <p className="testimonial-text">&ldquo;{testimonial.text}&rdquo;</p>
                    </div>
                    <div className="testimonial-author">
                      {testimonial.avatar ? (
                        <img src={testimonial.avatar} alt={testimonial.name} className="testimonial-avatar" />
                      ) : (
                        <div className="testimonial-avatar-placeholder">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                      <div className="testimonial-author-info">
                        <div className="testimonial-name">{testimonial.name}</div>
                        {testimonial.role && (
                          <div className="testimonial-role">{testimonial.role}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

