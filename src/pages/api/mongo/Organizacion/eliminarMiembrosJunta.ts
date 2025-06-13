import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { OrganizacionService } from '@/services/OrganizacionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();
    const { id, miembroId } = req.query;

    // Validar que se proporcionen los IDs como query parameters
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID de organización requerido',
        hint: 'Envía el ID como query parameter: ?id=organizacionId&miembroId=miembroId'
      });
    }

    if (!miembroId || typeof miembroId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID de miembro requerido',
        hint: 'Envía el ID como query parameter: ?id=organizacionId&miembroId=miembroId'
      });
    }

    // Validar formato de IDs
    if (!/^[0-9a-fA-F]{24}$/.test(id) || !/^[0-9a-fA-F]{24}$/.test(miembroId)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de ID inválido',
        details: 'Los IDs deben ser ObjectIds válidos de MongoDB (24 caracteres hexadecimales)'
      });
    }

    const organizacionService = new OrganizacionService();
    const resultado = await organizacionService.eliminarMiembroJunta(id, miembroId);

    if (resultado.success) {
      return res.status(200).json(resultado);
    } else {
      return res.status(400).json(resultado);
    }

  } catch (error) {
    console.error('Error al eliminar miembro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}