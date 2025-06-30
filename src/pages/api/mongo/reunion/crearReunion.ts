import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ReunionService } from '@/services/ReunionService';
import { reunionNotificacionService } from '@/services/ReunionNotificacionService';
import { AgendaService } from '@/services/AgendaService';
import { ConvocadoDTO } from '@/types/ReunionDTO';

// Tipado explícito para los parámetros y retorno
interface GenerarAsignacion {
  destinatario: string;
  datosAsignacion: {
    reunionId: string;
    titulo: string;
    fechaReunion: string;
    rolAsignado: string;
    emisor: string;
  };
}

async function generarAsignacionesParaPuntos(
  reunionId: string,
  reunionData: any,
  agendaService: any,
  convocados: ConvocadoDTO[]
): Promise<GenerarAsignacion[]> {
  // 1. Obtener la agenda con puntos poblados
  const agenda = await agendaService.obtenerAgendaConDatos(reunionData.agenda);
  if (!agenda || !agenda.puntos || !Array.isArray(agenda.puntos)) return [];

  // 2. Mapear cada punto a la estructura de notificación de asignación
  const asignaciones = agenda.puntos
    .filter((punto: any) => punto.expositor && typeof punto.expositor === 'string')
    .map((punto: any) => {
      // Buscar el correo del expositor en la lista de convocados
      const expositorConvocado = convocados.find(
        (conv) => conv.nombre.trim().toLowerCase() === punto.expositor.trim().toLowerCase()
      );
      return {
        destinatario: expositorConvocado?.correo || '',
        datosAsignacion: {
          reunionId: String(reunionId),
          titulo: punto.titulo,
          fechaReunion: reunionData.hora_inicio,
          rolAsignado: punto.tipo,
          emisor: reunionData.organizacion
        }
      };
    })
    // Solo incluir si se encontró correo válido
    .filter((asig: GenerarAsignacion) => !!asig.destinatario);

  return asignaciones;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    try {
        await connectToDatabase();
        const reunionService = new ReunionService();
        const agendaService = new AgendaService();
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
                
                if (resultadosNotificacion.fallidas.length > 0) {
                    console.warn('Errores en notificaciones:', resultadosNotificacion.fallidas);
                }
            }

            // Generar asignaciones para los puntos de la agenda
            const asignaciones = await generarAsignacionesParaPuntos(
                String(nuevaReunion._id || nuevaReunion.id),
                reunionData,
                agendaService,
                convocados
            );
            
            // Se recorre para enviar las notificaciones de asignación:
            for (const { destinatario, datosAsignacion } of asignaciones) {
                await reunionNotificacionService.enviarNotificacionAsignacion(destinatario, datosAsignacion);
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