import mongoose, { Schema, Document } from 'mongoose';

export interface IPersona extends Document {
  nombre: string;
  apellidos: string;
  correo: string;
  rol: 'Presidente' | 'SubPresidente' | 'Tesorero' | 'Vocal';
  organizacion: mongoose.Types.ObjectId; // Referencia a la organización
  usuario?: mongoose.Types.ObjectId; // Opcional: referencia al usuario si es miembro registrado
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
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }, // Nueva referencia opcional
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const PersonaModel =
  mongoose.models.Persona ||
  mongoose.model<IPersona>('Persona', PersonaSchema);