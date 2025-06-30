/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import { notificacionService } from '@/services/NotificacionService';

/**
 * API específica para crear notificaciones de asignación
 * POST /api/mongo/notificacion/asignacion
 * 
 * Body:
 * {
 *   "emisor": "email",
 *   "destinatario": "email", // o "destinatarios": ["email1", "email2"]
 *   "reunionId": "reunion_id",
 *   "rolAsignado": "Presidente" | "Secretario" | "Miembro",
 *   "fechaReunion": "2023-12-31T10:00:00Z"
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
      rolAsignado, 
      fechaReunion 
    } = req.body;

    // Validación de campos requeridos
    if (!emisor || !reunionId || !rolAsignado || !fechaReunion) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: emisor, reunionId, rolAsignado, fechaReunion'
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

    // Validar rol asignado
    const rolesValidos = ['Presidente', 'Secretario', 'Miembro', 'Observador'];
    if (!rolesValidos.includes(rolAsignado)) {
      return res.status(400).json({
        success: false,
        message: `Rol inválido. Roles válidos: ${rolesValidos.join(', ')}`
      });
    }

    const datosAsignacion = {
      reunionId,
      rolAsignado,
      fechaReunion: fechaReunionDate
    };

    // Crear notificación individual o masiva
    if (destinatario) {
      // Notificación individual
      const notificacion = await notificacionService.crearNotificacionAsignacion(
        emisor,
        destinatario,
        datosAsignacion
      );

      return res.status(201).json({
        success: true,
        message: 'Notificación de asignación creada exitosamente',
        data: notificacion
      });
    } else {
      // Notificaciones masivas
      const notificaciones = await notificacionService.crearNotificacionesMasivas(
        'ASIGNACION' as any,
        emisor,
        destinatarios,
        datosAsignacion
      );

      return res.status(201).json({
        success: true,
        message: `${notificaciones.length} notificaciones de asignación creadas exitosamente`,
        data: {
          notificaciones,
          cantidadCreadas: notificaciones.length,
          cantidadSolicitada: destinatarios.length
        }
      });
    }

  } catch (error) {
    console.error('Error al crear notificación de asignación:', error);
    
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
