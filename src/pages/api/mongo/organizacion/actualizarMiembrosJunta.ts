import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { OrganizacionService } from '@/services/OrganizacionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();

    const { id, miembroId } = req.query;
    const { nombre, apellidos, correo, rol } = req.body;

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

    // Validar que al menos un campo esté presente para actualizar
    if (!nombre && !apellidos && !correo && !rol) {
      return res.status(400).json({
        success: false,
        message: 'Al menos un campo debe ser proporcionado para actualizar'
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

    // Validar formato de correo si se proporciona
    if (correo) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de correo inválido',
          errors: {
            correo: ['El formato del correo no es válido']
          }
        });
      }
    }

    const organizacionService = new OrganizacionService();
    const resultado = await organizacionService.actualizarMiembroJunta(id, miembroId, {
      nombre: nombre?.trim(),
      apellidos: apellidos?.trim(),
      correo: correo?.trim().toLowerCase(),
      rol: rol?.trim()
    });

    if (resultado.success) {
      return res.status(200).json(resultado);
    } else {
      return res.status(400).json(resultado);
    }

  } catch (error) {
    console.error('Error al actualizar miembro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}