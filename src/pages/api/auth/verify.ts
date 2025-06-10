// src/pages/api/auth/verify.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Error de configuración del servidor'
    });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token requerido'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    return res.status(200).json({
      success: true,
      message: 'Token válido',
      user: {
        userId: decoded.userId,
        email: decoded.email,
        nombreUsuario: decoded.nombreUsuario
      }
    });

  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
}
