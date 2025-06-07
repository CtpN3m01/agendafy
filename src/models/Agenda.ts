import mongoose, { Schema, Document, Types } from 'mongoose';

/*
La interfaz IAgenda define la estructura de un documento de agenda.
Cada agenda tiene un título y una lista de puntos.
*/

export interface IAgenda extends Document {
  titulo: string;
  puntos: Types.ObjectId[];
}

/*
AgendaSchema define el esquema de Mongoose para la colección de agendas.
Cada agenda tiene un campo 'titulo' que es una cadena de texto y un campo 
'puntos' que es un arreglo de objetos Punto.
*/

const AgendaSchema = new Schema<IAgenda>({
  titulo: { type: String, required: true },
  puntos: [{ type: Schema.Types.ObjectId, ref: 'Punto' }]
});

/*
AgendaModel es el modelo de Mongoose para la colección de agendas.
Si el modelo ya existe, se reutiliza; de lo contrario, se crea uno nuevo.
*/

export const AgendaModel =
  mongoose.models.Agenda ||
  mongoose.model<IAgenda>('Agendas', AgendaSchema);
