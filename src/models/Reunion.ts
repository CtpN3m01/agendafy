import mongoose, { Schema, Document } from 'mongoose';

/*
Esta interfaz define la estructura de un documento
de reunión en la base de datos.
Incluye campos como título, organización, hora de inicio y fin, archivos adjuntos,
convocados, lugar, tipo de reunión, modalidad, agenda y puntos.
*/

export interface IReunion extends Document {
  _id: mongoose.Types.ObjectId;
  titulo: string;
  organizacion: mongoose.Types.ObjectId; // Cambiado a referencia de Organizacion
  hora_inicio: Date;
  hora_fin: Date;
  archivos: string[];
  convocados: string[];
  lugar: string;
  tipo_reunion: 'Extraordinaria' | 'Ordinaria';
  modalidad: 'Presencial' | 'Virtual';
  agenda: mongoose.Types.ObjectId; // Cambiado a referencia de Agenda
}

/*
ReunionSchema define el esquema de Mongoose para el modelo Reunion.
Incluye los campos requeridos y sus tipos de datos.
*/

const ReunionSchema = new Schema<IReunion>({
  _id: { type: Schema.Types.ObjectId, required: true },
  titulo: { type: String, required: true },
  organizacion: { type: Schema.Types.ObjectId, ref: 'Organizacion', required: true },
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
  agenda: { type: Schema.Types.ObjectId, required: true },
});

/*
ReunionModel es el modelo de Mongoose que se utiliza
para interactuar con la colección 'Reuniones' en la base de datos.
*/

export const ReunionModel =
  mongoose.models.Reunion || mongoose.model<IReunion>('Reunion', ReunionSchema);