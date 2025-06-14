// src/hooks/use-agendas.ts
"use client";

import { useState, useEffect } from 'react';
import { isValidObjectId } from '@/lib/validation';

// Tipo basado en la API de agendas
interface AgendaData {
  _id: string;
  nombre: string;
  organizacion: string;
  puntos?: string[];
  reuniones?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface CreateAgendaData {
  nombre: string;
  organizacion: string;
  puntos?: string[];
  reuniones?: string[];
}

interface PuntoData {
  _id?: string;
  titulo: string;
  tipo: "Informativo" | "Aprobacion" | "Fondo";
  duracion: number;
  detalles: string;
  anotaciones?: string;
  expositor: string;
  archivos?: string[];
  votosAFavor?: number;
  votosEnContra?: number;
  decisiones?: string[];
  agenda?: string;
}

interface UseAgendasReturn {
  agendas: AgendaData[];
  isLoading: boolean;
  error: string | null;
  createAgenda: (data: CreateAgendaData) => Promise<AgendaData | null>;
  updateAgenda: (id: string, data: Partial<CreateAgendaData>) => Promise<AgendaData | null>;
  deleteAgenda: (id: string) => Promise<boolean>;
  getAgenda: (id: string, populated?: boolean) => Promise<AgendaData | null>;
  getAgendasByOrganization: (organizacionId: string) => Promise<AgendaData[]>;
  createAgendaWithPuntos: (agendaData: CreateAgendaData, puntos: Omit<PuntoData, 'agenda'>[]) => Promise<AgendaData | null>;
  getPuntosByAgenda: (agendaId: string) => Promise<PuntoData[]>;
  refetch: () => Promise<void>;
}

export function useAgendas(organizacionId?: string): UseAgendasReturn {
  const [agendas, setAgendas] = useState<AgendaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgendas = async () => {
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

      const response = await fetch(`/api/mongo/agenda/obtenerAgenda?organizacion=${organizacionId}`);
      
      if (response.ok) {
        const agendas = await response.json();
        setAgendas(agendas);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al cargar las agendas');
      }
    } catch (error) {
      console.error('Error fetching agendas:', error);
      setError('Error de conexión al cargar las agendas');
    } finally {
      setIsLoading(false);
    }
  };

  const createAgenda = async (data: CreateAgendaData): Promise<AgendaData | null> => {
    try {
      setError(null);

      const response = await fetch('/api/mongo/agenda/crearAgenda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        // Actualizar la lista local
        setAgendas(prev => [...prev, result]);
        return result;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear la agenda');
        return null;
      }
    } catch (error) {
      console.error('Error creating agenda:', error);
      setError('Error de conexión al crear la agenda');
      return null;
    }
  };

