import { ReunionModel, IReunion } from '@/models/Reunion';

/* 
DAO es responsable de acceder a los datos de una base de datos. 
Encapsula toda la lógica para interactuar con la base de datos, 
como consultas, inserciones, actualizaciones o eliminaciones.
*/

export class ReunionDAO {
  async create(reunionData: Partial<IReunion>): Promise<IReunion> {
    const reunion = new ReunionModel(reunionData);
    return reunion.save();
  }

  async findAll(): Promise<IReunion[]> {
    return ReunionModel.find().exec();
  }
}