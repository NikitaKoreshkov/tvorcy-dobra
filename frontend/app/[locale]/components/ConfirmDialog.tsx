'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = 'info',
}: ConfirmDialogProps) {
  const t = useTranslations('common');
  const defaultConfirmText = confirmText || t('confirm');
  const defaultCancelText = cancelText || t('cancel');
  
  if (!isOpen) return null;

  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return {
          confirm: {
            background: '#e74c3c',
            color: '#fff',
            border: '1px solid #e74c3c',
          },
        };
      case 'warning':
        return {
          confirm: {
            background: '#f39c12',
            color: '#fff',
            border: '1px solid #f39c12',
          },
        };
      default:
        return {
          confirm: {
            background: '#000',
            color: '#fff',
            border: '1px solid #000',
          },
        };
    }
  };

  const buttonStyles = getButtonStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h3 style={{
              fontSize: '24px',
              fontWeight: 600,
              marginBottom: '16px',
              color: '#000',
            }}>
              {title}
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '32px',
              lineHeight: 1.6,
            }}>
              {message}
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={onCancel}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  background: 'transparent',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#666',
                  fontWeight: 500,
                }}
              >
                {defaultCancelText}
              </button>
              <button
                onClick={onConfirm}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  ...buttonStyles.confirm,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {defaultConfirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

