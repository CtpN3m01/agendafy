// DAO is responsible for accessing data from a database It encapsulates 
// all the logic for interacting with the database, such as queries, 
// inserts, updates, or deletions.

import { ReunionModel, IReunion } from '@/models/Reunion';

export class ReunionDAO {
  async create(reunionData: Partial<IReunion>): Promise<IReunion> {
    const reunion = new ReunionModel(reunionData);
    return reunion.save();
  }

  async findAll(): Promise<IReunion[]> {
    return ReunionModel.find().exec();
  }
}