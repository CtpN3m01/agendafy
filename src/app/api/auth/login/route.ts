// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nombreUsuario, contrasena } = body;

    // Manejar ambos formatos (frontend y Postman)
    const loginData = {
      nombreUsuario: nombreUsuario || email,
      contrasena: contrasena || password
    };

    if (!loginData.nombreUsuario || !loginData.contrasena) {
      return NextResponse.json({
        success: false,
        message: 'Datos incompletos',
        errors: {
          general: ['Email/Usuario y contraseña son requeridos']
        }
      }, { status: 400 });
    }

    const authService = new AuthService();
    const result = await authService.iniciarSesion(loginData);

    const statusCode = result.success ? 200 : 401;
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}