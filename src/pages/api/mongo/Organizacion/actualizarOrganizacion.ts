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
  if (req.method !== 'PUT') {
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

    // Obtener ID de la organización (múltiples formas)
    let organizacionId = req.query.id as string;
    
    // Si no está en query, revisar si está en el body
    if (!organizacionId && req.body.id) {
      organizacionId = req.body.id;
    }

    // Validar que tenemos el ID
    if (!organizacionId) {
      return res.status(400).json({
        success: false,
        message: 'ID de organización requerido',
        hint: 'Envía el ID como query parameter: ?id=tu_id_aqui'
      });
    }

    // Validar formato del ID
    if (!/^[0-9a-fA-F]{24}$/.test(organizacionId)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de ID inválido'
      });
    }

    // Extraer datos del body
    const { nombre, correo, telefono, direccion } = req.body;

    // Validar que al menos un campo esté presente
    if (!nombre && !correo && !telefono && !direccion && !req.file) {
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

    // Procesar el logo si existe
    let logoBuffer: Buffer | undefined;
    if (req.file) {
      logoBuffer = req.file.buffer;
      console.log(`Nuevo logo recibido: ${req.file.originalname}, tamaño: ${req.file.size} bytes`);
    }

    // Preparar datos para actualizar
    const datosActualizacion: any = {};
    if (nombre) datosActualizacion.nombre = nombre;
    if (correo) datosActualizacion.correo = correo;
    if (telefono) datosActualizacion.telefono = telefono;
    if (direccion) datosActualizacion.direccion = direccion;
    if (logoBuffer) datosActualizacion.logo = logoBuffer;

    const organizacionService = new OrganizacionService();
    const resultado = await organizacionService.actualizarOrganizacion(
      organizacionId,
      datosActualizacion,
      decoded.userId
    );

    if (resultado.success) {
      return res.status(200).json(resultado);
    } else {
      return res.status(400).json(resultado);
    }

  } catch (error) {
    console.error('Error al actualizar organización:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}