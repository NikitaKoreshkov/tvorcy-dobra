'use client';

import { Link } from '@/src/routing';
import { useTranslations } from 'next-intl';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Header() {
  const t = useTranslations('header');
  const { isAuthenticated, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // While loading, show "Join" to avoid flickering
  const showProfile = !isLoading && isAuthenticated;

  // Close mobile menu when clicking outside or on a link
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.burger-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="premium-glass">
        <div className="w-full px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 relative">
            {/* Logo */}
            <Link
              href="/"
              onClick={handleLogoClick}
              className="logo-link"
            >
              <span className="text-2xl font-bold tracking-tight">The creators of Good</span>
            </Link>

            {/* Desktop Navigation - centered */}
            <nav className="header-desktop-nav hidden lg:flex items-center gap-8 xl:gap-12 absolute left-1/2 -translate-x-1/2">
              <Link href="/about" className="nav-link">
                {t('about')}
              </Link>
              <Link href="/programs" className="nav-link">
                {t('programs')}
              </Link>
              <Link href="/reports" className="nav-link">
                {t('reports')}
              </Link>
              <Link href="/support" className="nav-link">
                {t('support')}
              </Link>
              <Link href="/contacts" className="nav-link">
                {t('contacts')}
              </Link>
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="flex items-center gap-2 lg:gap-3">
              <Link
                href="/alius-ai"
                className="alius-header-button hidden sm:flex"
                aria-label={t('openAliusAI')}
                title={t('aliusAITitle')}
              >
                AliusAI
              </Link>
              <Link 
                href={showProfile ? "/profile" : "/login"} 
                className="premium-button hidden sm:block"
              >
                {showProfile ? t('myProfile') : t('join')}
              </Link>
              
              {/* Burger Button - Mobile */}
              <button
                className="burger-button header-burger-button lg:hidden flex flex-col justify-center items-center w-8 h-8 p-0 bg-transparent border-none cursor-pointer z-[60] relative"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                <span
                  className={`burger-line w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'
                  }`}
                />
                <span
                  className={`burger-line w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`burger-line w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`mobile-menu header-mobile-menu fixed inset-0 top-20 z-40 bg-white transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:hidden`}
      >
        <nav className="flex flex-col h-full overflow-y-auto px-6 py-8">
          <Link 
            href="/about" 
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            {t('about')}
          </Link>
          <Link 
            href="/programs" 
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            {t('programs')}
          </Link>
          <Link 
            href="/reports" 
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            {t('reports')}
          </Link>
          <Link 
            href="/support" 
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            {t('support')}
          </Link>
          <Link 
            href="/contacts" 
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            {t('contacts')}
          </Link>

          <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col gap-4">
            <Link
              href="/alius-ai"
              className="mobile-nav-button alius-button"
              onClick={closeMobileMenu}
            >
              AliusAI
            </Link>
            <Link 
              href={showProfile ? "/profile" : "/login"} 
              className="mobile-nav-button profile-button"
              onClick={closeMobileMenu}
            >
              {showProfile ? t('myProfile') : t('join')}
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="header-mobile-overlay fixed inset-0 top-20 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </header>
  );
}

