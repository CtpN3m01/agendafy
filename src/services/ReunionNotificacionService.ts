import { NotificacionService } from './NotificacionService';
import { TipoNotificacion } from '@/types/NotificacionDTO';
import { ConvocadoDTO } from '@/types/ReunionDTO';

export interface DatosReunionNotificacion {
  reunionId: string;
  titulo: string;
  fechaReunion: string;
  lugar: string;
  modalidad: 'Presencial' | 'Virtual';
  tipoReunion: 'Ordinaria' | 'Extraordinaria';
  agendaId?: string;
  emisor: string; // Quien crea la reunión
}

export interface DatosAsignacionNotificacion {
  reunionId: string;
  titulo: string;
  fechaReunion: string;
  rolAsignado: string;
  emisor: string;
}

/**
 * Servicio especializado para manejar notificaciones relacionadas con reuniones
 * Aplica el principio de responsabilidad única y evita duplicación de código
 */
export class ReunionNotificacionService {
  private notificacionService: NotificacionService;

  constructor() {
    this.notificacionService = new NotificacionService();
  }

  /**
   * Envía notificaciones de convocatoria a todos los convocados de una reunión
   */
  async enviarNotificacionesConvocatoria(
    convocados: ConvocadoDTO[],
    datosReunion: DatosReunionNotificacion
  ): Promise<{
    exitosas: number;
    fallidas: { correo: string; error: string }[];
  }> {
    const resultados = {
      exitosas: 0,
      fallidas: [] as { correo: string; error: string }[]
    };

    // Filtrar solo miembros de la organización para notificaciones automáticas
    const miembrosParaNotificar = convocados.filter(convocado => convocado.esMiembro);

    for (const convocado of miembrosParaNotificar) {
      try {
        await this.notificacionService.crearNotificacion(
          TipoNotificacion.CONVOCATORIA,
          datosReunion.emisor,
          convocado.correo,
          {
            reunionId: datosReunion.reunionId,
            tituloReunion: datosReunion.titulo,
            fechaReunion: datosReunion.fechaReunion,
            lugarReunion: datosReunion.lugar,
            modalidad: datosReunion.modalidad,
            tipoReunion: datosReunion.tipoReunion,
            agendaId: datosReunion.agendaId
          }
        );
        
        resultados.exitosas++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
        resultados.fallidas.push({
          correo: convocado.correo,
          error: errorMsg
        });
        
        console.warn(`Error al enviar notificación de convocatoria a ${convocado.correo}:`, errorMsg);
      }
    }

    return resultados;
  }

  /**
   * Envía notificación de asignación de rol a un miembro específico
   */
  async enviarNotificacionAsignacion(
    destinatario: string,
    datosAsignacion: DatosAsignacionNotificacion
  ): Promise<boolean> {
    try {
      await this.notificacionService.crearNotificacion(
        TipoNotificacion.ASIGNACION,
        datosAsignacion.emisor,
        destinatario,
        {
          reunionId: datosAsignacion.reunionId,
          tituloReunion: datosAsignacion.titulo,
          fechaReunion: datosAsignacion.fechaReunion,
          rolAsignado: datosAsignacion.rolAsignado
        }
      );
      
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`Error al enviar notificación de asignación a ${destinatario}:`, errorMsg);
      return false;
    }
  }

  /**
   * Envía notificaciones masivas de convocatoria (para reuniones extraordinarias)
   */
  async enviarNotificacionesConvocatoriaMasiva(
    correosDestinatarios: string[],
    datosReunion: DatosReunionNotificacion
  ): Promise<{
    exitosas: number;
    fallidas: { correo: string; error: string }[];
  }> {
    const resultados = {
      exitosas: 0,
      fallidas: [] as { correo: string; error: string }[]
    };

    for (const correo of correosDestinatarios) {
      try {
        await this.notificacionService.crearNotificacion(
          TipoNotificacion.CONVOCATORIA,
          datosReunion.emisor,
          correo,
          {
            reunionId: datosReunion.reunionId,
            tituloReunion: datosReunion.titulo,
            fechaReunion: datosReunion.fechaReunion,
            lugarReunion: datosReunion.lugar,
            modalidad: datosReunion.modalidad,
            tipoReunion: datosReunion.tipoReunion,
            agendaId: datosReunion.agendaId
          }
        );
        
        resultados.exitosas++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
        resultados.fallidas.push({
          correo,
          error: errorMsg
        });
        
        console.warn(`Error al enviar notificación masiva a ${correo}:`, errorMsg);
      }
    }

    return resultados;
  }

  /**
   * Valida que los datos de reunión sean correctos antes de enviar notificaciones
   */
  private validarDatosReunion(datos: DatosReunionNotificacion): void {
    if (!datos.reunionId) throw new Error('ID de reunión requerido');
    if (!datos.titulo) throw new Error('Título de reunión requerido');
    if (!datos.fechaReunion) throw new Error('Fecha de reunión requerida');
    if (!datos.lugar) throw new Error('Lugar de reunión requerido');
    if (!datos.emisor) throw new Error('Emisor requerido');
    
    // Validar que la fecha sea futura
    const fechaReunion = new Date(datos.fechaReunion);
    if (fechaReunion <= new Date()) {
      throw new Error('La fecha de reunión debe ser futura');
    }
  }
}

// Instancia singleton del servicio
export const reunionNotificacionService = new ReunionNotificacionService();
