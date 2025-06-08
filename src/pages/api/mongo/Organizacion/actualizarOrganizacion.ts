import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { OrganizacionService } from '@/services/OrganizacionService';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-para-jwt-2025';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
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

    const { id, ...datosActualizacion } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de organización requerido'
      });
    }

    const organizacionService = new OrganizacionService();
    const resultado = await organizacionService.actualizarOrganizacion(
      id, 
      datosActualizacion, 
      decoded.userId
    );

    if (resultado.success) {
      return res.status(200).json(resultado);
    } else {
      return res.status(400).json(resultado);
    }

  } catch (error) {
    console.error('Error al actualizar organización:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}