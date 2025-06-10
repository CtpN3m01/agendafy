import mongoose, { Schema, Document } from 'mongoose';

/*
Interfaz que define la estructura de un Acta
con sus campos requeridos.
Esta interfaz se utiliza para tipar los documentos
almacenados en la base de datos.
*/

export interface IActa extends Document {
  logo?: string;
  encabezado: string;
  paginaInicial: string;
  indicePuntos: string;
  cuerpo: string;
  paginaFirmas: string;
  piePagina: string;
}

/*
ActaSchema define el esquema de Mongoose para el modelo Acta.
Incluye los campos encabezado, cuerpo y piePagina,
cada uno de tipo String y requerido.
Este esquema se utiliza para validar los documentos
*/

const ActaSchema = new Schema<IActa>({
  logo: { type: String},
  encabezado: { type: String, required: true },
  paginaInicial: { type: String, required: true },
  indicePuntos: { type: String, required: true },
  cuerpo: { type: String, required: true },
  paginaFirmas: { type: String, required: true },
  piePagina: { type: String, required: true },
});

/*
ActaModel es el modelo de Mongoose que se utiliza
para interactuar con la colección 'Actas' en la base de datos.
*/

export const ActaModel =
  mongoose.models.Acta || mongoose.model<IActa>('Actas', ActaSchema);
