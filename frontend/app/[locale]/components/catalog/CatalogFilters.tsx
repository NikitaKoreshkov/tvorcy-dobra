'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDownIcon } from '../Icons';

export interface FilterState {
  age: Set<string>;
  disabilityType: Set<string>;
  projectCategory: Set<string>;
  goalAmount: Set<string>;
  region: Set<string>;
  urgency: Set<string>;
}

interface CatalogFiltersProps {
  projectsContainerRef: React.RefObject<HTMLDivElement>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters?: FilterState;
  onFiltersChange?: (filters: FilterState) => void;
}

interface FilterCategory {
  id: string;
  label: string;
  selectedCount?: number;
  options: string[];
  type: 'checkbox' | 'radio';
}

export default function CatalogFilters({ 
  projectsContainerRef, 
  searchQuery, 
  onSearchChange,
  filters: externalFilters,
  onFiltersChange
}: CatalogFiltersProps) {
  const t = useTranslations('catalogPage');
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [selectedFilters, setSelectedFilters] = useState<FilterState>(() => 
    externalFilters || {
      age: new Set(),
      disabilityType: new Set(),
      projectCategory: new Set(),
      goalAmount: new Set(),
      region: new Set(),
      urgency: new Set(),
    }
  );

  // Синхронизация с внешними фильтрами (только если они действительно изменились)
  useEffect(() => {
    if (externalFilters) {
      // Проверяем, действительно ли фильтры изменились
      const currentFiltersStr = JSON.stringify(Object.fromEntries(
        Object.entries(selectedFilters).map(([k, v]) => [k, Array.from(v)])
      ));
      const externalFiltersStr = JSON.stringify(Object.fromEntries(
        Object.entries(externalFilters).map(([k, v]) => [k, Array.from(v)])
      ));
      
      if (currentFiltersStr !== externalFiltersStr) {
        setSelectedFilters(externalFilters);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalFilters]);

  const filtersRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Синхронизация высоты wrapper с высотой проектов
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncHeight = () => {
      if (!wrapperRef.current || !projectsContainerRef.current) return;
      
      const projectsHeight = projectsContainerRef.current.offsetHeight;
      wrapperRef.current.style.minHeight = `${projectsHeight}px`;
    };

    const resizeObserver = new ResizeObserver(syncHeight);
    
    if (projectsContainerRef.current) {
      resizeObserver.observe(projectsContainerRef.current);
            }

    syncHeight();
    // Дополнительные вызовы для надежности
    const timer1 = setTimeout(syncHeight, 100);
    const timer2 = setTimeout(syncHeight, 500);
    const timer3 = setTimeout(syncHeight, 1000);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [projectsContainerRef]);

  // Подсчет выбранных фильтров без учета "Все" вариантов
  const getSelectedCount = (categoryId: string) => {
    const filters = selectedFilters[categoryId as keyof FilterState] || new Set();
    const allOptions = [t('allOptions'), t('allAgesOption'), t('allTypesOption'), t('allRegionsOption'), t('anyOption')];
    const count = Array.from(filters).filter(f => !allOptions.includes(f)).length;
    return count > 0 ? count : undefined;
  };

  const filterCategories: FilterCategory[] = useMemo(() => [
    {
      id: 'age',
      label: t('childAge'),
      selectedCount: getSelectedCount('age'),
      options: [t('allAges'), t('0to3years'), t('4to6years'), t('7to12years'), t('13to17years'), t('18plus')],
      type: 'checkbox',
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
      type: 'checkbox',
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
      type: 'checkbox',
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
      type: 'radio',
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
      type: 'checkbox',
    },
    {
      id: 'urgency',
      label: t('urgencyLabel'),
      selectedCount: getSelectedCount('urgency'),
      options: [t('all'), t('emergencyCases'), t('regularProjects')],
      type: 'checkbox',
    },
  ], [selectedFilters, t]);

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
    setSelectedFilters((prev) => {
      const newFilters: FilterState = { ...prev };
      const categoryFilters = new Set(newFilters[categoryId as keyof FilterState] || []);

      // Варианты, которые считаются "все"
      const allOptions = [t('allOptions'), t('allAgesOption'), t('allTypesOption'), t('allRegionsOption'), t('anyOption')];

      if (type === 'radio') {
        categoryFilters.clear();
        categoryFilters.add(option);
      } else {
        // Для checkbox логика: если выбрали "Все", очищаем остальные
        // Если выбрали другой вариант, убираем "Все"
        if (allOptions.includes(option)) {
          // Выбрали "Все" - очищаем другие варианты
          categoryFilters.clear();
          categoryFilters.add(option);
        } else {
          // Выбрали обычный вариант
        if (categoryFilters.has(option)) {
          categoryFilters.delete(option);
        } else {
            // Убираем "Все" если оно было выбрано
            allOptions.forEach(allOpt => categoryFilters.delete(allOpt));
          categoryFilters.add(option);
        }
        }
      }

      newFilters[categoryId as keyof FilterState] = categoryFilters;
      
      // Уведомляем родительский компонент об изменении
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
      
      return newFilters;
    });
  };

  const isOptionSelected = (categoryId: string, option: string) => {
    return selectedFilters[categoryId as keyof FilterState]?.has(option) || false;
  };

  const hasActiveFilters = () => {
    const allOptions = [t('allOptions'), t('allAgesOption'), t('allTypesOption'), t('allRegionsOption'), t('anyOption')];
    return Object.values(selectedFilters).some(filterSet => {
      const filtered = Array.from(filterSet as Set<string>).filter(f => !allOptions.includes(f));
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
    if (onFiltersChange) {
      onFiltersChange(emptyFilters);
    }
    onSearchChange('');
  };

  return (
    <div 
      ref={wrapperRef} 
      className="hidden lg:block flex-shrink-0" 
      style={{ 
        width: '16rem', // 256px = w-64
      }}
    >
      <div
        ref={filtersRef}
        className="bg-white sticky"
        style={{
          width: '16rem',
          top: 'calc(5rem + 6rem)', // 80px (header) + ~96px (catalog header) = ~176px
        }}
      >
        <div className="w-full">
        {filterCategories.map((category, index) => {
          const isOpen = openCategories.has(category.id);
          const hasSelected = category.selectedCount !== undefined && category.selectedCount > 0;

          return (
            <div key={category.id}>
              {/* Filter Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between py-4 hover:opacity-70 transition-opacity"
              >
                <span className="text-sm font-normal text-black">
                  {category.label}
                  {hasSelected && ` (${category.selectedCount})`}
                </span>
                <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  <ChevronDownIcon />
                </div>
              </button>

              {/* Filter Options */}
              {isOpen && (
                <div className="pb-4 space-y-3">
                  {category.options.map((option) => {
                    const isSelected = isOptionSelected(category.id, option);
                    return (
                      <label
                        key={option}
                        className="flex items-center cursor-pointer hover:opacity-70 transition-opacity group"
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

        {/* Reset Filters Button at the bottom */}
        {hasActiveFilters() && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 text-sm text-black border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              {t('resetFilters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
