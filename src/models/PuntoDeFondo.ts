import { PuntoModel } from '@/models/Punto';
import mongoose, { Schema } from 'mongoose';

/*
La interfaz IPuntoDeFondo define la estructura de un documento de punto de fondo.
*/

export interface IPuntoDeFondo extends Document {
  decisiones: string[];
}

/*
PuntoDeFondoSchema define el esquema de Mongoose para la colección de puntos de fondo.
Incluye el campo decisiones, que es un arreglo de cadenas de texto y es requerido.
*/

const PuntoDeFondoSchema = new Schema<IPuntoDeFondo>({
  decisiones: { type: [String], required: true },
});

/*
PuntoDeFondoModel es el modelo de Mongoose que se utiliza
para interactuar con la colección de puntos de fondo.
*/

export const PuntoDeFondoModel = (() => {
  if (mongoose.models.PuntoDeFondo) {
    return mongoose.models.PuntoDeFondo;
  }
  
  // Verificar si el discriminador ya existe
  const existingDiscriminator = (PuntoModel as any).discriminators?.['Fondo'];
  if (existingDiscriminator) {
    return existingDiscriminator;
  }
  
  return PuntoModel.discriminator<IPuntoDeFondo>('Fondo', PuntoDeFondoSchema);
})();
