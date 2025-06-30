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

      // Selecciona el endpoint según el tipo de usuario
      let endpoint = '';
      if (user.type === 'miembro' && user.organizacion) {
        endpoint = `/api/mongo/organizacion/obtenerOrganizacion?id=${user.organizacion}`;
      } else {
        endpoint = `/api/mongo/organizacion/obtenerOrganizacion?userId=${user.id}`;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const responseData = await response.json();

        // Soporta ambas respuestas: singular y array
        if (responseData.success && responseData.organizacion) {
          setOrganization(responseData.organizacion);
        } else if (
          responseData.success &&
          responseData.organizaciones &&
          responseData.organizaciones.length > 0
        ) {
          setOrganization(responseData.organizaciones[0]);
        } else {
          setOrganization(null);
          setError('No se encontró organización');
        }
      } else if (response.status === 404) {
        setOrganization(null);
        setError('No tienes una organización asignada');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al obtener la organización');
      }
    } catch (error) {
      console.error('Error fetching user organization:', error);
      setError('Error de conexión al obtener la organización');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, user?.type, user?.organizacion]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchOrganization();
    } else {      setIsLoading(false);
      setOrganization(null);
    }
  }, [isAuthenticated, user?.id, user?.organizacion, fetchOrganization]);

  return {
    organization,
    isLoading,
    error,
    refetch: fetchOrganization,
  };
}
