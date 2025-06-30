/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import { notificacionService } from '@/services/NotificacionService';

/**
 * API para obtener notificaciones por destinatario
 * GET /api/mongo/notificacion/destinatario?destinatario=email&limite=20&leida=false&tipo=ASIGNACION
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método no permitido. Use GET.' 
    });
  }

  try {
    const { 
      destinatario, 
      limite, 
      leida, 
      tipo, 
      fechaDesde, 
      fechaHasta 
    } = req.query;

    // Validación del destinatario
    if (!destinatario || typeof destinatario !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'El parámetro destinatario es requerido'
      });
    }

    // Construir filtros
    const filtros: any = {};
    
    if (limite && typeof limite === 'string') {
      const limiteNum = parseInt(limite);
      if (!isNaN(limiteNum) && limiteNum > 0) {
        filtros.limite = Math.min(limiteNum, 100); // Máximo 100
      }
    }

    if (leida === 'true' || leida === 'false') {
      filtros.leida = leida === 'true';
    }

    if (tipo && typeof tipo === 'string') {
      filtros.tipo = tipo;
    }

    if (fechaDesde && typeof fechaDesde === 'string') {
      filtros.fechaDesde = new Date(fechaDesde);
    }

    if (fechaHasta && typeof fechaHasta === 'string') {
      filtros.fechaHasta = new Date(fechaHasta);
    }

    // Obtener notificaciones
    const notificaciones = await notificacionService.obtenerNotificacionesPorDestinatario(
      destinatario,
      filtros
    );

    return res.status(200).json({
      success: true,
      message: 'Notificaciones obtenidas exitosamente',
      data: notificaciones,
      count: notificaciones.length
    });

  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
