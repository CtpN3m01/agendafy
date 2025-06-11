import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { OrganizacionService } from '@/services/OrganizacionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();

    const { id } = req.query;
    const { nombre, apellidos, correo, rol } = req.body;

    // Validar que se proporcione el ID de la organización
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID de organización requerido',
        hint: 'Envía el ID como query parameter: ?id=tu_id_aqui'
      });
    }

    // Validaciones básicas
    if (!nombre || !apellidos || !correo) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos',
        errors: {
          general: ['nombre, apellidos y correo son requeridos']
        }
      });
    }

    // Validar formato del ID de organización
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de ID de organización inválido',
        details: 'El ID debe ser un ObjectId válido de MongoDB (24 caracteres hexadecimales)'
      });
    }

    // Validar formato de correo
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

    const organizacionService = new OrganizacionService();
    const resultado = await organizacionService.agregarMiembroJunta(id, {
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      correo: correo.trim().toLowerCase(),
      rol: rol?.trim() || 'Miembro'
    });

    if (resultado.success) {
      return res.status(201).json(resultado);
    } else {
      return res.status(400).json(resultado);
    }

  } catch (error) {
    console.error('Error al agregar miembro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}