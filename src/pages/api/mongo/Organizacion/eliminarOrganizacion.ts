import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { OrganizacionService } from '@/services/OrganizacionService';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-para-jwt-2025';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
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

    // Obtener ID de múltiples formas (más flexible)
    let organizacionId: string;
    
    // Opción 1: ID en query parameters
    if (req.query.id && typeof req.query.id === 'string') {
      organizacionId = req.query.id;
    }
    // Opción 2: ID en el body
    else if (req.body?.id) {
      organizacionId = req.body.id;
    }
    // Opción 3: Mensaje de error más descriptivo
    else {
      return res.status(400).json({
        success: false,
        message: 'ID de organización requerido',
        hint: 'Envía el ID como query parameter (?id=tu_id) o en el body como JSON'
      });
    }

    // Validar formato del ID
    if (!/^[0-9a-fA-F]{24}$/.test(organizacionId)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de ID inválido',
        details: 'El ID debe ser un ObjectId válido de MongoDB (24 caracteres hexadecimales)'
      });
    }

    console.log('ID recibido para eliminar:', organizacionId);

    const organizacionService = new OrganizacionService();
    const resultado = await organizacionService.eliminarOrganizacion(organizacionId, decoded.userId);

    if (resultado.success) {
      return res.status(200).json(resultado);
    } else {
      return res.status(400).json(resultado);
    }

  } catch (error) {
    console.error('Error al eliminar organización:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}