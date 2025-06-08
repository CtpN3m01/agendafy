// src/components/auth/protected-route.tsx
"use client";

import { useRequireAuth } from '@/hooks/use-auth';
import { useMounted } from '@/hooks/use-mounted';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const isMounted = useMounted();

  // Durante el server-side rendering o antes del montaje, no mostramos nada
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // El hook se encarga de redirigir
  }

  return <>{children}</>;
}
