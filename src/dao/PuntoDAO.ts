import { PuntoModel, IPunto } from '@/models/Punto';

/* 
DAO es responsable de acceder a los datos de una base de datos. 
Encapsula toda la lógica para interactuar con la base de datos, 
como consultas, inserciones, actualizaciones o eliminaciones.
*/

export class PuntoDAO {
  async create(puntoData: Partial<IPunto>): Promise<IPunto> {
    const punto = new PuntoModel(puntoData);
    return punto.save();
  }

  async findAll(): Promise<IPunto[]> {
    return PuntoModel.find().exec();
  }
}