// src/hooks/use-organization.ts
"use client";

import { useState, useEffect } from 'react';
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
  const { user, token } = useAuth();
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/mongo/organizacion/obtenerOrganizacion', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Si hay organizaciones, tomar la primera (un usuario debería tener solo una)
        if (data.organizaciones && data.organizaciones.length > 0) {
          setOrganization(data.organizaciones[0]);
        } else {
          setOrganization(null);
        }
      } else {
        // Si el error es que no se encontró organización, no es un error
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
  };

  useEffect(() => {
    if (user && token) {
      fetchOrganization();
    } else {
      setIsLoading(false);
    }
  }, [user, token]);

  return {
    organization,
    isLoading,
    error,
    refetch: fetchOrganization,
  };
}
