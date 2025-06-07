// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, nuevaContrasena, confirmarContrasena } = body;

    if (!token || !nuevaContrasena || !confirmarContrasena) {
      return NextResponse.json({
        success: false,
        message: 'Datos incompletos'
      }, { status: 400 });
    }

    if (nuevaContrasena !== confirmarContrasena) {
      return NextResponse.json({
        success: false,
        message: 'Las contraseñas no coinciden'
      }, { status: 400 });
    }

    if (nuevaContrasena.length < 8) {
      return NextResponse.json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      }, { status: 400 });
    }

    const authService = new AuthService();
    const result = await authService.restablecerContrasena(token, nuevaContrasena);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error en reset password:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}