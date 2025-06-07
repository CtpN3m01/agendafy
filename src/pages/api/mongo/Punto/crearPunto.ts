import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { PuntoService } from '@/services/PuntoService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();
    const puntoService = new PuntoService();
    const puntoData = req.body;

    // Validación básica
    if (!puntoData.titulo || !puntoData.tipo || !puntoData.duracion || !puntoData.expositor) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    const nuevoPunto = await puntoService.crearPunto(puntoData);
    return res.status(201).json(nuevoPunto);
  } catch (error) {
    console.error('Error al crear el punto:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}