import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { NotificacionService } from '@/services/NotificacionService';

const notificacionService = new NotificacionService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { destinatario } = req.query;
  if (!destinatario || typeof destinatario !== 'string') {
    return res.status(400).json({ success: false, message: 'El destinatario es requerido' });
  }

  try {
    await connectToDatabase();
    const deletedCount = await notificacionService.deleteMany(destinatario);
    return res.status(200).json({
      success: true,
      deletedCount,
      message: `Se eliminaron ${deletedCount} notificaciones del buzón.`
    });
  } catch {
    return res.status(500).json({ success: false, message: 'Error al vaciar el buzón de notificaciones' });
  }
}
