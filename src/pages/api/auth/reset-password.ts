// src/pages/api/auth/reset-password.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService';
import { PersonaAuthAdapter } from '@/models/PersonaAuthAdapter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const body = req.body;
    const { token, nuevaContrasena, confirmarContrasena, newPassword, confirmPassword } = body;

    // Manejar ambos formatos
    const resetToken = token;
    const password = nuevaContrasena || newPassword;
    const confirmPass = confirmarContrasena || confirmPassword;

    if (!resetToken || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token y contraseña son requeridos'
      });
    }

    // Validar confirmación de contraseña si se proporciona
    if (confirmPass && password !== confirmPass) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Primero intentar como Usuario (admin)
    const authService = new AuthService();
    const usuarioResult = await authService.restablecerContrasena(resetToken, password);

    if (usuarioResult.success) {
      return res.status(200).json(usuarioResult);
    }

    // Si falla como usuario, intentar como Persona (miembro de junta)
    const personaAuthAdapter = new PersonaAuthAdapter();
    const personaResult = await personaAuthAdapter.restablecerContrasenaPersona(resetToken, password);

    if (personaResult.success) {
      return res.status(200).json(personaResult);
    }

    // Si ambos fallan, retornar error genérico
    return res.status(400).json({
      success: false,
      message: 'Token inválido o expirado'
    });

  } catch (error) {
    console.error('Error en reset-password:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
