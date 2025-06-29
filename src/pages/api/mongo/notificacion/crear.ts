import { NextApiRequest, NextApiResponse } from 'next';
import { notificacionService } from '@/services/NotificacionService';
import { TipoNotificacion } from '@/types/NotificacionDTO';

/**
 * API para crear notificaciones
 * POST /api/mongo/notificacion/crear
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método no permitido. Use POST.' 
    });
  }

  try {
    const { tipo, emisor, destinatario, datos } = req.body;

    // Validación de campos requeridos
    if (!tipo || !emisor || !destinatario || !datos) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: tipo, emisor, destinatario, datos'
      });
    }

    // Validar que el tipo sea válido
    if (!Object.values(TipoNotificacion).includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de notificación inválido. Tipos válidos: ${Object.values(TipoNotificacion).join(', ')}`
      });
    }

    // Crear la notificación usando el servicio
    const notificacion = await notificacionService.crearNotificacion(
      tipo,
      emisor,
      destinatario,
      datos
    );

    return res.status(201).json({
      success: true,
      message: 'Notificación creada exitosamente',
      data: notificacion
    });

  } catch (error) {
    console.error('Error al crear notificación:', error);
    
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
