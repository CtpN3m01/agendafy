// DAO is responsible for accessing data from a database It encapsulates 
// all the logic for interacting with the database, such as queries, 
// inserts, updates, or deletions.

import { ReunionModel, IReunion } from '@/models/Reunion';

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