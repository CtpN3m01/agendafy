// src/pages/api/auth/forgot-password.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const authService = new AuthService();
    
    const body = req.body;
    const correo = body.correo || body.email;

    if (!correo) {
      return res.status(400).json({
        success: false,
        message: 'Correo requerido'
      });
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de correo inválido'
      });
    }

    // Usar el servicio de autenticación para solicitar recuperación
    const result = await authService.solicitarRecuperacion(correo);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }

  } catch (error) {
    console.error('Error en forgot-password:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
