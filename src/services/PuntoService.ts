import { CrearPuntoDTO, ActualizarPuntoDTO } from '@/types/PuntoDTO';
import { PuntoDAO } from '@/dao/PuntoDAO';
import mongoose from 'mongoose';

export class PuntoService {
    private puntoDAO = new PuntoDAO();

    async crearPunto(puntoData: CrearPuntoDTO) {
        if (!puntoData.titulo || !puntoData.tipo || !puntoData.duracion || !puntoData.expositor) {
            throw new Error('Datos incompletos para crear el punto.');
        }

        // Convierte el string del DTO a ObjectId para el modelo
        const dataParaCrear = {
            ...puntoData,
            agenda: mongoose.Types.ObjectId.createFromHexString(puntoData.agenda),
            titulo: puntoData.titulo.trim(),
            detalles: puntoData.detalles || '',
            anotaciones: puntoData.anotaciones || '',
            archivos: puntoData.archivos || [],
            votosAFavor: puntoData.votosAFavor || 0,
            votosEnContra: puntoData.votosEnContra || 0,
            decisiones: puntoData.decisiones || []
        };

        return this.puntoDAO.create(dataParaCrear);
    }

    async obtenerPunto(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`El ID proporcionado no es válido: ${id}`);
        }
        const punto = await this.puntoDAO.findById(id);
        if (!punto) {
            throw new Error(`No se encontró un punto con el ID: ${id}`);
        }
        return punto;
    }

    async obtenerPuntosPorAgenda(agendaId: string) {
        if (!mongoose.Types.ObjectId.isValid(agendaId)) {
            throw new Error(`El ID de agenda proporcionado no es válido: ${agendaId}`);
        }
        return this.puntoDAO.findByAgenda(agendaId);
    }

    async editarPunto(id: string, updateData: ActualizarPuntoDTO) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`El ID proporcionado no es válido: ${id}`);
        }
        
        const updated = await this.puntoDAO.updateById(id, updateData);
        if (!updated) {
            throw new Error(`No se encontró un punto con el ID: ${id}`);
        }
        return updated;
    }

    async eliminarPunto(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`El ID proporcionado no es válido: ${id}`);
        }
        
        const deleted = await this.puntoDAO.deleteById(id);
        if (!deleted) {
            throw new Error(`No se encontró un punto con el ID: ${id}`);
        }
        return deleted;
    }
}