import { NextApiRequest, NextApiResponse } from 'next';
import { UsuarioDAOImpl } from '@/dao/UsuarioDAO';
import { PersonaAuthAdapter } from '@/models/PersonaAuthAdapter';
import { IUsuario } from '@/models/Usuario';
import { PersonaAuthAdapter } from '@/models/PersonaAuthAdapter';
import { IUsuario } from '@/models/Usuario';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '@/lib/jwt-config';

const usuarioDAO = new UsuarioDAOImpl();
const personaAdapter = new PersonaAuthAdapter();
const personaAdapter = new PersonaAuthAdapter();

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
    
    let usuario;
    if (decoded.type === 'miembro') {
      usuario = await personaAdapter.buscarPorId(decoded.userId);
    } else {
      usuario = await usuarioDAO.buscarPorId(decoded.userId);
    }

    let usuario;
    if (decoded.type === 'miembro') {
      usuario = await personaAdapter.buscarPorId(decoded.userId);
    } else {
      usuario = await usuarioDAO.buscarPorId(decoded.userId);
    }

    console.log('getUserFromToken - Usuario encontrado:', usuario ? 'sí' : 'no');
    return { usuario, decoded };
    return { usuario, decoded };
  } catch (error) {
    console.log('getUserFromToken - Error verifying token:', error);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const result = await getUserFromToken(req);
      const result = await getUserFromToken(req);

      if (!result) {
      if (!result) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      const { usuario, decoded } = result;     // Mapear datos del usuario a formato UserProfile

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (decoded?.type === 'miembro') {
        const userProfile = {
          id: (usuario as any)._id.toString(),
          name: `${usuario.nombre} ${usuario.apellidos}`,
          email: usuario.correo,
          avatar: "",
          phone: "",
          position: (usuario as any).rol || "",
          department: "",
          bio: "",
          createdAt: usuario.createdAt,
          updatedAt: usuario.updatedAt
        };
        return res.status(200).json(userProfile);
      } else {
        // Usuario administrador (no miembro)
        const usuarioAdmin = usuario as IUsuario;
        const userProfile = {
          id: (usuarioAdmin as any)._id.toString(),
          name: usuarioAdmin.nombre || "",
          email: usuarioAdmin.correo,
          avatar: usuarioAdmin.avatar,
          phone: usuarioAdmin.telefono || "",
          position: usuarioAdmin.posicion || "",
          department: usuarioAdmin.departamento || "",
          bio: usuarioAdmin.biografia || "",
          createdAt: usuarioAdmin.createdAt,
          updatedAt: usuarioAdmin.updatedAt
        };
        return res.status(200).json(userProfile);
      }
      }
      const { usuario, decoded } = result;     // Mapear datos del usuario a formato UserProfile

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (decoded?.type === 'miembro') {
        const userProfile = {
          id: (usuario as any)._id.toString(),
          name: `${usuario.nombre} ${usuario.apellidos}`,
          email: usuario.correo,
          avatar: "",
          phone: "",
          position: (usuario as any).rol || "",
          department: "",
          bio: "",
          createdAt: usuario.createdAt,
          updatedAt: usuario.updatedAt
        };
        return res.status(200).json(userProfile);
      } else {
        // Usuario administrador (no miembro)
        const usuarioAdmin = usuario as IUsuario;
        const userProfile = {
          id: (usuarioAdmin as any)._id.toString(),
          name: usuarioAdmin.nombre || "",
          email: usuarioAdmin.correo,
          avatar: usuarioAdmin.avatar,
          phone: usuarioAdmin.telefono || "",
          position: usuarioAdmin.posicion || "",
          department: usuarioAdmin.departamento || "",
          bio: usuarioAdmin.biografia || "",
          createdAt: usuarioAdmin.createdAt,
          updatedAt: usuarioAdmin.updatedAt
        };
        return res.status(200).json(userProfile);
      }
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
  if (req.method === 'PATCH') {
    try {
      console.log('PATCH /api/user/profile - Request body:', req.body);

      const result = await getUserFromToken(req);
      if (!result) {

      const result = await getUserFromToken(req);
      if (!result) {
        console.log('Usuario no autenticado');
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      const { usuario, decoded } = result;

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      const { usuario, decoded } = result;

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      console.log('Usuario encontrado:', { id: (usuario as any)._id, nombre: usuario.nombre });
      console.log('Usuario encontrado:', { id: (usuario as any)._id, nombre: usuario.nombre });

      const { name, email, phone, position, department, bio } = req.body;
      const { name, email, phone, position, department, bio } = req.body;
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

      // Actualizar usando el método correcto según el tipo de usuario
      let usuarioActualizado;
      if (decoded?.type === 'miembro') {
        // Si es miembro, deberías tener un método para actualizar persona
        usuarioActualizado = await personaAdapter.actualizarPerfil((usuario as any)._id.toString(), updateData);
      } else {
        usuarioActualizado = await usuarioDAO.actualizarPerfil((usuario as any)._id.toString(), updateData);
      }

      console.log('Usuario actualizado:', usuarioActualizado ? 'exitoso' : 'falló');

      if (!usuarioActualizado) {
        return res.status(500).json({ error: 'Error al actualizar el usuario' });
      }

      // Construir el perfil actualizado para la respuesta
      let userProfileActualizado;
      if (decoded?.type === 'miembro') {
        userProfileActualizado = {
          id: (usuarioActualizado as any)._id.toString(),
          name: `${usuarioActualizado.nombre} ${usuarioActualizado.apellidos}`,
          email: usuarioActualizado.correo,
          avatar: '',
          phone: '',
          position: (usuarioActualizado as any).rol || '',
          department: '',
          bio: '',
          createdAt: usuarioActualizado.createdAt,
          updatedAt: usuarioActualizado.updatedAt
        };
      } else {
        const usuarioAdminAct = usuarioActualizado as IUsuario;
        userProfileActualizado = {
          id: (usuarioAdminAct as any)._id.toString(),
          name: `${usuarioAdminAct.nombre} ${usuarioAdminAct.apellidos}`,
          email: usuarioAdminAct.correo,
          avatar: usuarioAdminAct.avatar,
          phone: usuarioAdminAct.telefono || '',
          position: usuarioAdminAct.posicion || '',
          department: usuarioAdminAct.departamento || '',
          bio: usuarioAdminAct.biografia || '',
          createdAt: usuarioAdminAct.createdAt,
          updatedAt: usuarioAdminAct.updatedAt
        };
      }
      return res.status(200).json(userProfileActualizado);
      }

      // Construir el perfil actualizado para la respuesta
      let userProfileActualizado;
      if (decoded?.type === 'miembro') {
        userProfileActualizado = {
          id: (usuarioActualizado as any)._id.toString(),
          name: `${usuarioActualizado.nombre} ${usuarioActualizado.apellidos}`,
          email: usuarioActualizado.correo,
          avatar: '',
          phone: '',
          position: (usuarioActualizado as any).rol || '',
          department: '',
          bio: '',
          createdAt: usuarioActualizado.createdAt,
          updatedAt: usuarioActualizado.updatedAt
        };
      } else {
        const usuarioAdminAct = usuarioActualizado as IUsuario;
        userProfileActualizado = {
          id: (usuarioAdminAct as any)._id.toString(),
          name: `${usuarioAdminAct.nombre} ${usuarioAdminAct.apellidos}`,
          email: usuarioAdminAct.correo,
          avatar: usuarioAdminAct.avatar,
          phone: usuarioAdminAct.telefono || '',
          position: usuarioAdminAct.posicion || '',
          department: usuarioAdminAct.departamento || '',
          bio: usuarioAdminAct.biografia || '',
          createdAt: usuarioAdminAct.createdAt,
          updatedAt: usuarioAdminAct.updatedAt
        };
      }
      return res.status(200).json(userProfileActualizado);
    } catch (error) {
      console.error('Error al actualizar el perfil en API:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : error);
      return res.status(500).json({
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
