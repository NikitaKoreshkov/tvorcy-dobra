'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { FilterIcon, ChevronDownIcon, ArrowUpIcon, ArrowDownIcon, SearchIcon, XIcon } from '../Icons';

export type SortOption = 'popular' | 'raised-asc' | 'raised-desc' | 'title-asc' | 'title-desc' | 'donors-desc';

interface CatalogHeaderProps {
  projectsCount: number;
  isLoading: boolean;
  showFilters: boolean;
  onToggleFilters: () => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenMobileFilters?: () => void;
}

export default function CatalogHeader({
  projectsCount,
  isLoading,
  showFilters,
  onToggleFilters,
  sortOption,
  onSortChange,
  searchQuery,
  onSearchChange,
  onOpenMobileFilters,
}: CatalogHeaderProps) {
  const t = useTranslations('catalogPage');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const lastScrollYRef = useRef<number>(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelOffsetRef = useRef<number>(0);
  const sortPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Сохраняем изначальную позицию панели относительно окна
    const updatePanelOffset = () => {
      if (panelRef.current && typeof window !== 'undefined') {
        const rect = panelRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || (typeof document !== 'undefined' ? document.documentElement.scrollTop : 0);
        panelOffsetRef.current = rect.top + scrollTop;
      }
    };
    
    // Обновляем при загрузке и после загрузки контента
    updatePanelOffset();
    const timeout1 = setTimeout(updatePanelOffset, 100);
    const timeout2 = setTimeout(updatePanelOffset, 500);
    const timeout3 = setTimeout(updatePanelOffset, 1000);
    
    // Также обновляем при изменении размера окна
    window.addEventListener('resize', updatePanelOffset);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      window.removeEventListener('resize', updatePanelOffset);
    };
  }, [projectsCount]); // Пересчитываем при изменении количества проектов

  // Логика sticky/fixed позиционирования
  useEffect(() => {
    if (typeof window === 'undefined' || !panelRef.current) return;

    const handleScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const scrollDelta = Math.abs(scrollY - lastScrollYRef.current);
      
      // Обновляем состояние скролла для изменения размера элементов
      if (scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Логика для sticky позиционирования
      if (panelOffsetRef.current > 0) {
        const shouldBeFixed = scrollY >= panelOffsetRef.current - 80; // 80px = высота header
        setIsFixed(shouldBeFixed);
      }

      lastScrollYRef.current = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Вызываем сразу для начального состояния

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [projectsCount]);

  // Закрываем панель сортировки при клике вне её
  useEffect(() => {
    if (!showSort || typeof document === 'undefined') return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Проверяем, был ли клик внутри контейнера сортировки (кнопка + панель)
      if (sortPanelRef.current && !sortPanelRef.current.contains(target)) {
        setShowSort(false);
      }
    };

    // Также закрываем при нажатии Escape
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSort(false);
      }
    };

    // Используем небольшую задержку, чтобы не закрывать панель сразу после клика на кнопку
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showSort]);

  const sortOptions: { 
    baseValue: SortOption; 
    label: string; 
    hasDirection?: boolean;
    ascValue?: SortOption;
    descValue?: SortOption;
  }[] = [
    { baseValue: 'popular', label: t('byPopularity') },
    { 
      baseValue: 'raised-desc', 
      label: t('byAmount'), 
      hasDirection: true,
      ascValue: 'raised-asc',
      descValue: 'raised-desc',
    },
    { 
      baseValue: 'title-asc', 
      label: t('byTitle'),
      hasDirection: true,
      ascValue: 'title-asc',
      descValue: 'title-desc',
    },
    { baseValue: 'donors-desc', label: t('byDonors') },
  ];

  const getCurrentSortForOption = (option: typeof sortOptions[0]): SortOption | null => {
    if (!option.hasDirection) {
      return option.baseValue === sortOption ? option.baseValue : null;
    }
    if (sortOption === option.ascValue || sortOption === option.descValue) {
      return sortOption;
    }
    return null;
  };

  const handleSortSelect = (sort: SortOption) => {
    onSortChange(sort);
  };

  const handleDirectionClick = (option: typeof sortOptions[0], direction: 'asc' | 'desc', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!option.hasDirection) return;
    
    const newSort = direction === 'asc' ? option.ascValue! : option.descValue!;
    onSortChange(newSort);
  };

  return (
    <>
      {/* Catalog Header Panel - Nike Style with Scroll Behavior */}
      <div 
        ref={panelRef}
        data-catalog-header="true"
        className="w-full premium-glass z-40 transition-all duration-300 sticky top-20 left-0 right-0"
      >
        <div className={`w-full px-6 lg:px-8 transition-all duration-300 ${
          isScrolled ? 'py-4' : 'py-8'
        }`}>
          <div className="flex items-center justify-between gap-4">
            {/* Left side: Title and count */}
            <div className={`flex items-center transition-all duration-300 ${
              isScrolled ? 'gap-1' : 'gap-2'
            }`}>
              <h1 className={`font-bold text-black tracking-tight transition-all duration-300 ${
                isScrolled ? 'text-sm' : 'text-lg lg:text-2xl'
              }`}>
                {t('catalogTitle')} ({isLoading ? '...' : projectsCount})
              </h1>
            </div>

            {/* Mobile: Filters button */}
            {onOpenMobileFilters && (
              <button
                onClick={onOpenMobileFilters}
                className="lg:hidden flex items-center gap-2 text-sm text-black hover:opacity-70 transition-all duration-200 font-normal px-3 py-2 border border-gray-200 rounded-md"
              >
                <FilterIcon />
                <span>{t('filters')}</span>
              </button>
            )}

            {/* Center: Search - Desktop only */}
            <div className={`hidden lg:flex flex-1 max-w-md transition-all duration-300 ${
              isScrolled ? 'hidden md:block' : ''
            }`}>
              <div className="relative w-full">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
                    isScrolled ? 'text-xs py-1.5' : 'text-sm'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    <XIcon />
                  </button>
                )}
              </div>
            </div>

            {/* Right side: Filter and Sort buttons - Desktop only */}
            <div className={`hidden lg:flex items-center transition-all duration-300 ${
              isScrolled ? 'gap-2' : 'gap-6'
            }`}>
              <button
                onClick={onToggleFilters}
                className={`flex items-center text-black hover:opacity-70 transition-all duration-200 font-normal ${
                  isScrolled ? 'text-[10px] gap-1' : 'text-base gap-2'
                }`}
              >
                {showFilters ? t('hideFilters') : t('showFilters')}
                <div className={`transition-transform duration-300 ${
                  isScrolled ? 'scale-50' : 'scale-100'
                }`}>
                  <FilterIcon />
                </div>
              </button>
              <div className="relative" ref={sortPanelRef}>
                <button
                  data-sort-button
                  onClick={() => setShowSort(!showSort)}
                  className={`flex items-center text-black hover:opacity-70 transition-all duration-200 font-normal ${
                isScrolled ? 'text-[10px] gap-1' : 'text-base gap-2'
                  }`}
                >
                  {t('sortBy')}
                <div className={`transition-transform duration-300 ${
                  isScrolled ? 'scale-50' : 'scale-100'
                  } ${showSort ? 'rotate-180' : ''}`}>
                  <ChevronDownIcon />
                </div>
              </button>

                {/* Sort Panel */}
                {showSort && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 premium-glass animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
                        {t('sortByLabel')}
                      </div>
                      <div className="space-y-1">
                        {sortOptions.map((option) => {
                          const currentSort = getCurrentSortForOption(option);
                          const isActive = currentSort !== null;
                          const isAsc = currentSort === option.ascValue;
                          const isDesc = currentSort === option.descValue;

                          return (
                            <div
                              key={option.baseValue}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${
                                isActive
                                  ? 'bg-black text-white font-medium shadow-sm'
                                  : 'text-black hover:bg-gray-50'
                              }`}
                            >
                              <button
                                onClick={() => {
                                  if (!option.hasDirection) {
                                    handleSortSelect(option.baseValue);
                                  } else {
                                    // При клике на текст для варианта с направлением - выбираем направление по умолчанию (desc)
                                    handleSortSelect(option.descValue!);
                                  }
                                }}
                                className="flex-1 text-left"
                              >
                                {option.label}
                              </button>
                              
                              {option.hasDirection && (
                                <div className="flex items-center gap-1 ml-2">
                                  <button
                                    onClick={(e) => handleDirectionClick(option, 'asc', e)}
                                    className={`p-1 rounded transition-all duration-200 ${
                                      isAsc
                                        ? 'bg-white/20 text-white'
                                        : isActive
                                        ? 'text-white/60 hover:bg-white/10 hover:text-white'
                                        : 'text-gray-400 hover:bg-gray-100 hover:text-black'
                                    }`}
                                    title={t('sortAscending')}
                                  >
                                    <ArrowUpIcon />
                                  </button>
                                  <button
                                    onClick={(e) => handleDirectionClick(option, 'desc', e)}
                                    className={`p-1 rounded transition-all duration-200 ${
                                      isDesc
                                        ? 'bg-white/20 text-white'
                                        : isActive
                                        ? 'text-white/60 hover:bg-white/10 hover:text-white'
                                        : 'text-gray-400 hover:bg-gray-100 hover:text-black'
                                    }`}
                                    title={t('sortDescending')}
                                  >
                                    <ArrowDownIcon />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
}

