import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { PuntoModel } from '@/models/Punto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();
    const { idReunion } = req.query;

    if (!idReunion) {
      return res.status(400).json({ message: 'Falta el parámetro idReunion' });
    }

    const puntos = await PuntoModel.find({ idReunion }).exec();
    return res.status(200).json(puntos);
  } catch (error) {
    console.error('Error al obtener los puntos:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}