'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
    
    // Обработчик ошибок загрузки модулей webpack
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleWindowError);
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleWindowError);
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  handleWindowError = (event: ErrorEvent) => {
    // Игнорируем ошибки загрузки модулей webpack - они обрабатываются автоматически
    if (event.message && event.message.includes('Cannot read properties of undefined')) {
      // Пытаемся перезагрузить страницу при ошибке загрузки модуля
      if (event.message.includes('reading \'call\'')) {
        console.warn('Webpack module load error detected, will retry...');
        setTimeout(() => {
          if (typeof window !== 'undefined' && !this.state.hasError) {
            window.location.reload();
          }
        }, 100);
      }
    }
  };

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    // Обрабатываем ошибки промисов, связанные с загрузкой модулей
    if (event.reason && typeof event.reason === 'object' && 'message' in event.reason) {
      const error = event.reason as Error;
      if (error.message && error.message.includes('Cannot read properties of undefined')) {
        console.warn('Unhandled promise rejection (module load error), will retry...');
        event.preventDefault();
        setTimeout(() => {
          if (typeof window !== 'undefined' && !this.state.hasError) {
            window.location.reload();
          }
        }, 100);
      }
    }
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}>Reload</button>
        </div>
      );
    }

    return this.props.children;
  }
}

