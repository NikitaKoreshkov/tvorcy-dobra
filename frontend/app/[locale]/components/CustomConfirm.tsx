'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface CustomConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function CustomConfirm({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'info',
}: CustomConfirmProps) {
  const t = useTranslations('common');
  const defaultConfirmText = confirmText || t('confirm');
  const defaultCancelText = cancelText || t('cancel');
  const colors = {
    danger: { bg: '#fef2f2', border: '#dc2626', button: '#dc2626', buttonHover: '#b91c1c' },
    warning: { bg: '#fffbeb', border: '#f59e0b', button: '#f59e0b', buttonHover: '#d97706' },
    info: { bg: '#f0f9ff', border: '#0066cc', button: '#0066cc', buttonHover: '#0052a3' },
  };

  const color = colors[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9998,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="custom-confirm-modal"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: color.bg,
              border: `2px solid ${color.border}`,
              borderRadius: '16px',
              padding: '2rem',
              zIndex: 9999,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="custom-confirm-title" style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              margin: '0 0 1rem 0',
              color: '#1a1a1a',
            }}>
              {title}
            </h3>
            <p className="custom-confirm-message" style={{
              fontSize: '1rem',
              lineHeight: '1.6',
              margin: '0 0 2rem 0',
              color: '#4a4a4a',
            }}>
              {message}
            </p>
            <div className="custom-confirm-buttons" style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={onClose}
                className="custom-confirm-cancel-button"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid #d1d1d1',
                  borderRadius: '8px',
                  color: '#1a1a1a',
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#8a8a8a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.borderColor = '#d1d1d1';
                }}
              >
                {defaultCancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="custom-confirm-submit-button"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: color.button,
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = color.buttonHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = color.button;
                }}
              >
                {defaultConfirmText}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

