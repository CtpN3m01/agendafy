import { OrganizacionDAOImpl, IOrganizacionDAO } from '@/dao/OrganizacionDAO';
import { CrearOrganizacionDTO, OrganizacionResponseDTO, ActualizarOrganizacionDTO } from '@/types/OrganizacionDTO';
import { UsuarioModel } from '@/models/Usuario';
import { connectToDatabase } from '@/lib/mongodb';
import { PersonaModel } from '@/models/Persona';

export class OrganizacionService {
  private organizacionDAO: IOrganizacionDAO;

  constructor() {
    this.organizacionDAO = new OrganizacionDAOImpl();
  }

  // Crea una nueva organización
  async crearOrganizacion(organizacionData: CrearOrganizacionDTO): Promise<{
    success: boolean;
    message: string;
    organizacion?: OrganizacionResponseDTO;
    errors?: Record<string, string[]>;
  }> {
    try {      
      // Validar que el usuario existe
      const usuario = await UsuarioModel.findById(organizacionData.usuarioId).exec();
      if (!usuario) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          errors: { general: ['El usuario no existe'] }
        };
      }

      // Validar que el nombre no esté en uso
      const existeNombre = await this.organizacionDAO.buscarPorNombre(organizacionData.nombre);
      if (existeNombre) {
        return {
          success: false,
          message: 'El nombre de la organización ya está en uso',
          errors: { nombre: ['Este nombre ya está en uso'] }
        };
      }

      // Validar que el correo no esté en uso
      const existeCorreo = await this.organizacionDAO.buscarPorCorreo(organizacionData.correo);
      if (existeCorreo) {
        return {
          success: false,
          message: 'El correo ya está registrado',
          errors: { correo: ['Este correo ya está en uso'] }
        };
      }

      // Crear la organización
      const nuevaOrganizacion = await this.organizacionDAO.crearOrganizacion(organizacionData);

