import { CrearReunionDTO } from '@/types/ReunionDTO';
import { ReunionDAO } from '@/dao/ReunionDAO';

export class ReunionService {
    private reunionDAO = new ReunionDAO();

    async crearReunion(reunionData: CrearReunionDTO) {
        
        if (new Date(reunionData.hora_inicio) >= new Date(reunionData.hora_fin)) {
            throw new Error('La hora de inicio debe ser anterior a la hora de fin.');
        }

        return this.reunionDAO.create(reunionData);
    }
}