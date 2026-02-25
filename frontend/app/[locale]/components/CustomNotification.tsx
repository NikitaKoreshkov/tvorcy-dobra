'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface CustomNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export default function CustomNotification({
  isOpen,
  onClose,
  type,
  title,
  message,
  duration = 5000,
}: CustomNotificationProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const colors = {
    success: { bg: '#f0fdf4', border: '#16a34a', icon: '#16a34a', text: '#166534' },
    error: { bg: '#fef2f2', border: '#dc2626', icon: '#dc2626', text: '#991b1b' },
    info: { bg: '#f0f9ff', border: '#0066cc', icon: '#0066cc', text: '#1e40af' },
    warning: { bg: '#fffbeb', border: '#f59e0b', icon: '#f59e0b', text: '#92400e' },
  };

  const icons = {
    success: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    error: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4M12 16h.01" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    info: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    warning: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };

  const color = colors[type];
  const icon = icons[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="custom-notification-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="custom-notification"
            style={{
              background: color.bg,
              border: `2px solid ${color.border}`,
            }}
          >
          <div className="custom-notification-icon" style={{ color: color.icon }}>
            {icon}
          </div>
          <div className="custom-notification-content">
            <h3 className="custom-notification-title" style={{ color: color.text }}>
              {title}
            </h3>
            <p className="custom-notification-message" style={{ color: color.text }}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="custom-notification-close"
            style={{ color: color.icon }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 5L5 15M5 5l10 10" strokeLinecap="round"/>
            </svg>
          </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

