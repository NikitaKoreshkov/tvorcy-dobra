'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/src/routing';
import { getApiUrl } from '@/src/config';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Link } from '@/src/routing';
import { useInView } from 'framer-motion';
import ProjectHero from '../../components/project/ProjectHero';
import ProjectStats from '../../components/project/ProjectStats';
import ProjectDescription from '../../components/project/ProjectDescription';
import ProjectDetails from '../../components/project/ProjectDetails';
import ProjectSidebar from '../../components/project/ProjectSidebar';
import ProjectActions from '../../components/project/ProjectActions';
import ProjectGallery from '../../components/project/ProjectGallery';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  images?: string[];
  category: string;
  location: string;
  raised: number;
  goal: number;
  donors: number;
  createdAt?: string;
  age?: string;
  disabilityType?: string;
  urgency?: string;
  status?: string;
  tags?: string[];
  metadata?: {
    fullDescription?: string;
    name?: string;
    daysLeft?: number;
  };
}

export default function ProjectPage() {
  const t = useTranslations('projectPage');
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isHeroInView = useInView(heroRef, viewOptions);
  const isContentInView = useInView(contentRef, viewOptions);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setError(t('projectIdNotSpecified'));
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(getApiUrl(`/projects/${projectId}`));
        const data = await response.json();

        if (!data.success || !data.project) {
          setError(data.message || t('projectNotFound'));
          setIsLoading(false);
          return;
        }

        // Преобразуем данные проекта
        const projectData: Project = {
          id: data.project.id,
          title: data.project.title,
          description: data.project.description,
          image: data.project.image || '/images/q.jpg',
          images: data.project.images || [],
          category: data.project.category || 'Общее',
          location: data.project.location || '',
          raised: Number(data.project.raised) || 0,
          goal: Number(data.project.goal) || 0,
          donors: data.project.donors || 0,
          createdAt: data.project.createdAt || data.project.created_at,
          age: data.project.age,
          disabilityType: data.project.disabilityType || data.project.disability_type,
          urgency: data.project.urgency,
          status: data.project.status,
          tags: data.project.tags || [],
          metadata: data.project.metadata || {},
        };

        setProject(projectData);
      } catch (err) {
        console.error('Error loading project:', err);
        setError(t('failedToLoadProject'));
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId, t]);

  const getProgress = (raised: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min(Math.round((raised / goal) * 100), 100);
  };

  const handleDonate = () => {
    router.push(`/donate?projectId=${project?.id}`);
  };

  const handleSubscribe = () => {
    router.push(`/profile/subscriptions?create=true&projectId=${project?.id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.title,
        text: project?.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t('linkCopied'));
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
        <Header />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg font-medium">{t('loadingProject')}</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
        <Header />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">😔</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-black">{t('projectNotFound')}</h1>
            <p className="text-gray-600 mb-8 text-lg">{error || t('requestedProjectDoesNotExist')}</p>
            <Link 
              href="/catalog" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              <span>{t('backToCatalog')}</span>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const progress = getProgress(project.raised, project.goal);
  const fullDescription = project.metadata?.fullDescription || project.description;
  const organizerName = project.metadata?.name;
  const daysLeft = project.metadata?.daysLeft;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <Header />
      
      {/* Breadcrumbs */}
      <div className="w-full bg-white border-b border-gray-200 pt-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
          <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Link href="/" className="text-gray-600 hover:text-black transition-colors duration-200 font-medium truncate">
              {t('home')}
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/catalog" className="text-gray-600 hover:text-black transition-colors duration-200 font-medium truncate">
              {t('catalog')}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-black font-semibold truncate max-w-[120px] sm:max-w-[200px] md:max-w-md">{project.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div ref={heroRef}>
        <ProjectHero
          title={project.title}
          description={project.description}
          image={project.image}
          urgency={project.urgency}
          isInView={isHeroInView}
        />
          </div>

      {/* Main Content */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-24" ref={contentRef}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
            {/* Main Content - Left Side (2 columns) */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
              {/* Project Stats */}
              <ProjectStats
                raised={project.raised}
                goal={project.goal}
                donors={project.donors}
                progress={progress}
                daysLeft={daysLeft}
                isInView={isContentInView}
              />

              {/* Project Description */}
              <ProjectDescription
                fullDescription={fullDescription}
                isInView={isContentInView}
              />

              {/* Project Gallery */}
              {project.images && project.images.length > 0 && (
                <ProjectGallery
                  images={project.images}
                  title={project.title}
                  isInView={isContentInView}
                />
              )}

              {/* Project Details & Tags */}
              <ProjectDetails
                location={project.location}
                age={project.age}
                disabilityType={project.disabilityType}
                organizerName={organizerName}
                tags={project.tags}
                isInView={isContentInView}
              />

              {/* Action Buttons */}
              <ProjectActions
                projectId={project.id}
                projectTitle={project.title}
                projectDescription={project.description}
                isInView={isContentInView}
                onDonate={handleDonate}
                onSubscribe={handleSubscribe}
                onShare={handleShare}
              />
            </div>

            {/* Sidebar - Right Side (1 column) */}
            <div className="lg:col-span-1 order-first lg:order-last !static">
              <ProjectSidebar
                projectId={project.id}
                projectTitle={project.title}
                projectDescription={project.description}
                urgency={project.urgency}
                status={project.status}
                createdAt={project.createdAt}
                isInView={isContentInView}
                onDonate={handleDonate}
                onSubscribe={handleSubscribe}
                onShare={handleShare}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
