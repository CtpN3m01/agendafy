import { useState, useEffect, useCallback } from 'react';
import { NotificacionResponseDTO, FiltrosNotificacionDTO } from '@/types/NotificacionDTO';

interface UseNotificacionesReturn {
  notificaciones: NotificacionResponseDTO[];
  conteoNoLeidas: number;
  isLoading: boolean;
  error: string | null;
  obtenerNotificaciones: (filtros?: FiltrosNotificacionDTO) => Promise<void>;
  marcarComoLeida: (id: string) => Promise<boolean>;
  marcarVariasComoLeidas: (ids: string[]) => Promise<number>;
  eliminarNotificacion: (id: string) => Promise<boolean>;
  actualizarConteoNoLeidas: () => Promise<void>;
  refrescarNotificaciones: () => Promise<void>;
}

export function useNotificaciones(destinatario?: string): UseNotificacionesReturn {
  const [notificaciones, setNotificaciones] = useState<NotificacionResponseDTO[]>([]);
  const [conteoNoLeidas, setConteoNoLeidas] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: unknown, mensaje: string) => {
    console.error(mensaje, error);
    setError(error instanceof Error ? error.message : mensaje);
  }, []);

  const obtenerNotificaciones = useCallback(async (filtros?: FiltrosNotificacionDTO) => {
    if (!destinatario) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.set('destinatario', destinatario);
      
      if (filtros?.limite) params.set('limite', filtros.limite.toString());
      if (filtros?.leida !== undefined) params.set('leida', filtros.leida.toString());
      if (filtros?.tipo) params.set('tipo', filtros.tipo);
      if (filtros?.fechaDesde) params.set('fechaDesde', filtros.fechaDesde.toISOString());
      if (filtros?.fechaHasta) params.set('fechaHasta', filtros.fechaHasta.toISOString());

      const response = await fetch(`/api/mongo/notificacion/destinatario?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setNotificaciones(data.data || []);
      } else {
        throw new Error(data.message || 'Error al obtener notificaciones');
      }
    } catch (error) {
      handleError(error, 'Error al cargar notificaciones');
      setNotificaciones([]);
    } finally {
      setIsLoading(false);
    }
  }, [destinatario, handleError]);

  const actualizarConteoNoLeidas = useCallback(async () => {
    if (!destinatario) return;
    
    try {
      const response = await fetch(`/api/mongo/notificacion/conteo-no-leidas?destinatario=${destinatario}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setConteoNoLeidas(data.data.conteoNoLeidas || 0);
      }
    } catch (error) {
      handleError(error, 'Error al actualizar conteo de no leídas');
    }
  }, [destinatario, handleError]);

  const marcarComoLeida = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/mongo/notificacion/marcar-leida', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Actualizar el estado local
        setNotificaciones(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, leida: true } : notif
          )
        );
        
        // Actualizar conteo
        await actualizarConteoNoLeidas();
        return true;
      } else {
        throw new Error(data.message || 'Error al marcar como leída');
      }
    } catch (error) {
      handleError(error, 'Error al marcar notificación como leída');
      return false;
    }
  }, [actualizarConteoNoLeidas, handleError]);

  const marcarVariasComoLeidas = useCallback(async (ids: string[]): Promise<number> => {
    try {
      const response = await fetch('/api/mongo/notificacion/marcar-leida', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const cantidadMarcadas = data.data?.cantidadMarcadas || 0;
        
        // Actualizar el estado local
        setNotificaciones(prev => 
          prev.map(notif => 
            ids.includes(notif.id) ? { ...notif, leida: true } : notif
          )
        );
        
        // Actualizar conteo
        await actualizarConteoNoLeidas();
        return cantidadMarcadas;
      } else {
        throw new Error(data.message || 'Error al marcar notificaciones como leídas');
      }
    } catch (error) {
      handleError(error, 'Error al marcar notificaciones como leídas');
      return 0;
    }
  }, [actualizarConteoNoLeidas, handleError]);

  const eliminarNotificacion = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/mongo/notificacion/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Actualizar el estado local
        setNotificaciones(prev => prev.filter(notif => notif.id !== id));
        
        // Actualizar conteo
        await actualizarConteoNoLeidas();
        return true;
      } else {
        throw new Error(data.message || 'Error al eliminar notificación');
      }
    } catch (error) {
      handleError(error, 'Error al eliminar notificación');
      return false;
    }
  }, [actualizarConteoNoLeidas, handleError]);

  const refrescarNotificaciones = useCallback(async () => {
    await Promise.all([
      obtenerNotificaciones(),
      actualizarConteoNoLeidas()
    ]);
  }, [obtenerNotificaciones, actualizarConteoNoLeidas]);

  // Cargar datos iniciales
  useEffect(() => {
    if (destinatario) {
      refrescarNotificaciones();
    }
  }, [destinatario, refrescarNotificaciones]);

  return {
    notificaciones,
    conteoNoLeidas,
    isLoading,
    error,
    obtenerNotificaciones,
    marcarComoLeida,
    marcarVariasComoLeidas,
    eliminarNotificacion,
    actualizarConteoNoLeidas,
    refrescarNotificaciones,
  };
}
