import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { PuntoService } from '@/services/PuntoService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();
    const puntoService = new PuntoService();
    const { agendaId } = req.query;

    if (typeof agendaId !== 'string') {
      return res.status(400).json({ message: 'El ID de agenda debe ser una cadena' });
    }
    const puntos = await puntoService.obtenerPuntosPorAgenda(agendaId);
    return res.status(200).json(puntos);
  } catch (error) {
    console.error('Error al obtener los puntos por agenda:', error);
    return res.status(500).json({ message: (error as Error).message || 'Error interno del servidor' });
  }
}
