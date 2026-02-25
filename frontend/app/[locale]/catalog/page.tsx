'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from '@/src/routing';
import CatalogHeader, { SortOption } from '../components/catalog/CatalogHeader';
import CatalogFilters, { FilterState } from '../components/catalog/CatalogFilters';
import CatalogProjects from '../components/catalog/CatalogProjects';
import MobileFiltersPanel from '../components/catalog/MobileFiltersPanel';

export default function CatalogPage() {
  const t = useTranslations('catalogPage');
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  // Initialize as false to avoid hydration mismatch, will be set correctly after mount
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('popular');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    age: new Set(),
    disabilityType: new Set(),
    projectCategory: new Set(),
    goalAmount: new Set(),
    region: new Set(),
    urgency: new Set(),
  });
  const projectsContainerRef = useRef<HTMLDivElement>(null);

  // На мобильных устройствах скрываем фильтры по умолчанию
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkMobile = () => {
      if (window.innerWidth < 1024) {
        setShowFilters(false);
      } else {
        setShowFilters(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleProjectsLoad = (projects: any[]) => {
    setProjectsCount(projects.length);
    setIsLoading(false);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-20">
        {/* Breadcrumbs */}
        <div className="w-full bg-gray-50 border-b border-gray-200">
          <div className="w-full px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                {t('breadcrumbHome')}
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{t('breadcrumbCatalog')}</span>
            </nav>
          </div>
        </div>

        {/* Catalog Header Panel */}
        <CatalogHeader
          projectsCount={projectsCount}
          isLoading={isLoading}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          sortOption={sortOption}
          onSortChange={setSortOption}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenMobileFilters={() => setShowMobileFilters(true)}
        />

        {/* Filters and Projects Section - Single Container */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="relative flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 lg:gap-8">
            {/* Desktop Filters */}
            {showFilters && (
              <CatalogFilters 
                projectsContainerRef={projectsContainerRef}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filters={filters}
                onFiltersChange={setFilters}
              />
            )}
            
            {/* Projects - Right Side */}
            <div className="flex-1 w-full">
              <CatalogProjects
                containerRef={projectsContainerRef}
                onProjectsLoad={handleProjectsLoad}
                showFilters={showFilters}
                sortOption={sortOption}
                searchQuery={searchQuery}
                filters={filters}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filters Panel */}
      <MobileFiltersPanel
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        onSortChange={setSortOption}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <Footer />
    </>
  );
}
