// src/components/providers/client-providers.tsx
"use client";

import { AuthProvider } from '@/hooks/use-auth';
import { useMounted } from '@/hooks/use-mounted';
import { Toaster } from 'sonner';
import type { ReactNode } from 'react';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  useMounted();

  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
