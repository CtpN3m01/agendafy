import { PuntoModel } from '@/models/Punto';
import mongoose, { Schema } from 'mongoose';

/*
La interfaz IPuntoAprobacion define la estructura de un documento de punto de aprobación.
Cada punto de aprobación tiene dos campos: votosAFavor y votosEnContra,
que representan el número de votos a favor y en contra, respectivamente.
*/

export interface IPuntoAprobacion extends Document {
  votosAFavor: number;
  votosEnContra: number;
}

/*
PuntoAprobacionSchema define el esquema de Mongoose para la colección de puntos de aprobación.
Incluye los campos votosAFavor y votosEnContra, ambos de tipo Number,
y con un valor por defecto de 0.
*/

const PuntoAprobacionSchema = new Schema<IPuntoAprobacion>({
    votosAFavor: { type: Number, default: 0 },
    votosEnContra: { type: Number, default: 0 }
});

/*
PuntoAprobacionModel es el modelo de Mongoose que se utiliza
para interactuar con la colección de puntos de aprobación.
*/

export const PuntoAprobacionModel = (() => {
  if (mongoose.models.PuntoAprobacion) {
    return mongoose.models.PuntoAprobacion;
  }
  // Verificar si el discriminador ya existe
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingDiscriminator = (PuntoModel as any).discriminators?.['Aprobacion'];
  if (existingDiscriminator) {
    return existingDiscriminator;
  }
  
  return PuntoModel.discriminator<IPuntoAprobacion>('Aprobacion', PuntoAprobacionSchema);
})();
