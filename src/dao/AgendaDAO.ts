import { AgendaModel, IAgenda } from '@/models/Agenda';
import mongoose from 'mongoose';

/* 
DAO es responsable de acceder a los datos de una base de datos. 
Encapsula toda la lógica para interactuar con la base de datos, 
como consultas, inserciones, actualizaciones o eliminaciones.
*/

export class AgendaDAO {
  async create(agendaData: Partial<IAgenda>): Promise<IAgenda> {
    const agenda = new AgendaModel(agendaData);
    return agenda.save();
  }

  async findAll() {
    return AgendaModel.find().exec();
  }

  async findById(id: string) {
    return AgendaModel.findById(id).exec();
  }

  async findByOrganizacion(organizacionId: string) {
    return AgendaModel.find({ organizacion: organizacionId }).exec();
  }

  async findByNombre(nombre: string) {
    return AgendaModel.find({ nombre: { $regex: nombre, $options: 'i' } }).exec();
  }

  async deleteById(id: string) {
    return AgendaModel.findByIdAndDelete(id);
  }

  async updateById(id: string, updateData: Partial<IAgenda>) {
    return AgendaModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Métodos específicos para manejar las referencias
  async addPunto(agendaId: string, puntoId: mongoose.Types.ObjectId) {
    return AgendaModel.findByIdAndUpdate(
      agendaId, 
      { $addToSet: { puntos: puntoId } }, 
      { new: true }
    );
  }

  async removePunto(agendaId: string, puntoId: mongoose.Types.ObjectId) {
    return AgendaModel.findByIdAndUpdate(
      agendaId, 
      { $pull: { puntos: puntoId } }, 
      { new: true }
    );
  }

  async addReunion(agendaId: string, reunionId: mongoose.Types.ObjectId) {
    return AgendaModel.findByIdAndUpdate(
      agendaId, 
      { $addToSet: { reuniones: reunionId } }, 
      { new: true }
    );
  }

  async removeReunion(agendaId: string, reunionId: mongoose.Types.ObjectId) {
    return AgendaModel.findByIdAndUpdate(
      agendaId, 
      { $pull: { reuniones: reunionId } }, 
      { new: true }
    );
  }

  // Método para obtener agenda con datos poblados
  async findByIdWithPopulated(id: string) {
    return AgendaModel.findById(id)
      .populate('organizacion')
      .populate('puntos')
      .populate('reuniones')
      .exec();
  }
}