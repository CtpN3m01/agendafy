import { PuntoAprobacionModel } from '@/models/PuntoAprobacion';
import { PuntoDeFondoModel } from '@/models/PuntoDeFondo';
import { TipoPunto } from '@/models/Punto';

/*
Esta interfaz define la estructura de los datos necesarios
para crear un punto en una agenda.
*/

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

/*
PuntoFactory es una clase que se encarga de crear puntos
en una agenda según el tipo especificado.
*/

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
