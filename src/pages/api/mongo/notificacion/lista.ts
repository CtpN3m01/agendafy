import { NextApiRequest, NextApiResponse } from 'next';
import { notificacionService } from '@/services/NotificacionService';
import { TipoNotificacion, FiltrosNotificacionDTO } from '@/types/NotificacionDTO';

/**
 * API para obtener notificaciones con paginación y filtros avanzados
 * GET /api/mongo/notificacion/lista?pagina=1&limite=20&destinatario=email&tipo=ASIGNACION&leida=false
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
      pagina, 
      limite, 
      destinatario, 
      emisor, 
      tipo, 
      leida, 
      fechaDesde, 
      fechaHasta 
    } = req.query;

    // Construir filtros
    const filtros: FiltrosNotificacionDTO = {};

    // Paginación
    if (pagina && typeof pagina === 'string') {
      const paginaNum = parseInt(pagina);
      if (!isNaN(paginaNum) && paginaNum > 0) {
        filtros.pagina = paginaNum;
      }
    }

    if (limite && typeof limite === 'string') {
      const limiteNum = parseInt(limite);
      if (!isNaN(limiteNum) && limiteNum > 0) {
        filtros.limite = Math.min(limiteNum, 100); // Máximo 100
      }
    }

    // Filtros de datos
    if (destinatario && typeof destinatario === 'string') {
      filtros.destinatario = destinatario;
    }

    if (emisor && typeof emisor === 'string') {
      filtros.emisor = emisor;
    }

    if (tipo && typeof tipo === 'string' && Object.values(TipoNotificacion).includes(tipo as TipoNotificacion)) {
      filtros.tipo = tipo as TipoNotificacion;
    }

    if (leida === 'true' || leida === 'false') {
      filtros.leida = leida === 'true';
    }

    // Filtros de fecha
    if (fechaDesde && typeof fechaDesde === 'string') {
      const fecha = new Date(fechaDesde);
      if (!isNaN(fecha.getTime())) {
        filtros.fechaDesde = fecha;
      }
    }

    if (fechaHasta && typeof fechaHasta === 'string') {
      const fecha = new Date(fechaHasta);
      if (!isNaN(fecha.getTime())) {
        filtros.fechaHasta = fecha;
      }
    }

    // Obtener notificaciones con paginación
    const resultado = await notificacionService.obtenerNotificacionesConPaginacion(filtros);

    return res.status(200).json({
      success: true,
      message: 'Notificaciones obtenidas exitosamente',
      data: resultado
    });

  } catch (error) {
    console.error('Error al obtener lista de notificaciones:', error);
    
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
}
