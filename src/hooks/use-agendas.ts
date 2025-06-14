// src/hooks/use-agendas.ts
"use client";

/**
 * Hook personalizado para gestionar agendas y puntos
 * 
 * Características principales:
 * - Se alinea con los DTOs del backend (CrearAgendaDTO, ActualizarAgendaDTO, CrearPuntoDTO)
 * - Implementa funciones reutilizables para evitar duplicación de código
 * - Manejo centralizado de errores
 * - Peticiones HTTP optimizadas con una función helper
 * - Estado local actualizado automáticamente
 * - Validación de ObjectId antes de realizar consultas
 * 
 * @author Refactorizado para seguir buenas prácticas
 */

import { useState, useEffect, useCallback } from 'react';
import { isValidObjectId } from '@/lib/validation';
import { CrearAgendaDTO, ActualizarAgendaDTO } from '@/types/AgendaDTO';
import { CrearPuntoDTO, ActualizarPuntoDTO } from '@/types/PuntoDTO';
import mongoose from 'mongoose';

// Interfaz para los datos de respuesta de la API (equivalente a AgendaData)
interface AgendaResponse {
  _id: string;
  nombre: string;
  organizacion: string | mongoose.Types.ObjectId;
  puntos?: string[] | mongoose.Types.ObjectId[];
  reuniones?: string[] | mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipo para crear agenda (alineado con DTO)
type CreateAgendaData = Omit<CrearAgendaDTO, 'organizacion'> & {
  organizacion: string;
};

// Tipo para actualizar agenda
type UpdateAgendaData = Omit<ActualizarAgendaDTO, 'organizacion'> & {
  organizacion?: string;
};

// Interfaz para puntos (simplificada basada en DTO)
interface PuntoData extends Omit<CrearPuntoDTO, 'agenda'> {
  _id?: string;
  agenda?: string;
}

// Tipos de respuesta reutilizables
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

interface UseAgendasReturn {
  agendas: AgendaResponse[];
  isLoading: boolean;
  error: string | null;
  createAgenda: (data: CreateAgendaData) => Promise<AgendaResponse | null>;
  updateAgenda: (id: string, data: Partial<CreateAgendaData>) => Promise<AgendaResponse | null>;
  deleteAgenda: (id: string) => Promise<boolean>;
  getAgenda: (id: string, populated?: boolean) => Promise<AgendaResponse | null>;
  getAgendasByOrganization: (organizacionId: string) => Promise<AgendaResponse[]>;
  createAgendaWithPuntos: (agendaData: CreateAgendaData, puntos: Omit<PuntoData, 'agenda'>[]) => Promise<AgendaResponse | null>;
  getPuntosByAgenda: (agendaId: string) => Promise<PuntoData[]>;
  refetch: () => Promise<void>;
}

export function useAgendas(organizacionId?: string): UseAgendasReturn {
  const [agendas, setAgendas] = useState<AgendaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función reutilizable para manejar errores de API
  const handleApiError = useCallback((error: unknown, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    setError(errorMessage);
  }, []);

  // Función reutilizable para hacer peticiones HTTP
  const makeApiRequest = useCallback(async <T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T | null> => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error en la petición: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const fetchAgendas = useCallback(async () => {
    if (!organizacionId) {
      setAgendas([]);
      setIsLoading(false);
      return;
    }

    // Validar formato de ObjectId antes de hacer la consulta
    if (!isValidObjectId(organizacionId)) {
      setError('ID de organización inválido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await makeApiRequest<AgendaResponse[]>(
        `/api/mongo/agenda/obtenerAgenda?organizacion=${organizacionId}`
      );
      
      if (result) {
        setAgendas(result);
      }
    } catch (error) {
      handleApiError(error, 'Error al cargar las agendas');
    } finally {
      setIsLoading(false);
    }
  }, [organizacionId, makeApiRequest, handleApiError]);

  const createAgenda = async (data: CreateAgendaData): Promise<AgendaResponse | null> => {
    try {
      setError(null);

      const result = await makeApiRequest<AgendaResponse>('/api/mongo/agenda/crearAgenda', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (result) {
        // Actualizar la lista local
        setAgendas(prev => [...prev, result]);
        return result;
      }
      return null;
    } catch (error) {
      handleApiError(error, 'Error al crear la agenda');
      return null;
    }
  };

  const createPunto = async (puntoData: PuntoData): Promise<PuntoData | null> => {
    try {
      const result = await makeApiRequest<PuntoData>('/api/mongo/punto/crearPunto', {
        method: 'POST',
        body: JSON.stringify(puntoData),
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const createAgendaWithPuntos = async (
    agendaData: CreateAgendaData, 
    puntos: Omit<PuntoData, 'agenda'>[]
  ): Promise<AgendaResponse | null> => {
    try {
      setError(null);

      // Primero crear la agenda
      const nuevaAgenda = await createAgenda(agendaData);
      if (!nuevaAgenda) {
        throw new Error('Error al crear la agenda');
      }

      // Luego crear todos los puntos
      const puntosCreados: string[] = [];
      for (const puntoData of puntos) {
        const puntoCompleto = {
          ...puntoData,
          agenda: nuevaAgenda._id
        };
        
        const puntoCreadoResult = await createPunto(puntoCompleto);
        if (puntoCreadoResult?._id) {
          puntosCreados.push(puntoCreadoResult._id);
        }
      }      // Actualizar la agenda con los IDs de los puntos creados
      if (puntosCreados.length > 0) {
        const agendaActualizada = await updateAgenda(nuevaAgenda._id, {
          puntos: puntosCreados as any // Casting temporal para compatibilidad
        });
        return agendaActualizada || nuevaAgenda;
      }

      return nuevaAgenda;
    } catch (error) {
      handleApiError(error, 'Error al crear la agenda con puntos');
      return null;
    }
  };

  const updateAgenda = async (id: string, data: Partial<CreateAgendaData>): Promise<AgendaResponse | null> => {
    try {
      setError(null);

      const updateData = {
        _id: id,
        ...data
      };

      const result = await makeApiRequest<{ agenda: AgendaResponse }>('/api/mongo/agenda/editarAgenda', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (result?.agenda) {
        // Actualizar la lista local
        setAgendas(prev => prev.map(agenda => 
          agenda._id === id ? result.agenda : agenda
        ));
        return result.agenda;
      }
      return null;
    } catch (error) {
      handleApiError(error, 'Error al actualizar la agenda');
      return null;
    }
  };

  const deleteAgenda = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      await makeApiRequest(`/api/mongo/agenda/eliminarAgenda?id=${id}`, {
        method: 'DELETE',
      });

      // Remover de la lista local
      setAgendas(prev => prev.filter(agenda => agenda._id !== id));
      return true;
    } catch (error) {
      handleApiError(error, 'Error al eliminar la agenda');
      return false;
    }
  };

  const getAgenda = async (id: string, populated: boolean = false): Promise<AgendaResponse | null> => {
    try {
      setError(null);

      const url = populated 
        ? `/api/mongo/agenda/obtenerAgenda?id=${id}&poblado=true`
        : `/api/mongo/agenda/obtenerAgenda?id=${id}`;

      const result = await makeApiRequest<AgendaResponse>(url);
      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        setError('Agenda no encontrada');
      } else {
        handleApiError(error, 'Error al obtener la agenda');
      }
      return null;
    }
  };

  const getAgendasByOrganization = async (organizacionId: string): Promise<AgendaResponse[]> => {
    try {
      setError(null);

      const result = await makeApiRequest<AgendaResponse[]>(
        `/api/mongo/agenda/obtenerAgenda?organizacion=${organizacionId}`
      );
      
      return result || [];
    } catch (error) {
      handleApiError(error, 'Error al obtener las agendas');
      return [];
    }
  };

  const getPuntosByAgenda = async (agendaId: string): Promise<PuntoData[]> => {
    try {
      setError(null);

      const result = await makeApiRequest<PuntoData[]>(
        `/api/mongo/punto/obtenerPuntosPorAgenda?agendaId=${agendaId}`
      );
      
      return Array.isArray(result) ? result : [];
    } catch (error) {
      handleApiError(error, 'Error al obtener los puntos');
      return [];
    }
  };

  useEffect(() => {
    if (organizacionId) {
      fetchAgendas();
    } else {
      setIsLoading(false);
    }
  }, [organizacionId, fetchAgendas]);

  return {
    agendas,
    isLoading,
    error,
    createAgenda,
    updateAgenda,
    deleteAgenda,
    getAgenda,
    getAgendasByOrganization,
    createAgendaWithPuntos,
    getPuntosByAgenda,
    refetch: fetchAgendas,
  };
}

// Hook adicional para manejar puntos independientemente
export function usePuntos() {
  const [error, setError] = useState<string | null>(null);

  // Función reutilizable para manejar errores de API
  const handleApiError = useCallback((error: unknown, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    setError(errorMessage);
  }, []);

  // Función reutilizable para hacer peticiones HTTP
  const makeApiRequest = useCallback(async <T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T | null> => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error en la petición: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const createPunto = async (puntoData: PuntoData): Promise<PuntoData | null> => {
    try {
      setError(null);

      const result = await makeApiRequest<PuntoData>('/api/mongo/punto/crearPunto', {
        method: 'POST',
        body: JSON.stringify(puntoData),
      });

      return result;
    } catch (error) {
      handleApiError(error, 'Error al crear el punto');
      return null;
    }
  };

  const updatePunto = async (id: string, data: Partial<PuntoData>): Promise<PuntoData | null> => {
    try {
      setError(null);

      const updateData = { id, ...data };

      const result = await makeApiRequest<{ punto: PuntoData }>('/api/mongo/punto/editarPunto', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      return result?.punto || null;
    } catch (error) {
      handleApiError(error, 'Error al actualizar el punto');
      return null;
    }
  };

  const deletePunto = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      await makeApiRequest('/api/mongo/punto/eliminarPunto', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });

      return true;
    } catch (error) {
      handleApiError(error, 'Error al eliminar el punto');
      return false;
    }
  };

  const getPunto = async (id: string): Promise<PuntoData | null> => {
    try {
      setError(null);

      const result = await makeApiRequest<PuntoData>(`/api/mongo/punto/obtenerPunto?id=${id}`);
      return result;
    } catch (error) {
      handleApiError(error, 'Error al obtener el punto');
      return null;
    }
  };

  return {
    error,
    createPunto,
    updatePunto,
    deletePunto,
    getPunto,
  };
}
