import { CrearAgendaDTO, ActualizarAgendaDTO, AgregarPuntoDTO, AgregarReunionDTO } from '@/types/AgendaDTO';
import { AgendaDAO } from '@/dao/AgendaDAO';
import mongoose from 'mongoose';

export class AgendaService {
    private agendaDAO = new AgendaDAO();

    async crearAgenda(agendaData: CrearAgendaDTO) {
        // Validación básica
        if (!agendaData.nombre || agendaData.nombre.trim() === '') {
            throw new Error('El nombre de la agenda es requerido.');
        }
        if (!agendaData.organizacion) {
            throw new Error('La organización es requerida.');
        }

        return this.agendaDAO.create(agendaData);
    }

    async eliminarAgenda(id: string) {
        return this.agendaDAO.deleteById(id);
    }

    async editarAgenda(id: string, updateData: ActualizarAgendaDTO) {
        return this.agendaDAO.updateById(id, updateData);
    }

    async obtenerAgendas() {
        return this.agendaDAO.findAll();
    }

    async obtenerAgendasPorOrganizacion(organizacionId: string) {
        return this.agendaDAO.findByOrganizacion(organizacionId);
    }

    async obtenerAgendaPorId(id: string) {
        return this.agendaDAO.findById(id);
    }

    async obtenerAgendaPorNombre(nombre: string) {
        return this.agendaDAO.findByNombre(nombre);
    }

    async obtenerAgendaConDatos(id: string) {
        return this.agendaDAO.findByIdWithPopulated(id);
    }

    // Métodos específicos para manejar puntos
    async agregarPunto(data: AgregarPuntoDTO) {
        const { agendaId, puntoId } = data;
        return this.agendaDAO.addPunto(agendaId.toString(), puntoId);
    }

    async eliminarPunto(agendaId: string, puntoId: mongoose.Types.ObjectId) {
        return this.agendaDAO.removePunto(agendaId, puntoId);
    }

    // Métodos específicos para manejar reuniones
    async agregarReunion(data: AgregarReunionDTO) {
        const { agendaId, reunionId } = data;
        return this.agendaDAO.addReunion(agendaId.toString(), reunionId);
    }

    async eliminarReunion(agendaId: string, reunionId: mongoose.Types.ObjectId) {
        return this.agendaDAO.removeReunion(agendaId, reunionId);
    }
}