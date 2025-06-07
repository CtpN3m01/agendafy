import { PuntoModel } from './Punto';
import mongoose, { Schema } from 'mongoose';

export interface IPuntoDeFondo extends Document {
  decisiones: string[];
}

const PuntoDeFondoSchema = new Schema<IPuntoDeFondo>({
  decisiones: { type: [String], required: true },
});

export const PuntoDeFondoModel =
  mongoose.models.PuntoDeFondo ||
  PuntoModel.discriminator<IPuntoDeFondo>('Fondo', PuntoDeFondoSchema);
