import mongoose, { Schema, Document } from 'mongoose';

/*
La enumeración TipoPunto define los tipos de puntos que pueden existir en una agenda.
Cada punto puede ser de tipo 'Informativo', 'Aprobacion' o 'Fondo'.
*/

export enum TipoPunto {
  Informativo = 'Informativo',
  Aprobacion = 'Aprobacion',
  Fondo = 'Fondo',
}

/*
La interfaz IPunto define la estructura de un documento de punto en una agenda.
Cada punto tiene un título, un tipo (que es una de las opciones de TipoPunto: Informativo, Aprobacion o Fondo), 
una duración, comentarios, un expositor y una lista de archivos asociados.
*/

export interface IPunto extends Document {
  titulo: string;
  comentarios: string; 
  duracion: number;
  tipo: TipoPunto;
  votosAFavor?: number;
  votosEnContra?: number;
  decisiones?: string[];
  expositor: string;
  archivos?: string[];
  agenda: mongoose.Types.ObjectId;
}

/*
PuntoSchema define el esquema de Mongoose para la colección de puntos.
Cada punto tiene un campo 'titulo' que es una cadena de texto, un campo 'tipo'
*/

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
  votosAFavor: { type: Number, default: 0 },
  votosEnContra: { type: Number, default: 0 },
  decisiones: { type: [String], default: [] },
  agenda: { type: Schema.Types.ObjectId, ref: 'Agenda', required: true }, // <-- Referencia a la agenda
}, { discriminatorKey: 'tipo', collection: 'Puntos' });

export const PuntoModel =
  mongoose.models.Punto || mongoose.model<IPunto>('Punto', PuntoSchema);
