import { UsuarioModel, IUsuario } from '@/models/Usuario';
import { CrearUsuarioDTO, UsuarioResponseDTO } from '@/types/UsuarioDTO';
import { connectToDatabase } from '@/lib/mongodb';

export interface IUsuarioDAO {
  crearUsuario(usuario: CrearUsuarioDTO): Promise<UsuarioResponseDTO>;
  buscarPorCorreo(correo: string): Promise<IUsuario | null>;
  buscarPorNombreUsuario(nombreUsuario: string): Promise<IUsuario | null>;
  buscarPorId(id: string): Promise<IUsuario | null>;
  actualizarToken(id: string, token: string, expires: Date): Promise<void>;
  actualizarContrasena(id: string, nuevaContrasena: string): Promise<void>;
  buscarPorResetToken(token: string): Promise<IUsuario | null>;
}

export class UsuarioDAOImpl implements IUsuarioDAO {
  async crearUsuario(usuarioData: CrearUsuarioDTO): Promise<UsuarioResponseDTO> {
    await connectToDatabase();
    
    const usuario = new UsuarioModel({
      nombre_usuario: usuarioData.nombreUsuario,
      nombre: usuarioData.nombre,
      apellidos: usuarioData.apellidos,
      correo: usuarioData.correo,
      contrasena: usuarioData.contrasena
    });

    const savedUsuario = await usuario.save();
    
    return {
      id: savedUsuario._id.toString(),
      nombreUsuario: savedUsuario.nombre_usuario,
      nombre: savedUsuario.nombre,
      apellidos: savedUsuario.apellidos,
      correo: savedUsuario.correo,
      createdAt: savedUsuario.createdAt
    };
  }

  async buscarPorCorreo(correo: string): Promise<IUsuario | null> {
    await connectToDatabase();
    return await UsuarioModel.findOne({ correo, isActive: true }).exec();
  }

  async buscarPorNombreUsuario(nombreUsuario: string): Promise<IUsuario | null> {
    await connectToDatabase();
    return await UsuarioModel.findOne({ nombre_usuario: nombreUsuario, isActive: true }).exec();
  }

  async buscarPorId(id: string): Promise<IUsuario | null> {
    await connectToDatabase();
    return await UsuarioModel.findById(id).exec();
  }

  async actualizarToken(id: string, token: string, expires: Date): Promise<void> {
    await connectToDatabase();
    await UsuarioModel.findByIdAndUpdate(id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires
    }).exec();
  }

  async actualizarContrasena(id: string, nuevaContrasena: string): Promise<void> {
    await connectToDatabase();
    await UsuarioModel.findByIdAndUpdate(id, {
      contrasena: nuevaContrasena,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    }).exec();
  }

  async buscarPorResetToken(token: string): Promise<IUsuario | null> {
    await connectToDatabase();
    return await UsuarioModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    }).exec();
  }
}