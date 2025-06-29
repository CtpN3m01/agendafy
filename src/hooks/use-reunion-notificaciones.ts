import { useCallback } from 'react';
import { toast } from 'sonner';
import { reunionNotificacionService } from '@/services/ReunionNotificacionService';
import { ConvocadoDTO } from '@/types/ReunionDTO';

interface UseReunionNotificacionesProps {
  emisor?: string;
}

interface DatosReunionCompleta {
  id: string;
  titulo: string;
  fechaReunion: string;
  lugar: string;
  modalidad: 'Presencial' | 'Virtual';
  tipoReunion: 'Ordinaria' | 'Extraordinaria';
  agendaId?: string;
  convocados: ConvocadoDTO[];
}

/**
 * Hook para manejar notificaciones relacionadas con reuniones
 * Centraliza la lógica de envío de notificaciones automáticas
 */
export const useReunionNotificaciones = ({ emisor }: UseReunionNotificacionesProps = {}) => {
  
  /**
   * Envía notificaciones de convocatoria cuando se crea una reunión
   */
  const enviarNotificacionesCreacionReunion = useCallback(async (
    datosReunion: DatosReunionCompleta
  ): Promise<{
    success: boolean;
    exitosas: number;
    fallidas: number;
    errores?: string[];
  }> => {
    try {
      if (!emisor) {
        throw new Error('Emisor requerido para enviar notificaciones');
      }

      const datosNotificacion = {
        reunionId: datosReunion.id,
        titulo: datosReunion.titulo,
        fechaReunion: datosReunion.fechaReunion,
        lugar: datosReunion.lugar,
        modalidad: datosReunion.modalidad,
        tipoReunion: datosReunion.tipoReunion,
        agendaId: datosReunion.agendaId,
        emisor
      };

      const resultados = await reunionNotificacionService
        .enviarNotificacionesConvocatoria(datosReunion.convocados, datosNotificacion);

      const success = resultados.exitosas > 0;
      
      if (success) {
        if (resultados.fallidas.length === 0) {
          toast.success(`Se enviaron ${resultados.exitosas} notificaciones de convocatoria`);
        } else {
          toast.warning(
            `Se enviaron ${resultados.exitosas} notificaciones. ${resultados.fallidas.length} fallaron.`
          );
        }
      } else {
        toast.error('No se pudieron enviar las notificaciones de convocatoria');
      }

      return {
        success,
        exitosas: resultados.exitosas,
        fallidas: resultados.fallidas.length,
        errores: resultados.fallidas.map(f => f.error)
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error al enviar notificaciones de reunión:', errorMsg);
      toast.error(`Error al enviar notificaciones: ${errorMsg}`);
      
      return {
        success: false,
        exitosas: 0,
        fallidas: 1,
        errores: [errorMsg]
      };
    }
  }, [emisor]);

  /**
   * Envía notificación de asignación de rol
   */
  const enviarNotificacionAsignacion = useCallback(async (
    destinatario: string,
    datosAsignacion: {
      reunionId: string;
      titulo: string;
      fechaReunion: string;
      rolAsignado: string;
    }
  ): Promise<boolean> => {
    try {
      if (!emisor) {
        throw new Error('Emisor requerido para enviar notificaciones');
      }

      const success = await reunionNotificacionService.enviarNotificacionAsignacion(
        destinatario,
        {
          ...datosAsignacion,
          emisor
        }
      );

      if (success) {
        toast.success(`Notificación de asignación enviada a ${destinatario}`);
      } else {
        toast.error('Error al enviar notificación de asignación');
      }

      return success;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error al enviar notificación de asignación:', errorMsg);
      toast.error(`Error al enviar notificación: ${errorMsg}`);
      return false;
    }
  }, [emisor]);

  /**
   * Envía notificaciones masivas (para reuniones extraordinarias urgentes)
   */
  const enviarNotificacionesMasivas = useCallback(async (
    destinatarios: string[],
    datosReunion: Omit<DatosReunionCompleta, 'convocados'>
  ): Promise<{
    success: boolean;
    exitosas: number;
    fallidas: number;
    errores?: string[];
  }> => {
    try {
      if (!emisor) {
        throw new Error('Emisor requerido para enviar notificaciones');
      }

      const datosNotificacion = {
        reunionId: datosReunion.id,
        titulo: datosReunion.titulo,
        fechaReunion: datosReunion.fechaReunion,
        lugar: datosReunion.lugar,
        modalidad: datosReunion.modalidad,
        tipoReunion: datosReunion.tipoReunion,
        agendaId: datosReunion.agendaId,
        emisor
      };

      const resultados = await reunionNotificacionService
        .enviarNotificacionesConvocatoriaMasiva(destinatarios, datosNotificacion);

      const success = resultados.exitosas > 0;
      
      if (success) {
        toast.success(`Notificaciones masivas enviadas: ${resultados.exitosas} exitosas`);
      } else {
        toast.error('No se pudieron enviar las notificaciones masivas');
      }

      return {
        success,
        exitosas: resultados.exitosas,
        fallidas: resultados.fallidas.length,
        errores: resultados.fallidas.map(f => f.error)
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error al enviar notificaciones masivas:', errorMsg);
      toast.error(`Error al enviar notificaciones masivas: ${errorMsg}`);
      
      return {
        success: false,
        exitosas: 0,
        fallidas: destinatarios.length,
        errores: [errorMsg]
      };
    }
  }, [emisor]);

  return {
    enviarNotificacionesCreacionReunion,
    enviarNotificacionAsignacion,
    enviarNotificacionesMasivas
  };
};
