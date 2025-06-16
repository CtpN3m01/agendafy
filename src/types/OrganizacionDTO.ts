export interface OrganizacionDTO {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  logo?: string; 
}

export interface CrearOrganizacionDTO {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  logo?: Buffer; 
  usuarioId: string;
}

export interface OrganizacionResponseDTO {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  logo?: string; 
  miembros: Array<{
    id: string;
    nombre: string;
    apellidos: string;
    correo: string;
    rol: string;
  }>;
  reuniones: Array<{
    id: string;
    titulo: string;
    fecha: Date;
  }>;
  usuario: {
    id: string;
    nombre: string;
    correo: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ActualizarOrganizacionDTO {
  nombre?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  logo?: Buffer; 
}