import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

interface UseNotificacionCountReturn {
  conteoNoLeidas: number;
  isLoading: boolean;
  error: string | null;
  actualizarConteo: () => Promise<void>;
}

export function useNotificacionCount(): UseNotificacionCountReturn {
  const { user } = useAuth();
  const [conteoNoLeidas, setConteoNoLeidas] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const actualizarConteo = useCallback(async () => {
    if (!user?.correo) {
      setConteoNoLeidas(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ destinatario: user.correo });
      const response = await fetch(`/api/mongo/notificacion/conteo-no-leidas?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setConteoNoLeidas(data.conteo || 0);
      } else {
        throw new Error(data.message || 'Error al obtener conteo');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error al obtener conteo de notificaciones:', errorMessage);
      setError(errorMessage);
      setConteoNoLeidas(0);
    } finally {
      setIsLoading(false);
    }
  }, [user?.correo]);

  // Actualizar conteo cuando cambie el usuario
  useEffect(() => {
    actualizarConteo();
  }, [actualizarConteo]);

  // Actualizar conteo cada 30 segundos
  useEffect(() => {
    if (!user?.correo) return;
    
    const interval = setInterval(actualizarConteo, 30000);
    return () => clearInterval(interval);
  }, [user?.correo, actualizarConteo]);

  return {
    conteoNoLeidas,
    isLoading,
    error,
    actualizarConteo
  };
}
