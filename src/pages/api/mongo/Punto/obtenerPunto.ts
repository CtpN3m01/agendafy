import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { PuntoService } from '@/services/PuntoService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    await connectToDatabase();

    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'El ID debe ser una cadena'
      });
    }

    const puntoService = new PuntoService();
    const punto = await puntoService.obtenerPunto(id);

    return res.status(200).json({
      success: true,
      punto
    });

  } catch (error: any) {
    console.error('Error al obtener el punto:', error);
    return res.status(404).json({
      success: false,
      message: error.message || 'Punto no encontrado'
    });
  }
}
