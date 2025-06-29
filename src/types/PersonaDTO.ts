/*
DTO define la forma de los datos que se transferirán entre capas 
(p. ej., del backend al frontend). No está vinculado al modelo de
base de datos y, por lo general, solo incluye los datos que necesita 
el consumidor.
*/

export interface PersonaDTO {
  nombre: string;
  apellidos: string;
  correo: string;
  rol: 'Presidente' | 'Vicepresidente' | 'Tesorero' | 'Vocal' | 'Miembro' | 'Administrador';
  organizacion: string;
}

export interface CrearPersonaDTO {
  nombre: string;
  apellidos: string;
  correo: string;
  rol: 'Presidente' | 'Vicepresidente' | 'Tesorero' | 'Vocal' | 'Miembro' | 'Administrador';
  organizacion: string;
}

// Nuevos DTOs para el login de Persona
export interface PersonaLoginDTO {
  correo: string;
  contrasena: string;
}

export interface PersonaResponseDTO {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: 'Presidente' | 'Vicepresidente' | 'Tesorero' | 'Vocal' | 'Miembro' | 'Administrador';
  organizacion: string;
  createdAt: Date;
}

export interface PersonaAuthResponseDTO {
  success: boolean;
  message: string;
  token?: string;
  persona?: PersonaResponseDTO;
  errors?: Record<string, string[]>;
}