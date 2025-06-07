import { CrearAgendaDTO } from '@/types/AgendaDTO';
import { AgendaModel } from '@/models/Agenda';

export class AgendaService {
  async crearAgenda(agendaData: CrearAgendaDTO) {
    if (!agendaData.titulo) {
      throw new Error('El título de la agenda es obligatorio.');
    }
    // Puedes agregar validaciones adicionales para los puntos si lo deseas
    const agenda = new AgendaModel(agendaData);
    return agenda.save();
  }
}