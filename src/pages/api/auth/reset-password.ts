// src/pages/api/auth/reset-password.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const authService = new AuthService();
    
    const body = req.body;
    const { token, nuevaContrasena, confirmarContrasena, newPassword, confirmPassword } = body;

    // Manejar ambos formatos
    const resetToken = token;
    const password = nuevaContrasena || newPassword;
    const confirmPass = confirmarContrasena || confirmPassword;

    if (!resetToken || !password || !confirmPass) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos'
      });
    }

    if (password !== confirmPass) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    // Usar el servicio de autenticación para restablecer la contraseña
    const result = await authService.restablecerContrasena(resetToken, password);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error('Error en reset-password:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
