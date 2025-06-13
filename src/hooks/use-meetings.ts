// src/hooks/use-meetings.ts
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { isValidObjectId } from '@/lib/validation';

// Tipo simplificado basado en la API de reuniones
interface ReunionData {
  _id: string;
  titulo: string;
  organizacion: string;
  hora_inicio: string;
  hora_fin?: string;
  archivos?: string[];
  convocados?: string[];
  lugar?: string;
  tipo_reunion?: string;
  modalidad?: string;
  agenda?: string;
  puntos?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface CreateReunionData {
  titulo: string;
  organizacion: string;
  hora_inicio: string;
  hora_fin?: string;
  convocados?: string[];
  lugar?: string;
  tipo_reunion?: string;
  modalidad?: string;
  agenda?: string;
}

interface UseMeetingsReturn {
  meetings: ReunionData[];
  isLoading: boolean;
  error: string | null;
  createMeeting: (data: CreateReunionData) => Promise<ReunionData | null>;
  updateMeeting: (id: string, data: Partial<CreateReunionData>) => Promise<ReunionData | null>;
  deleteMeeting: (id: string) => Promise<boolean>;
  getMeeting: (id: string) => Promise<ReunionData | null>;
  refetch: () => Promise<void>;
}

export function useMeetings(organizacionId?: string): UseMeetingsReturn {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<ReunionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  const fetchMeetings = async () => {
    if (!organizacionId) {
      setMeetings([]);
      setIsLoading(false);
      return;
    }    // Validar formato de ObjectId antes de hacer la consulta
    if (!isValidObjectId(organizacionId)) {
      setError('ID de organización inválido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/mongo/reunion/obtenerReuniones?organizacion=${organizacionId}`);
      
      if (response.ok) {
        const reuniones = await response.json();
        setMeetings(reuniones);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al cargar las reuniones');
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setError('Error de conexión al cargar las reuniones');
    } finally {
      setIsLoading(false);
    }
  };  const createMeeting = async (data: CreateReunionData): Promise<ReunionData | null> => {
    try {
      setError(null);

      // No generar _id en el cliente - MongoDB lo generará automáticamente
      const reunionData = {
        ...data
      };

      const response = await fetch('/api/mongo/reunion/crearReunion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reunionData),
      });

      if (response.ok) {
        const result = await response.json();
        // Actualizar la lista local
        setMeetings(prev => [...prev, result]);
        return result;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear la reunión');
        return null;
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      setError('Error de conexión al crear la reunión');
      return null;
    }
  };
  const updateMeeting = async (id: string, data: Partial<CreateReunionData>): Promise<ReunionData | null> => {
    try {
      setError(null);

      const updateData = {
        _id: id,
        ...data
      };

      const response = await fetch('/api/mongo/reunion/editarReunion', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        // Actualizar la lista local
        setMeetings(prev => prev.map(meeting => 
          meeting._id === id ? result.reunion : meeting
        ));
        return result.reunion;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al actualizar la reunión');
        return null;
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
      setError('Error de conexión al actualizar la reunión');
      return null;
    }
  };

  const deleteMeeting = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`/api/mongo/reunion/eliminarReunion?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remover de la lista local
        setMeetings(prev => prev.filter(meeting => meeting._id !== id));
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al eliminar la reunión');
        return false;
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
      setError('Error de conexión al eliminar la reunión');
      return false;
    }
  };

  const getMeeting = async (id: string): Promise<ReunionData | null> => {
    try {
      setError(null);

      const response = await fetch(`/api/mongo/reunion/obtenerReunion?id=${id}`);

      if (response.ok) {
        const result = await response.json();
        return result;
      } else if (response.status === 404) {
        setError('Reunión no encontrada');
        return null;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al obtener la reunión');
        return null;
      }
    } catch (error) {
      console.error('Error getting meeting:', error);
      setError('Error de conexión al obtener la reunión');
      return null;
    }
  };

  useEffect(() => {
    if (organizacionId) {
      fetchMeetings();
    } else {
      setIsLoading(false);
    }
  }, [organizacionId]);

  return {
    meetings,
    isLoading,
    error,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    getMeeting,
    refetch: fetchMeetings,
  };
}
