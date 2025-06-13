import { Director } from '@/models/Director';
import { ActaRegularBuilder } from '@/models/ActaRegularBuilder';

import { CrearReunionDTO } from '@/types/ReunionDTO';
import { IPunto } from '@/models/Punto';
import { IAgenda } from '@/models/Agenda';
import { OrganizacionResponseDTO } from '@/types/OrganizacionDTO'; 

import { generarPDF } from '@/services/GenerarPDF'; 

import fs from 'fs';
import path from 'path';

export async function crearYGuardarPDF(reunion: CrearReunionDTO, puntos: IPunto[],
                                       organizacion: OrganizacionResponseDTO, agenda: IAgenda) {
  const builder = new ActaRegularBuilder();
  builder.setDatos(reunion, agenda, puntos, organizacion);
  const director = new Director(builder);
  const acta = director.buildActaCompleta();
  const pdfBuffer = await generarPDF(acta);

  // Limpiar título para nombre de archivo
  const tituloLimpio = reunion.titulo.replace(/[^a-zA-Z0-9-_]/g, '_');
  const nombreArchivo = `${tituloLimpio}.pdf`;

  // Ruta base (carpeta actual del archivo)
  const carpetaBase = __dirname;
  const carpetaDestino = path.join(carpetaBase, 'ActasEnPDF');

  // Crear la carpeta si no existe
  if (!fs.existsSync(carpetaDestino)) {
    fs.mkdirSync(carpetaDestino, { recursive: true });
  }

  // Ruta completa al archivo
  const rutaSalida = path.join(carpetaDestino, nombreArchivo);

  // Escribir el archivo
  fs.writeFileSync(rutaSalida, pdfBuffer);
  console.log('✅ PDF guardado en:', rutaSalida);
}