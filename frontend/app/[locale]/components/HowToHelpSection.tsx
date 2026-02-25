'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/src/routing';
import Image from 'next/image';

export default function HowToHelpSection() {
  const t = useTranslations('common');
  const tHome = useTranslations('homePage');
  const waysToHelp = [
    {
      id: 1,
      title: tHome('oneTimeDonation'),
      description: tHome('oneTimeDonationDesc'),
      link: '/catalog',
      color: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      id: 2,
      title: tHome('regularSupport'),
      description: tHome('regularSupportDesc'),
      link: '/profile/subscriptions?tab=create',
      color: 'from-green-500/10 to-emerald-500/10',
    },
    {
      id: 3,
      title: tHome('corporatePartnership'),
      description: tHome('corporatePartnershipDesc'),
      link: '/corporate',
      color: 'from-orange-500/10 to-amber-500/10',
    },
  ];

  return (
    <section className="how-to-help-section">
      <div className="how-to-help-container">
        <div className="how-to-help-header">
          <h2 className="premium-content-title premium-title-centered">
            {tHome('howYouCanHelp')} <span className="premium-title-accent"></span>
          </h2>
          <p className="premium-content-intro">
            {tHome('howYouCanHelpDesc')}
          </p>
        </div>

        <div className="how-to-help-grid">
          {waysToHelp.map((way) => (
            <div
              key={way.id}
              className="how-to-help-card"
            >
              <div className={`how-to-help-card-bg ${way.color}`} />
              <div className="how-to-help-card-content">
                <h3 className="how-to-help-card-title">{way.title}</h3>
                <p className="how-to-help-card-description">{way.description}</p>
                <Link href={way.link} className="how-to-help-card-link">
                  {t('learnMore')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

