import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { AgendaService } from '@/services/AgendaService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectToDatabase();
    const agendaService = new AgendaService();
    const { id, nombre, organizacion, poblado } = req.query;

    let agendas;

    if (id && typeof id === 'string') {
      // Obtener agenda por ID
      if (poblado === 'true') {
        agendas = await agendaService.obtenerAgendaConDatos(id);
      } else {
        agendas = await agendaService.obtenerAgendaPorId(id);
      }
      
      if (!agendas) {
        return res.status(404).json({ message: 'Agenda no encontrada' });
      }
    } else if (organizacion && typeof organizacion === 'string') {
      // Obtener agendas por organización
      agendas = await agendaService.obtenerAgendasPorOrganizacion(organizacion);
    } else if (nombre && typeof nombre === 'string') {
      // Buscar agendas por nombre
      agendas = await agendaService.obtenerAgendaPorNombre(nombre);
    } else {
      // Obtener todas las agendas
      agendas = await agendaService.obtenerAgendas();
    }

    return res.status(200).json(agendas);
  } catch (error) {
    console.error('Error al obtener agenda(s):', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}