// API para obtener reuniones por organización
// ruta /api/mongo/Reunion/obtenerReuniones

import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ReunionService } from '@/services/ReunionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();
    const reunionService = new ReunionService();
    const { organizacion } = req.query;

    if (!organizacion || typeof organizacion !== 'string') {
      return res.status(400).json({ message: 'ID de organización requerido' });
    }

    const reuniones = await reunionService.obtenerReunionesPorOrganizacion(organizacion);
    return res.status(200).json(reuniones);
  } catch (error) {
    console.error('Error al obtener las reuniones:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}