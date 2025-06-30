// src/pages/api/websocket.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';

// Mapa para almacenar conexiones WebSocket por email de usuario
const connections = new Map<string, WebSocket>();

// Crear servidor WebSocket
let wss: WebSocketServer | null = null;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (!wss) {
      // Inicializar el servidor WebSocket una sola vez
      wss = new WebSocketServer({ 
        port: 3001,
        path: '/notifications'
      });

      wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
        const parsedUrl = parse(request.url || '', true);
        const userEmail = parsedUrl.query.email as string;

        if (!userEmail) {
          ws.close(1008, 'Email requerido');
          return;
        }

        console.log(`Usuario conectado: ${userEmail}`);
        
        // Almacenar la conexión
        connections.set(userEmail, ws);

        // Manejar mensajes del cliente
        ws.on('message', async (message: Buffer) => {
          try {
            const data = JSON.parse(message.toString());
            
            switch (data.type) {
              case 'MARK_AS_READ':
                // Aquí puedes manejar cuando se marca como leída una notificación
                console.log(`Notificación ${data.notificationId} marcada como leída por ${userEmail}`);
                break;
                
              case 'DELETE_NOTIFICATION':
                // Aquí puedes manejar cuando se elimina una notificación
                console.log(`Notificación ${data.notificationId} eliminada por ${userEmail}`);
                break;
                
              default:
                console.log('Mensaje WebSocket no reconocido:', data);
            }
          } catch (error) {
            console.error('Error al procesar mensaje WebSocket:', error);
          }
        });

        // Manejar desconexión
        ws.on('close', () => {
          console.log(`Usuario desconectado: ${userEmail}`);
          connections.delete(userEmail);
        });

        // Manejar errores
        ws.on('error', (error: Error) => {
          console.error(`Error WebSocket para ${userEmail}:`, error);
          connections.delete(userEmail);
        });

        // Enviar mensaje de bienvenida
        ws.send(JSON.stringify({
          type: 'CONNECTION_ESTABLISHED',
          message: 'Conectado al servidor de notificaciones'
        }));
      });

      console.log('Servidor WebSocket iniciado en puerto 3001');
    }

    res.status(200).json({ 
      message: 'Servidor WebSocket inicializado',
      connections: connections.size 
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Función para enviar notificación a un usuario específico
export function sendNotificationToUser(userEmail: string, notification: unknown) {
  const ws = connections.get(userEmail);
  
    if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify({
        type: 'NEW_NOTIFICATION',
        notification: notification
      }));
      console.log(`Notificación enviada a ${userEmail}`);
      return true;
    } catch (error) {
      console.error(`Error al enviar notificación a ${userEmail}:`, error);
      connections.delete(userEmail);
      return false;
    }
  }
  
  return false;
}

// Función para enviar notificación a múltiples usuarios
export function sendNotificationToUsers(userEmails: string[], notification: unknown) {
  const results = userEmails.map(email => {
    return {
      email,
      sent: sendNotificationToUser(email, notification)
    };
  });
  
  console.log('Resultados del envío:', results);
  return results;
}

// Función para obtener usuarios conectados
export function getConnectedUsers(): string[] {
  return Array.from(connections.keys());
}

// Función para broadcast a todos los usuarios conectados
export function broadcastToAll(message: unknown) {
  let sentCount = 0;
  
  connections.forEach((ws, userEmail) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        sentCount++;
      } catch (error) {
        console.error(`Error al enviar broadcast a ${userEmail}:`, error);
        connections.delete(userEmail);
      }
    } else {
      connections.delete(userEmail);
    }
  });
  
  console.log(`Broadcast enviado a ${sentCount} usuarios`);
  return sentCount;
}
