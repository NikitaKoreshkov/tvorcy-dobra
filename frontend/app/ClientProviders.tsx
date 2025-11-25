'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './contexts/AuthContext';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

