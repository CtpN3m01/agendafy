import mongoose, { Schema, Document } from 'mongoose';

export enum TipoPunto {
  Aprobacion = 'Aprobacion',
  Fondo = 'Fondo',
}

export interface IPunto extends Document {
  titulo: string;
  comentarios: string; // <-- Cambiado de descripcion a comentarios
  duracion: number;
  tipo: TipoPunto;
  votosAFavor?: number;
  votosEnContra?: number;
  decisiones?: string[];
  expositor: string;
  archivos?: string[];
}

export const PuntoSchema = new Schema<IPunto>({
  titulo: { type: String, required: true },
  tipo: {
    type: String,
    enum: Object.values(TipoPunto),
    required: true,
  },
  duracion: { type: Number, required: true },
  comentarios: { type: String, default: '' },
  expositor: { type: String, required: true },
  archivos: { type: [String], default: [] },
}, { discriminatorKey: 'tipo', collection: 'Puntos' });

export const PuntoModel =
  mongoose.models.Punto || mongoose.model<IPunto>('Punto', PuntoSchema);
