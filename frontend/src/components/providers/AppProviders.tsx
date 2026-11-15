'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { ActiveProfileProvider } from '../../context/ActiveProfileContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ActiveProfileProvider>{children}</ActiveProfileProvider>
    </AuthProvider>
  );
}
