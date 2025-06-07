// src/pages/api/auth/register.ts
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
    
    const body = req.body;
    console.log('Datos recibidos:', body);
    
    // Manejar ambos formatos (frontend y Postman)
    const registerData = {
      nombreUsuario: body.nombreUsuario || body.email?.split('@')[0] || body.name?.toLowerCase().replace(/\s+/g, ''),
      nombre: body.nombre || body.name?.split(' ')[0] || '',
      apellidos: body.apellidos || body.name?.split(' ').slice(1).join(' ') || '',
      correo: body.correo || body.email,
      contrasena: body.contrasena || body.password
    };

    console.log('Datos procesados:', registerData);

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

    // Verificar si el usuario ya existe
    const existeCorreo = await UsuarioModel.findOne({ correo: registerData.correo });
    if (existeCorreo) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya está registrado',
        errors: { correo: ['Este correo ya está en uso'] }
      });
    }

    const existeUsuario = await UsuarioModel.findOne({ nombre_usuario: registerData.nombreUsuario });
    if (existeUsuario) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario ya está en uso',
        errors: { nombreUsuario: ['Este nombre de usuario ya está en uso'] }
      });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(registerData.contrasena, salt);

    // Crear usuario
    const nuevoUsuario = new UsuarioModel({
      nombre_usuario: registerData.nombreUsuario,
      nombre: registerData.nombre,
      apellidos: registerData.apellidos,
      correo: registerData.correo,
      contrasena: hashedPassword
    });

    const usuarioGuardado = await nuevoUsuario.save();
    console.log('Usuario creado:', usuarioGuardado._id);

    // Generar token
    const token = jwt.sign({
      userId: usuarioGuardado._id.toString(),
      email: usuarioGuardado.correo,
      nombreUsuario: usuarioGuardado.nombre_usuario
    }, JWT_SECRET, { expiresIn: '7d' });

    const userResponse = {
      id: usuarioGuardado._id.toString(),
      nombreUsuario: usuarioGuardado.nombre_usuario,
      nombre: usuarioGuardado.nombre,
      apellidos: usuarioGuardado.apellidos,
      correo: usuarioGuardado.correo,
      createdAt: usuarioGuardado.createdAt
    };

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Error completo en registro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}