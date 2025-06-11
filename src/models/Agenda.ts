import mongoose, { Schema, Document } from 'mongoose';

/*
Esta interfaz define la estructura de un documento
de agenda en la base de datos.
Incluye campos como nombre, organización, puntos (referencias a ObjectIDs) y reuniones (referencias a ObjectIDs).
*/

export interface IAgenda extends Document {
  nombre: string;
  organizacion: mongoose.Types.ObjectId; // Referencia a Organizacion
  puntos: mongoose.Types.ObjectId[]; // Lista de referencias a Puntos
  reuniones: mongoose.Types.ObjectId[]; // Lista de referencias a Reuniones
}

/*
AgendaSchema define el esquema de Mongoose para el modelo Agenda.
Incluye los campos requeridos y sus tipos de datos.
*/

const AgendaSchema = new Schema<IAgenda>({
  nombre: { type: String, required: true },
  organizacion: { type: Schema.Types.ObjectId, ref: 'Organizacion', required: true },
  puntos: [{ type: Schema.Types.ObjectId, ref: 'Punto', default: [] }],
  reuniones: [{ type: Schema.Types.ObjectId, ref: 'Reunion', default: [] }]
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

/*
AgendaModel es el modelo de Mongoose que se utiliza
para interactuar con la colección 'Agendas' en la base de datos.
*/

export const AgendaModel =
  mongoose.models.Agenda || mongoose.model<IAgenda>('Agenda', AgendaSchema);