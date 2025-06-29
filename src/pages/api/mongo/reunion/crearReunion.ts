import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ReunionService } from '@/services/ReunionService';
import { reunionNotificacionService } from '@/services/ReunionNotificacionService';

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

        // Crear la reunión
        const nuevaReunion = await reunionService.crearReunion(reunionData);
        
        // Enviar notificaciones de convocatoria automáticamente
        try {
            const convocados = reunionData.convocados || [];
            
            if (convocados.length > 0) {
                const datosNotificacion = {
                    reunionId: String(nuevaReunion._id || nuevaReunion.id),
                    titulo: reunionData.titulo,
                    fechaReunion: reunionData.hora_inicio,
                    lugar: reunionData.lugar,
                    modalidad: reunionData.modalidad,
                    tipoReunion: reunionData.tipo_reunion,
                    agendaId: reunionData.agenda,
                    emisor: reunionData.organizacion // Usar organización como emisor por ahora
                };

                const resultadosNotificacion = await reunionNotificacionService
                    .enviarNotificacionesConvocatoria(convocados, datosNotificacion);

                console.log(`✅ Notificaciones enviadas: ${resultadosNotificacion.exitosas} exitosas, ${resultadosNotificacion.fallidas.length} fallidas`);
                
                if (resultadosNotificacion.fallidas.length > 0) {
                    console.warn('Errores en notificaciones:', resultadosNotificacion.fallidas);
                }
            }
        } catch (notificationError) {
            console.warn('Error al enviar notificaciones de convocatoria:', notificationError);
            // No fallar la creación de la reunión por errores de notificación
        }
        
        return res.status(201).json(nuevaReunion);
    } catch (error) {
        console.error('Error al crear la reunión:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}