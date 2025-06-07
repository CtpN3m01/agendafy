// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Manejar ambos formatos (frontend y Postman)
    const registerData = {
      nombreUsuario: body.nombreUsuario || body.email?.split('@')[0] || body.name?.toLowerCase().replace(/\s+/g, ''),
      nombre: body.nombre || body.name?.split(' ')[0] || '',
      apellidos: body.apellidos || body.name?.split(' ').slice(1).join(' ') || '',
      correo: body.correo || body.email,
      contrasena: body.contrasena || body.password
    };

    // Validaciones básicas
    if (!registerData.nombreUsuario || !registerData.nombre || !registerData.correo || !registerData.contrasena) {
      return NextResponse.json({
        success: false,
        message: 'Datos incompletos',
        errors: {
          general: ['Todos los campos son requeridos']
        }
      }, { status: 400 });
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.correo)) {
      return NextResponse.json({
        success: false,
        message: 'Formato de correo inválido',
        errors: {
          correo: ['El formato del correo no es válido']
        }
      }, { status: 400 });
    }

    // Validar longitud de contraseña
    if (registerData.contrasena.length < 8) {
      return NextResponse.json({
        success: false,
        message: 'Contraseña muy corta',
        errors: {
          contrasena: ['La contraseña debe tener al menos 8 caracteres']
        }
      }, { status: 400 });
    }

    const authService = new AuthService();
    const result = await authService.registrarUsuario(registerData);

    const statusCode = result.success ? 201 : 400;
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}