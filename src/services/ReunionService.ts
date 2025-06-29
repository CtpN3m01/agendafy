import { CrearReunionDTO } from '@/types/ReunionDTO';
import { ReunionDAO } from '@/dao/ReunionDAO';

export class ReunionService {
    private reunionDAO = new ReunionDAO();    
    
    async crearReunion(reunionData: CrearReunionDTO) {
        
        // Solo validar hora_fin si está presente
        if (reunionData.hora_fin && new Date(reunionData.hora_inicio) >= new Date(reunionData.hora_fin)) {
            throw new Error('La hora de inicio debe ser anterior a la hora de fin.');
        }
        // Convertir hora_inicio a Date y ajustar a UTC-6
        const horaInicio = new Date(reunionData.hora_inicio);
        horaInicio.setHours(horaInicio.getHours() - 6);
        reunionData.hora_inicio = horaInicio;
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

    async obtenerReunion(id: string) {
        return this.reunionDAO.findById(id);
    }
}