import { TipoPunto } from '@/models/Punto';

/*
DTO define la forma de los datos que se transferirán entre capas 
(p. ej., del backend al frontend). No está vinculado al modelo de 
base de datos y, por lo general, solo incluye los datos que necesita 
el consumidor.
*/

export interface CrearPuntoDTO {
  titulo: string;
  tipo: TipoPunto;
  duracion: number;
  detalles?: string; // Detalles de lo que se va a tratar en el punto
  anotaciones?: string;
  expositor: string;
  archivos?: string[];
  // Para Aprobacion
  votosAFavor?: number;
  votosEnContra?: number;
  // Para Fondo
  decisiones?: string[];
  agenda: string; // ID de la agenda como string
}

export interface ActualizarPuntoDTO {
  titulo?: string;
  tipo?: TipoPunto;
  duracion?: number;
  detalles?: string; // Detalles de lo que se va a tratar en el punto
  anotaciones?: string;
  expositor?: string;
  archivos?: string[];
  votosAFavor?: number;
  votosEnContra?: number;
  decisiones?: string[];
}

export interface PuntoResponseDTO {
  id: string;
  titulo: string;
  tipo: TipoPunto;
  duracion: number;
  detalles?: string; // Detalles de lo que se va a tratar en el punto
  anotaciones?: string;
  expositor: string;
  archivos?: string[];
  // Para Aprobacion
  votosAFavor?: number;
  votosEnContra?: number;
  // Para Fondo
  decisiones?: string[];
  agenda: string; // ID de la agenda como string
}

export interface ActualizarPuntoDTO {
  titulo?: string;
  tipo?: TipoPunto;
  duracion?: number;
  detalles?: string; // Detalles de lo que se va a tratar en el punto
  anotaciones?: string;
  expositor?: string;
  archivos?: string[];
  votosAFavor?: number;
  votosEnContra?: number;
  decisiones?: string[];
}