import { AgendaModel, IAgenda } from '@/models/Agenda';

/* 
DAO es responsable de acceder a los datos de una base de datos. 
Encapsula toda la lógica para interactuar con la base de datos, 
como consultas, inserciones, actualizaciones o eliminaciones.
*/

export class AgendaDAO {
  async create(data: Partial<IAgenda>): Promise<IAgenda> {
    const doc = new AgendaModel(data);
    return doc.save();
  }

  async findAll(): Promise<IAgenda[]> {
    return AgendaModel.find().exec();
  }
}