import { AgendaModel, IAgenda } from '@/models/Agenda';

export class AgendaDAO {
  async create(agendaData: Partial<IAgenda>): Promise<IAgenda> {
    const agenda = new AgendaModel(agendaData);
    return agenda.save();
  }

  async findAll(): Promise<IAgenda[]> {
    return AgendaModel.find().exec();
  }

  async findById(id: string): Promise<IAgenda | null> {
    return AgendaModel.findById(id).exec();
  }
}