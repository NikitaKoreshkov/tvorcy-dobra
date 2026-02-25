'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  id?: string;
  name?: string;
  variant?: 'light' | 'dark';
  isSmall?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  label,
  required = false,
  id,
  name,
  variant = 'light',
  isSmall = false,
}: CustomSelectProps) {
  const t = useTranslations('common');
  const defaultPlaceholder = placeholder || t('select');
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div style={{ position: 'relative' }} ref={selectRef}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 500,
            color: '#1a1a1a',
          }}
        >
          {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
      )}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: isSmall 
            ? (variant === 'dark' ? '0.625rem 0.75rem' : '0.625rem 0.75rem')
            : (variant === 'dark' ? '0.875rem 1rem' : '0.75rem 1rem'),
          border: variant === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #d1d1d1',
          borderRadius: isSmall ? '6px' : '8px',
          fontSize: isSmall ? '0.8125rem' : '0.95rem',
          background: variant === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isSmall ? '0.5rem' : '0.75rem',
          transition: 'border-color 0.2s, background 0.2s',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = variant === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#0066cc';
            if (variant === 'dark') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = variant === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d1';
            if (variant === 'dark') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }
          }
        }}
      >
        <span style={{ 
          color: variant === 'dark' 
            ? (value ? 'var(--text-primary, #fff)' : 'var(--text-secondary, #8a8a8a)')
            : (value ? '#1a1a1a' : '#8a8a8a'),
          flex: 1,
          textAlign: 'left',
        }}>
          {selectedOption ? selectedOption.label : defaultPlaceholder}
        </span>
        <motion.svg
          width={isSmall ? "14" : "16"}
          height={isSmall ? "14" : "16"}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ 
            color: variant === 'dark' ? 'var(--text-secondary, #8a8a8a)' : '#8a8a8a', 
            flexShrink: 0 
          }}
        >
          <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
        {name && <input type="hidden" name={name} value={value} />}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: variant === 'dark' ? 'var(--bg-secondary, #0f0f0f)' : '#fff',
              border: variant === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #d1d1d1',
              borderRadius: '8px',
              boxShadow: variant === 'dark' 
                ? '0 10px 40px rgba(0, 0, 0, 0.5)' 
                : '0 10px 40px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: isSmall ? '0.625rem 0.75rem' : '0.875rem 1rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  fontSize: isSmall ? '0.8125rem' : '0.95rem',
                  background: value === option.value 
                    ? (variant === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#f0f9ff')
                    : 'transparent',
                  color: value === option.value 
                    ? (variant === 'dark' ? 'var(--text-primary, #fff)' : '#0066cc')
                    : (variant === 'dark' ? 'var(--text-primary, #fff)' : '#1a1a1a'),
                  fontWeight: value === option.value ? 500 : 400,
                }}
                onMouseEnter={(e) => {
                  if (value !== option.value) {
                    e.currentTarget.style.background = variant === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (value !== option.value) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {option.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

