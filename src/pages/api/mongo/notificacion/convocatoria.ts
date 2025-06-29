import { NextApiRequest, NextApiResponse } from 'next';
import { notificacionService } from '@/services/NotificacionService';

/**
 * API específica para crear notificaciones de convocatoria
 * POST /api/mongo/notificacion/convocatoria
 * 
 * Body:
 * {
 *   "emisor": "email",
 *   "destinatario": "email", // o "destinatarios": ["email1", "email2"]
 *   "reunionId": "reunion_id",
 *   "fechaReunion": "2023-12-31T10:00:00Z",
 *   "lugarReunion": "Sala de juntas",
 *   "agendaId": "agenda_id" // opcional
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
    const { 
      emisor, 
      destinatario, 
      destinatarios, 
      reunionId, 
      fechaReunion, 
      lugarReunion,
      agendaId 
    } = req.body;

    // Validación de campos requeridos
    if (!emisor || !reunionId || !fechaReunion || !lugarReunion) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: emisor, reunionId, fechaReunion, lugarReunion'
      });
    }

    // Validar que se proporcione al menos un destinatario
    if (!destinatario && (!destinatarios || !Array.isArray(destinatarios) || destinatarios.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos un destinatario (destinatario o destinatarios)'
      });
    }

    // Validar fecha de reunión
    const fechaReunionDate = new Date(fechaReunion);
    if (isNaN(fechaReunionDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido para fechaReunion'
      });
    }

    if (fechaReunionDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de la reunión debe ser futura'
      });
    }

    // Validar lugar de reunión
    if (!lugarReunion.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El lugar de la reunión no puede estar vacío'
      });
    }

    const datosConvocatoria = {
      reunionId,
      fechaReunion: fechaReunionDate,
      lugarReunion: lugarReunion.trim(),
      agendaId: agendaId || null
    };

    // Crear notificación individual o masiva
    if (destinatario) {
      // Notificación individual
      const notificacion = await notificacionService.crearNotificacionConvocatoria(
        emisor,
        destinatario,
        datosConvocatoria
      );

      return res.status(201).json({
        success: true,
        message: 'Notificación de convocatoria creada exitosamente',
        data: notificacion
      });
    } else {
      // Notificaciones masivas
      const notificaciones = await notificacionService.crearNotificacionesMasivas(
        'CONVOCATORIA' as any,
        emisor,
        destinatarios,
        datosConvocatoria
      );

      return res.status(201).json({
        success: true,
        message: `${notificaciones.length} notificaciones de convocatoria creadas exitosamente`,
        data: {
          notificaciones,
          cantidadCreadas: notificaciones.length,
          cantidadSolicitada: destinatarios.length
        }
      });
    }

  } catch (error) {
    console.error('Error al crear notificación de convocatoria:', error);
    
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
