// src/pages/api/auth/forgot-password.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService';
import { PersonaAuthAdapter } from '@/adapters/PersonaAuthAdapter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
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

    // Primero intentar como Usuario (admin)
    const authService = new AuthService();
    const usuarioResult = await authService.solicitarRecuperacion(correo);

    if (usuarioResult.success) {
      return res.status(200).json(usuarioResult);
    }

    // Si falla como usuario, intentar como Persona (miembro de junta)
    const personaAuthAdapter = new PersonaAuthAdapter();
    const personaResult = await personaAuthAdapter.solicitarRecuperacionPersona(correo);

    if (personaResult.success) {
      return res.status(200).json(personaResult);
    }

    // Si ambos fallan, retornar error genérico
    return res.status(404).json({
      success: false,
      message: 'No se encontró una cuenta con ese correo'
    });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
