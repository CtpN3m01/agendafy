import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { PuntoService } from '@/services/PuntoService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();
    const puntoService = new PuntoService();
    const { id, ...updateData } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'ID requerido' });
    }

    const updated = await puntoService.editarPunto(id, updateData);    return res.status(200).json({ message: 'Punto actualizado correctamente', punto: updated });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error al editar el punto:', error);
    return res.status(500).json({ message: error.message || 'Error interno del servidor' });
  }
}