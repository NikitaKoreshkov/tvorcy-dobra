'use client';

import Header from './components/Header';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import HowToHelpSection from './components/HowToHelpSection';
import DonationCards from './components/DonationCards';
import SuccessStoriesSection from './components/SuccessStoriesSection';
import AIFeatureSection from './components/AIFeatureSection';
import SponsorsSection from './components/SponsorsSection';
import TopUsersSection from './components/TopUsersSection';
import CTASection from './components/CTASection';
import AliusAIAssistant from './components/AliusAIAssistant';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <AboutSection />
      <HowToHelpSection />
      <DonationCards />
      <SuccessStoriesSection />
      <AIFeatureSection />
      <SponsorsSection />
      <TopUsersSection />
      <CTASection />
      <Footer />
      <AliusAIAssistant />
    </main>
  );
}

