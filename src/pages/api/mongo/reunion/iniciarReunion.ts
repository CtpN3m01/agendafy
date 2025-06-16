import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ReunionService } from '@/services/ReunionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();
    const reunionService = new ReunionService();
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID de reunión requerido' });
    }    // Actualizar la hora de inicio a la hora actual
    const updateData = {
      hora_inicio: new Date()
    };

    const updated = await reunionService.editarReunion(id, updateData);

    if (!updated) {
      return res.status(404).json({ message: 'Reunión no encontrada' });
    }

    return res.status(200).json({ 
      message: 'Reunión iniciada correctamente', 
      reunion: updated 
    });
  } catch (error) {
    console.error('Error al iniciar la reunión:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
