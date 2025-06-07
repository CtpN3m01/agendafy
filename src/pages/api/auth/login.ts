// src/pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { UsuarioModel } from '@/models/Usuario';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-para-jwt-2025';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();
    
    const { email, password, nombreUsuario, contrasena } = req.body;

    // Manejar ambos formatos (frontend y Postman)
    const loginData = {
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

    // Buscar usuario por nombre de usuario o correo
    let usuario = await UsuarioModel.findOne({ 
      nombre_usuario: loginData.nombreUsuario,
      isActive: true 
    });
    
    if (!usuario) {
      usuario = await UsuarioModel.findOne({ 
        correo: loginData.nombreUsuario,
        isActive: true 
      });
    }

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        errors: { general: ['Usuario o contraseña incorrectos'] }
      });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(loginData.contrasena, usuario.contrasena);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        errors: { general: ['Usuario o contraseña incorrectos'] }
      });
    }

    // Generar token
    const token = jwt.sign({
      userId: usuario._id.toString(),
      email: usuario.correo,
      nombreUsuario: usuario.nombre_usuario
    }, JWT_SECRET, { expiresIn: '7d' });

    const userResponse = {
      id: usuario._id.toString(),
      nombreUsuario: usuario.nombre_usuario,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      createdAt: usuario.createdAt
    };

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}