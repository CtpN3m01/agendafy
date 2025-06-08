import mongoose, { Schema, Document } from 'mongoose';
import { IPersona, PersonaSchema } from '@/models/Persona';

/*
La interfaz IOrganizacion define la estructura de un documento de organización.
Cada organización tiene un nombre, correo electrónico, logo, dirección, teléfono y una junta directiva.
*/

export interface IOrganizacion extends Document {
  nombre: string;
  correo: string;
  logo: Blob;
  direccion: string;
  telefono: string;
  juta_directiva: IPersona [];
}

/*
OrganizacionSchema define el esquema de Mongoose para la colección de organizaciones.
Cada organización tiene un campo 'nombre' que es una cadena de texto, un campo 'correo' 
que es una cadena de texto, un campo 'logo' que es un Blob, un campo 'direccion' que 
es una cadena de texto, un campo 'telefono' que es una cadena de texto, y un campo 
'junta_directiva' que es un arreglo de objetos Persona.
*/

const OrganizacionSchema = new Schema<IOrganizacion>({
  nombre: { type: String, required: true },
  correo: { type: String, required: true },
  logo: { type: String, required: true },
  direccion: { type: String, required: true },
  telefono: { type: String, required: true },
  juta_directiva: { type: [PersonaSchema], default: [], required: true },
});

/*
OrganizacionModel es el modelo de Mongoose para la colección de organizaciones.
*/

export const OrganizacionModel =
  mongoose.models.Organizacion ||
  mongoose.model<IOrganizacion>('Organizaciones', OrganizacionSchema);
