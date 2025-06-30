// src/hooks/use-sse-notifications.ts
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useNotificaciones } from './use-notificaciones';
import { NotificacionResponseDTO } from '@/types';

interface SSENotificationHook {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  marcarComoLeida: (notificationId: string) => Promise<void>;
  eliminarNotificacion: (notificationId: string) => Promise<void>;
}

export function useSSENotifications(): SSENotificationHook {
  const { user, token } = useAuth();
  const { refrescarNotificaciones } = useNotificaciones();
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Función para conectar SSE
  const connect = useCallback(() => {
    if (!user || !token || user.type !== 'persona') {
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      setConnectionStatus('connecting');
      
      // Configurar la URL del SSE con el token como query parameter
      const eventSource = new EventSource(`/api/notifications/stream?token=${encodeURIComponent(token)}`);

      eventSource.onopen = () => {
        console.log('SSE conectado para notificaciones');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'CONNECTION_ESTABLISHED':
              console.log('Conexión SSE establecida:', data.message);
              break;
              
            case 'NEW_NOTIFICATION':
              console.log('Nueva notificación recibida:', data.notification);
              // Refrescar la lista de notificaciones
              refrescarNotificaciones();
              break;
              
            case 'NOTIFICATION_READ':
              console.log('Notificación marcada como leída:', data.notificationId);
              // Refrescar la lista de notificaciones
              refrescarNotificaciones();
              break;
              
            case 'NOTIFICATION_DELETED':
              console.log('Notificación eliminada:', data.notificationId);
              // Refrescar la lista de notificaciones
              refrescarNotificaciones();
              break;
              
            case 'PING':
              // Solo para mantener la conexión viva
              break;
              
            default:
              console.log('Mensaje SSE no reconocido:', data);
          }
        } catch (err) {
          console.error('Error al procesar mensaje SSE:', err);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Error en SSE:', error);
        setIsConnected(false);
        setConnectionStatus('error');
        
        // Intentar reconectar
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;
          
          console.log(`Reintentando conexión SSE en ${delay}ms (intento ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.log('Máximo número de reintentos alcanzado para SSE');
          setConnectionStatus('error');
        }
      };

      eventSourceRef.current = eventSource;
      
    } catch (error) {
      console.error('Error al crear conexión SSE:', error);
      setConnectionStatus('error');
    }
  }, [user, token, refrescarNotificaciones]);

  // Función para desconectar
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);

  // Función para marcar notificación como leída
  const marcarComoLeida = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/mongo/notificacion/marcarComoLeida', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId })
      });

      if (!response.ok) {
        throw new Error('Error al marcar notificación como leída');
      }

      // La actualización se recibirá via SSE
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      throw error;
    }
  }, [token]);

  // Función para eliminar notificación
  const eliminarNotificacion = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/mongo/notificacion/eliminarNotificacion', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId })
      });

      if (!response.ok) {
        throw new Error('Error al eliminar notificación');
      }

      // La actualización se recibirá via SSE
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      throw error;
    }
  }, [token]);

  // Efecto para manejar la conexión
  useEffect(() => {
    if (user && user.type === 'persona' && token) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup al desmontar
    return () => {
      disconnect();
    };
  }, [user, token, connect, disconnect]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionStatus,
    marcarComoLeida,
    eliminarNotificacion
  };
}
