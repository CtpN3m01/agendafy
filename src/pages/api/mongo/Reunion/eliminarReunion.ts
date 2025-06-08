import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ReunionService } from '@/services/ReunionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();
    const reunionService = new ReunionService();
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'ID requerido' });
    }

    const deleted = await reunionService.eliminarReunion(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Reunión no encontrada' });
    }

    return res.status(200).json({ message: 'Reunión eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la reunión:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}