/*
Tipos compartidos para puntos de agenda
Estos tipos pueden ser usados tanto en el cliente como en el servidor
*/

export enum TipoPunto {
  Informativo = 'Informativo',
  Aprobacion = 'Aprobacion',
  Fondo = 'Fondo',
}

export interface PuntoBase {
  titulo: string;
  detalles?: string;
  anotaciones?: string; 
  duracion: number;
  tipo: TipoPunto;
  votosAFavor?: number;
  votosEnContra?: number;
  decisiones?: string[];
  expositor: string;
  archivos?: string[];
}