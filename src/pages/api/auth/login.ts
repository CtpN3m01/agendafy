// src/pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService';
import { UsuarioDTO } from '@/types/UsuarioDTO';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const authService = new AuthService();
    
    const { email, password, nombreUsuario, contrasena } = req.body;

    // Manejar ambos formatos (frontend y Postman)
    const loginData: UsuarioDTO = {
      nombreUsuario: nombreUsuario || email,
      contrasena: contrasena || password
    };

    if (!loginData.nombreUsuario || !loginData.contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos',
        errors: {
          general: ['Email/Usuario y contraseña son requeridos']
        }
      });
    }

    // Usar el servicio de autenticación para iniciar sesión
    const result = await authService.iniciarSesion(loginData);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }

  } catch (error) {
    console.error('Error completo en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
