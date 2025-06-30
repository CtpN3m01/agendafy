import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { OrganizacionService } from '@/services/OrganizacionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();

    // Obtener ID de la organización
    const organizacionId = req.query.id as string;
    const usuarioId = req.query.usuarioId as string;

    // Validar que tenemos el ID de organización
    if (!organizacionId) {
      return res.status(400).json({
        success: false,
        message: 'ID de organización requerido',
        hint: 'Envía el ID como query parameter: ?id=tu_id_aqui'
      });
    }

    // Validar que tenemos el ID de usuario
    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario requerido',
        hint: 'Envía el usuarioId como query parameter: ?usuarioId=tu_id_aqui'
      });
    }

    // Validar formato del ID de organización
    if (!/^[0-9a-fA-F]{24}$/.test(organizacionId)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de ID de organización inválido'
      });
    }

    // Validar formato del ID de usuario
    if (!/^[0-9a-fA-F]{24}$/.test(usuarioId)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de ID de usuario inválido'
      });
    }

    // Extraer datos del body
    const { nombre, correo, telefono, direccion } = req.body;

    // Validar que al menos un campo esté presente
    if (!nombre && !correo && !telefono && !direccion) {
      return res.status(400).json({
        success: false,
        message: 'Al menos un campo debe ser proporcionado para actualizar'
      });
    }

    // Validar formato de correo si se proporciona
    if (correo) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de correo inválido'
        });
      }
    }

    // Preparar datos para actualizar
    const datosActualizacion: {
      nombre?: string;
      correo?: string;
      telefono?: string;
      direccion?: string;
    } = {};
    if (nombre) datosActualizacion.nombre = nombre;
    if (correo) datosActualizacion.correo = correo;
    if (telefono) datosActualizacion.telefono = telefono;
    if (direccion) datosActualizacion.direccion = direccion;

    const organizacionService = new OrganizacionService();
    const resultado = await organizacionService.actualizarOrganizacion(
      organizacionId,
      datosActualizacion,
      usuarioId
    );

    if (resultado.success) {
      return res.status(200).json(resultado);
    } else {
      return res.status(400).json(resultado);
    }

  } catch (error) {
    console.error('Error al actualizar organización (datos básicos):', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
