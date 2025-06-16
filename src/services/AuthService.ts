import { UsuarioDAOImpl, IUsuarioDAO } from '@/dao/UsuarioDAO';
import { CrearUsuarioDTO, UsuarioDTO, LoginResponseDTO, UsuarioResponseDTO } from '@/types/UsuarioDTO';
import { HashUtil } from '@/lib/hash';
import { AuthUtil } from '@/lib/auth';
import { EmailService } from './EmailService';

export class AuthService {
  private usuarioDAO: IUsuarioDAO;
  private emailService: EmailService;

  constructor() {
    this.usuarioDAO = new UsuarioDAOImpl();
    this.emailService = new EmailService();
  }

  async registrarUsuario(usuarioData: CrearUsuarioDTO): Promise<LoginResponseDTO> {
    try {
      // Validar si el usuario ya existe
      const existeCorreo = await this.usuarioDAO.buscarPorCorreo(usuarioData.correo);
      if (existeCorreo) {
        return {
          success: false,
          message: 'El correo ya está registrado',
          errors: { correo: ['Este correo ya está en uso'] }
        };
      }

      const existeUsuario = await this.usuarioDAO.buscarPorNombreUsuario(usuarioData.nombreUsuario);
      if (existeUsuario) {
        return {
          success: false,
          message: 'El nombre de usuario ya está en uso',
          errors: { nombreUsuario: ['Este nombre de usuario ya está en uso'] }
        };
      }

      // Hashear contraseña
      const hashedPassword = await HashUtil.hash(usuarioData.contrasena);

      // Crear usuario
      const nuevoUsuario = await this.usuarioDAO.crearUsuario({
        ...usuarioData,
        contrasena: hashedPassword
      });

      // Generar token
      const token = AuthUtil.generateToken({
        userId: nuevoUsuario.id,
        email: nuevoUsuario.correo,
        nombreUsuario: nuevoUsuario.nombreUsuario
      });

      // Intentar enviar correo de bienvenida (no bloquear el registro si falla)
      try {
        await this.emailService.enviarCorreoBienvenida(nuevoUsuario.correo, nuevoUsuario.nombre);
        console.log('Correo de bienvenida enviado exitosamente');
      } catch (emailError) {
        console.warn('No se pudo enviar el correo de bienvenida:', emailError instanceof Error ? emailError.message : 'Error desconocido');
        // No fallar el registro por un error de email
      }

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        token,
        user: nuevoUsuario
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        errors: { general: ['Error interno del servidor'] }
      };
    }
  }

  async iniciarSesion(loginData: UsuarioDTO): Promise<LoginResponseDTO> {
    try {
      // Buscar usuario por nombre de usuario o correo
      let usuario = await this.usuarioDAO.buscarPorNombreUsuario(loginData.nombreUsuario);
      if (!usuario) {
        usuario = await this.usuarioDAO.buscarPorCorreo(loginData.nombreUsuario);
      }

      if (!usuario) {
        return {
          success: false,
          message: 'Credenciales incorrectas',
          errors: { general: ['Usuario o contraseña incorrectos'] }
        };
      }

      // Verificar contraseña
      const passwordValida = await HashUtil.compare(loginData.contrasena, usuario.contrasena);
      if (!passwordValida) {
        return {
          success: false,
          message: 'Credenciales incorrectas',
          errors: { general: ['Usuario o contraseña incorrectos'] }
        };
      }
      // Generar token
      const token = AuthUtil.generateToken({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: (usuario as any)._id.toString(),
        email: usuario.correo,
        nombreUsuario: usuario.nombre_usuario
      });

      const userResponse: UsuarioResponseDTO = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (usuario as any)._id.toString(),
        nombreUsuario: usuario.nombre_usuario,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        createdAt: usuario.createdAt
      };

      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        token,
        user: userResponse
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        errors: { general: ['Error interno del servidor'] }
      };
    }
  }

  async solicitarRecuperacion(correo: string): Promise<{ success: boolean; message: string }> {
    try {
      const usuario = await this.usuarioDAO.buscarPorCorreo(correo);
      if (!usuario) {
        return {
          success: false,
          message: 'No se encontró una cuenta con ese correo'
        };
      }      const resetToken = AuthUtil.generateResetToken();
      const expires = AuthUtil.getResetTokenExpiration();      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.usuarioDAO.actualizarToken((usuario as any)._id.toString(), resetToken, expires);
      
      // Intentar enviar correo de recuperación
      try {
        await this.emailService.enviarCorreoRecuperacion(correo, resetToken);
        console.log('Correo de recuperación enviado exitosamente');
      } catch (emailError) {
        console.warn('No se pudo enviar el correo de recuperación:', emailError instanceof Error ? emailError.message : 'Error desconocido');
        // Aún consideramos exitoso el proceso aunque no se envíe el email
      }

      return {
        success: true,
        message: 'Se ha generado el token de recuperación. Verifica la configuración de email para recibir instrucciones.'
      };
    } catch (error) {
      console.error('Error en recuperación:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  async restablecerContrasena(token: string, nuevaContrasena: string): Promise<{ success: boolean; message: string }> {
    try {
      const usuario = await this.usuarioDAO.buscarPorResetToken(token);
      if (!usuario) {
        return {
          success: false,
          message: 'Token inválido o expirado'
        };
      }
      const hashedPassword = await HashUtil.hash(nuevaContrasena);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.usuarioDAO.actualizarContrasena((usuario as any)._id.toString(), hashedPassword);

      return {
        success: true,
        message: 'Contraseña restablecida exitosamente'
      };
    } catch (error) {
      console.error('Error en restablecimiento:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }
}