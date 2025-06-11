import { PuntoModel } from '@/models/Punto';
import mongoose, { Schema } from 'mongoose';

/*
La interfaz IPuntoInformativo define la estructura de un documento de punto informativo.
Los puntos informativos son simples y no requieren campos adicionales más allá
de los definidos en el modelo base de Punto.
*/

export interface IPuntoInformativo extends Document {
  // Los puntos informativos no tienen campos adicionales
  // Usan solo los campos base: titulo, comentarios, duracion, expositor, archivos
}

/*
PuntoInformativoSchema define el esquema de Mongoose para la colección de puntos informativos.
Como los puntos informativos no requieren campos adicionales, 
el schema está vacío y usa solo los campos heredados del modelo base.
*/

const PuntoInformativoSchema = new Schema<IPuntoInformativo>({
  // No hay campos adicionales para puntos informativos
});

/*
PuntoInformativoModel es el modelo de Mongoose que se utiliza
para interactuar con la colección de puntos informativos.
*/

export const PuntoInformativoModel = (() => {
  if (mongoose.models.PuntoInformativo) {
    return mongoose.models.PuntoInformativo;
  }
  
  // Verificar si el discriminador ya existe
  const existingDiscriminator = (PuntoModel as any).discriminators?.['Informativo'];
  if (existingDiscriminator) {
    return existingDiscriminator;
  }
  
  return PuntoModel.discriminator<IPuntoInformativo>('Informativo', PuntoInformativoSchema);
})();
