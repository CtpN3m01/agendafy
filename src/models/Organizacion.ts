import mongoose, { Schema, Document } from 'mongoose';
import { IPersona, PersonaSchema } from './Persona';

export interface IOrganizacion extends Document {
  nombre: string;
  correo: string;
  logo: Blob;
  direccion: string;
  telefono: string;
  juta_directiva: IPersona [];
}

const OrganizacionSchema = new Schema<IOrganizacion>({
  nombre: { type: String, required: true },
  correo: { type: String, required: true },
  logo: { type: String, required: true },
  direccion: { type: String, required: true },
  telefono: { type: String, required: true },
  juta_directiva: { type: [PersonaSchema], default: [], required: true },
});

export const OrganizacionModel =
  mongoose.models.Organizacion ||
  mongoose.model<IOrganizacion>('Organizaciones', OrganizacionSchema);
