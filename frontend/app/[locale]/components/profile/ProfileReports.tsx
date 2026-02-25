'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { DocumentIcon, DownloadIcon } from '../Icons';

export default function ProfileReports() {
  const t = useTranslations('profilePage');
  const tCommon = useTranslations('common');
  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  // Отчёты будут появляться по мере реализации проектов
  const reports: Array<{
    id: number;
    project: string;
    title: string;
    date: string;
    image: string;
    summary: string;
    quote: string;
    fullText: string;
    stats: any;
  }> = [];

  const handleReadReport = (reportId: number) => {
    setSelectedReport(reportId);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
    }
  };

  const handleCloseReport = () => {
    setSelectedReport(null);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'unset'; // Разблокируем скролл
    }
  };

  const handleDownloadPDF = (reportId: number) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    // Создаем красивый PDF из контента
    createBeautifulPDF(report);
  };

  const createBeautifulPDF = (report: typeof reports[0]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formattedDate = new Date(report.date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let inList = false;
    const formattedContent = report.fullText.split('\n').map((line, index, array) => {
      if (line.startsWith('# ')) {
        const result = inList ? '</ul>' : '';
        inList = false;
        return result + `<h1 class="report-h1">${escapeHtml(line.substring(2))}</h1>`;
      } else if (line.startsWith('## ')) {
        const result = inList ? '</ul>' : '';
        inList = false;
        return result + `<h2 class="report-h2">${escapeHtml(line.substring(3))}</h2>`;
      } else if (line.trim() === '') {
        const result = inList ? '</ul>' : '';
        inList = false;
        return result + '<br>';
      } else if (line.startsWith('- ')) {
        if (!inList) {
          inList = true;
          return `<ul><li class="report-list-item">${escapeHtml(line.substring(2))}</li>`;
        } else {
          // Проверяем следующий элемент - если он тоже список, оставляем список открытым
          const nextLine = array[index + 1];
          if (nextLine && nextLine.startsWith('- ')) {
            return `<li class="report-list-item">${escapeHtml(line.substring(2))}</li>`;
          } else {
            inList = false;
            return `<li class="report-list-item">${escapeHtml(line.substring(2))}</li></ul>`;
          }
        }
      } else {
        const result = inList ? '</ul>' : '';
        inList = false;
        return result + `<p class="report-paragraph">${escapeHtml(line)}</p>`;
      }
    }).join('') + (inList ? '</ul>' : '');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${escapeHtml(report.title)} - The creators of Good</title>
          <style>
            @page {
              size: A4;
              margin: 2cm;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.7;
              color: #1a1a1a;
              background: #ffffff;
              padding: 0;
              max-width: 210mm;
              margin: 0 auto;
            }
            
            .report-header {
              background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
              color: #ffffff;
              padding: 2.5rem 2rem;
              margin: -2cm -2cm 2rem -2cm;
              border-bottom: 4px solid #10b981;
            }
            
            .report-header-content {
              max-width: 100%;
              margin: 0 auto;
            }
            
            .report-logo {
              font-family: 'Playfair Display', serif;
              font-size: 1.75rem;
              font-weight: 700;
              margin-bottom: 0.75rem;
              letter-spacing: -0.02em;
            }
            
            .report-title {
              font-family: 'Playfair Display', serif;
              font-size: 1.875rem;
              font-weight: 700;
              margin-bottom: 1rem;
              line-height: 1.3;
              letter-spacing: -0.02em;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            
            .report-meta {
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
              margin-top: 1.25rem;
              font-size: 0.875rem;
              opacity: 0.9;
            }
            
            .report-meta-item {
              display: flex;
              align-items: flex-start;
              gap: 0.5rem;
              line-height: 1.5;
            }
            
            .report-content {
              padding: 0 1rem 2rem 1rem;
              max-width: 800px;
              margin: 0 auto;
            }
            
            .report-h1 {
              font-family: 'Playfair Display', serif;
              font-size: 2rem;
              font-weight: 700;
              color: #1a1a1a;
              margin: 3rem 0 1.5rem 0;
              padding-bottom: 0.75rem;
              border-bottom: 3px solid #1a1a1a;
              line-height: 1.3;
              letter-spacing: -0.01em;
            }
            
            .report-h1:first-of-type {
              margin-top: 0;
            }
            
            .report-h2 {
              font-family: 'Playfair Display', serif;
              font-size: 1.5rem;
              font-weight: 700;
              color: #1a1a1a;
              margin: 2.5rem 0 1rem 0;
              line-height: 1.4;
              letter-spacing: -0.01em;
            }
            
            .report-paragraph {
              font-size: 1rem;
              color: #4a4a4a;
              margin: 1.25rem 0;
              text-align: justify;
              line-height: 1.8;
            }
            
            .report-list-item {
              font-size: 1rem;
              color: #4a4a4a;
              margin: 0.75rem 0;
              line-height: 1.7;
              list-style: none;
              padding-left: 1.5rem;
              position: relative;
            }
            
            .report-list-item::before {
              content: '✓';
              position: absolute;
              left: 0;
              color: #10b981;
              font-weight: 700;
              font-size: 1.125rem;
            }
            
            ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            
            .report-footer {
              margin-top: 4rem;
              padding-top: 2rem;
              border-top: 2px solid #e8e8e8;
              text-align: center;
              color: #6a6a6a;
              font-size: 0.875rem;
            }
            
            .report-signature {
              margin-top: 3rem;
              text-align: right;
            }
            
            .report-signature-line {
              border-top: 2px solid #1a1a1a;
              width: 300px;
              margin: 3rem 0 0.5rem auto;
            }
            
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 1rem 2rem;
              background: #1a1a1a;
              color: #ffffff;
              border: none;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              z-index: 10000;
            }
            
            .print-button:hover {
              background: #2a2a2a;
            }
            
            @media (max-width: 768px) {
              body {
                padding: 1rem;
                max-width: 100%;
              }
              
              .report-header {
                padding: 1.5rem 1rem;
                margin: -1rem -1rem 1.5rem -1rem;
              }
              
              .report-logo {
                font-size: 1.25rem;
                margin-bottom: 0.5rem;
              }
              
              .report-title {
                font-size: 1.375rem;
                margin-bottom: 0.75rem;
                word-break: break-word;
              }
              
              .report-meta {
                font-size: 0.8125rem;
                margin-top: 1rem;
              }
              
              .report-content {
                padding: 0 0.5rem 1.5rem 0.5rem;
              }
              
              .report-h1 {
                font-size: 1.5rem;
                margin: 2rem 0 1rem 0;
                padding-bottom: 0.5rem;
              }
              
              .report-h2 {
                font-size: 1.25rem;
                margin: 1.5rem 0 0.75rem 0;
              }
              
              .report-paragraph {
                font-size: 0.9375rem;
                margin: 1rem 0;
                text-align: left;
                line-height: 1.6;
              }
              
              .report-list-item {
                font-size: 0.9375rem;
                margin: 0.5rem 0;
                padding-left: 1.25rem;
              }
              
              .report-list-item::before {
                font-size: 1rem;
              }
              
              .report-footer {
                margin-top: 2rem;
                padding-top: 1.5rem;
                font-size: 0.8125rem;
              }
              
              .report-signature {
                margin-top: 2rem;
              }
              
              .report-signature-line {
                width: 200px;
                margin: 2rem 0 0.5rem auto;
              }
              
              .print-button {
                top: 10px;
                right: 10px;
                padding: 0.75rem 1.25rem;
                font-size: 0.875rem;
              }
            }
            
            @media (max-width: 385px) {
              body {
                padding: 0.75rem;
              }
              
              .report-header {
                padding: 1.25rem 0.875rem;
                margin: -0.75rem -0.75rem 1.25rem -0.75rem;
              }
              
              .report-logo {
                font-size: 1.125rem;
              }
              
              .report-title {
                font-size: 1.25rem;
              }
              
              .report-meta {
                font-size: 0.75rem;
              }
              
              .report-content {
                padding: 0 0.25rem 1.25rem 0.25rem;
              }
              
              .report-h1 {
                font-size: 1.375rem;
                margin: 1.5rem 0 0.875rem 0;
              }
              
              .report-h2 {
                font-size: 1.125rem;
                margin: 1.25rem 0 0.625rem 0;
              }
              
              .report-paragraph {
                font-size: 0.875rem;
                margin: 0.875rem 0;
              }
              
              .report-list-item {
                font-size: 0.875rem;
                padding-left: 1rem;
              }
              
              .report-signature-line {
                width: 150px;
              }
              
              .print-button {
                top: 8px;
                right: 8px;
                padding: 0.625rem 1rem;
                font-size: 0.8125rem;
              }
            }
            
            @media (max-width: 300px) {
              body {
                padding: 0.5rem;
              }
              
              .report-header {
                padding: 1rem 0.75rem;
                margin: -0.5rem -0.5rem 1rem -0.5rem;
              }
              
              .report-logo {
                font-size: 1rem;
                margin-bottom: 0.375rem;
              }
              
              .report-title {
                font-size: 1.125rem;
                margin-bottom: 0.5rem;
              }
              
              .report-meta {
                font-size: 0.6875rem;
                margin-top: 0.75rem;
                gap: 0.375rem;
              }
              
              .report-content {
                padding: 0 0.125rem 1rem 0.125rem;
              }
              
              .report-h1 {
                font-size: 1.25rem;
                margin: 1.25rem 0 0.75rem 0;
                padding-bottom: 0.375rem;
              }
              
              .report-h2 {
                font-size: 1rem;
                margin: 1rem 0 0.5rem 0;
              }
              
              .report-paragraph {
                font-size: 0.8125rem;
                margin: 0.75rem 0;
                line-height: 1.5;
              }
              
              .report-list-item {
                font-size: 0.8125rem;
                margin: 0.375rem 0;
                padding-left: 0.875rem;
              }
              
              .report-list-item::before {
                font-size: 0.9375rem;
              }
              
              .report-footer {
                margin-top: 1.5rem;
                padding-top: 1rem;
                font-size: 0.75rem;
              }
              
              .report-signature {
                margin-top: 1.5rem;
              }
              
              .report-signature-line {
                width: 120px;
                margin: 1.5rem 0 0.375rem auto;
              }
              
              .print-button {
                top: 5px;
                right: 5px;
                padding: 0.5rem 0.875rem;
                font-size: 0.75rem;
              }
            }
            
            @media print {
              .print-button {
                display: none;
              }
              
              body {
                padding: 0;
              }
              
              .report-header {
                margin: -2cm -2cm 2cm -2cm;
                page-break-after: avoid;
              }
              
              .report-content {
                padding: 0;
              }
              
              .report-h1 {
                page-break-after: avoid;
              }
              
              .report-h2 {
                page-break-after: avoid;
              }
              
              .report-paragraph {
                orphans: 3;
                widows: 3;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <div class="report-header-content">
              <div class="report-logo">The creators of Good</div>
              <h1 class="report-title">${escapeHtml(report.title)}</h1>
              <div class="report-meta">
                <div class="report-meta-item">
                  <strong>Проект:</strong> ${escapeHtml(report.project)}
                </div>
                <div class="report-meta-item">
                  <strong>Дата:</strong> ${escapeHtml(formattedDate)}
                </div>
              </div>
            </div>
          </div>
          
          <div class="report-content">
            ${formattedContent}
            
            <div class="report-footer">
              <p>Благодарим вас за поддержку!</p>
              <p style="margin-top: 0.5rem; font-weight: 600;">Фонд Творцы Добра</p>
            </div>
            
            <div class="report-signature">
              <div class="report-signature-line"></div>
              <p style="font-size: 0.875rem; color: #6a6a6a;">Директор фонда</p>
            </div>
          </div>
          
          <button class="print-button" onclick="window.print()">Печать / Сохранить PDF</button>
          
          <script>
            // Автоматически открываем диалог печати через небольшую задержку
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
            
            // Функция для закрытия окна после печати (опционально)
            window.onafterprint = function() {
              // Можно закрыть окно или оставить открытым
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const escapeHtml = (text: string) => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  return (
    <div className="profile-reports">
      <motion.div
        className="premium-content-header"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="premium-content-title">{t('reportsTitle')}</h2>
        <p className="premium-content-intro">
          {t('reportsDescription')}
        </p>
      </motion.div>

      <div className="profile-reports-list">
        {reports.length > 0 ? (
          reports.map((report, index) => (
            <motion.div
              key={report.id}
              className="profile-report-card"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <div className="profile-report-image-wrapper">
                <Image
                  src={report.image}
                  alt={report.title}
                  fill
                  className="profile-report-image"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="profile-report-content">
                <div className="profile-report-header">
                  <h3 className="profile-report-title">{report.title}</h3>
                  <p className="profile-report-project">{report.project}</p>
                  <p className="profile-report-date">{report.date}</p>
                </div>
                <p className="profile-report-summary">{report.summary}</p>
                <div className="profile-report-quote">
                  <p className="profile-report-quote-text">&ldquo;{report.quote}&rdquo;</p>
                </div>
                <div className="profile-report-actions">
                  <button 
                    className="premium-button"
                    onClick={() => handleReadReport(report.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <DocumentIcon />
                    {t('readFullReport')}
                  </button>
                  <button 
                    className="profile-report-download"
                    onClick={() => handleDownloadPDF(report.id)}
                  >
                    <DownloadIcon />
                    {t('downloadPDF')}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="profile-reports-empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: '#6a6a6a'
            }}
          >
            <div className="mx-auto mb-4 opacity-30" style={{ width: '64px', height: '64px', color: '#6a6a6a' }}>
              <DocumentIcon />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-black/70">{t('reportsEmptyTitle')}</h3>
            <p className="text-base leading-relaxed max-w-md mx-auto">
              {t('reportsEmptyText')}
            </p>
          </motion.div>
        )}
      </div>

      {/* Модальное окно для просмотра полного отчета */}
      <AnimatePresence>
        {selectedReport !== null && (() => {
          const report = reports.find(r => r.id === selectedReport);
          if (!report) return null;

          return (
            <motion.div
              className="profile-report-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseReport}
            >
              <motion.div
                className="profile-report-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="profile-report-modal-header">
                  <h2 className="profile-report-modal-title">{report.title}</h2>
                  <button
                    className="profile-report-modal-close"
                    onClick={handleCloseReport}
                    aria-label={tCommon('close')}
                  >
                    ×
                  </button>
                </div>
                <div className="profile-report-modal-content">
                  <div className="profile-report-modal-meta">
                    <p><strong>Проект:</strong> {report.project}</p>
                    <p><strong>Дата:</strong> {new Date(report.date).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                  <div className="profile-report-modal-text">
                    {report.fullText.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index}>{line.substring(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={index}>{line.substring(3)}</h2>;
                      } else if (line.trim() === '') {
                        return <br key={index} />;
                      } else if (line.startsWith('- ')) {
                        return <li key={index} style={{ marginLeft: '1.5rem', marginBottom: '0.5rem' }}>{line.substring(2)}</li>;
                      } else {
                        return <p key={index}>{line}</p>;
                      }
                    })}
                  </div>
                </div>
                <div className="profile-report-modal-footer">
                  <button
                    className="premium-button"
                    onClick={() => {
                      handleDownloadPDF(report.id);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <DownloadIcon />
                    {t('downloadPDF')}
                  </button>
                  <button
                    className="profile-report-modal-close-button"
                    onClick={handleCloseReport}
                  >
                    {tCommon('close')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

