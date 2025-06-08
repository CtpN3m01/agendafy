import mongoose, { Schema, Document } from 'mongoose';

/*
La interfaz IPersona define la estructura de un documento de persona.
Cada persona tiene un nombre, apellidos, correo electrónico y un rol en la organización.
Además, tiene un campo de referencia a la organización a la que pertenece,
y campos para indicar si está activa, así como las fechas de creación y actualización.
*/

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

/*
PersonaSchema define el esquema de Mongoose para la colección de personas.
Cada persona tiene un campo 'nombre' que es una cadena de texto, un campo 'apellidos'
que es una cadena de texto, un campo 'correo' que es una cadena de texto,
y un campo 'rol' que es una cadena de texto con un valor restringido a
'Presidente', 'SubPresidente', 'Tesorero' o 'Vocal'.
*/

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

/*
PersonaModel es el modelo de Mongoose para la colección de personas.
Si el modelo ya existe, se reutiliza; de lo contrario, se crea uno nuevo.
*/

export const PersonaModel =
  mongoose.models.Persona ||
  mongoose.model<IPersona>('Persona', PersonaSchema);