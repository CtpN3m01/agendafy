import { NextApiRequest, NextApiResponse } from 'next';
import { notificacionService } from '@/services/NotificacionService';

/**
 * API para obtener el conteo de notificaciones no leídas
 * GET /api/mongo/notificacion/conteo-no-leidas?destinatario=email
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método no permitido. Use GET.' 
    });
  }

  try {
    const { destinatario } = req.query;

    // Validación del destinatario
    if (!destinatario || typeof destinatario !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'El parámetro destinatario es requerido'
      });
    }

    // Obtener conteo de notificaciones no leídas
    const conteo = await notificacionService.contarNotificacionesNoLeidas(destinatario);

    return res.status(200).json({
      success: true,
      message: 'Conteo obtenido exitosamente',
      data: {
        destinatario,
        conteoNoLeidas: conteo
      }
    });

  } catch (error) {
    console.error('Error al obtener conteo de notificaciones no leídas:', error);
    
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
