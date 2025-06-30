// src/pages/api/notifications/websocket-status.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getConnectedUsers, sendNotificationToUser, broadcastToAll } from '../websocket';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Obtener estado del servidor WebSocket
    const connectedUsers = getConnectedUsers();
    
    res.status(200).json({
      success: true,
      connectedUsers: connectedUsers.length,
      users: connectedUsers
    });
  } else if (req.method === 'POST') {
    // Enviar notificación de prueba
    const { email, notification, broadcast } = req.body;
    
    try {
      if (broadcast) {
        // Enviar a todos los usuarios conectados
        const sentCount = broadcastToAll(notification);
        res.status(200).json({
          success: true,
          message: 'Broadcast enviado',
          sentCount
        });
      } else if (email) {
        // Enviar a usuario específico
        const sent = sendNotificationToUser(email, notification);
        res.status(200).json({
          success: sent,
          message: sent ? 'Notificación enviada' : 'Usuario no conectado'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Email o broadcast requerido'
        });
      }
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
