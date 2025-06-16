// src/pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService';
import { CrearUsuarioDTO } from '@/types/UsuarioDTO';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const authService = new AuthService();
    
    const body = req.body;
    
    // Manejar ambos formatos (frontend y Postman)
    const registerData: CrearUsuarioDTO = {
      nombreUsuario: body.nombreUsuario || body.email?.split('@')[0] || body.name?.toLowerCase().replace(/\s+/g, ''),
      nombre: body.nombre || body.name?.split(' ')[0] || '',
      apellidos: body.apellidos || body.name?.split(' ').slice(1).join(' ') || '',
      correo: body.correo || body.email,
      contrasena: body.contrasena || body.password
    };

    // Log sin datos sensibles
    console.log('Procesando registro para usuario:', registerData.nombreUsuario, 'email:', registerData.correo);

    // Validaciones básicas
    if (!registerData.nombreUsuario || !registerData.nombre || !registerData.correo || !registerData.contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos',
        errors: {
          general: ['Todos los campos son requeridos']
        }
      });
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.correo)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de correo inválido',
        errors: {
          correo: ['El formato del correo no es válido']
        }
      });
    }

    // Validar longitud de contraseña
    if (registerData.contrasena.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña muy corta',
        errors: {
          contrasena: ['La contraseña debe tener al menos 8 caracteres']
        }
      });
    }

    // Usar el servicio de autenticación para registrar el usuario
    const result = await authService.registrarUsuario(registerData);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error('Error completo en registro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}