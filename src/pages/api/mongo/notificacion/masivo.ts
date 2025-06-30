import { NextApiRequest, NextApiResponse } from 'next';
import { notificacionService } from '@/services/NotificacionService';
import { TipoNotificacion } from '@/types/NotificacionDTO';

/**
 * API para crear notificaciones masivas
 * POST /api/mongo/notificacion/masivo
 * 
 * Body:
 * {
 *   "tipo": "ASIGNACION" | "CONVOCATORIA",
 *   "emisor": "email",
 *   "destinatarios": ["email1", "email2", "email3"],
 *   "datos": { ... }
 * }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método no permitido. Use POST.' 
    });
  }

  try {
    const { tipo, emisor, destinatarios, datos } = req.body;

    // Validación de campos requeridos
    if (!tipo || !emisor || !destinatarios || !datos) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: tipo, emisor, destinatarios, datos'
      });
    }

    // Validar que el tipo sea válido
    if (!Object.values(TipoNotificacion).includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de notificación inválido. Tipos válidos: ${Object.values(TipoNotificacion).join(', ')}`
      });
    }

    // Validar destinatarios
    if (!Array.isArray(destinatarios) || destinatarios.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'destinatarios debe ser un array no vacío'
      });
    }

    // Limitar el número de destinatarios para evitar sobrecarga
    if (destinatarios.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'No se pueden enviar notificaciones a más de 100 destinatarios a la vez'
      });
    }

    // Validar que todos los destinatarios sean strings válidos
    const destinatariosValidos = destinatarios.filter(dest => 
      typeof dest === 'string' && dest.trim().length > 0
    );

    if (destinatariosValidos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se encontraron destinatarios válidos'
      });
    }

    // Crear notificaciones masivas
    const notificaciones = await notificacionService.crearNotificacionesMasivas(
      tipo,
      emisor,
      destinatariosValidos,
      datos
    );

    return res.status(201).json({
      success: true,
      message: `${notificaciones.length} notificaciones creadas exitosamente`,
      data: {
        notificaciones,
        cantidadCreadas: notificaciones.length,
        cantidadSolicitada: destinatariosValidos.length,
        cantidadDescartada: destinatarios.length - destinatariosValidos.length
      }
    });

  } catch (error) {
    console.error('Error al crear notificaciones masivas:', error);
    
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
