// src/pages/api/auth/set-password.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PersonaAuthAdapter } from '@/adapters/PersonaAuthAdapter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { email } = req.body;

    // Validación básica
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido'
      });
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de correo inválido'
      });
    }

    // Generar un token de recuperación para establecer la primera contraseña
    // Esto es más seguro que establecer directamente con email
    const personaAuthAdapter = new PersonaAuthAdapter();
    const result = await personaAuthAdapter.solicitarRecuperacionPersona(email);

    if (result.success) {
      return res.status(200).json({
        ...result,
        message: 'Se ha generado un enlace para establecer tu contraseña. Revisa tu correo electrónico.'
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error en set-password:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}
