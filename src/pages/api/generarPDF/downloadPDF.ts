import type { NextApiRequest, NextApiResponse } from 'next';
import { Director } from '@/models/Director';
import { ActaRegularBuilder } from '@/models/ActaRegularBuilder';
import { generarPDF } from '@/services/GenerarPDFService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { reunion, puntos, organizacion, agenda } = req.body;

    const builder = new ActaRegularBuilder();
    builder.setDatos(reunion, agenda, puntos, organizacion.organizacion);
    const director = new Director(builder);
    const acta = director.buildActaCompleta();

    const pdfBuffer = await generarPDF(acta);

    const fileName = `${agenda.nombre
      .normalize("NFD")                  // Separa letras y tildes (á → a +  ́)
      .replace(/[\u0300-\u036f]/g, '')  // Elimina las tildes ( ́)
      .replace(/[^a-zA-Z0-9-_]/g, '_')  // Reemplaza los demás caracteres no válidos
    }.pdf`;


    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({ error: 'Error generando PDF' });
  }
}
