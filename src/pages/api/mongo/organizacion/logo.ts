import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { OrganizacionModel } from '@/models/Organizacion';
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

    // Obtener ID de la organización
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID de organización requerido'
      });
    }

    // Buscar la organización
    const organizacion = await OrganizacionModel.findById(id);
    
    if (!organizacion) {
      return res.status(404).json({
        success: false,
        message: 'Organización no encontrada'
      });
    }

    // Verificar que el usuario tiene acceso
    if (organizacion.usuario.toString() !== decoded.userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta imagen'
      });
    }

    // Verificar que hay logo
    if (!organizacion.logo) {
      return res.status(404).json({
        success: false,
        message: 'La organización no tiene logo'
      });
    }

    // Configurar headers para imagen
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache por 1 día
    res.setHeader('Content-Length', organizacion.logo.length);

    // Enviar la imagen
    return res.status(200).send(organizacion.logo);

  } catch (error) {
    console.error('Error al obtener logo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}
