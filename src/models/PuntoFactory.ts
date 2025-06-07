import { PuntoAprobacionModel } from './PuntoAprobacion';
import { PuntoDeFondoModel } from './PuntoDeFondo';
import { TipoPunto } from './Punto';

interface PuntoData {
  titulo: string;
  comentarios: string;
  duracion: number;
  tipo: TipoPunto;
  votosAFavor?: number;
  votosEnContra?: number;
  decisiones?: string[];
  expositor: string;    
  archivos?: string[];
}

export class PuntoFactory {
  static async crearPunto(data: PuntoData) {
    switch (data.tipo) {
      case TipoPunto.Aprobacion:
        return await new PuntoAprobacionModel({
          ...data,
          votosAFavor: data.votosAFavor || 0,
          votosEnContra: data.votosEnContra || 0,
        }).save();

      case TipoPunto.Fondo:
        return await new PuntoDeFondoModel({
          ...data,
          decisiones: data.decisiones || [],
        }).save();

      default:
        throw new Error(`Tipo de punto inválido: ${data.tipo}`);
    }
  }
}
