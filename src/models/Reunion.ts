import mongoose, { Schema, Document } from 'mongoose';

/*
Esta interfaz define la estructura de un documento
de reunión en la base de datos.
Incluye campos como título, organización, hora de inicio y fin, archivos adjuntos,
convocados, lugar, tipo de reunión, modalidad, agenda y puntos.
*/

export interface IConvocado {
  nombre: string;
  correo: string;
  esMiembro: boolean;
}

export interface IReunion extends Document {
  titulo: string;
  organizacion: mongoose.Types.ObjectId;
  hora_inicio: Date;
  hora_fin: Date;
  archivos: string[];
  convocados: IConvocado[];
  lugar: string;
  tipo_reunion: 'Extraordinaria' | 'Ordinaria';
  modalidad: 'Presencial' | 'Virtual';
  agenda: mongoose.Types.ObjectId; 
}

/*
ReunionSchema define el esquema de Mongoose para el modelo Reunion.
Incluye los campos requeridos y sus tipos de datos.
*/

const ConvocadoSchema = new Schema<IConvocado>({
  nombre: { type: String, required: true },
  correo: { type: String, required: true },
  esMiembro: { type: Boolean, required: true }
});

const ReunionSchema = new Schema<IReunion>({
  titulo: { type: String, required: true },
  organizacion: { type: Schema.Types.ObjectId, ref: 'Organizacion', required: true },
  hora_inicio: { type: Date, required: true },
  hora_fin: { type: Date, required: false },
  archivos: { type: [String], default: [] },
  convocados: { type: [ConvocadoSchema], default: [], required: true },
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