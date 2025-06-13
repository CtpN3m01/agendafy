import { PuntoModel, IPunto } from '@/models/Punto';
import { PuntoFactory } from '@/models/PuntoFactory';
import mongoose from 'mongoose';

/* 
DAO es responsable de acceder a los datos de una base de datos. 
Encapsula toda la lógica para interactuar con la base de datos, 
como consultas, inserciones, actualizaciones o eliminaciones.
*/

export class PuntoDAO {  async create(puntoData: Partial<IPunto>): Promise<IPunto> {
    // Convierte agenda a ObjectId si viene como string
    if (puntoData.agenda && typeof puntoData.agenda === 'string') {
      puntoData.agenda = mongoose.Types.ObjectId.createFromHexString(puntoData.agenda);
    }
    
    // Usar PuntoFactory para crear el punto según su tipo
    return PuntoFactory.crearPunto(puntoData as any);
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
    
    // Si se está actualizando el tipo, necesitamos manejar el cambio de discriminador
    if (updateData.tipo) {
      const currentPunto = await PuntoModel.findById(id).exec();
      if (!currentPunto) {
        throw new Error('Punto no encontrado');
      }
      
      // Si el tipo es diferente, necesitamos recrear el documento
      if (currentPunto.tipo !== updateData.tipo) {
        // Obtener todos los datos del punto actual
        const currentData = currentPunto.toObject();
        
        // Eliminar el punto actual
        await PuntoModel.findByIdAndDelete(id).exec();
        
        // Crear nuevo punto con el tipo correcto
        const newPuntoData = {
          ...currentData,
          ...updateData,
          _id: id, // Mantener el mismo ID
        };
        
        // Usar PuntoFactory para crear el punto con el tipo correcto
        return PuntoFactory.crearPunto(newPuntoData);
      }
    }
    
    // Si no hay cambio de tipo, usar actualización normal
    return PuntoModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async deleteById(id: string): Promise<IPunto | null> {
    return PuntoModel.findByIdAndDelete(id).exec();
  }
}