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

    async eliminarReunion(id: string) {
        return this.reunionDAO.deleteById(id);
    }

    async editarReunion(id: string, updateData: Partial<CrearReunionDTO>) {
        return this.reunionDAO.updateById(id, updateData);
    }

    async obtenerReuniones() {
        return this.reunionDAO.findAll();
    }

    async obtenerReunionesPorOrganizacion(organizacionId: string) {
        return this.reunionDAO.findByOrganizacion(organizacionId);
    }
}