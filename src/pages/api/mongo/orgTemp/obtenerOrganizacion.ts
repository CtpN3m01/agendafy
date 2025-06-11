import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { OrganizacionService } from '@/services/OrganizacionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();    
    const organizacionService = new OrganizacionService();
    
    // Si se proporciona un ID específico en query parameters
    const { id, userId } = req.query;
    
    if (id && typeof id === 'string') {
      // Obtener organización específica
      const organizacion = await organizacionService.obtenerOrganizacion(id);
      
      if (!organizacion) {
        return res.status(404).json({
          success: false,
          message: 'Organización no encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        organizacion
      });
    } else if (userId && typeof userId === 'string') {
      // Obtener todas las organizaciones del usuario
      const organizaciones = await organizacionService.obtenerOrganizacionesPorUsuario(userId);

      return res.status(200).json({
        success: true,
        organizaciones
      });    } else {
      return res.status(400).json({
        success: false,
        message: 'Se requiere ID de organización o userId'
      });
    }

  } catch (error) {
    console.error('Error al obtener organizaciones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}