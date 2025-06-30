import type { NextApiRequest, NextApiResponse } from 'next';
import { PersonaDAOImpl } from '@/dao/PersonaDAO';
import { CrearPersonaDTO } from '@/types/PersonaDTO';
import { HashUtil } from '@/lib/hash';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { nombre, apellidos, correo, rol, organizacion, contrasena } = req.body;

    // Validación básica
    if (!nombre || !apellidos || !correo || !rol || !organizacion) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Validar contraseña si se proporciona
    if (contrasena && contrasena.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const personaDAO = new PersonaDAOImpl();

    // Verificar si ya existe una persona con ese correo
    const existePersona = await personaDAO.buscarPorCorreo(correo);
    if (existePersona) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una persona con ese correo electrónico'
      });
    }

    // Preparar datos de la persona
    const personaData: CrearPersonaDTO & { contrasena?: string } = {
      nombre,
      apellidos,
      correo,
      rol,
      organizacion
    };

    // Si se proporciona contraseña, hashearla
    if (contrasena) {
      personaData.contrasena = await HashUtil.hash(contrasena);
    }

    // Crear la persona
    const nuevaPersona = await personaDAO.crearPersona(personaData);

    // Preparar respuesta sin contraseña
    const respuesta = {
      id: (nuevaPersona as typeof nuevaPersona & { _id: { toString(): string } })._id.toString(),
      nombre: nuevaPersona.nombre,
      apellidos: nuevaPersona.apellidos,
      correo: nuevaPersona.correo,
      rol: nuevaPersona.rol,
      organizacion: nuevaPersona.organizacion.toString(),
      tieneContrasena: !!contrasena
    };

    return res.status(201).json({
      success: true,
      message: contrasena 
        ? 'Miembro creado exitosamente con acceso al sistema'
        : 'Miembro creado exitosamente. Podrá establecer su contraseña más tarde',
      persona: respuesta
    });

  } catch (error) {
    console.error('Error al crear persona:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}
