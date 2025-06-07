import { CrearPuntoDTO } from '@/types/PuntoDTO';
import { PuntoFactory } from '@/models/PuntoFactory';

export class PuntoService {
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
}