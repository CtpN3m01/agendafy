import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { OrganizacionService } from '@/services/OrganizacionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();

    // Obtener ID y usuarioId directamente del request
    let organizacionId: string;
    let usuarioId: string;
    
    // Obtener organizacionId de múltiples formas
    if (req.query.id && typeof req.query.id === 'string') {
      organizacionId = req.query.id;
    } else if (req.body?.id) {
      organizacionId = req.body.id;
    } else {
      return res.status(400).json({
        success: false,
        message: 'ID de organización requerido',
        hint: 'Envía el ID como query parameter (?id=tu_id) o en el body como JSON'
      });
    }

    // Obtener usuarioId
    if (req.query.usuarioId && typeof req.query.usuarioId === 'string') {
      usuarioId = req.query.usuarioId;
    } else if (req.body?.usuarioId) {
      usuarioId = req.body.usuarioId;
    } else {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario requerido',
        hint: 'Envía el usuarioId como query parameter o en el body como JSON'
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
    const resultado = await organizacionService.eliminarOrganizacion(organizacionId, usuarioId);

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