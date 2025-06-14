// src/hooks/use-meetings.ts
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { isValidObjectId } from '@/lib/validation';
import { ConvocadoDTO } from '@/types/ReunionDTO';
import { subirArchivos } from '@/services/ArchivoService';

// Interfaces que coinciden exactamente con el backend
export interface ReunionData {
  _id: string;
  titulo: string;
  organizacion: string;
  hora_inicio: string;
  hora_fin?: string;
  archivos: string[];
  convocados: ConvocadoDTO[];
  lugar: string;
  tipo_reunion: 'Extraordinaria' | 'Ordinaria';
  modalidad: 'Presencial' | 'Virtual';
  agenda: string;
  puntos?: string[];
  __v?: number;
}

export interface CreateReunionData {
  titulo: string;
  organizacion: string;
  hora_inicio: string;
  hora_fin?: string;
  archivos?: string[];
  convocados?: ConvocadoDTO[];
  lugar: string;
  tipo_reunion: 'Extraordinaria' | 'Ordinaria';
  modalidad: 'Presencial' | 'Virtual';
  agenda: string;
  puntos?: string[];
  // Agregar archivos como Files para el manejo en memoria
  archivosFiles?: File[];
}

interface UseMeetingsReturn {
  meetings: ReunionData[];
  isLoading: boolean;
  error: string | null;
  createMeeting: (data: CreateReunionData) => Promise<ReunionData | null>;
  updateMeeting: (id: string, data: Partial<CreateReunionData>) => Promise<ReunionData | null>;
  deleteMeeting: (id: string) => Promise<boolean>;
  getMeeting: (id: string) => Promise<ReunionData | null>;
  sendEmail: (emailData: EmailData) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export interface EmailData {
  to: string[];
  subject: string;
  detalles: {
    titulo: string;
    hora_inicio: string;
    hora_fin?: string;
    lugar: string;
    tipo_reunion: string;
    modalidad: string;
    archivos: string[];
    agenda: string;
    puntos: string[];
    convocados: ConvocadoDTO[];
  };
}

// Constantes para mejorar mantenibilidad
const API_ENDPOINTS = {
  CREATE: '/api/mongo/reunion/crearReunion',
  UPDATE: '/api/mongo/reunion/editarReunion',
  DELETE: '/api/mongo/reunion/eliminarReunion',
  GET_ONE: '/api/mongo/reunion/obtenerReunion',
  GET_BY_ORG: '/api/mongo/reunion/obtenerReuniones',
  SEND_EMAIL: '/api/mongo/reunion/enviarCorreo',
} as const;

const ERROR_MESSAGES = {
  INVALID_ORG_ID: 'ID de organización inválido',
  CONNECTION_ERROR: 'Error de conexión',
  NOT_FOUND: 'Reunión no encontrada',
  LOAD_ERROR: 'Error al cargar las reuniones',
  CREATE_ERROR: 'Error al crear la reunión',
  UPDATE_ERROR: 'Error al actualizar la reunión',
  DELETE_ERROR: 'Error al eliminar la reunión',
  EMAIL_ERROR: 'Error al enviar el correo',
} as const;

export function useMeetings(organizacionId?: string): UseMeetingsReturn {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<ReunionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función utilitaria para manejo de errores
  const handleApiError = (error: any, defaultMessage: string): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return defaultMessage;  };

