// src/pages/api/auth/forgot-password.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { UsuarioModel } from '@/models/Usuario';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();
    
    const body = req.body;
    const correo = body.correo || body.email;

    if (!correo) {
      return res.status(400).json({
        success: false,
        message: 'Correo requerido'
      });
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de correo inválido'
      });
    }

    const usuario = await UsuarioModel.findOne({ correo, isActive: true });
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró una cuenta con ese correo'
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos
    await UsuarioModel.findByIdAndUpdate(usuario._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: expires
    });

    // Configurar transporter de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: correo,
      subject: 'Recuperación de Contraseña - Agendafy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Recuperación de Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña en Agendafy.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Restablecer Contraseña
          </a>
          <p style="margin-top: 20px; color: #666;">
            Este enlace expirará en 1 hora por seguridad.
          </p>
          <p style="color: #666;">
            Si no solicitaste este cambio, puedes ignorar este correo.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Se ha enviado un correo con las instrucciones de recuperación'
    });

  } catch (error) {
    console.error('Error en forgot password:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}