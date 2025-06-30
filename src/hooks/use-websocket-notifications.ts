// src/hooks/use-websocket-notifications.ts
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { NotificacionResponseDTO } from '@/types/NotificacionDTO';

interface WebSocketNotificationHook {
  notificaciones: NotificacionResponseDTO[];
  conteoNoLeidas: number;
  isConnected: boolean;
  error: string | null;
  marcarComoLeida: (id: string) => Promise<boolean>;
  eliminarNotificacion: (id: string) => Promise<boolean>;
}

export function useWebSocketNotifications(): WebSocketNotificationHook {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState<NotificacionResponseDTO[]>([]);
  const [conteoNoLeidas, setConteoNoLeidas] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Fallback: cargar notificaciones via API tradicional
  const loadNotificationsViaAPI = useCallback(async () => {
    if (!user?.correo || user.type !== 'miembro') return;

    try {
      const [notificacionesRes, conteoRes] = await Promise.all([
        fetch(`/api/mongo/notificacion/destinatario?destinatario=${encodeURIComponent(user.correo)}`),
        fetch(`/api/mongo/notificacion/conteo-no-leidas?destinatario=${encodeURIComponent(user.correo)}`)
      ]);

      if (notificacionesRes.ok && conteoRes.ok) {
        const notificacionesData = await notificacionesRes.json();
        const conteoData = await conteoRes.json();
        
        setNotificaciones(notificacionesData.notificaciones || []);
        setConteoNoLeidas(conteoData.conteo || 0);
      }
    } catch (err) {
      console.error('Error al cargar notificaciones via API:', err);
    }
  }, [user?.correo, user?.type]);

  // Función para conectar WebSocket
  const connect = useCallback(() => {
    if (!user?.correo || user.type !== 'miembro') {
      return; // Solo miembros de junta reciben notificaciones en tiempo real
    }

    try {
      const wsUrl = `ws://localhost:3001/notifications?email=${encodeURIComponent(user.correo)}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket conectado para notificaciones');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'INITIAL_NOTIFICATIONS':
              setNotificaciones(data.notifications || []);
              setConteoNoLeidas(data.unreadCount || 0);
              break;
              
            case 'NEW_NOTIFICATION':
              setNotificaciones(prev => [data.notification, ...prev]);
              setConteoNoLeidas(prev => prev + 1);
              break;
              
            case 'NOTIFICATION_READ':
              setNotificaciones(prev => 
                prev.map(notif => 
                  notif.id === data.notificationId 
                    ? { ...notif, leida: true }
                    : notif
                )
              );
              setConteoNoLeidas(prev => Math.max(0, prev - 1));
              break;
              
            case 'NOTIFICATION_DELETED':
              setNotificaciones(prev => {
                const deletedNotification = prev.find(n => n.id === data.notificationId);
                if (deletedNotification && !deletedNotification.leida) {
                  setConteoNoLeidas(count => Math.max(0, count - 1));
                }
                return prev.filter(notif => notif.id !== data.notificationId);
              });
              break;
              
            case 'ERROR':
              setError(data.message);
              break;
              
            default:
              console.log('Mensaje WebSocket no reconocido:', data);
          }
        } catch (err) {
          console.error('Error al procesar mensaje WebSocket:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket cerrado:', event.code, event.reason);
        setIsConnected(false);
        
        // Reconectar automáticamente si no fue intencional
        if (event.code !== 1000 && reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        setError('Error de conexión en tiempo real');
      };

      wsRef.current = ws;
      
    } catch (err) {
      console.error('Error al crear WebSocket:', err);
      setError('No se pudo conectar a notificaciones en tiempo real');
      
      // Fallback a polling si WebSocket falla
      loadNotificationsViaAPI();
    }
  }, [user?.correo, user?.type, loadNotificationsViaAPI]);

  // Función para marcar como leída
  const marcarComoLeida = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/mongo/notificacion/marcar-leida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        // El WebSocket debería recibir la actualización automáticamente
        // Si no hay WebSocket, actualizar localmente
        if (!isConnected) {
          setNotificaciones(prev => 
            prev.map(notif => 
              notif.id === id ? { ...notif, leida: true } : notif
            )
          );
          setConteoNoLeidas(prev => Math.max(0, prev - 1));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err);
      return false;
    }
  }, [isConnected]);

  // Función para eliminar notificación
  const eliminarNotificacion = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/mongo/notificacion/eliminar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        // El WebSocket debería recibir la actualización automáticamente
        // Si no hay WebSocket, actualizar localmente
        if (!isConnected) {
          setNotificaciones(prev => {
            const notificacionEliminada = prev.find(n => n.id === id);
            if (notificacionEliminada && !notificacionEliminada.leida) {
              setConteoNoLeidas(count => Math.max(0, count - 1));
            }
            return prev.filter(notif => notif.id !== id);
          });
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
      return false;
    }
  }, [isConnected]);

  // Conectar cuando el usuario esté disponible
  useEffect(() => {
    if (user?.correo && user.type === 'miembro') {
      connect();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user?.correo, user?.type, connect]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    notificaciones,
    conteoNoLeidas,
    isConnected,
    error,
    marcarComoLeida,
    eliminarNotificacion
  };
}
