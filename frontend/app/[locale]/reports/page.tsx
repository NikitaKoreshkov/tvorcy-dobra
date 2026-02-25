'use client';

import { useTranslations } from 'next-intl';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Link } from '@/src/routing';
import { DocumentIcon, CalendarIcon, CheckIcon, DownloadIcon, ChartIcon, ArrowRightIcon } from '../components/Icons';

export default function ReportsPage() {
  const t = useTranslations('reportsPage');
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const heroRef = useRef(null);
  
  const viewOptions = { once: true, margin: '-100px' } as const;
  const isInView1 = useInView(ref1, viewOptions);
  const isInView2 = useInView(ref2, viewOptions);
  const isInView3 = useInView(ref3, viewOptions);
  const isInView4 = useInView(ref4, viewOptions);
  const isInView5 = useInView(ref5, viewOptions);
  const isHeroInView = useInView(heroRef, viewOptions);

  const [selectedYear, setSelectedYear] = useState<number>(2025);

  const reports: Array<{
    id: number;
    year: number;
    title: string;
    description: string;
    link: string;
  }> = [];

  const financialData = [
    { year: '2025', income: 0, expenses: 0 },
  ];

  const distributionData = [
    { name: t('childrenSports'), value: 0, color: '#0a0a0a' },
    { name: t('mothersSupport'), value: 0, color: '#4a4a4a' },
    { name: t('inclusionRehab'), value: 0, color: '#6a6a6a' },
    { name: t('socialSupport'), value: 0, color: '#8a8a8a' },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-black via-black to-black/70 bg-clip-text text-transparent">
                {t('heroTitle')}
              </span>
              <br />
              <span className="text-black/70">{t('heroSubtitle')}</span>
            </h1>
            <p className="text-xl lg:text-2xl text-black/60 max-w-3xl mx-auto leading-relaxed">
              {t('heroDescription')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50/50" ref={ref1}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 1, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-black">
                {t('financialReportingTitle')}
              </h2>
              <p className="text-xl text-black/70 leading-relaxed">
                {t('financialReportingDescription')}
              </p>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={isInView1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-black/10">
                <Image
                  src="/images/24.jpg"
                  alt="Финансовая отчётность"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reports Types */}
      <section className="py-20 lg:py-32 bg-white" ref={ref2}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {t('reportTypesTitle')} <span className="text-black/70"></span>
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {[
              {
                number: '01',
                icon: CalendarIcon,
                title: t('quarterlyReportsTitle'),
                image: '/images/25.jpg',
                texts: [
                  t('quarterlyReportsText1'),
                  t('quarterlyReportsText2'),
                ],
              },
              {
                number: '02',
                icon: DocumentIcon,
                title: t('annualReportTitle'),
                image: '/images/26.jpg',
                texts: [
                  t('annualReportText1'),
                  t('annualReportText2'),
                ],
              },
              {
                number: '03',
                icon: CheckIcon,
                title: t('auditReportsTitle'),
                image: '/images/27.jpg',
                texts: [
                  t('auditReportsText1'),
                  t('auditReportsText2'),
                ],
              },
              {
                number: '04',
                icon: DocumentIcon,
                title: t('projectReportsTitle'),
                image: '/images/28.jpg',
                texts: [
                  t('projectReportsText1'),
                  t('projectReportsText2'),
                ],
              },
            ].map((reportType, index) => {
              const IconComponent = reportType.icon;
              return (
                <motion.div
                  key={index}
                  className="group relative bg-white rounded-3xl overflow-hidden border-2 border-black/5 hover:border-black/10 transition-all duration-500"
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: [0.6, -0.05, 0.01, 0.99] }}
                  whileHover={{ y: -8, scale: 1.01 }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={reportType.image}
                      alt={reportType.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute top-4 left-4">
                      <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-black/10">
                        <span className="text-xs font-bold text-black">{reportType.number}</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-black/70" />
                      </div>
                      <h3 className="text-2xl font-bold text-black">{reportType.title}</h3>
                    </div>
                    {reportType.texts.map((text, textIndex) => (
                      <p key={textIndex} className="text-black/70 leading-relaxed mb-3">
                        {text}
                      </p>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50/50 to-white" ref={ref3}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {t('financialIndicators')}
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              {t('financialIndicatorsDescription')}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Bar Chart */}
            <motion.div
              className="bg-white rounded-3xl p-8 lg:p-10 border border-black/5"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <h3 className="text-2xl font-bold mb-2 text-black">{t('yearlyDynamics')}</h3>
              <p className="text-black/60 mb-8">{t('incomeAndExpenses')}</p>
              <div className="space-y-6">
                {financialData.map((data, index) => (
                  <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-black/70">{data.year}</span>
                        <div className="flex gap-4 text-xs text-black/50">
                          <span>{t('income')}: {data.income === 0 ? '0' : `${data.income}М`}</span>
                          <span>{t('expenses')}: {data.expenses === 0 ? '0' : `${data.expenses}М`}</span>
                        </div>
                      </div>
                    <div className="space-y-2">
                      <motion.div
                        className="h-8 bg-black rounded-lg flex items-center justify-end pr-3"
                        initial={{ width: 0 }}
                        animate={isInView3 ? { width: data.income === 0 ? '5%' : `${Math.min((data.income / 80) * 100, 100)}%` } : { width: 0 }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.15 }}
                      >
                        <span className="text-white text-sm font-medium">{data.income === 0 ? '0' : data.income}</span>
                      </motion.div>
                      <motion.div
                        className="h-8 bg-black/40 rounded-lg flex items-center justify-end pr-3"
                        initial={{ width: 0 }}
                        animate={isInView3 ? { width: data.expenses === 0 ? '5%' : `${Math.min((data.expenses / 80) * 100, 100)}%` } : { width: 0 }}
                        transition={{ duration: 1, delay: 0.6 + index * 0.15 }}
                      >
                        <span className="text-black text-sm font-medium">{data.expenses === 0 ? '0' : data.expenses}</span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pie Chart */}
            <motion.div
              className="bg-white rounded-3xl p-8 lg:p-10 border border-black/5"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <h3 className="text-2xl font-bold mb-2 text-black">{t('fundDistribution')}</h3>
              <p className="text-black/60 mb-8">{t('byPrograms2024')}</p>
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {distributionData.map((segment, index) => {
                      const angle = (segment.value / 100) * 360;
                      const startAngle = distributionData.slice(0, index).reduce((sum, s) => sum + (s.value / 100) * 360, 0);
                      const largeArc = angle > 180 ? 1 : 0;
                      const x1 = 100 + 100 * Math.cos((startAngle * Math.PI) / 180);
                      const y1 = 100 + 100 * Math.sin((startAngle * Math.PI) / 180);
                      const x2 = 100 + 100 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                      const y2 = 100 + 100 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                      return (
                        <motion.path
                          key={index}
                          d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={segment.color}
                          initial={{ pathLength: 0 }}
                          animate={isInView3 ? { pathLength: 1 } : { pathLength: 0 }}
                          transition={{ duration: 1.5, delay: 0.8 + index * 0.2 }}
                          style={{ opacity: 0.8 }}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-black">
                        {distributionData.reduce((sum, item) => sum + item.value, 0)}%
                      </div>
                      <div className="text-sm text-black/60">{t('total')}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 w-full">
                  {distributionData.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded" style={{ background: item.color }}></div>
                        <span className="font-medium text-black">{item.name}</span>
                      </div>
                      <span className="font-bold text-black">{item.value}%</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reports List */}
      <section className="py-20 lg:py-32 bg-white" ref={ref4}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {t('latestReports')}
            </h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              {t('latestReportsDescription')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {reports.length > 0 ? reports.map((report) => (
              <motion.div
                key={report.id}
                className="group bg-white rounded-3xl p-6 lg:p-8 border-2 border-black/5 hover:border-black/10 transition-all duration-500 flex flex-col"
                initial={{ opacity: 0, y: 40 }}
                animate={isInView4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.8, delay: report.id * 0.1 + 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-black/70" />
                  </div>
                  <div className="text-2xl font-bold text-black">{report.year}</div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-black">{report.title}</h3>
                <p className="text-black/70 mb-6 leading-relaxed flex-grow">{report.description}</p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Создаем и скачиваем файл отчета
                    const fileName = `report-${report.year}.pdf`;
                    const reportContent = `Отчет за ${report.year} год\n\n${report.title}\n\n${report.description}\n\nЭто демонстрационный отчет.`;
                    
                    // Создаем blob и скачиваем
                    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="group/link inline-flex items-center gap-2 text-black font-medium hover:text-black/70 transition-colors mt-auto cursor-pointer"
                >
                  <DownloadIcon className="w-5 h-5" />
                  <span>{t('downloadReport')}</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )) : (
              <motion.div
                className="col-span-full text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-lg text-black/60">{t('noReportsYet')}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50/50" ref={ref5}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {t('questionsAboutReports')}
            </h2>
            <p className="text-xl text-black/60 mb-8 max-w-2xl mx-auto">
              {t('questionsAboutReportsDescription')}
            </p>
            <Link
              href="/contacts"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-black/90 transition-all"
            >
              {t('contactUs')}
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