      return {
        success: true,
        message: 'Organización creada exitosamente',
        organizacion: nuevaOrganizacion
      };
    } catch (error) {
      console.error('Error detallado en creación de organización:', error);
      
      // Manejar errores específicos de MongoDB
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          return {
            success: false,
            message: 'Ya existe una organización con esos datos',
            errors: { general: ['Nombre o correo ya en uso'] }
          };
        }
        if (error.message.includes('validation failed')) {
          return {
            success: false,
            message: 'Datos de entrada inválidos',
            errors: { general: ['Revisa los datos ingresados'] }
          };
        }
      }
      
      return {
        success: false,
        message: 'Error interno del servidor',
        errors: { general: ['Error interno del servidor'] }
      };
    }
  }

  // Obtiene una organización por su ID
  async obtenerOrganizacion(id: string): Promise<OrganizacionResponseDTO | null> {
    return await this.organizacionDAO.buscarPorId(id);
  }

  // Obtiene todas las organizaciones de un usuario
  async obtenerOrganizacionesPorUsuario(userId: string): Promise<OrganizacionResponseDTO[]> {
    return await this.organizacionDAO.buscarPorUsuario(userId);
  }

  // Actualiza una organización
  async actualizarOrganizacion(
    id: string, 
    datos: ActualizarOrganizacionDTO,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
    organizacion?: OrganizacionResponseDTO;
    errors?: Record<string, string[]>;
  }> {
    try {
      // Verificar que la organización existe y pertenece al usuario
      const organizacion = await this.organizacionDAO.buscarPorId(id);
      if (!organizacion) {
        return {
          success: false,
          message: 'Organización no encontrada',
          errors: { general: ['La organización no existe'] }
        };
      }

      if (organizacion.usuario.id !== userId) {
        return {
          success: false,
          message: 'No tienes permisos para modificar esta organización',
          errors: { general: ['Sin permisos'] }
        };
      }

      // Validar nombre único si se está actualizando
      if (datos.nombre && datos.nombre !== organizacion.nombre) {
        const existeNombre = await this.organizacionDAO.buscarPorNombre(datos.nombre);
        if (existeNombre) {
          return {
            success: false,
            message: 'El nombre de la organización ya está en uso',
            errors: { nombre: ['Este nombre ya está en uso'] }
          };
        }
      }

      // Validar correo único si se está actualizando
      if (datos.correo && datos.correo !== organizacion.correo) {
        const existeCorreo = await this.organizacionDAO.buscarPorCorreo(datos.correo);
        if (existeCorreo) {
          return {
            success: false,
            message: 'El correo ya está registrado',
            errors: { correo: ['Este correo ya está en uso'] }
          };
        }
      }

      const organizacionActualizada = await this.organizacionDAO.actualizarOrganizacion(id, datos);

      return {
        success: true,
        message: 'Organización actualizada exitosamente',
        organizacion: organizacionActualizada!
      };
    } catch (error) {
      console.error('Error en actualización de organización:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        errors: { general: ['Error interno del servidor'] }
      };
    }
  }

  // Elimina una organización
  async eliminarOrganizacion(id: string, userId: string): Promise<{
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
  }> {
    try {      
      // Verificar que la organización existe y pertenece al usuario
      const organizacion = await this.organizacionDAO.buscarPorId(id);
      if (!organizacion) {
        return {
          success: false,
          message: 'Organización no encontrada',
          errors: { general: ['La organización no existe o fue eliminada previamente'] }
        };
      }

      if (organizacion.usuario.id !== userId) {
        return {
          success: false,
          message: 'No tienes permisos para eliminar esta organización',
          errors: { general: ['Solo el propietario puede eliminar la organización'] }
        };
      }
      
      // Verificar si tiene reuniones activas
      if (organizacion.reuniones && organizacion.reuniones.length > 0) {
        console.log(`Organización ${id} tiene ${organizacion.reuniones.length} reuniones asociadas`);
        // Podrías decidir si permitir eliminación o no
      }

      // Verificar si tiene miembros
      if (organizacion.miembros && organizacion.miembros.length > 0) {
        console.log(`Organización ${id} tiene ${organizacion.miembros.length} miembros asociados`);
      }

      const eliminada = await this.organizacionDAO.eliminarOrganizacion(id);

      if (!eliminada) {
        return {
          success: false,
          message: 'No se pudo eliminar la organización',
          errors: { general: ['Error al procesar la eliminación'] }
        };
      }

      console.log(`Organización ${id} eliminada exitosamente por usuario ${userId}`);

      return {
        success: true,
        message: 'Organización eliminada exitosamente'
      };
    } catch (error) {
      console.error('Error en eliminación de organización:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        errors: { general: ['Error interno del servidor'] }
      };
    }
  }

  // Obtiene los miembros de la junta directiva de una organización
  async obtenerMiembrosJunta(id: string): Promise<Array<{
    nombre: string;
    correo: string;
    esMiembro: boolean;
  }> | null> {
    try {
      const organizacion = await this.organizacionDAO.buscarPorId(id);
      
      if (!organizacion) {
        return null;
      }

      // Mapear los miembros al formato requerido
      const miembrosJunta = organizacion.miembros.map(miembro => ({
        nombre: `${miembro.nombre} ${miembro.apellidos}`.trim(),
        correo: miembro.correo,
        esMiembro: true
      }));

      return miembrosJunta;
    } catch (error) {
      console.error('Error en obtener miembros de la junta:', error);
      throw error;
    }
  }

  // Agregar miembro a la junta directiva
  async agregarMiembroJunta(organizacionId: string, datos: {
    nombre: string;
    apellidos: string;
    correo: string;
    rol?: string;
  }): Promise<{
    success: boolean;
    message: string;
    miembro?: any;
    errors?: Record<string, string[]>;
  }> {
    try {
      // Verificar que la organización existe
      const organizacion = await this.organizacionDAO.buscarPorId(organizacionId);
      if (!organizacion) {
        return {
          success: false,
          message: 'Organización no encontrada',
          errors: { general: ['La organización no existe'] }
        };
      }

      // Verificar si el correo ya está en uso por otro miembro
      const miembroExistente = await PersonaModel.findOne({ 
        correo: datos.correo.toLowerCase(),
        organizacion: organizacionId // ← Buscar solo dentro de esta organización
      }).exec();

      if (miembroExistente) {
        // Verificar si ya es miembro de esta organización
        const yaEsMiembro = organizacion.miembros.some(m => m.id === miembroExistente._id.toString());
        if (yaEsMiembro) {
          return {
            success: false,
            message: 'El correo ya está registrado como miembro',
            errors: { correo: ['Este correo ya pertenece a un miembro de la organización'] }
          };
        }
        
        // Actualizar datos si la persona ya existe pero no es miembro
        await PersonaModel.findByIdAndUpdate(miembroExistente._id, {
          nombre: datos.nombre,
          apellidos: datos.apellidos,
          correo: datos.correo.toLowerCase(),
          rol: datos.rol || 'Miembro',
          organizacion: organizacionId // ← Asegurar que tiene la organización
        }).exec();

        // Agregar a la organización
        await this.organizacionDAO.agregarMiembro(organizacionId, miembroExistente._id.toString());

        return {
          success: true,
          message: 'Miembro agregado exitosamente',
          miembro: {
            id: miembroExistente._id.toString(),
            nombre: datos.nombre,
            apellidos: datos.apellidos,
            correo: datos.correo.toLowerCase(),
            rol: datos.rol || 'Miembro',
            esMiembro: true
          }
        };
      } else {
        // Crear nueva persona
        const nuevaPersona = new PersonaModel({
          nombre: datos.nombre,
          apellidos: datos.apellidos,
          correo: datos.correo.toLowerCase(),
          rol: datos.rol || 'Miembro',
          organizacion: organizacionId
        });

        const personaGuardada = await nuevaPersona.save();

        // Agregar a la organización
        await this.organizacionDAO.agregarMiembro(organizacionId, personaGuardada._id.toString());

        return {
          success: true,
          message: 'Miembro agregado exitosamente',
          miembro: {
            id: personaGuardada._id.toString(),
            nombre: personaGuardada.nombre,
            apellidos: personaGuardada.apellidos,
            correo: personaGuardada.correo,
            rol: personaGuardada.rol,
            esMiembro: true
          }
        };
      }

    } catch (error) {
      console.error('Error al agregar miembro:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        errors: { general: ['Error interno del servidor'] }
      };
    }
  }

  // Actualizar miembro de la junta directiva
  async actualizarMiembroJunta(organizacionId: string, miembroId: string, datos: {
    nombre?: string;
    apellidos?: string;
    correo?: string;
    rol?: string;
  }): Promise<{
    success: boolean;
    message: string;
    miembro?: any;
    errors?: Record<string, string[]>;
  }> {
    try {
      // Verificar que la organización existe
      const organizacion = await this.organizacionDAO.buscarPorId(organizacionId);
      if (!organizacion) {
        return {
          success: false,
          message: 'Organización no encontrada',
          errors: { general: ['La organización no existe'] }
        };
      }

      // Verificar que el miembro pertenece a la organización
      const esMiembro = organizacion.miembros.some(m => m.id === miembroId);
      if (!esMiembro) {
        return {
          success: false,
          message: 'El miembro no pertenece a esta organización',
          errors: { general: ['Miembro no encontrado en la organización'] }
        };
      }

      // Verificar si el nuevo correo ya está en uso por otro miembro
      if (datos.correo) {
        const miembroConCorreo = await PersonaModel.findOne({ 
          correo: datos.correo.toLowerCase() 
        }).exec();
        
        if (miembroConCorreo && miembroConCorreo._id.toString() !== miembroId) {
          return {
            success: false,
            message: 'El correo ya está en uso por otro miembro',
            errors: { correo: ['Este correo ya está registrado'] }
          };
        }
      }

      // Actualizar datos del miembro
      const datosActualizacion: any = {};
      if (datos.nombre) datosActualizacion.nombre = datos.nombre;
      if (datos.apellidos) datosActualizacion.apellidos = datos.apellidos;
      if (datos.correo) datosActualizacion.correo = datos.correo.toLowerCase();
      if (datos.rol) datosActualizacion.rol = datos.rol;

      const miembroActualizado = await PersonaModel.findByIdAndUpdate(
        miembroId, 
        datosActualizacion, 
        { new: true }
      ).exec();

      if (!miembroActualizado) {
        return {
          success: false,
          message: 'Error al actualizar el miembro',
          errors: { general: ['No se pudo actualizar el miembro'] }
        };
      }

      return {
        success: true,
        message: 'Miembro actualizado exitosamente',
        miembro: {
          id: miembroActualizado._id.toString(),
          nombre: miembroActualizado.nombre,
          apellidos: miembroActualizado.apellidos,
          correo: miembroActualizado.correo,
          rol: miembroActualizado.rol,
          esMiembro: true
        }
      };

    } catch (error) {
      console.error('Error al actualizar miembro:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        errors: { general: ['Error interno del servidor'] }
      };
    }
  }

  // Eliminar miembro de la junta directiva (SOFT DELETE - solo del array miembros)
  async eliminarMiembroJunta(organizacionId: string, miembroId: string): Promise<{
    success: boolean;
    message: string;
    miembroEliminado?: any;
    errors?: Record<string, string[]>;
  }> {
    try {
      // Verificar que la organización existe
      const organizacion = await this.organizacionDAO.buscarPorId(organizacionId);
      if (!organizacion) {
        return {
          success: false,
          message: 'Organización no encontrada',
          errors: { general: ['La organización no existe'] }
        };
      }

      // Verificar que el miembro pertenece a la organización
      const esMiembro = organizacion.miembros.some(m => m.id === miembroId);
      if (!esMiembro) {
        return {
          success: false,
          message: 'El miembro no pertenece a esta organización',
          errors: { general: ['Miembro no encontrado en la organización'] }
        };
      }

      // Obtener datos del miembro antes de removerlo del array
      const miembro = await PersonaModel.findById(miembroId).exec();
      if (!miembro) {
        return {
          success: false,
          message: 'Miembro no encontrado',
          errors: { general: ['El miembro no existe en la base de datos'] }
        };
      }

      // Guardar datos del miembro para la respuesta
      const datosEliminado = {
        id: miembro._id.toString(),
        nombre: miembro.nombre,
        apellidos: miembro.apellidos,
        correo: miembro.correo,
        rol: miembro.rol
      };

      // SOFT DELETE - Solo eliminar del array miembros de la organización
      // NO eliminar el registro de PersonaModel
      await this.organizacionDAO.eliminarMiembro(organizacionId, miembroId);

      return {
        success: true,
        message: 'Miembro removido de la junta directiva exitosamente',
        miembroEliminado: datosEliminado
      };

    } catch (error) {
      console.error('Error al eliminar miembro:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        errors: { general: ['Error interno del servidor'] }
      };
    }
  }
}

