import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAgenda extends Document {
  titulo: string;
  puntos: Types.ObjectId[]; // IDs de puntos
}

const AgendaSchema = new Schema<IAgenda>({
  titulo: { type: String, required: true },
  puntos: [{ type: Schema.Types.ObjectId, ref: 'Punto', default: [] }]
});

export const AgendaModel =
  mongoose.models.Agenda ||
  mongoose.model<IAgenda>('Agendas', AgendaSchema);
