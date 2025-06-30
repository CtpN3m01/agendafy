import { NextApiRequest, NextApiResponse } from 'next';
import { notificacionService } from '@/services/NotificacionService';

/**
 * API para manejar una notificación específica por ID
 * GET /api/mongo/notificacion/[id] - Obtener notificación por ID
 * PATCH /api/mongo/notificacion/[id] - Actualizar notificación
 * DELETE /api/mongo/notificacion/[id] - Eliminar notificación
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Validar que se proporcione el ID
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'ID de notificación requerido'
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await obtenerNotificacion(id, res);
      
      case 'PATCH':
        return await actualizarNotificacion(id, req.body, res);
      
      case 'DELETE':
        return await eliminarNotificacion(id, res);
      
      default:
        return res.status(405).json({
          success: false,
          message: 'Método no permitido. Use GET, PATCH o DELETE.'
        });
    }
  } catch (error) {
    console.error(`Error en API de notificación [${req.method}]:`, error);
    
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}

/**
 * Obtener notificación por ID
 */
async function obtenerNotificacion(id: string, res: NextApiResponse) {
  const notificacion = await notificacionService.obtenerNotificacionPorId(id);
  
  if (!notificacion) {
    return res.status(404).json({
      success: false,
      message: 'Notificación no encontrada'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Notificación obtenida exitosamente',
    data: notificacion
  });
}

/**
 * Actualizar notificación
 */
async function actualizarNotificacion(id: string, body: { asunto?: string; contenido?: string; leida?: boolean }, res: NextApiResponse) {
  const { asunto, contenido, leida } = body;

  // Validar que al menos un campo sea proporcionado
  if (asunto === undefined && contenido === undefined && leida === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere al menos uno de los campos: asunto, contenido, leida'
    });
  }

  // Construir objeto de actualización
  const datosActualizacion: {
    asunto?: string;
    contenido?: string;
    leida?: boolean;
  } = {};
  
  if (asunto !== undefined) {
    if (typeof asunto !== 'string' || asunto.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El asunto debe ser una cadena no vacía'
      });
    }
    datosActualizacion.asunto = asunto.trim();
  }

  if (contenido !== undefined) {
    if (typeof contenido !== 'string' || contenido.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El contenido debe ser una cadena no vacía'
      });
    }
    datosActualizacion.contenido = contenido.trim();
  }

  if (leida !== undefined) {
    if (typeof leida !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El campo leida debe ser un booleano'
      });
    }
    datosActualizacion.leida = leida;
  }

  const notificacionActualizada = await notificacionService.actualizarNotificacion(
    id, 
    datosActualizacion
  );

  if (!notificacionActualizada) {
    return res.status(404).json({
      success: false,
      message: 'Notificación no encontrada'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Notificación actualizada exitosamente',
    data: notificacionActualizada
  });
}

/**
 * Eliminar notificación
 */
async function eliminarNotificacion(id: string, res: NextApiResponse) {
  const eliminada = await notificacionService.eliminarNotificacion(id);
  
  if (!eliminada) {
    return res.status(404).json({
      success: false,
      message: 'Notificación no encontrada'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Notificación eliminada exitosamente'
  });
}
