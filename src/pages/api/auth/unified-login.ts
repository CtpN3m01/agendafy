import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService';
import { PersonaAuthAdapter } from '@/models/PersonaAuthAdapter';
import { UsuarioDTO } from '@/types/UsuarioDTO';
import { PersonaLoginDTO } from '@/types/PersonaDTO';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
        errors: {
          general: ['Email y contraseña son requeridos']
        }
      });
    }

    // Primero intentar como Usuario (admin)
    const authService = new AuthService();
    const usuarioLoginData: UsuarioDTO = {
      nombreUsuario: email,
      contrasena: password
    };

    const usuarioResult = await authService.iniciarSesion(usuarioLoginData);

    if (usuarioResult.success) {
      // Si es exitoso como usuario, agregar el tipo al objeto user
      return res.status(200).json({
        ...usuarioResult,
        user: {
          ...usuarioResult.user,
          type: 'usuario' // Agregar el tipo de usuario
        },
        userType: 'usuario'
      });
    }

    // Si falla como usuario, intentar como Persona (miembro de junta)
    const personaAuthAdapter = new PersonaAuthAdapter();
    const personaLoginData: PersonaLoginDTO = {
      correo: email,
      contrasena: password
    };

    const personaResult = await personaAuthAdapter.iniciarSesionPersona(personaLoginData);

    if (personaResult.success) {
      // Adaptar la respuesta de persona al formato esperado por el frontend
      return res.status(200).json({
        success: true,
        message: personaResult.message,
        token: personaResult.token,
        user: {
          id: personaResult.persona!.id,
          correo: personaResult.persona!.correo,
          nombreUsuario: `${personaResult.persona!.nombre}_${personaResult.persona!.apellidos}`,
          nombre: personaResult.persona!.nombre,
          apellidos: personaResult.persona!.apellidos,
          type: 'miembro',
          rol: personaResult.persona!.rol,
          organizacion: personaResult.persona!.organizacion
        },
        userType: 'miembro'
      });
    }

    // Si ambos fallan, retornar error genérico
    return res.status(401).json({
      success: false,
      message: 'Credenciales incorrectas',
      errors: {
        general: ['Email o contraseña incorrectos']
      }
    });

  } catch (error) {
    console.error('Error en unified login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      errors: {
        general: ['Error interno del servidor']
      }
    });
  }
}
