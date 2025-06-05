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
        const reunionData = req.body;

        // Validación básica
        if (!reunionData.titulo || !reunionData.organizacion || !reunionData.hora_inicio || !reunionData.lugar || !reunionData.tipo_reunion || !reunionData.modalidad) {
            return res.status(400).json({ message: 'Datos incompletos' });
        }

        const nuevaReunion = await reunionService.crearReunion(reunionData);
        return res.status(201).json(nuevaReunion);
    } catch (error) {
        console.error('Error al crear la reunión:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}