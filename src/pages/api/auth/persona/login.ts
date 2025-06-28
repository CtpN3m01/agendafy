import type { NextApiRequest, NextApiResponse } from 'next';
import { PersonaAuthAdapter } from '@/adapters/PersonaAuthAdapter';
import { PersonaLoginDTO } from '@/types/PersonaDTO';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
        errors: {
          email: !email ? ['Email es requerido'] : [],
          password: !password ? ['Contraseña es requerida'] : []
        }
      });
    }

    // Crear el adaptador y procesar el login
    const personaAuthAdapter = new PersonaAuthAdapter();
    const loginData: PersonaLoginDTO = {
      correo: email,
      contrasena: password
    };

    const result = await personaAuthAdapter.iniciarSesionPersona(loginData);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (error) {
    console.error('Error en API login persona:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}
