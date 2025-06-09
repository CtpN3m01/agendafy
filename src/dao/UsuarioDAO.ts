import { UsuarioModel, IUsuario } from '@/models/Usuario';
import { CrearUsuarioDTO, UsuarioResponseDTO } from '@/types/UsuarioDTO';
import { connectToDatabase } from '@/lib/mongodb';

/* 
DAO es responsable de acceder a los datos de una base de datos. 
Encapsula toda la lógica para interactuar con la base de datos, 
como consultas, inserciones, actualizaciones o eliminaciones.
*/

export interface IUsuarioDAO {
  crearUsuario(usuario: CrearUsuarioDTO): Promise<UsuarioResponseDTO>;
  buscarPorCorreo(correo: string): Promise<IUsuario | null>;
  buscarPorNombreUsuario(nombreUsuario: string): Promise<IUsuario | null>;
  buscarPorId(id: string): Promise<IUsuario | null>;
  actualizarToken(id: string, token: string, expires: Date): Promise<void>;
  actualizarContrasena(id: string, nuevaContrasena: string): Promise<void>;
  buscarPorResetToken(token: string): Promise<IUsuario | null>;
  actualizarPerfil(id: string, datos: Partial<IUsuario>): Promise<IUsuario | null>;
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
  async actualizarPerfil(id: string, datos: Partial<IUsuario>): Promise<IUsuario | null> {
    try {
      console.log('DAO: actualizarPerfil - ID:', id);
      console.log('DAO: actualizarPerfil - Datos:', datos);
      
      await connectToDatabase();
      const resultado = await UsuarioModel.findByIdAndUpdate(
        id, 
        datos, 
        { new: true, runValidators: true }
      ).exec();
      
      console.log('DAO: actualizarPerfil - Resultado:', resultado ? 'exitoso' : 'falló');
      return resultado;
    } catch (error) {
      console.error('DAO: Error en actualizarPerfil:', error);
      throw error;
    }
  }
}