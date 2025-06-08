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

  async findAll() {
    return ReunionModel.find().exec();
  }

  async findByOrganizacion(organizacionId: string) {
    return ReunionModel.find({ organizacion: organizacionId }).exec();
  }

  async deleteById(id: string) {
    const doc = await ReunionModel.findById(id);
    console.log('Documento encontrado:', doc);
    return ReunionModel.findByIdAndDelete(id);
  }

  async updateById(id: string, updateData: Partial<IReunion>) {
    return ReunionModel.findByIdAndUpdate(id, updateData, { new: true });
  }
}