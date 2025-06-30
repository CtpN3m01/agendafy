// src/hooks/use-board-members.ts
"use client";

import { useState, useEffect, useCallback } from 'react';

interface BoardMember {
  _id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: string;
  contrasena?: string; // Opcional para incluir contraseña
}

interface UseBoardMembersReturn {
  members: BoardMember[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addMember: (member: Omit<BoardMember, '_id'>) => Promise<boolean>;
  updateMember: (id: string, member: Partial<Omit<BoardMember, '_id'>>) => Promise<boolean>;
  deleteMember: (id: string) => Promise<boolean>;
}

export function useBoardMembers(organizationId: string | null): UseBoardMembersReturn {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/mongo/organizacion/obtenerMiembrosJunta?id=${organizationId}&_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
      const data = await response.json();
      console.log('Full API response:', data);
      if (data.success) {
        console.log('Board members received:', data.miembros);
        console.log('Number of members:', data.miembros?.length || 0);
        
        // Los miembros ya vienen con _id desde el servicio
        setMembers(data.miembros || []);
      } else {
        setError(data.message || 'Error al cargar los miembros');
      }
    } catch (error) {      console.error('Error fetching board members:', error);
      setError('Error de conexión al cargar los miembros');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  const addMember = async (member: Omit<BoardMember, '_id'>): Promise<boolean> => {
    if (!organizationId) return false;

    try {
      // Usar la API principal que ahora genera contraseñas automáticamente
      const response = await fetch(`/api/mongo/organizacion/agregarMiembrosJunta?id=${organizationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(member),
      });

      const data = await response.json();

      if (data.success) {
        await fetchMembers(); // Refetch to get updated list
        return true;
      } else {
        setError(data.message || 'Error al agregar miembro a la organización');
        return false;
      }
    } catch (error) {
      console.error('Error adding member:', error);
      setError('Error de conexión al agregar miembro');
      return false;
    }
  };
  const updateMember = async (id: string, member: Partial<Omit<BoardMember, '_id'>>): Promise<boolean> => {
    if (!organizationId || !id) {
      console.error('Missing organizationId or member id');
      return false;
    }

    try {
      const response = await fetch(`/api/mongo/organizacion/actualizarMiembrosJunta?id=${organizationId}&miembroId=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(member),
      });

      const data = await response.json();

      if (data.success) {
        await fetchMembers(); // Refetch to get updated list
        return true;
      } else {
        setError(data.message || 'Error al actualizar miembro');
        return false;
      }
    } catch (error) {
      console.error('Error updating member:', error);
      setError('Error de conexión al actualizar miembro');
      return false;
    }
  };

  const deleteMember = async (id: string): Promise<boolean> => {
    if (!organizationId) return false;

    try {
      const response = await fetch(`/api/mongo/organizacion/eliminarMiembrosJunta?id=${organizationId}&miembroId=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        await fetchMembers(); // Refetch to get updated list
        return true;
      } else {
        setError(data.message || 'Error al eliminar miembro');
        return false;
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      setError('Error de conexión al eliminar miembro');
      return false;
    }
  };
  useEffect(() => {
    if (organizationId) {
      fetchMembers();
    } else {
      setIsLoading(false);
    }
  }, [organizationId, fetchMembers]);

  return {
    members,
    isLoading,
    error,
    refetch: fetchMembers,
    addMember,
    updateMember,
    deleteMember,
  };
}
