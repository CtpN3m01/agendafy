import mongoose, { Schema, Document } from 'mongoose';

export interface IReunion extends Document {
  titulo: string;
  organizacion: string;
  hora_inicio: Date;
  hora_fin: Date;
  archivos: string[];
  convocados: string[];
  lugar: string;
  tipo_reunion: 'Extraordinaria' | 'Ordinaria';
  modalidad: 'Presencial' | 'Virtual';
}

const ReunionSchema = new Schema<IReunion>({
  titulo: { type: String, required: true },
  organizacion: { type: String, required: true },
  hora_inicio: { type: Date, required: true },
  hora_fin: { type: Date, required: false },
  archivos: { type: [String], default: [] },
  convocados: { type: [String], default: [], required: true },
  lugar: { type: String, required: true },
  tipo_reunion: {
    type: String,
    enum: ['Extraordinaria', 'Ordinaria'],
    required: true,
  },
  modalidad: {
    type: String,
    enum: ['Presencial', 'Virtual'],
    required: true,
  },
});

export const ReunionModel = mongoose.models.Reunion || mongoose.model<IReunion>('Reuniones', ReunionSchema);