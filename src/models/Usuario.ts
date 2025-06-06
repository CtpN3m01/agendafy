import mongoose, { Schema, Document } from 'mongoose';

export interface IUsuario extends Document {
  nombre_usuario: string;
  nombre: string;
  apellidos: string;
  correo: string;
  contrasena: string;
}

const UsuarioSchema = new Schema<IUsuario>({
  nombre_usuario: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
});

export const UsuarioModel =
  mongoose.models.Usuario ||
  mongoose.model<IUsuario>('Usuarios', UsuarioSchema);
