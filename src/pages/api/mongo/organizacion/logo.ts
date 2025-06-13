import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { OrganizacionModel } from '@/models/Organizacion';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();

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
