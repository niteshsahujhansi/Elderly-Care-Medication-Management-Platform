'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { ActiveProfileProvider } from '../../context/ActiveProfileContext';
import { LanguageProvider } from '../../context/LanguageContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ActiveProfileProvider>{children}</ActiveProfileProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
