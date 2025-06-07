// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const correo = body.correo || body.email;

    if (!correo) {
      return NextResponse.json({
        success: false,
        message: 'Correo requerido'
      }, { status: 400 });
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return NextResponse.json({
        success: false,
        message: 'Formato de correo inválido'
      }, { status: 400 });
    }

    const authService = new AuthService();
    const result = await authService.solicitarRecuperacion(correo);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error en forgot password:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}