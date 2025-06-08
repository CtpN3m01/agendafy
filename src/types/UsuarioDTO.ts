/*
DTO define la forma de los datos que se transferirán entre capas 
(p. ej., del backend al frontend). No está vinculado al modelo de 
base de datos y, por lo general, solo incluye los datos que necesita 
el consumidor.
*/

export interface UsuarioDTO {
  nombreUsuario: string;
  contrasena: string;
}

export interface CrearUsuarioDTO {
  nombreUsuario: string;
  nombre: string;
  apellidos: string;
  correo: string;
  contrasena: string;
}

export interface UsuarioResponseDTO {
  id: string;
  nombreUsuario: string;
  nombre: string;
  apellidos: string;
  correo: string;
  createdAt: Date;
}

export interface LoginResponseDTO {
  success: boolean;
  message: string;
  token?: string;
  user?: UsuarioResponseDTO;
  errors?: Record<string, string[]>;
}

export interface ForgotPasswordDTO {
  correo: string;
}

export interface ResetPasswordDTO {
  token: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}