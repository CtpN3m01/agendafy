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

    // Crear el adaptador y procesar la solicitud
    const personaAuthAdapter = new PersonaAuthAdapter();
    const result = await personaAuthAdapter.solicitarRecuperacionPersona(email);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error en API forgot-password persona:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}