  const createPunto = async (puntoData: PuntoData): Promise<PuntoData | null> => {
    try {
      const response = await fetch('/api/mongo/punto/crearPunto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(puntoData),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el punto');
      }
    } catch (error) {
      console.error('Error creating punto:', error);
      throw error;
    }
  };

  const createAgendaWithPuntos = async (
    agendaData: CreateAgendaData, 
    puntos: Omit<PuntoData, 'agenda'>[]
  ): Promise<AgendaData | null> => {
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
        if (puntoCreadoResult) {
          puntosCreados.push(puntoCreadoResult._id!);
        }
      }

      // Actualizar la agenda con los IDs de los puntos creados
      if (puntosCreados.length > 0) {
        const agendaActualizada = await updateAgenda(nuevaAgenda._id, {
          puntos: puntosCreados
        });
        return agendaActualizada || nuevaAgenda;
      }

      return nuevaAgenda;
    } catch (error) {
      console.error('Error creating agenda with puntos:', error);
      setError('Error al crear la agenda con puntos');
      return null;
    }
  };

  const updateAgenda = async (id: string, data: Partial<CreateAgendaData>): Promise<AgendaData | null> => {
    try {
      setError(null);

      const updateData = {
        _id: id,
        ...data
      };

      const response = await fetch('/api/mongo/agenda/editarAgenda', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        // Actualizar la lista local
        setAgendas(prev => prev.map(agenda => 
          agenda._id === id ? result.agenda : agenda
        ));
        return result.agenda;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al actualizar la agenda');
        return null;
      }
    } catch (error) {
      console.error('Error updating agenda:', error);
      setError('Error de conexión al actualizar la agenda');
      return null;
    }
  };

  const deleteAgenda = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`/api/mongo/agenda/eliminarAgenda?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remover de la lista local
        setAgendas(prev => prev.filter(agenda => agenda._id !== id));
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al eliminar la agenda');
        return false;
      }
    } catch (error) {
      console.error('Error deleting agenda:', error);
      setError('Error de conexión al eliminar la agenda');
      return false;
    }
  };

  const getAgenda = async (id: string, populated: boolean = false): Promise<AgendaData | null> => {
    try {
      setError(null);

      const url = populated 
        ? `/api/mongo/agenda/obtenerAgenda?id=${id}&poblado=true`
        : `/api/mongo/agenda/obtenerAgenda?id=${id}`;

      const response = await fetch(url);

      if (response.ok) {
        const result = await response.json();
        return result;
      } else if (response.status === 404) {
        setError('Agenda no encontrada');
        return null;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al obtener la agenda');
        return null;
      }
    } catch (error) {
      console.error('Error getting agenda:', error);
      setError('Error de conexión al obtener la agenda');
      return null;
    }
  };

  const getAgendasByOrganization = async (organizacionId: string): Promise<AgendaData[]> => {
    try {
      setError(null);

      const response = await fetch(`/api/mongo/agenda/obtenerAgenda?organizacion=${organizacionId}`);

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al obtener las agendas');
        return [];
      }
    } catch (error) {
      console.error('Error getting agendas by organization:', error);
      setError('Error de conexión al obtener las agendas');
      return [];
    }
  };  const getPuntosByAgenda = async (agendaId: string): Promise<PuntoData[]> => {
    try {
      setError(null);

      const response = await fetch(`/api/mongo/punto/obtenerPuntosPorAgenda?agendaId=${agendaId}`);

      if (response.ok) {
        const result = await response.json();
        return Array.isArray(result) ? result : [];
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al obtener los puntos');
        return [];
      }
    } catch (error) {
      console.error('Error getting puntos by agenda:', error);
      setError('Error de conexión al obtener los puntos');
      return [];
    }
  };

  useEffect(() => {
    if (organizacionId) {
      fetchAgendas();
    } else {
      setIsLoading(false);
    }
  }, [organizacionId]);

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

  const createPunto = async (puntoData: PuntoData): Promise<PuntoData | null> => {
    try {
      setError(null);

      const response = await fetch('/api/mongo/punto/crearPunto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(puntoData),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear el punto');
        return null;
      }
    } catch (error) {
      console.error('Error creating punto:', error);
      setError('Error de conexión al crear el punto');
      return null;
    }
  };

  const updatePunto = async (id: string, data: Partial<PuntoData>): Promise<PuntoData | null> => {
    try {
      setError(null);

      const updateData = { id, ...data };

      const response = await fetch('/api/mongo/punto/editarPunto', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        return result.punto;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al actualizar el punto');
        return null;
      }
    } catch (error) {
      console.error('Error updating punto:', error);
      setError('Error de conexión al actualizar el punto');
      return null;
    }
  };

  const deletePunto = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch('/api/mongo/punto/eliminarPunto', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al eliminar el punto');
        return false;
      }
    } catch (error) {
      console.error('Error deleting punto:', error);
      setError('Error de conexión al eliminar el punto');
      return false;
    }
  };

  const getPunto = async (id: string): Promise<PuntoData | null> => {
    try {
      setError(null);

      const response = await fetch(`/api/mongo/punto/obtenerPunto?id=${id}`);

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al obtener el punto');
        return null;
      }
    } catch (error) {
      console.error('Error getting punto:', error);
      setError('Error de conexión al obtener el punto');
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
