// src/pages/api/auth/reset-password.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { UsuarioModel } from '@/models/Usuario';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();
    
    const body = req.body;
    const { token, nuevaContrasena, confirmarContrasena } = body;

    if (!token || !nuevaContrasena || !confirmarContrasena) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos'
      });
    }

    if (nuevaContrasena !== confirmarContrasena) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }

    if (nuevaContrasena.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    // Buscar usuario con token válido
    const usuario = await UsuarioModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
      isActive: true
    });

    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(nuevaContrasena, salt);

    // Actualizar contraseña y limpiar token
    await UsuarioModel.findByIdAndUpdate(usuario._id, {
      contrasena: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    });

    return res.status(200).json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    console.error('Error en reset password:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}