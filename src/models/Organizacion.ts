import mongoose, { Schema, Document } from 'mongoose';
import { IPersona, PersonaSchema } from '@/models/Persona';

/*
La interfaz IOrganizacion define la estructura de un documento de organización.
Cada organización tiene un nombre, correo electrónico, logo, dirección, teléfono y una junta directiva.
*/

export interface IOrganizacion extends Document {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  foto?: string;
  usuario: mongoose.Types.ObjectId;
  miembros: mongoose.Types.ObjectId[];
  reuniones: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/*
OrganizacionSchema define el esquema de Mongoose para la colección de organizaciones.
Cada organización tiene un campo 'nombre' que es una cadena de texto, un campo 'correo' 
que es una cadena de texto, un campo 'logo' que es un Blob, un campo 'direccion' que 
es una cadena de texto, un campo 'telefono' que es una cadena de texto, y un campo 
'junta_directiva' que es un arreglo de objetos Persona.
*/

const OrganizacionSchema = new Schema<IOrganizacion>({
  nombre: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  correo: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de correo inválido']
  },
  telefono: { 
    type: String, 
    required: true,
    trim: true
  },
  direccion: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  foto: { 
    type: String, 
    default: null 
  },
  usuario: { 
    type: Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  miembros: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Persona',
    default: []
  }],
  reuniones: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Reunion',
    default: []
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// Índices únicos solo aquí
OrganizacionSchema.index({ nombre: 1 }, { unique: true });
OrganizacionSchema.index({ correo: 1 }, { unique: true });
OrganizacionSchema.index({ usuario: 1 });
/*
OrganizacionModel es el modelo de Mongoose para la colección de organizaciones.
*/

export const OrganizacionModel =
  mongoose.models.Organizacion ||
  mongoose.model<IOrganizacion>('Organizacion', OrganizacionSchema);