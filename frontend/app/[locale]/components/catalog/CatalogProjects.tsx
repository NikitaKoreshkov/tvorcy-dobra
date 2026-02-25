'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/routing';
import { getApiUrl } from '@/src/config';
import Image from 'next/image';
import { SortOption } from './CatalogHeader';

import type { FilterState as ProjectFilters } from './CatalogFilters';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  location: string;
  raised: number;
  goal: number;
  donors: number;
  createdAt?: string;
  // Новые поля для фильтров
  age?: string;
  disabilityType?: string;
  urgency?: string;
  status?: string;
}

interface CatalogProjectsProps {
  onProjectsLoad?: (projects: Project[]) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
  showFilters?: boolean;
  sortOption?: SortOption;
  searchQuery?: string;
  filters?: ProjectFilters;
}

export default function CatalogProjects({ 
  onProjectsLoad, 
  containerRef: externalRef, 
  showFilters = true, 
  sortOption = 'popular', 
  searchQuery = '',
  filters
}: CatalogProjectsProps) {
  const t = useTranslations('catalogPage');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = externalRef || internalRef;

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch(getApiUrl('/projects'));
        const data = await response.json();
        if (data.success && data.projects) {
          const transformedProjects: Project[] = data.projects.map((project: any) => ({
            id: project.id,
            title: project.title,
            description: project.description,
            image: project.image || '/images/q2.jpg',
            category: project.category || 'Общее',
            location: project.location || '',
            raised: Number(project.raised) || 0,
            goal: Number(project.goal) || 0,
            donors: project.donors || 0,
            createdAt: project.createdAt || project.created_at,
            // Новые поля
            age: project.age || project.childAge,
            disabilityType: project.disabilityType || project.disability_type || project.type,
            urgency: project.urgency || project.isUrgent ? t('emergencyCases') : t('regularProjects'),
            status: project.status || (project.raised >= project.goal && project.goal > 0 ? t('projectStatusClosed') : project.raised > 0 ? t('projectStatusPartially') : t('projectStatusOpen')),
          }));
          setProjects(transformedProjects);
          onProjectsLoad?.(transformedProjects);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [onProjectsLoad]);

  // Фильтрация и сортировка проектов
  const sortedProjects = useMemo(() => {
    let projectsCopy = [...projects];
    
    // Фильтрация по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      projectsCopy = projectsCopy.filter(project => {
        const title = project.title.toLowerCase();
        const description = project.description.toLowerCase();
        const category = project.category.toLowerCase();
        const location = project.location?.toLowerCase() || '';
        return title.includes(query) || 
               description.includes(query) || 
               category.includes(query) || 
               location.includes(query);
      });
    }

    // Фильтрация по выбранным фильтрам
    if (filters) {
      const allOptions = [t('allOptions'), t('allAgesOption'), t('allTypesOption'), t('allRegionsOption'), t('anyOption')];
      
      // Возраст ребёнка
      const ageFilters = Array.from(filters.age).filter(f => !allOptions.includes(f));
      if (ageFilters.length > 0) {
        projectsCopy = projectsCopy.filter(project => {
          if (!project.age) return false;
          const projectAge = project.age;
          return ageFilters.some(filter => {
            if (filter === t('age0to3')) return projectAge === '0-3' || projectAge?.includes('0-3');
            if (filter === t('age4to6')) return projectAge === '4-6' || projectAge?.includes('4-6');
            if (filter === t('age7to12')) return projectAge === '7-12' || projectAge?.includes('7-12');
            if (filter === t('age13to17')) return projectAge === '13-17' || projectAge?.includes('13-17');
            if (filter === t('age18plus')) return projectAge === '18+' || projectAge?.includes('18');
            return projectAge === filter;
          });
        });
      }

      // Тип инвалидности / потребностей
      const disabilityFilters = Array.from(filters.disabilityType).filter(f => !allOptions.includes(f));
      if (disabilityFilters.length > 0) {
        projectsCopy = projectsCopy.filter(project => {
          if (!project.disabilityType) return false;
          const projectType = project.disabilityType.toLowerCase();
          return disabilityFilters.some(filter => 
            projectType.includes(filter.toLowerCase()) || filter.toLowerCase().includes(projectType)
          );
        });
      }

      // Направление работы (категория проекта)
      const categoryFilters = Array.from(filters.projectCategory).filter(f => !allOptions.includes(f));
      if (categoryFilters.length > 0) {
        projectsCopy = projectsCopy.filter(project => {
          if (!project.category) return false;
          const projectCategory = project.category.toLowerCase();
          return categoryFilters.some(filter => {
            const filterLower = filter.toLowerCase();
            if (filter === t('childrenSports')) {
              return projectCategory.includes('спорт') || projectCategory.includes('sport') || 
                     project.title?.toLowerCase().includes('спорт') || project.title?.toLowerCase().includes('sport');
            }
            if (filter === t('mothersSupport')) {
              return projectCategory.includes('мам') || projectCategory.includes('mother') || 
                     project.title?.toLowerCase().includes('мам') || project.title?.toLowerCase().includes('mother');
            }
            if (filter === t('inclusionRehab')) {
              return projectCategory.includes('инклюзия') || projectCategory.includes('реабилитация') || 
                     projectCategory.includes('inclusion') || projectCategory.includes('rehabilitation') ||
                     project.title?.toLowerCase().includes('инклюзия') || project.title?.toLowerCase().includes('реабилитация');
            }
            if (filter === t('socialSupport')) {
              return projectCategory.includes('социальн') || projectCategory.includes('social') ||
                     project.title?.toLowerCase().includes('социальн');
            }
            return projectCategory.includes(filterLower);
          });
        });
      }

      // Необходимая сумма / цель
      const goalFilters = Array.from(filters.goalAmount).filter(f => !allOptions.includes(f));
      if (goalFilters.length > 0 && goalFilters[0] !== t('anyOption')) {
        projectsCopy = projectsCopy.filter(project => {
          const goal = project.goal;
          return goalFilters.some(filter => {
            if (filter === t('filterUpTo50k')) return goal <= 50000;
            if (filter === t('filter50to100k')) return goal >= 50000 && goal <= 100000;
            if (filter === t('filter100to300k')) return goal >= 100000 && goal <= 300000;
            if (filter === t('filter300to500k')) return goal >= 300000 && goal <= 500000;
            if (filter === t('filter500to1m')) return goal >= 500000 && goal <= 1000000;
            if (filter === t('filterOver1m')) return goal > 1000000;
            return true;
          });
        });
      }

      // Регион
      const regionFilters = Array.from(filters.region).filter(f => !allOptions.includes(f));
      if (regionFilters.length > 0) {
        projectsCopy = projectsCopy.filter(project => {
          if (!project.location) return false;
          const projectLocation = project.location.toLowerCase();
          return regionFilters.some(filter => {
            const filterLower = filter.toLowerCase();
            // Маппинг регионов
            if (filter === t('moscow')) return projectLocation.includes('москва') || projectLocation.includes('moscow');
            if (filter === t('stPetersburg')) return projectLocation.includes('петербург') || projectLocation.includes('спб') || projectLocation.includes('st. petersburg') || projectLocation.includes('saint petersburg');
            if (filter === t('moscowRegion')) return projectLocation.includes('московская') || projectLocation.includes('moscow region');
            if (filter === t('leningradRegion')) return projectLocation.includes('ленинградская') || projectLocation.includes('leningrad region');
            if (filter === t('centralRegion')) return projectLocation.includes('центральн') || projectLocation.includes('central');
            if (filter === t('northwestRegion')) return projectLocation.includes('северо-запад') || projectLocation.includes('northwest');
            if (filter === t('siberia')) return projectLocation.includes('сибирь') || projectLocation.includes('siberia');
            if (filter === t('farEast')) return projectLocation.includes('дальний восток') || projectLocation.includes('far east');
            return projectLocation.includes(filterLower);
          });
        });
      }

      // Срочность
      const urgencyFilters = Array.from(filters.urgency).filter(f => !allOptions.includes(f));
      if (urgencyFilters.length > 0) {
        projectsCopy = projectsCopy.filter(project => {
          if (!project.urgency) return false;
          return urgencyFilters.some(filter => project.urgency === filter);
        });
      }
    }
    
    // Сортировка
    switch (sortOption) {
      case 'popular':
        // По популярности: сортируем по проценту собранных средств и количеству доноров
        return projectsCopy.sort((a, b) => {
          const progressA = a.goal > 0 ? (a.raised / a.goal) * 100 : 0;
          const progressB = b.goal > 0 ? (b.raised / b.goal) * 100 : 0;
          if (Math.abs(progressA - progressB) < 0.1) {
            return b.donors - a.donors;
          }
          return progressB - progressA;
        });
      
      case 'raised-desc':
        // По сумме собранных средств (по убыванию)
        return projectsCopy.sort((a, b) => b.raised - a.raised);
      
      case 'raised-asc':
        // По сумме собранных средств (по возрастанию)
        return projectsCopy.sort((a, b) => a.raised - b.raised);
      
      case 'title-asc':
        // По названию (А-Я)
        return projectsCopy.sort((a, b) => a.title.localeCompare(b.title, 'en'));
      
      case 'title-desc':
        // По названию (Я-А)
        return projectsCopy.sort((a, b) => b.title.localeCompare(a.title, 'en'));
      
      case 'donors-desc':
        // По количеству доноров (по убыванию)
        return projectsCopy.sort((a, b) => b.donors - a.donors);
      
      default:
        return projectsCopy;
    }
  }, [projects, sortOption, searchQuery, filters]);

  const getProgress = (raised: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min(Math.round((raised / goal) * 100), 100);
  };

  if (isLoading) {
    return (
      <div ref={containerRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`bg-gray-100 rounded-lg animate-pulse transition-all duration-300 ${
              showFilters ? 'h-96' : 'h-[500px]'
            }`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProjects.map((project) => {
          const progress = getProgress(project.raised, project.goal);
          
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className={`relative w-full overflow-hidden transition-all duration-300 ${
                showFilters ? 'h-48' : 'h-72'
              }`}>
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {project.urgency && (
                  <div className={`absolute top-3 left-3 px-3 py-1 backdrop-blur-sm rounded-full text-xs font-medium ${
                    project.urgency === t('emergencyCases') || project.urgency === 'Emergency cases' || project.urgency === 'Экстренные случаи'
                      ? 'bg-red-500/90 text-white' 
                      : 'bg-white/90 text-gray-900'
                  }`}>
                    {project.urgency === t('emergencyCases') || project.urgency === 'Экстренные случаи' ? t('emergencyCases') : project.urgency === t('regularProjects') || project.urgency === 'Обычные' ? t('regularProjects') : project.urgency}
                  </div>
                )}
              </div>
              
              <div className={`transition-all duration-300 ${
                showFilters ? 'p-5' : 'p-6'
              }`}>
                <h3 className="text-lg font-bold text-black mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>{progress}% {t('collected')}</span>
                    <span>{project.donors} {t('donors')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-black h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Amount */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-black">
                      {project.raised.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('of')} {project.goal.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                  {project.location && (
                    <div className="text-xs text-gray-500">
                      {project.location}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

