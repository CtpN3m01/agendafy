import { CrearPuntoDTO } from '@/types/PuntoDTO';
import { PuntoFactory } from '@/models/PuntoFactory';
import { PuntoModel } from '@/models/Punto';
import mongoose from 'mongoose';

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

    async obtenerPunto(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`El ID proporcionado no es válido: ${id}`);
        }
        const punto = await PuntoModel.findById(id);
        if (!punto) {
            throw new Error(`No se encontró un punto con el ID: ${id}`);
        }
        return punto;
    }

}