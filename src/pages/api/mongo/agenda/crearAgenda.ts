import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { AgendaService } from '@/services/AgendaService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    try {
        await connectToDatabase();
        const agendaService = new AgendaService();
        const agendaData = req.body;

        // Validación básica
        if (!agendaData.nombre || !agendaData.organizacion) {
            return res.status(400).json({ message: 'Datos incompletos. nombre y organizacion son requeridos.' });
        }

        const nuevaAgenda = await agendaService.crearAgenda(agendaData);
        return res.status(201).json(nuevaAgenda);
    } catch (error) {
        console.error('Error al crear la agenda:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}