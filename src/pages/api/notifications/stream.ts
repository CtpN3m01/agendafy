// src/pages/api/notifications/stream.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthUtil } from '@/lib/auth';

// Mapa para almacenar las conexiones SSE activas
const connections = new Map<string, NextApiResponse>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar autenticación via query parameter
    const token = req.query.token as string;
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const decoded = AuthUtil.verifyToken(token);
    if (!decoded || !decoded.email) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const userEmail = decoded.email;

    // Configurar headers para SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Almacenar la conexión
    connections.set(userEmail, res);
    console.log(`Usuario conectado via SSE: ${userEmail}`);

    // Enviar mensaje de conexión establecida
    res.write(`data: ${JSON.stringify({
      type: 'CONNECTION_ESTABLISHED',
      message: 'Conectado al stream de notificaciones',
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Enviar ping cada 30 segundos para mantener la conexión viva
    const pingInterval = setInterval(() => {
      if (res.destroyed) {
        clearInterval(pingInterval);
        connections.delete(userEmail);
        return;
      }
      
      try {
        res.write(`data: ${JSON.stringify({
          type: 'PING',
          timestamp: new Date().toISOString()
        })}\n\n`);
      } catch (error) {
        console.error(`Error enviando ping a ${userEmail}:`, error);
        clearInterval(pingInterval);
        connections.delete(userEmail);
      }
    }, 30000);

    // Manejar cuando el cliente se desconecta
    req.on('close', () => {
      console.log(`Usuario desconectado via SSE: ${userEmail}`);
      clearInterval(pingInterval);
      connections.delete(userEmail);
    });

    req.on('error', (error) => {
      console.error(`Error SSE para ${userEmail}:`, error);
      clearInterval(pingInterval);
      connections.delete(userEmail);
    });

  } catch (error) {
    console.error('Error en stream de notificaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Función para enviar notificación a un usuario específico
export function sendNotificationToUser(userEmail: string, notification: any) {
  const res = connections.get(userEmail);
  
  if (res && !res.destroyed) {
    try {
      res.write(`data: ${JSON.stringify({
        type: 'NEW_NOTIFICATION',
        notification: notification,
        timestamp: new Date().toISOString()
      })}\n\n`);
      console.log(`Notificación SSE enviada a ${userEmail}`);
      return true;
    } catch (error) {
      console.error(`Error al enviar notificación SSE a ${userEmail}:`, error);
      connections.delete(userEmail);
      return false;
    }
  }
  
  return false;
}

// Función para enviar actualización de notificación leída
export function sendNotificationRead(userEmail: string, notificationId: string) {
  const res = connections.get(userEmail);
  
  if (res && !res.destroyed) {
    try {
      res.write(`data: ${JSON.stringify({
        type: 'NOTIFICATION_READ',
        notificationId: notificationId,
        timestamp: new Date().toISOString()
      })}\n\n`);
      return true;
    } catch (error) {
      console.error(`Error al enviar actualización de lectura SSE a ${userEmail}:`, error);
      connections.delete(userEmail);
      return false;
    }
  }
  
  return false;
}

// Función para enviar notificación eliminada
export function sendNotificationDeleted(userEmail: string, notificationId: string) {
  const res = connections.get(userEmail);
  
  if (res && !res.destroyed) {
    try {
      res.write(`data: ${JSON.stringify({
        type: 'NOTIFICATION_DELETED',
        notificationId: notificationId,
        timestamp: new Date().toISOString()
      })}\n\n`);
      return true;
    } catch (error) {
      console.error(`Error al enviar eliminación SSE a ${userEmail}:`, error);
      connections.delete(userEmail);
      return false;
    }
  }
  
  return false;
}

// Función para obtener usuarios conectados
export function getConnectedUsers() {
  return Array.from(connections.keys());
}
