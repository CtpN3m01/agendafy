import { AuthService } from '@/services/AuthService';
import { PersonaDAOImpl, IPersonaDAO } from '@/dao/PersonaDAO';
import { IPersona } from '@/models/Persona';
import { PersonaLoginDTO, PersonaAuthResponseDTO, PersonaResponseDTO } from '@/types/PersonaDTO';
import { CrearUsuarioDTO, UsuarioDTO } from '@/types/UsuarioDTO';
import { CrearPersonaDTO } from '@/types/PersonaDTO';
import { HashUtil } from '@/lib/hash';
import { AuthUtil } from '@/lib/auth';

/**
 * Adaptador que permite a las entidades Persona utilizar el AuthService
 * diseñado originalmente para Usuario.
 * 
 * Este adaptador implementa el patrón Adapter, convirtiendo las interfaces
 * de Persona para que sean compatibles con AuthService.
 */
export class PersonaAuthAdapter {

  private authService: AuthService;
  private personaDAO: IPersonaDAO;

  constructor() {
    this.authService = new AuthService();
    this.personaDAO = new PersonaDAOImpl();
  }

  /**
   * Permite que una Persona inicie sesión adaptando sus datos
   * al formato esperado por AuthService
   */
  async iniciarSesionPersona(loginData: PersonaLoginDTO): Promise<PersonaAuthResponseDTO> {
    try {
      // Buscar la persona por correo
      const persona = await this.personaDAO.buscarPorCorreo(loginData.correo);
      
      if (!persona) {
        return {
          success: false,
          message: 'Credenciales incorrectas',
          errors: { general: ['Correo o contraseña incorrectos'] }
        };
      }

      // Verificar que la persona tenga contraseña (puede hacer login)
      if (!persona.contrasena) {
        return {
          success: false,
          message: 'Esta cuenta no tiene acceso de login',
          errors: { general: ['Contacte al administrador para activar su acceso'] }
        };
      }

      // Verificar contraseña
      const passwordValida = await HashUtil.compare(loginData.contrasena, persona.contrasena);
      if (!passwordValida) {
        return {
          success: false,
          message: 'Credenciales incorrectas',
          errors: { general: ['Correo o contraseña incorrectos'] }
        };
      }

      // Generar token con información de la persona
      const token = AuthUtil.generateToken({
        userId: persona.id,
        email: persona.correo,
        nombreUsuario: `${persona.nombre}_${persona.apellidos}`,
        type: 'miembro', // Identificar que es una persona miembro, no un usuario
        rol: persona.rol,
        organizacion: persona.organizacion.toString()
      });

      const personaResponse: PersonaResponseDTO = {
        id: persona.id,
        nombre: persona.nombre,
        apellidos: persona.apellidos,
        correo: persona.correo,
        rol: persona.rol,
        organizacion: persona.organizacion.toString(),
        createdAt: persona.createdAt
      };

      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        token,
        persona: personaResponse
      };
    } catch (error) {
      console.error('Error en login de persona:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        errors: { general: ['Error interno del servidor'] }
      };
    }
  }

  /**
   * Permite solicitar recuperación de contraseña para una Persona
   */
  async solicitarRecuperacionPersona(correo: string): Promise<{ success: boolean; message: string }> {
    try {
      const persona = await this.personaDAO.buscarPorCorreo(correo);
      if (!persona) {
        return {
          success: false,
          message: 'No se encontró una cuenta con ese correo'
        };
      }

      // Verificar que la persona tenga contraseña (puede hacer login)
      if (!persona.contrasena) {
        return {
          success: false,
          message: 'Esta cuenta no tiene acceso de login. Contacte al administrador.'
        };
      }

      const resetToken = AuthUtil.generateResetToken();
      const expires = AuthUtil.getResetTokenExpiration();

      await this.personaDAO.actualizarToken(persona.id, resetToken, expires);

      // TODO: Aquí se podría implementar el envío de email específico para personas
      // Por ahora solo retornamos éxito con el token generado

      return {
        success: true,
        message: 'Se ha generado el token de recuperación. Verifica la configuración de email para recibir instrucciones.'
      };
    } catch (error) {
      console.error('Error en recuperación de persona:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Permite restablecer la contraseña de una Persona
   */
  async restablecerContrasenaPersona(token: string, nuevaContrasena: string): Promise<{ success: boolean; message: string }> {
    try {
      const persona = await this.personaDAO.buscarPorResetToken(token);
      if (!persona) {
        return {
          success: false,
          message: 'Token inválido o expirado'
        };
      }

      const hashedPassword = await HashUtil.hash(nuevaContrasena);
      await this.personaDAO.actualizarContrasena(persona.id, hashedPassword);

      return {
        success: true,
        message: 'Contraseña restablecida exitosamente'
      };
    } catch (error) {
      console.error('Error en restablecimiento de persona:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Permite establecer una contraseña para una Persona que previamente no tenía
   * (útil cuando el CEO agrega personas a la junta directiva)
   */
  async establecerContrasenaPersona(correo: string, nuevaContrasena: string): Promise<{ success: boolean; message: string }> {
    try {
      const persona = await this.personaDAO.buscarPorCorreo(correo);
      if (!persona) {
        return {
          success: false,
          message: 'No se encontró la persona con ese correo'
        };
      }

      const hashedPassword = await HashUtil.hash(nuevaContrasena);
      await this.personaDAO.actualizarContrasena(persona.id, hashedPassword);

      return {
        success: true,
        message: 'Contraseña establecida exitosamente. Ya puedes iniciar sesión.'
      };
    } catch (error) {
      console.error('Error al establecer contraseña:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Convierte datos de Persona a formato Usuario para usar AuthService
   * (método auxiliar para futuras extensiones)
   */
  private adaptarPersonaAUsuario(persona: IPersona): CrearUsuarioDTO {
    return {
      nombreUsuario: `${persona.nombre}_${persona.apellidos}`.toLowerCase().replace(/\s+/g, '_'),
      nombre: persona.nombre,
      apellidos: persona.apellidos,
      correo: persona.correo,
      contrasena: persona.contrasena || ''
    };
  }

  /**
   * Convierte datos de login de Persona a formato Usuario
   * (método auxiliar para futuras extensiones)
   */
  private adaptarLoginPersonaAUsuario(loginData: PersonaLoginDTO): UsuarioDTO {
    return {
      nombreUsuario: loginData.correo, // Usar correo como nombre de usuario
      contrasena: loginData.contrasena
    };
  }

  /* 
   * Funcion que utiliza el personaDAO para buscar un usuario por id 
  */

  async buscarPorId(id: string) {
    return this.personaDAO.buscarPorId(id);
  }

  /**
   * Actualiza el perfil de una Persona usando personaDAO
   */
  async actualizarPerfil(id: string, datos: Partial<IPersona>): Promise<IPersona | null> {
    try {
      console.log('PersonaAuthAdapter: actualizarPerfil - ID:', id);
      console.log('PersonaAuthAdapter: actualizarPerfil - Datos:', datos);

      // Obtener los datos actuales de la persona
      const personaActual = await this.personaDAO.buscarPorId(id);
      if (!personaActual) {
        throw new Error('Persona no encontrada');
      }

      // Adaptar el campo organizacion si existe y es ObjectId
      const datosAdaptados = { ...datos };
      
      // Construir el objeto completo para el DAO
      const datosCompletos: CrearPersonaDTO = {
        nombre: datosAdaptados.nombre ?? personaActual.nombre,
        apellidos: datosAdaptados.apellidos ?? personaActual.apellidos,
        correo: datosAdaptados.correo ?? personaActual.correo,
        rol: datosAdaptados.rol ?? personaActual.rol,
        organizacion: datosAdaptados.organizacion 
          ? (typeof datosAdaptados.organizacion === 'string' 
              ? datosAdaptados.organizacion 
              : datosAdaptados.organizacion.toString())
          : personaActual.organizacion.toString(),
      };

      const resultado = await this.personaDAO.actualizarPersona(id, datosCompletos);
      console.log('PersonaAuthAdapter: actualizarPerfil - Resultado:', resultado ? 'exitoso' : 'falló');
      return resultado;
    } catch (error) {
      console.error('PersonaAuthAdapter: Error en actualizarPerfil:', error);
      throw error;
    }
  }

  /*
  * Verifica si un ID corresponde a una persona (miembro) existente
  */
  async esMiembro(id: string): Promise<boolean> {
    try {
      const persona = await this.personaDAO.buscarPorId(id);
      return !!persona;
    } catch (error) {
      console.error('PersonaAuthAdapter: Error en esMiembro:', error);
      return false;
    }
  }

}
