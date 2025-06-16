// src/hooks/use-user-organization.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

interface UserOrganization {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UseUserOrganizationReturn {
  organization: UserOrganization | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserOrganization(): UseUserOrganizationReturn {
  const { user, isAuthenticated } = useAuth();
  const [organization, setOrganization] = useState<UserOrganization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/mongo/organizacion/obtenerOrganizacion?userId=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success && responseData.organizaciones && responseData.organizaciones.length > 0) {
          // Tomar la primera organización del usuario
          setOrganization(responseData.organizaciones[0]);
        } else {
          setOrganization(null);
          setError('No se encontró organización');
        }
      } else if (response.status === 404) {
        // El usuario no tiene organización
        setOrganization(null);
        setError('No tienes una organización asignada');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al obtener la organización');
      }
    } catch (error) {
      console.error('Error fetching user organization:', error);
      setError('Error de conexión al obtener la organización');    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchOrganization();
    } else {      setIsLoading(false);
      setOrganization(null);
    }
  }, [isAuthenticated, user?.id, fetchOrganization]);

  return {
    organization,
    isLoading,
    error,
    refetch: fetchOrganization,
  };
}
