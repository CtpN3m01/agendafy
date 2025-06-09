import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { OrganizacionService } from '@/services/OrganizacionService';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-para-jwt-2025';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();

    // Verificar autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autorización requerido'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    const organizacionService = new OrganizacionService();
    
    // Si se proporciona un ID específico en query parameters
    const { id } = req.query;
    
    if (id && typeof id === 'string') {
      // Obtener organización específica
      const organizacion = await organizacionService.obtenerOrganizacion(id);
      
      if (!organizacion) {
        return res.status(404).json({
          success: false,
          message: 'Organización no encontrada'
        });
      }

      // Verificar que el usuario tiene acceso a esta organización
      if (organizacion.usuario.id !== decoded.userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver esta organización'
        });
      }

      return res.status(200).json({
        success: true,
        organizacion // Devuelve organizacion con logo en base64
      });
    } else {
      // Obtener todas las organizaciones del usuario
      const organizaciones = await organizacionService.obtenerOrganizacionesPorUsuario(decoded.userId);

      return res.status(200).json({
        success: true,
        organizaciones // ✅ CAMBIADO: cada organizacion incluye logo en base64
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