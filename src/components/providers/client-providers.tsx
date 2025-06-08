// src/components/providers/client-providers.tsx
"use client";

import { AuthProvider } from '@/hooks/use-auth';
import { useMounted } from '@/hooks/use-mounted';
import type { ReactNode } from 'react';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const isMounted = useMounted();

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
