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
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID requerido' });
    }

    const reunion = await reunionService.obtenerReunion(id);

    if (!reunion) {
      return res.status(404).json({ message: 'Reunión no encontrada' });
    }

    return res.status(200).json(reunion);
  } catch (error) {
    console.error('Error al obtener la reunión:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
