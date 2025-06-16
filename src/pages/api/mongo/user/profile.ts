import { NextApiRequest, NextApiResponse } from 'next';
import { UsuarioDAOImpl } from '@/dao/UsuarioDAO';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '@/lib/jwt-config';

const usuarioDAO = new UsuarioDAOImpl();

// Función auxiliar para obtener el usuario del token
async function getUserFromToken(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '') || req.cookies.authToken;

  console.log('getUserFromToken - Auth header:', authHeader);
  console.log('getUserFromToken - Cookie token:', req.cookies.authToken);
  console.log('getUserFromToken - Final token:', token ? token.substring(0, 20) + '...' : 'null');

  if (!token) {
    console.log('getUserFromToken - No token found');
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as any;
    console.log('getUserFromToken - Decoded token:', decoded);
    
    const usuario = await usuarioDAO.buscarPorId(decoded.userId);
    console.log('getUserFromToken - Usuario encontrado:', usuario ? 'sí' : 'no');
    
    return usuario;
  } catch (error) {
    console.log('getUserFromToken - Error verifying token:', error);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const usuario = await getUserFromToken(req);

      if (!usuario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }      // Mapear datos del usuario a formato UserProfile
      const userProfile = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (usuario as any)._id.toString(),
        name: `${usuario.nombre} ${usuario.apellidos}`,
        email: usuario.correo,
        avatar: usuario.avatar,
        phone: usuario.telefono || "",
        position: usuario.posicion || "",
        department: usuario.departamento || "",
        bio: usuario.biografia || "",
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt
      };

      return res.status(200).json(userProfile);
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
  if (req.method === 'PATCH') {
    try {
      console.log('PATCH /api/user/profile - Request body:', req.body);
      
      const usuario = await getUserFromToken(req);

      if (!usuario) {
        console.log('Usuario no autenticado');
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      console.log('Usuario encontrado:', { id: 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (usuario as any)._id, nombre: usuario.nombre });

      const { name, email, phone, position, department, bio } = req.body;      // Preparar datos para actualizar
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {};
      
      // Si se actualiza el nombre, separar en nombre y apellidos
      if (name && name !== `${usuario.nombre} ${usuario.apellidos}`) {
        const parts = name.trim().split(' ');
        updateData.nombre = parts[0] || usuario.nombre;
        updateData.apellidos = parts.slice(1).join(' ') || usuario.apellidos;
      }

      if (email && email !== usuario.correo) {
        updateData.correo = email;
      }

      // Campos adicionales del perfil
      if (phone !== undefined) updateData.telefono = phone;
      if (position !== undefined) updateData.posicion = position;
      if (department !== undefined) updateData.departamento = department;
      if (bio !== undefined) updateData.biografia = bio;

      console.log('Datos a actualizar:', updateData);      // Actualizar usando el nuevo método del DAO
      const usuarioActualizado = await usuarioDAO.actualizarPerfil(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (usuario as any)._id.toString(), updateData);

      console.log('Usuario actualizado:', usuarioActualizado ? 'exitoso' : 'falló');

      if (!usuarioActualizado) {
        return res.status(500).json({ error: 'Error al actualizar el usuario' });
      }      const userProfileActualizado = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (usuarioActualizado as any)._id.toString(),
        name: `${usuarioActualizado.nombre} ${usuarioActualizado.apellidos}`,
        email: usuarioActualizado.correo,
        avatar: usuarioActualizado.avatar,
        phone: usuarioActualizado.telefono || "",
        position: usuarioActualizado.posicion || "",
        department: usuarioActualizado.departamento || "",
        bio: usuarioActualizado.biografia || "",
        createdAt: usuarioActualizado.createdAt,
        updatedAt: usuarioActualizado.updatedAt
      };      return res.status(200).json(userProfileActualizado);
    } catch (error) {
      console.error('Error al actualizar el perfil en API:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : error);
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Método no permitido
  res.setHeader('Allow', ['GET', 'PATCH']);
  return res.status(405).json({ error: `Método ${req.method} no permitido` });
}
