import mongoose, { Schema, Document } from 'mongoose';

/*
La interfaz IUsuario define la estructura de un documento de usuario.
Cada usuario tiene un nombre de usuario, nombre, apellidos, correo electrónico y contraseña.
*/

export interface IUsuario extends Document {
  nombre_usuario: string;
  nombre: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/*
UsuarioSchema define el esquema de Mongoose para la colección de usuarios.
Incluye los campos nombre_usuario, nombre, apellidos, correo y contrasena,
todos de tipo String.
Estos campos son requeridos y algunos de ellos son únicos,
*/

const UsuarioSchema = new Schema<IUsuario>({
  nombre_usuario: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

/*
UsuarioModel es el modelo de Mongoose para la colección de usuarios.
Si el modelo ya existe, se reutiliza; de lo contrario, se crea uno nuevo.
*/

export const UsuarioModel =
  mongoose.models.Usuario ||
  mongoose.model<IUsuario>('Usuario', UsuarioSchema);