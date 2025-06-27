import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ReunionService } from '@/services/ReunionService';
import { NotificacionService } from '@/services/NotificacionService';
import { TipoNotificacion } from '@/types/NotificacionDTO';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    try {
        await connectToDatabase();
        const reunionService = new ReunionService();
        const reunionData = req.body;
        
        // Validación actualizada para coincidir con los datos del hook
        if (!reunionData.titulo || 
            !reunionData.organizacion || 
            !reunionData.hora_inicio || 
            !reunionData.lugar || 
            !reunionData.tipo_reunion || 
            !reunionData.modalidad ||
            !reunionData.agenda
        ) {
            return res.status(400).json({ 
                message: 'Datos incompletos',
                missing: {
                    titulo: !reunionData.titulo,
                    organizacion: !reunionData.organizacion,
                    hora_inicio: !reunionData.hora_inicio,
                    lugar: !reunionData.lugar,
                    tipo_reunion: !reunionData.tipo_reunion,
                    modalidad: !reunionData.modalidad,
                    agenda: !reunionData.agenda
                }
            });
        }

        const nuevaReunion = await reunionService.crearReunion(reunionData);
        
        // Enviar notificaciones de convocatoria a miembros de la junta directiva
        try {
          const notificacionService = new NotificacionService();
          const miembrosJunta = reunionData.convocados?.filter((convocado: any) => convocado.esMiembro) || [];
          
          if (miembrosJunta.length > 0) {
            const fechaReunion = new Date(reunionData.hora_inicio);
            
            for (const miembro of miembrosJunta) {
              try {
                await notificacionService.crearNotificacion(
                  TipoNotificacion.CONVOCATORIA,
                  reunionData.organizacion, // emisor será la organización
                  miembro.correo,
                  {
                    tituloReunion: reunionData.titulo,
                    fechaReunion: fechaReunion.toISOString(),
                    lugar: reunionData.lugar,
                    reunionId: nuevaReunion._id
                  }
                );
              } catch (notifError) {
                console.warn(`Error al enviar notificación a ${miembro.correo}:`, notifError);
                // No fallar la creación de la reunión por errores de notificación
              }
            }
          }
        } catch (error) {
          console.warn('Error al enviar notificaciones de convocatoria:', error);
          // No fallar la creación de la reunión por errores de notificación
        }
        
        return res.status(201).json(nuevaReunion);
    } catch (error) {
        console.error('Error al crear la reunión:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}