import mongoose, { Schema, Document } from 'mongoose';
import { IPunto, PuntoSchema } from './Punto';

export interface IAgenda extends Document {
  titulo: string;
  puntos: IPunto[];
}

const AgendaSchema = new Schema<IAgenda>({
  titulo: { type: String, required: true },
  puntos: { type: [PuntoSchema], default: []}
});

export const AgendaModel =
  mongoose.models.Agenda ||
  mongoose.model<IAgenda>('Agendas', AgendaSchema);
