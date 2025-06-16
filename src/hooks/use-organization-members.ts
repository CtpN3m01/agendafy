// src/hooks/use-organization-members.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { isValidObjectId } from '@/lib/validation';

export interface OrganizationMember {
  id: string;
  nombre: string;
  correo: string;
  esMiembro: boolean;
}

interface UseOrganizationMembersReturn {
  members: OrganizationMember[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const API_ENDPOINTS = {
  GET_MEMBERS: '/api/mongo/organizacion/obtenerMiembrosJunta',
} as const;

export function useOrganizationMembers(organizacionId?: string): UseOrganizationMembersReturn {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!organizacionId) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    if (!isValidObjectId(organizacionId)) {
      setError('ID de organización inválido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);      
      const response = await fetch(`${API_ENDPOINTS.GET_MEMBERS}?id=${organizacionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.miembros) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformedMembers: OrganizationMember[] = result.miembros.map((miembro: any) => ({
            id: miembro._id || miembro.id,
            nombre: miembro.nombre + " " + miembro.apellidos, // Asumiendo que el apellido está disponible
            correo: miembro.correo,
            esMiembro: true, // Todos los miembros de la junta son miembros de la organización
          }));
          setMembers(transformedMembers);
        } else {
          setError(result.message || 'Error al cargar los miembros');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al cargar los miembros');
      }
    } catch (error) {
      console.error('Error fetching organization members:', error);
      setError('Error de conexión al cargar los miembros');
    } finally {      setIsLoading(false);
    }
  }, [organizacionId]);

  useEffect(() => {
    if (organizacionId) {
      fetchMembers();    } else {
      setIsLoading(false);
    }
  }, [organizacionId, fetchMembers]);

  return {
    members,
    isLoading,
    error,
    refetch: fetchMembers,
  };
}

export default useOrganizationMembers;
