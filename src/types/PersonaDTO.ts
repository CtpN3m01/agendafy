export interface PersonaDTO {
  nombre: string;
  apellidos: string;
  correo: string;
  rol: 'Presidente' | 'SubPresidente' | 'Tesorero' | 'Vocal';
  organizacion: string;
}

export interface CrearPersonaDTO {
  nombre: string;
  apellidos: string;
  correo: string;
  rol: 'Presidente' | 'SubPresidente' | 'Tesorero' | 'Vocal';
  organizacion: string;
}