  const fetchMeetings = async () => {
    if (!organizacionId) {
      setMeetings([]);
      setIsLoading(false);
      return;
    }

    // Validar formato de ObjectId antes de hacer la consulta
    if (!isValidObjectId(organizacionId)) {
      setError(ERROR_MESSAGES.INVALID_ORG_ID);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_ENDPOINTS.GET_BY_ORG}?organizacion=${organizacionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const reuniones: ReunionData[] = await response.json();
        setMeetings(reuniones);
      } else {
        const errorData = await response.json();
        setError(errorData.message || ERROR_MESSAGES.LOAD_ERROR);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setError(handleApiError(error, `${ERROR_MESSAGES.CONNECTION_ERROR} al cargar las reuniones`));
    } finally {
      setIsLoading(false);
    }
  };
  const createMeeting = async (data: CreateReunionData): Promise<ReunionData | null> => {
    try {
      console.log("🏗️ HOOK createMeeting - Inicio");
      console.log("Datos recibidos:", data);
      
      setError(null);

      // Extraer archivos y datos de la reunión
      const { archivosFiles, ...reunionData } = data;
      let archivosFilenames: string[] = [];

      // Si hay archivos para subir, subirlos primero usando el ID de organización
      if (archivosFiles && archivosFiles.length > 0) {
        console.log("📎 Subiendo archivos a Supabase con ID organización:", reunionData.organizacion);
        
        try {
          archivosFilenames = await subirArchivos(archivosFiles, reunionData.organizacion);
          console.log("✅ Archivos subidos exitosamente:", archivosFilenames);
        } catch (fileError) {
          console.error("❌ Error al subir archivos:", fileError);
          setError("Error al subir los archivos adjuntos");
          return null;
        }
      }

      // Crear la reunión con los nombres de archivos
      const reunionDataWithFiles = {
        ...reunionData,
        archivos: archivosFilenames
      };

      console.log("📡 Creando reunión con datos:", reunionDataWithFiles);
      
      const response = await fetch(API_ENDPOINTS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reunionDataWithFiles),
      });

      if (response.ok) {
        const result: ReunionData = await response.json();
        console.log("✅ Reunión creada exitosamente:", result);
        
        // Actualizar la lista local
        setMeetings(prev => [...prev, result]);
        return result;
      } else {
        const errorData = await response.json();
        console.log("❌ Error del servidor:", errorData);
        setError(errorData.message || ERROR_MESSAGES.CREATE_ERROR);
        return null;
      }
    } catch (error) {
      console.error('❌ Error en createMeeting hook:', error);
      setError(handleApiError(error, `${ERROR_MESSAGES.CONNECTION_ERROR} al crear la reunión`));
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

      const response = await fetch(API_ENDPOINTS.UPDATE, {
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
        setError(errorData.message || ERROR_MESSAGES.UPDATE_ERROR);
        return null;
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
      setError(handleApiError(error, `${ERROR_MESSAGES.CONNECTION_ERROR} al actualizar la reunión`));
      return null;
    }
  };
  const deleteMeeting = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`${API_ENDPOINTS.DELETE}?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remover de la lista local
        setMeetings(prev => prev.filter(meeting => meeting._id !== id));
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || ERROR_MESSAGES.DELETE_ERROR);
        return false;
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
      setError(handleApiError(error, `${ERROR_MESSAGES.CONNECTION_ERROR} al eliminar la reunión`));
      return false;
    }
  };
  const getMeeting = async (id: string): Promise<ReunionData | null> => {
    try {
      setError(null);

      const response = await fetch(`${API_ENDPOINTS.GET_ONE}?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result: ReunionData = await response.json();
        return result;
      } else if (response.status === 404) {
        setError(ERROR_MESSAGES.NOT_FOUND);
        return null;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al obtener la reunión');
        return null;
      }
    } catch (error) {
      console.error('Error getting meeting:', error);
      setError(handleApiError(error, `${ERROR_MESSAGES.CONNECTION_ERROR} al obtener la reunión`));
      return null;
    }
  };
  const sendEmail = async (emailData: EmailData): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(API_ENDPOINTS.SEND_EMAIL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || ERROR_MESSAGES.EMAIL_ERROR);
        return false;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setError(handleApiError(error, `${ERROR_MESSAGES.CONNECTION_ERROR} al enviar el correo`));
      return false;
    }
  };

  useEffect(() => {
    if (organizacionId) {
      fetchMeetings();
    } else {
      setIsLoading(false);
    }
  }, [organizacionId]);  const hookReturn = {
    meetings,
    isLoading,
    error,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    getMeeting,
    sendEmail,
    refetch: fetchMeetings,
  };
  
  
  return hookReturn;
}
