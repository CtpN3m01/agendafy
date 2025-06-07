import { PuntoModel, IPunto } from '@/models/Punto';

export class PuntoDAO {
  async create(puntoData: Partial<IPunto>): Promise<IPunto> {
    const punto = new PuntoModel(puntoData);
    return punto.save();
  }

  async findAll(): Promise<IPunto[]> {
    return PuntoModel.find().exec();
  }
}