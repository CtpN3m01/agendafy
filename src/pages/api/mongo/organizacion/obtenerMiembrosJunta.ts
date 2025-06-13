import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { OrganizacionService } from '@/services/OrganizacionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();

    const { id } = req.query;

    // Validar que se proporcione el ID de la organización
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID de organización requerido',
        hint: 'Envía el ID como query parameter: ?id=tu_id_aqui'
      });
    }

    // Validar formato del ID
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de ID inválido',
        details: 'El ID debe ser un ObjectId válido de MongoDB (24 caracteres hexadecimales)'
      });
    }
    const organizacionService = new OrganizacionService();
    const miembros = await organizacionService.obtenerMiembrosJunta(id);

    if (!miembros) {
      return res.status(404).json({
        success: false,
        message: 'Organización no encontrada'
      });
    }

    // Agregar headers para evitar caché
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(200).json({
      success: true,
      message: 'Miembros de la junta obtenidos exitosamente',
      miembros
    });

  } catch (error) {
    console.error('Error al obtener miembros de la junta:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}