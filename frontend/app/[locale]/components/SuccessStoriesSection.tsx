'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function SuccessStoriesSection() {
  const t = useTranslations('homePage');
  const stories = [
    {
      id: 1,
      title: t('successStory1Title'),
      category: t('successStory1Category'),
      description: t('successStory1Description'),
      result: t('successStory1Result'),
      image: '/images/2.jpg',
      stats: {
        raised: '2 000 000 ₽',
        donors: 567,
        impact: t('successStory1Impact'),
      },
    },
    {
      id: 2,
      title: t('successStory2Title'),
      category: t('successStory2Category'),
      description: t('successStory2Description'),
      result: t('successStory2Result'),
      image: '/images/3.jpg',
      stats: {
        raised: '600 000 ₽',
        donors: 234,
        impact: t('successStory2Impact'),
      },
    },
    {
      id: 3,
      title: t('successStory3Title'),
      category: t('successStory3Category'),
      description: t('successStory3Description'),
      result: t('successStory3Result'),
      image: '/images/4.jpg',
      stats: {
        raised: '1 500 000 ₽',
        donors: 189,
        impact: t('successStory3Impact'),
      },
    },
  ];

  return (
    <section className="success-stories-section">
      <div className="success-stories-container">
        <div className="success-stories-header">
          <h2 className="premium-content-title premium-title-centered">
            {t('successStoriesTitle')} <span className="premium-title-accent">{t('successStoriesTitleHighlight')}</span>
          </h2>
          <p className="premium-content-intro">
            {t('successStoriesDescription')}
          </p>
        </div>

        <div className="success-stories-grid">
          {stories.map((story) => (
            <div
              key={story.id}
              className="success-story-card"
            >
              <div className="success-story-image-wrapper">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  className="success-story-image"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="success-story-overlay" />
                <div className="success-story-category">{story.category}</div>
              </div>
              
              <div className="success-story-content">
                <h3 className="success-story-title">{story.title}</h3>
                <p className="success-story-description">{story.description}</p>
                
                <div className="success-story-result">
                  <div className="success-story-result-icon">✓</div>
                  <span className="success-story-result-text">{story.result}</span>
                </div>

                <div className="success-story-stats">
                  <div className="success-story-stat">
                    <div className="success-story-stat-value">{story.stats.raised}</div>
                    <div className="success-story-stat-label">{t('collected')}</div>
                  </div>
                  <div className="success-story-stat">
                    <div className="success-story-stat-value">{story.stats.donors}</div>
                    <div className="success-story-stat-label">{t('donors')}</div>
                  </div>
                  <div className="success-story-stat">
                    <div className="success-story-stat-value">{story.stats.impact}</div>
                    <div className="success-story-stat-label">{t('result')}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

