import type { NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { OrganizacionService } from '@/services/OrganizacionService';
import { upload, runMiddleware, NextApiRequestWithFiles } from '@/lib/multer';

// Desactivar el parser de body por defecto para multer
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequestWithFiles, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();

    // Ejecutar multer middleware
    await runMiddleware(req, res, upload.single('logo'));

    // Extraer datos del body
    const { nombre, correo, telefono, direccion, usuarioId } = req.body;

    // Validaciones básicas
    if (!nombre || !correo || !telefono || !direccion || !usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos',
        errors: {
          general: ['Nombre, correo, teléfono, dirección y usuarioId son requeridos']
        }
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

    // Procesar el logo si existe
    let logoBuffer: Buffer | undefined;
    if (req.file) {
      // Verificar tamaño del archivo (máximo 1MB)
      if (req.file.size > 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'El logo es demasiado grande',
          errors: {
            logo: ['El logo debe ser menor a 1MB']
          }
        });
      }
      
      logoBuffer = req.file.buffer;
      console.log(`Logo recibido: ${req.file.originalname}, tamaño: ${req.file.size} bytes, tipo: ${req.file.mimetype}`);
    }

    const organizacionService = new OrganizacionService();
    const resultado = await organizacionService.crearOrganizacion({
      nombre,
      correo,
      telefono,
      direccion,
      logo: logoBuffer,
      usuarioId
    });

    if (resultado.success) {
      return res.status(201).json(resultado);
    } else {
      return res.status(400).json(resultado);
    }

  } catch (error) {
    console.error('Error al crear organización:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}