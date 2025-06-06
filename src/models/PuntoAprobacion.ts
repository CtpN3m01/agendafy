import { PuntoModel } from './Punto';
import mongoose, { Schema } from 'mongoose';

export interface IPuntoAprobacion extends Document {
  votosAFavor: number;
  votosEnContra: number;
}

const PuntoAprobacionSchema = new Schema<IPuntoAprobacion>({
    votosAFavor: { type: Number, default: 0 },
    votosEnContra: { type: Number, default: 0 }
});

export const PuntoAprobacionModel =
  mongoose.models.PuntoAprobacion ||
  PuntoModel.discriminator<IPuntoAprobacion>('Aprobacion', PuntoAprobacionSchema);
