"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

interface OrganizationData {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UseOrganizationReturn {
  organization: OrganizationData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOrganization(): UseOrganizationReturn {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      setOrganization(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let url: URL;
      // Si es persona y tiene organización, buscar por id de organización
      if (user.type === 'miembro' && user.organizacion) {
        url = new URL('/api/mongo/organizacion/obtenerOrganizacion', window.location.origin);
        url.searchParams.append('id', user.organizacion);
      } else {
        url = new URL('/api/mongo/organizacion/obtenerOrganizacion', window.location.origin);
        url.searchParams.append('userId', user.id);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Soporta respuesta singular y array
        if (data.organizacion) {
          setOrganization(data.organizacion);
        } else if (data.organizaciones && data.organizaciones.length > 0) {
          setOrganization(data.organizaciones[0]);
        } else {
          setOrganization(null);
        }
      } else {
        if (response.status === 404 || data.message?.includes('no encontrada')) {
          setOrganization(null);
        } else {
          setError(data.message || 'Error al cargar la organización');
        }
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      setError('Error de conexión al cargar la organización');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.type, user?.organizacion]);

  useEffect(() => {
    if (user?.id) {
      fetchOrganization();
    } else {
      setIsLoading(false);
      setOrganization(null);
    }
  }, [user, fetchOrganization]);

  return {
    organization,
    isLoading,
    error,
    refetch: fetchOrganization,
  };
}