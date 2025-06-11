import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { AgendaService } from '@/services/AgendaService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();
    const agendaService = new AgendaService();
    const { _id, ...updateData } = req.body;

    if (!_id) {
      return res.status(400).json({ message: 'ID requerido' });
    }

    const updated = await agendaService.editarAgenda(_id, updateData);

    if (!updated) {
      return res.status(404).json({ message: 'Agenda no encontrada' });
    }

    return res.status(200).json({ message: 'Agenda actualizada correctamente', agenda: updated });
  } catch (error) {
    console.error('Error al editar la agenda:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}