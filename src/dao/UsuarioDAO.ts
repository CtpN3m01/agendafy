import { UsuarioModel, IUsuario } from '@/models/Usuario';

/* 
DAO es responsable de acceder a los datos de una base de datos. 
Encapsula toda la lógica para interactuar con la base de datos, 
como consultas, inserciones, actualizaciones o eliminaciones.
*/

export class UsuarioDAO {
  async create(data: Partial<IUsuario>): Promise<IUsuario> {
    const doc = new UsuarioModel(data);
    return doc.save();
  }

  async findAll(): Promise<IUsuario[]> {
    return UsuarioModel.find().exec();
  }
}