import mongoose, { Schema, Document } from 'mongoose';

export interface IPersona extends Document {
  nombre: string;
  apellidos: string;
  correo: string;
  rol: 'Presidente' | 'SubPresidente' | 'Tesorero' | 'Vocal';
  organizacion: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const PersonaSchema = new Schema<IPersona>({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  correo: { type: String, required: true },
  rol: {
    type: String,
    enum: ['Presidente', 'SubPresidente', 'Tesorero', 'Vocal'],
    required: true,
  },
  organizacion: { type: Schema.Types.ObjectId, ref: 'Organizacion', required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const PersonaModel =
  mongoose.models.Persona ||
  mongoose.model<IPersona>('Persona', PersonaSchema);