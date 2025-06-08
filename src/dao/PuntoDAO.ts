import { PuntoModel, IPunto } from '@/models/Punto';
import { CrearPuntoDTO, PuntoResponseDTO } from '@/types/PuntoDTO';
import { connectToDatabase } from '@/lib/mongodb';

/* 
DAO es responsable de acceder a los datos de una base de datos. 
Encapsula toda la lógica para interactuar con la base de datos, 
como consultas, inserciones, actualizaciones o eliminaciones.
*/

export interface IPuntoDAO {
  buscarPorId(id: string): Promise<PuntoResponseDTO | null>;
}

export class PuntoDAOImpl implements IPuntoDAO {
  async buscarPorId(id: string): Promise<PuntoResponseDTO | null> {
    await connectToDatabase();
    return await PuntoModel.findById(id).exec();
  }
}

export class PuntoDAO {
  async create(puntoData: Partial<IPunto>): Promise<IPunto> {
    const punto = new PuntoModel(puntoData);
    return punto.save();
  }

  async findAll(): Promise<IPunto[]> {
    return PuntoModel.find().exec();
  }
}