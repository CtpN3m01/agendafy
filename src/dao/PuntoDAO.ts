import { PuntoModel, IPunto } from '@/models/Punto';
import mongoose from 'mongoose';

/* 
DAO es responsable de acceder a los datos de una base de datos. 
Encapsula toda la lógica para interactuar con la base de datos, 
como consultas, inserciones, actualizaciones o eliminaciones.
*/

export class PuntoDAO {
  async create(puntoData: Partial<IPunto>): Promise<IPunto> {
    // Convierte agenda a ObjectId si viene como string
    if (puntoData.agenda && typeof puntoData.agenda === 'string') {
      puntoData.agenda = mongoose.Types.ObjectId.createFromHexString(puntoData.agenda);
    }
    const punto = new PuntoModel(puntoData);
    return punto.save();
  }

  async findAll(): Promise<IPunto[]> {
    return PuntoModel.find().exec();
  }

  async findById(id: string): Promise<IPunto | null> {
    return PuntoModel.findById(id).exec();
  }

  async findByAgenda(agendaId: string): Promise<IPunto[]> {
    return PuntoModel.find({ agenda: agendaId }).exec();
  }

  async updateById(id: string, updateData: Partial<IPunto>): Promise<IPunto | null> {
    // Convierte agenda a ObjectId si viene como string en la actualización
    if (updateData.agenda && typeof updateData.agenda === 'string') {
      updateData.agenda = mongoose.Types.ObjectId.createFromHexString(updateData.agenda);
    }
    return PuntoModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async deleteById(id: string): Promise<IPunto | null> {
    return PuntoModel.findByIdAndDelete(id).exec();
  }
}