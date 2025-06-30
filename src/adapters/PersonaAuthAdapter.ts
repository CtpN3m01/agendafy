import { AuthService } from '@/services/AuthService';
import { PersonaDAOImpl, IPersonaDAO } from '@/dao/PersonaDAO';
import { IPersona } from '@/models/Persona';
import { PersonaLoginDTO, PersonaAuthResponseDTO, PersonaResponseDTO } from '@/types/PersonaDTO';
import { CrearUsuarioDTO, UsuarioDTO } from '@/types/UsuarioDTO';
import { HashUtil } from '@/lib/hash';
import { AuthUtil } from '@/lib/auth';
import { EmailService } from '@/services/EmailService';

// Interface para documentos de MongoDB con _id
interface IPersonaDocument extends IPersona {
  _id: {
    toString(): string;
  };
}

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
        userId: (persona as IPersonaDocument)._id.toString(),
        email: persona.correo,
        nombreUsuario: `${persona.nombre}_${persona.apellidos}`,
        type: 'miembro', // Identificar que es un miembro, no un usuario
        rol: persona.rol,
        organizacion: persona.organizacion.toString()
      });

      const personaResponse: PersonaResponseDTO = {
        id: (persona as IPersonaDocument)._id.toString(),
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

      await this.personaDAO.actualizarToken((persona as IPersonaDocument)._id.toString(), resetToken, expires);

      // Enviar email de recuperación
      try {
        const emailService = new EmailService();
        await emailService.enviarCorreoRecuperacion(correo, resetToken);
      } catch (emailError) {
        console.error('Error al enviar email de recuperación para persona:', emailError);
        return {
          success: false,
          message: 'Error al enviar el correo de recuperación. Inténtalo de nuevo más tarde.'
        };
      }

      return {
        success: true,
        message: 'Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña.'
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
      await this.personaDAO.actualizarContrasena((persona as IPersona & { _id: { toString(): string } })._id.toString(), hashedPassword);

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
      await this.personaDAO.actualizarContrasena((persona as IPersona & { _id: { toString(): string } })._id.toString(), hashedPassword);

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
}
