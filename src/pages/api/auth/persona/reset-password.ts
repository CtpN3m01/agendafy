import type { NextApiRequest, NextApiResponse } from 'next';
import { PersonaAuthAdapter } from '@/adapters/PersonaAuthAdapter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { token, newPassword } = req.body;

    // Validación básica
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos'
      });
    }

    // Validar longitud de contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Crear el adaptador y procesar el restablecimiento
    const personaAuthAdapter = new PersonaAuthAdapter();
    const result = await personaAuthAdapter.restablecerContrasenaPersona(token, newPassword);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error en API reset-password persona:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}
