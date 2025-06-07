import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { PuntoModel } from '@/models/Punto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();
    const { id, ...updateData } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'ID requerido' });
    }

    const updated = await PuntoModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Punto no encontrado' });
    }

    return res.status(200).json({ message: 'Punto actualizado correctamente', punto: updated });
  } catch (error) {
    console.error('Error al editar el punto:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}