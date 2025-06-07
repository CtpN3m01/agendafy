import { TipoPunto } from '@/models/Punto';

export interface CrearPuntoDTO {
  titulo: string;
  tipo: TipoPunto;
  duracion: number;
  comentarios?: string;
  expositor: string;
  archivos?: string[];
  // Para Aprobacion
  votosAFavor?: number;
  votosEnContra?: number;
  // Para Fondo
  decisiones?: string[];
}