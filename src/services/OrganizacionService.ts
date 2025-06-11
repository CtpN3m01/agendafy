import { OrganizacionDAOImpl, IOrganizacionDAO } from '@/dao/OrganizacionDAO';
import { CrearOrganizacionDTO, OrganizacionResponseDTO, ActualizarOrganizacionDTO } from '@/types/OrganizacionDTO';
import { UsuarioModel } from '@/models/Usuario';
import { connectToDatabase } from '@/lib/mongodb';

export class OrganizacionService {
  private organizacionDAO: IOrganizacionDAO;

  constructor() {
    this.organizacionDAO = new OrganizacionDAOImpl();
  }

  async crearOrganizacion(organizacionData: CrearOrganizacionDTO): Promise<{
    success: boolean;
    message: string;
    organizacion?: OrganizacionResponseDTO;
    errors?: Record<string, string[]>;
  }> {
    try {
      await connectToDatabase();
      
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

  async obtenerOrganizacion(id: string): Promise<OrganizacionResponseDTO | null> {
    return await this.organizacionDAO.buscarPorId(id);
  }

  async obtenerOrganizacionesPorUsuario(userId: string): Promise<OrganizacionResponseDTO[]> {
    return await this.organizacionDAO.buscarPorUsuario(userId);
  }

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

  async eliminarOrganizacion(id: string, userId: string): Promise<{
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
  }> {
    try {
      await connectToDatabase();
      
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
}