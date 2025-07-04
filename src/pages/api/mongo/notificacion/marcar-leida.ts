import { NextApiRequest, NextApiResponse } from 'next';
import { notificacionService } from '@/services/NotificacionService';
import { sendNotificationToUser } from '../../websocket';

/**
 * API para marcar notificaciones como leídas
 * PATCH /api/mongo/notificacion/marcar-leida
 * 
 * Body (una notificación):
 * { "id": "notificacion_id", "userEmail": "user@example.com" }
 * 
 * Body (múltiples notificaciones):
 * { "ids": ["id1", "id2", "id3"], "userEmail": "user@example.com" }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método no permitido. Use PATCH.' 
    });
  }

  try {
    const { id, ids, userEmail } = req.body;

    // Validar que se proporcione al menos uno de los parámetros
    if (!id && !ids) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos uno de los parámetros: id o ids'
      });
    }

    // Marcar una sola notificación como leída
    if (id && typeof id === 'string') {
      const resultado = await notificacionService.marcarComoLeida(id);
      
      if (!resultado) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }

      // Notificar vía WebSocket que la notificación fue marcada como leída
      if (userEmail) {
        try {
          sendNotificationToUser(userEmail, {
            type: 'NOTIFICATION_READ',
            notificationId: id
          });
        } catch (wsError) {
          console.warn('Error al enviar WebSocket de lectura:', wsError);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Notificación marcada como leída exitosamente'
      });
    }

    // Marcar múltiples notificaciones como leídas
    if (ids && Array.isArray(ids)) {
      if (ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El array de IDs no puede estar vacío'
        });
      }

      if (ids.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'No se pueden marcar más de 50 notificaciones a la vez'
        });
      }

      const cantidadMarcadas = await notificacionService.marcarVariasComoLeidas(ids);
      
      // Notificar vía WebSocket que las notificaciones fueron marcadas como leídas
      if (userEmail) {
        try {
          sendNotificationToUser(userEmail, {
            type: 'NOTIFICATIONS_READ',
            notificationIds: ids,
            count: cantidadMarcadas
          });
        } catch (wsError) {
          console.warn('Error al enviar WebSocket de lectura múltiple:', wsError);
        }
      }
      
      return res.status(200).json({
        success: true,
        message: `${cantidadMarcadas} notificaciones marcadas como leídas exitosamente`,
        data: {
          cantidadMarcadas,
          cantidadSolicitada: ids.length
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Formato de datos inválido'
    });

  } catch (error) {
    console.error('Error al marcar notificación(es) como leída(s):', error);
    
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
