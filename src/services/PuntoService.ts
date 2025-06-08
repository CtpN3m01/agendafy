import { PuntoDAOImpl, IPuntoDAO } from '@/dao/PuntoDAO';
import { CrearPuntoDTO, PuntoResponseDTO } from '@/types/PuntoDTO';
import { PuntoFactory } from '@/models/PuntoFactory';
import { PuntoModel } from '@/models/Punto';

export class PuntoService {

    private puntoDAO: IPuntoDAO;
    
    constructor() {
        this.puntoDAO = new PuntoDAOImpl();
    }

    async crearPunto(puntoData: CrearPuntoDTO) {
        if (!puntoData.titulo || !puntoData.tipo || !puntoData.duracion || !puntoData.expositor) {
            throw new Error('Datos incompletos para crear el punto.');
        }
        return PuntoFactory.crearPunto({
            ...puntoData,
            comentarios: puntoData.comentarios || '',
            archivos: puntoData.archivos || [],
            votosAFavor: puntoData.votosAFavor,
            votosEnContra: puntoData.votosEnContra,
            decisiones: puntoData.decisiones
        });
    }

    async obtenerPunto(id: string): Promise<PuntoResponseDTO | null> {
        return await this.puntoDAO.buscarPorId(id);
    }

}