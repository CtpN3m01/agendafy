import type { NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { OrganizacionService } from '@/services/OrganizacionService';
import { upload, runMiddleware, NextApiRequestWithFiles } from '@/lib/multer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-para-jwt-2025';

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

    // Extraer datos del body
    const { nombre, correo, telefono, direccion } = req.body;

    // Validaciones básicas
    if (!nombre || !correo || !telefono || !direccion) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos',
        errors: {
          general: ['Nombre, correo, teléfono y dirección son requeridos']
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
      usuarioId: decoded.userId
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