'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { XIcon, SearchIcon, ChevronDownIcon, ArrowUpIcon, ArrowDownIcon } from '../Icons';
import { SortOption } from './CatalogHeader';
import { FilterState } from './CatalogFilters';

interface MobileFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function MobileFiltersPanel({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  filters,
  onFiltersChange,
}: MobileFiltersPanelProps) {
  const t = useTranslations('catalogPage');
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [showSort, setShowSort] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const sortPanelRef = useRef<HTMLDivElement>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterState>(filters);

  // Синхронизация с внешними фильтрами
  useEffect(() => {
    setSelectedFilters(filters);
  }, [filters]);

  // Закрытие при клике вне панели
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (panelRef.current && !panelRef.current.contains(target)) {
        onClose();
      }
    };

    // Закрытие при нажатии Escape
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Блокируем скролл body когда панель открыта
    document.body.style.overflow = 'hidden';

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    document.addEventListener('keydown', handleEscape);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Закрываем панель сортировки при клике вне её
  useEffect(() => {
    if (!showSort) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (sortPanelRef.current && !sortPanelRef.current.contains(target)) {
        setShowSort(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSort(false);
      }
    };

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
    // Небольшая задержка для плавной анимации перед закрытием
    setTimeout(() => {
      setShowSort(false);
    }, 150);
  };

  const handleDirectionClick = (option: typeof sortOptions[0], direction: 'asc' | 'desc', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!option.hasDirection) return;
    
    const newSort = direction === 'asc' ? option.ascValue! : option.descValue!;
    onSortChange(newSort);
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleFilterChange = (categoryId: string, option: string, type: 'checkbox' | 'radio') => {
    const newFilters: FilterState = { ...selectedFilters };
    const categoryFilters = new Set(newFilters[categoryId as keyof FilterState] || []);

    const allOptions = [t('allOptions'), t('allAgesOption'), t('allTypesOption'), t('allRegionsOption'), t('anyOption')];

    if (type === 'radio') {
      categoryFilters.clear();
      categoryFilters.add(option);
    } else {
      if (allOptions.includes(option)) {
        categoryFilters.clear();
        categoryFilters.add(option);
      } else {
        if (categoryFilters.has(option)) {
          categoryFilters.delete(option);
        } else {
          allOptions.forEach(allOpt => categoryFilters.delete(allOpt));
          categoryFilters.add(option);
        }
      }
    }

    newFilters[categoryId as keyof FilterState] = categoryFilters;
    setSelectedFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const isOptionSelected = (categoryId: string, option: string) => {
    return selectedFilters[categoryId]?.has(option) || false;
  };

  const getSelectedCount = (categoryId: string) => {
    const filters = selectedFilters[categoryId] || new Set();
    const allOptions = [t('allOptions'), t('allAgesOption'), t('allTypesOption'), t('allRegionsOption'), t('anyOption')];
    const count = Array.from(filters).filter(f => !allOptions.includes(f)).length;
    return count > 0 ? count : undefined;
  };

  const hasActiveFilters = () => {
    const allOptions = [t('allOptions'), t('allAgesOption'), t('allTypesOption'), t('allRegionsOption'), t('anyOption')];
    return Object.values(selectedFilters).some(filterSet => {
      const filtered = Array.from(filterSet).filter(f => !allOptions.includes(f));
      return filtered.length > 0;
    }) || (searchQuery && searchQuery.length > 0);
  };

  const resetFilters = () => {
    const emptyFilters: FilterState = {
      age: new Set(),
      disabilityType: new Set(),
      projectCategory: new Set(),
      goalAmount: new Set(),
      region: new Set(),
      urgency: new Set(),
    };
    setSelectedFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    onSearchChange('');
  };

  const filterCategories = [
    {
      id: 'age',
      label: t('childAge'),
      selectedCount: getSelectedCount('age'),
      options: [t('allAges'), t('0to3years'), t('4to6years'), t('7to12years'), t('13to17years'), t('18plus')],
      type: 'checkbox' as const,
    },
    {
      id: 'disabilityType',
      label: t('disabilityTypeLabel'),
      selectedCount: getSelectedCount('disabilityType'),
      options: [
        t('allTypes'),
        t('cerebralPalsy'),
        t('autism'),
        t('downSyndrome'),
        t('visionImpairment'),
        t('hearingImpairment'),
        t('musculoskeletalDisorders'),
        t('oncologicalDiseases'),
        t('other'),
      ],
      type: 'checkbox' as const,
    },
    {
      id: 'projectCategory',
      label: t('projectCategoryLabel'),
      selectedCount: getSelectedCount('projectCategory'),
      options: [
        t('allCategories'),
        t('childrenSports'),
        t('mothersSupport'),
        t('inclusionRehab'),
        t('socialSupport'),
      ],
      type: 'checkbox' as const,
    },
    {
      id: 'goalAmount',
      label: t('requiredAmount'),
      selectedCount: getSelectedCount('goalAmount'),
      options: [
        t('anyAmount'),
        t('upTo50k'),
        t('50to100k'),
        t('100to300k'),
        t('300to500k'),
        t('500to1m'),
        t('over1m'),
      ],
      type: 'radio' as const,
    },
    {
      id: 'region',
      label: t('regionLabel'),
      selectedCount: getSelectedCount('region'),
      options: [
        t('allRegions'),
        t('moscow'),
        t('stPetersburg'),
        t('moscowRegion'),
        t('leningradRegion'),
        t('centralRegion'),
        t('northwestRegion'),
        t('siberia'),
        t('farEast'),
        t('otherRegions'),
      ],
      type: 'checkbox' as const,
    },
    {
      id: 'urgency',
      label: t('urgencyLabel'),
      selectedCount: getSelectedCount('urgency'),
      options: [t('all'), t('emergencyCases'), t('regularProjects')],
      type: 'checkbox' as const,
    },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-500 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 lg:hidden flex flex-col shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          willChange: 'transform',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-4 border-b border-gray-200 flex-shrink-0 transition-opacity duration-500 delay-100 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}>
          <h2 className="text-lg font-bold text-black">{t('filters')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
          >
            <XIcon />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className={`flex-1 overflow-y-auto px-4 py-4 transition-opacity duration-500 delay-150 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Search */}
          <div className={`mb-6 transition-all duration-500 delay-200 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors active:scale-95"
                >
                  <XIcon />
                </button>
              )}
            </div>
          </div>

          {/* Sort */}
          <div className={`mb-6 transition-all duration-500 delay-250 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <div ref={sortPanelRef}>
              <button
                onClick={() => setShowSort(!showSort)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50 active:scale-98 transition-all duration-200"
              >
                <span className="text-sm font-medium text-black">{t('sortBy')}</span>
                <div className={`transition-transform duration-300 ${showSort ? 'rotate-180' : ''}`}>
                  <ChevronDownIcon />
                </div>
              </button>

              {/* Sort Dropdown - Slides down and pushes content */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  showSort ? 'max-h-[400px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
                }`}
                style={{
                  willChange: 'max-height, opacity, margin-top',
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                      {t('sortByLabel')}
                    </div>
                    <div className="space-y-1">
                      {sortOptions.map((option, index) => {
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
                            } ${
                              showSort ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                            }`}
                            style={{
                              transitionDelay: showSort ? `${150 + index * 50}ms` : '0ms',
                            }}
                          >
                            <button
                              onClick={() => {
                                if (!option.hasDirection) {
                                  handleSortSelect(option.baseValue);
                                } else {
                                  handleSortSelect(option.descValue!);
                                }
                              }}
                              className="flex-1 text-left active:scale-98"
                            >
                              {option.label}
                            </button>
                            
                            {option.hasDirection && (
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={(e) => handleDirectionClick(option, 'asc', e)}
                                  className={`p-1 rounded transition-all duration-200 active:scale-95 ${
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
                                  className={`p-1 rounded transition-all duration-200 active:scale-95 ${
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
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {filterCategories.map((category, index) => {
              const isCategoryOpen = openCategories.has(category.id);
              const hasSelected = category.selectedCount !== undefined && category.selectedCount > 0;

              return (
                <div 
                  key={category.id}
                  className={`transition-all duration-500 ${
                    isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                  style={{
                    transitionDelay: isOpen ? `${300 + index * 30}ms` : '0ms',
                  }}
                >
                  {/* Filter Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between py-3 hover:opacity-70 active:scale-98 transition-all duration-200"
                  >
                    <span className="text-sm font-normal text-black">
                      {category.label}
                      {hasSelected && ` (${category.selectedCount})`}
                    </span>
                    <div className={`transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}>
                      <ChevronDownIcon />
                    </div>
                  </button>

                  {/* Filter Options */}
                  {isCategoryOpen && (
                    <div className="pb-4 space-y-3 pl-2">
                      {category.options.map((option) => {
                        const isSelected = isOptionSelected(category.id, option);
                        return (
                          <label
                            key={option}
                            className="flex items-center cursor-pointer hover:opacity-70 active:scale-98 transition-all duration-200 group"
                          >
                            <div className="relative flex items-center justify-center">
                              <input
                                type={category.type}
                                name={category.id}
                                checked={isSelected}
                                onChange={() => handleFilterChange(category.id, option, category.type)}
                                className="absolute opacity-0 cursor-pointer w-5 h-5 z-10"
                              />
                              <div className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-black border-black' 
                                  : 'bg-white border-gray-300 group-hover:border-gray-400'
                              }`}>
                                {isSelected && category.type === 'checkbox' && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                                {isSelected && category.type === 'radio' && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                            </div>
                            <span className="ml-3 text-sm text-black">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Divider */}
                  {index < filterCategories.length - 1 && (
                    <div className="border-b border-gray-200"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 py-4 border-t border-gray-200 flex-shrink-0 space-y-2 transition-opacity duration-500 delay-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}>
          {hasActiveFilters() && (
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2.5 text-sm text-black border border-gray-300 rounded-md hover:bg-gray-50 active:scale-98 transition-all duration-200"
            >
              {t('resetFilters')}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 active:scale-98 transition-all duration-200"
          >
            {t('applyFilters')}
          </button>
        </div>
      </div>
    </>
  );
}

