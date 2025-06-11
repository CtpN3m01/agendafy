// API para obtener reuniones por organización
// ruta /api/mongo/Reunion/obtenerReuniones

import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ReunionService } from '@/services/ReunionService';
import { isValidObjectId } from '@/lib/validation';

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
    }    // Validar formato de ObjectId
    if (!isValidObjectId(organizacion)) {
      return res.status(400).json({ message: 'Formato de ID de organización inválido' });
    }

    const reuniones = await reunionService.obtenerReunionesPorOrganizacion(organizacion);
    return res.status(200).json(reuniones);
  } catch (error) {
    console.error('Error al obtener las reuniones:', error);
    
    // Manejo específico de errores de validación
    if (error instanceof Error && error.message.includes('ID de organización inválido')) {
      return res.status(400).json({ message: error.message });
    }
    
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}