import { ActaModel, IActa } from '@/models/Acta';

/* 
DAO es responsable de acceder a los datos de una base de datos. 
Encapsula toda la lógica para interactuar con la base de datos, 
como consultas, inserciones, actualizaciones o eliminaciones.
*/

export class ActaDAO {
  async create(actaData: Partial<IActa>): Promise<IActa> {
    const acta = new ActaModel(actaData);
    return acta.save();
  }

  async findAll(): Promise<IActa[]> {
    return ActaModel.find().exec();
  }
}