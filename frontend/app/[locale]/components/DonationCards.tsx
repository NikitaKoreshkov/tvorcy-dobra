'use client';

import { useTranslations } from 'next-intl';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Link, useRouter } from '@/src/routing';
import { getApiUrl } from '@/src/config';
import { useAuth } from '@/app/contexts/AuthContext';
import LoginModal from './LoginModal';

interface DonationCard {
  id: string;
  name: string;
  title: string;
  description: string;
  fullDescription: string;
  amount: string;
  collected: string;
  progress: number;
  donors: number;
  daysLeft: number;
  image: string;
}

interface ProjectFromAPI {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  location: string;
  raised: number;
  goal: number;
  donors: number;
  metadata?: {
    fullDescription?: string;
    name?: string;
    daysLeft?: number;
  };
}

// Format number to short format (e.g., 680000 -> "680к")
function formatCurrencyShort(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}м`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}к`;
  }
  return value.toString();
}

export default function DonationCards() {
  const t = useTranslations('donations');
  const tCatalog = useTranslations('catalogPage');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [cards, setCards] = useState<DonationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(2);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const ref = useRef(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);

  const handleDonateClick = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setSelectedProjectId(projectId);
      setShowLoginModal(true);
      return;
    }
    
    router.push(`/donate?projectId=${projectId}`);
  };

  // Check if mobile/tablet
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
        const response = await fetch(getApiUrl('/projects?isFeatured=true&limit=5&sortBy=newest'));
        const data = await response.json();
        if (data.success && data.projects) {
          const transformedCards: DonationCard[] = data.projects.map((project: ProjectFromAPI) => {
            const progress = project.goal > 0 ? (Number(project.raised) / Number(project.goal)) * 100 : 0;
            const fullDescription = project.metadata?.fullDescription || project.description;
            const name = project.metadata?.name || project.location || tCatalog('defaultProjectName');
            const daysLeft = project.metadata?.daysLeft || Math.floor(Math.random() * 60) + 1;
            
            return {
              id: project.id,
              name,
              title: project.title,
              description: project.description,
              fullDescription,
              amount: `${formatCurrencyShort(Number(project.goal))} ₽`,
              collected: `${formatCurrencyShort(Number(project.raised))} ₽`,
              progress: Math.round(progress),
              donors: project.donors,
              daysLeft,
              image: project.image || '/images/q2.jpg',
            };
          });
          setCards(transformedCards);
          // Устанавливаем активный индекс на средний элемент, если есть карточки
          if (transformedCards.length > 0) {
            setActiveIndex(Math.min(2, Math.floor(transformedCards.length / 2)));
          }
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const handleCardFlip = (cardId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  // Create infinite carousel: [last, ...all, first]
  const infiniteCards = cards.length > 0 ? [
    cards[cards.length - 1],
    ...cards,
    cards[0],
  ] : [];
  
  // Real index in infinite array (1 is first real card, cards.length is last real card)
  // Start at index 3 (third card: 0=duplicate last, 1=first, 2=second, 3=third)
  const [realActiveIndex, setRealActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Обновляем realActiveIndex когда cards загружаются
  useEffect(() => {
    if (cards.length > 0 && infiniteCards.length > 0) {
      const middleIndex = Math.min(3, Math.floor(infiniteCards.length / 2));
      setRealActiveIndex(middleIndex);
    }
  }, [cards.length]);

  // Handle infinite loop without animation
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const handleNext = () => {
    setRealActiveIndex((prev) => {
      const next = prev + 1;
      // If we reach the duplicate first card, jump to real first card
      if (next >= infiniteCards.length - 1) {
        setIsTransitioning(true);
        setTimeout(() => {
          setRealActiveIndex(1);
          setIsTransitioning(false);
        }, 300);
        return infiniteCards.length - 1;
      }
      return next;
    });
    setFlippedCards(new Set());
  };

  const handlePrev = () => {
    setRealActiveIndex((prev) => {
      const prevIndex = prev - 1;
      // If we reach the duplicate last card, jump to real last card
      if (prevIndex <= 0) {
        setIsTransitioning(true);
        setTimeout(() => {
          setRealActiveIndex(cards.length);
          setIsTransitioning(false);
        }, 300);
        return 0;
      }
      return prevIndex;
    });
    setFlippedCards(new Set());
  };

  const handleDragEnd = () => {
    const threshold = 50;
    if (dragX.get() > threshold) {
      handlePrev();
    } else if (dragX.get() < -threshold) {
      handleNext();
    }
    dragX.set(0);
  };

  const goToCard = (targetCardIndex: number) => {
    // Simply go directly to target - offset calculation handles the shortest path
    setRealActiveIndex(targetCardIndex + 1);
    setFlippedCards(new Set());
  };


  return (
    <section className="donations-section" ref={ref} style={{ minHeight: '1000px' }}>
      <div className="donations-container">
        {/* Header */}
        <div className="donations-header">
          <h2 className="donations-title">{t('title')}</h2>
          <p className="donations-subtitle">{t('subtitle')}</p>
        </div>

        {/* Cards Carousel */}
        <div className="donations-carousel-wrapper">
          <motion.div 
            ref={carouselRef}
            className="donations-carousel"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ x: dragX }}
          >
            {infiniteCards.map((card, index) => {
              const isActive = index === realActiveIndex;
              const isFlipped = flippedCards.has(card.id);
              
              // Calculate offset considering infinite loop
              // Map infinite indices to card indices (0-based)
              const getCardIndex = (infIndex: number) => {
                if (infIndex === 0) return cards.length - 1; // duplicate last = real last
                if (infIndex === infiniteCards.length - 1) return 0; // duplicate first = real first
                return infIndex - 1; // real cards
              };
              
              const currentCardIndex = getCardIndex(index);
              const activeCardIndex = getCardIndex(realActiveIndex);
              
              // Calculate circular distance (shortest path around the circle)
              let circularDistance = currentCardIndex - activeCardIndex;
              
              // Normalize to shortest path (-cards.length/2 to cards.length/2)
              if (circularDistance > cards.length / 2) {
                circularDistance -= cards.length;
              } else if (circularDistance < -cards.length / 2) {
                circularDistance += cards.length;
              }
              
              // Adaptive offset based on screen size
              const cardOffset = isMobile ? 280 : 520;
              
              // Calculate offset - always use shortest path
              // If circular distance is large, use duplicate for shorter visual path
              let offset = circularDistance * cardOffset;
              
              // When going from first to last or last to first, use duplicates for one-step transition
              // This makes the transition look like one step instead of going through all cards
              if (Math.abs(circularDistance) > cards.length / 2) {
                // Use shorter path through duplicate
                if (circularDistance > 0) {
                  // Going forward through many cards - use duplicate first on right
                  if (index === infiniteCards.length - 1) {
                    offset = cardOffset; // Duplicate first is one step right from real last
                  } else {
                    offset = (circularDistance - cards.length) * cardOffset;
                  }
                } else {
                  // Going backward through many cards - use duplicate last on left
                  if (index === 0) {
                    offset = -cardOffset; // Duplicate last is one step left from real first
                  } else {
                    offset = (circularDistance + cards.length) * cardOffset;
                  }
                }
              }
              
              // Handle duplicate positions relative to active card
              if (index === 0 && realActiveIndex === 1) {
                // Duplicate last when active is real first
                offset = -cardOffset;
              } else if (index === infiniteCards.length - 1 && realActiveIndex === infiniteCards.length - 2) {
                // Duplicate first when active is real last
                offset = cardOffset;
              }
              
              const distance = Math.abs(circularDistance);
              const adjustedDistance = Math.min(distance, cards.length - distance);
              
              // Adaptive blur, opacity, scale for mobile
              const blur = adjustedDistance === 0 ? 0 : adjustedDistance === 1 ? (isMobile ? 2 : 4) : (isMobile ? 6 : 12);
              const opacity = adjustedDistance === 0 ? 1 : adjustedDistance === 1 ? (isMobile ? 0.8 : 0.6) : (isMobile ? 0.5 : 0.3);
              const scale = adjustedDistance === 0 ? 1 : adjustedDistance === 1 ? (isMobile ? 0.85 : 0.8) : (isMobile ? 0.7 : 0.65);
              const brightness = adjustedDistance === 0 ? 1 : adjustedDistance === 1 ? (isMobile ? 1.1 : 1.3) : (isMobile ? 1.4 : 1.8);

              const cardTransition = { duration: 0.3, ease: [0.6, -0.05, 0.01, 0.99] };

              return (
                <motion.div
                  key={`${card.id}-${index}`}
                  className={`donation-card-wrapper ${isActive ? 'active' : ''} ${!isActive ? 'inactive' : ''}`}
                  animate={{
                    x: offset,
                    scale: scale,
                  }}
                  transition={cardTransition}
                  onClick={() => {
                    if (!isActive) {
                      // Map infinite index to real index
                      let targetIndex = index;
                      if (index === 0) targetIndex = cards.length - 1;
                      else if (index === infiniteCards.length - 1) targetIndex = 0;
                      else targetIndex = index - 1;
                      setRealActiveIndex(targetIndex + 1);
                      setFlippedCards(new Set());
                    } else {
                      handleCardFlip(card.id);
                    }
                  }}
                >
                  {/* Card Container with Flip */}
                  <div className="donation-card-flip-container">
                    <motion.div 
                      className="donation-card-flip-inner"
                      animate={{
                        rotateY: isFlipped ? 180 : 0,
                      }}
                      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* Front Side */}
                  <motion.div 
                        className="donation-card donation-card-front"
                    animate={{
                      filter: isActive 
                        ? 'blur(0px) brightness(1)' 
                        : `blur(${blur}px) brightness(${brightness})`,
                      opacity: opacity,
                    }}
                        transition={cardTransition}
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                        }}
                      >
                        {/* Hero Image Section - Top Quarter */}
                        <div className="donation-card-hero">
                          <img 
                            src={card.image} 
                            alt={card.name}
                            className="donation-card-hero-img"
                          />
                          {/* Gradient overlay for smooth transition */}
                          <div className="donation-card-hero-overlay"></div>
                        </div>

                    <div className="donation-card-content">
                          <div className="donation-card-header">
                      <h3 className="donation-card-title">{card.title}</h3>
                            <p className="donation-card-name">{card.name}</p>
                          </div>

                          <div className="donation-card-stats">
                            <div className="donation-card-stat">
                              <span className="donation-card-stat-value">{card.collected}</span>
                              <span className="donation-card-stat-label">{t('collected')}</span>
                            </div>
                            <div className="donation-card-stat">
                              <span className="donation-card-stat-value">{card.amount}</span>
                              <span className="donation-card-stat-label">{t('goal')}</span>
                            </div>
                          </div>

                          <div className="donation-card-progress-wrapper">
                      <div className="donation-card-progress">
                        <div 
                          className="donation-card-progress-bar"
                          style={{ width: `${card.progress}%` }}
                        />
                      </div>
                            <span className="donation-card-progress-text">{card.progress}%</span>
                          </div>

                          <button
                            className="donation-card-button"
                            onClick={(e) => handleDonateClick(e, card.id)}
                          >
                            {t('donate')}
                          </button>
                          <button 
                            className="donation-card-button-secondary"
                            onClick={(e) => handleCardFlip(card.id, e)}
                          >
                            {t('moreDetails')}
                          </button>
                    </div>
                  </motion.div>

                      {/* Back Side */}
                    <motion.div
                        className="donation-card donation-card-back"
                      animate={{
                          filter: isActive 
                            ? 'blur(0px) brightness(1)' 
                            : `blur(${blur}px) brightness(${brightness})`,
                          opacity: opacity,
                        }}
                        transition={cardTransition}
                      >
                        <div className="donation-card-content donation-card-back-content">
                          <div className="donation-card-header">
                            <h3 className="donation-card-title">{card.title}</h3>
                            <p className="donation-card-name">{card.name}</p>
                          </div>

                          <div className="donation-card-description-full">
                            <p>{card.fullDescription}</p>
                          </div>

                          <button
                            className="donation-card-button"
                            onClick={(e) => handleDonateClick(e, card.id)}
                          >
                            {t('donate')}
                          </button>
                          <button 
                            className="donation-card-button-secondary"
                            onClick={(e) => handleCardFlip(card.id, e)}
                          >
                            {t('back')}
                          </button>
                        </div>
                        </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Navigation */}
          <div className="donations-navigation">
            {cards.map((card, index) => {
              // Map real active index to card index (realActiveIndex - 1 because first is duplicate)
              const realCardIndex = realActiveIndex - 1;
              const normalizedIndex = realCardIndex < 0 ? cards.length - 1 : realCardIndex >= cards.length ? 0 : realCardIndex;
              const isActive = index === normalizedIndex;
              return (
            <button 
                  key={card.id}
                  className={`donations-nav-dot ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    goToCard(index);
                  }}
                  aria-label={`Go to project ${index + 1}`}
                />
              );
            })}
          </div>

          {/* View All Projects Button */}
          <Link href="/catalog" className="donations-view-all-button">
            {t('allProjects')}
          </Link>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setSelectedProjectId(null);
        }}
        redirectPath={selectedProjectId ? `/donate?projectId=${selectedProjectId}` : '/donate'}
      />
    </section>
  );
}

