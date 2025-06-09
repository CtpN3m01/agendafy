import { TipoPunto } from '@/models/Punto';
import mongoose from 'mongoose';
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
  comentarios?: string;
  expositor: string;
  archivos?: string[];
  idReunion: mongoose.Types.ObjectId; // ID de la reunión a la que pertenece el punto
  // Para Aprobacion
  votosAFavor?: number;
  votosEnContra?: number;
  // Para Fondo
  decisiones?: string[];
}