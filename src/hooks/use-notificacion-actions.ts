import { useCallback } from 'react';
import { toast } from 'sonner';

interface UseNotificacionActionsProps {
  onMarcarLeida?: (id: string) => Promise<boolean>;
  onMarcarVariasLeidas?: (ids: string[]) => Promise<number>;
  onEliminar?: (id: string) => Promise<boolean>;
  onRefrescar?: () => Promise<void>;
}

export const useNotificacionActions = ({
  onMarcarLeida,
  onMarcarVariasLeidas,
  onEliminar,
  onRefrescar
}: UseNotificacionActionsProps) => {
  
  const handleMarcarLeida = useCallback(async (id: string): Promise<boolean> => {
    if (!onMarcarLeida) return false;
    
    try {
      const resultado = await onMarcarLeida(id);
      if (resultado) {
        toast.success("Notificación marcada como leída");
      } else {
        toast.error("No se pudo marcar como leída");
      }
      return resultado;
    } catch (error) {
      console.error('Error al marcar como leída:', error);
      toast.error("Error al marcar como leída");
      return false;
    }
  }, [onMarcarLeida]);

  const handleMarcarVariasLeidas = useCallback(async (ids: string[]): Promise<number> => {
    if (!onMarcarVariasLeidas) return 0;
    
    try {
      const cantidad = await onMarcarVariasLeidas(ids);
      if (cantidad > 0) {
        toast.success(`${cantidad} notificaciones marcadas como leídas`);
      } else {
        toast.error("No se pudieron marcar las notificaciones");
      }
      return cantidad;
    } catch (error) {
      console.error('Error al marcar notificaciones como leídas:', error);
      toast.error("Error al marcar notificaciones como leídas");
      return 0;
    }
  }, [onMarcarVariasLeidas]);

  const handleEliminar = useCallback(async (id: string): Promise<boolean> => {
    if (!onEliminar) return false;
    
    try {
      const resultado = await onEliminar(id);
      if (resultado) {
        toast.success("Notificación eliminada");
      } else {
        toast.error("No se pudo eliminar la notificación");
      }
      return resultado;
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      toast.error("Error al eliminar notificación");
      return false;
    }
  }, [onEliminar]);

  const handleRefrescar = useCallback(async (): Promise<void> => {
    if (!onRefrescar) return;
    
    try {
      await onRefrescar();
      toast.success("Notificaciones actualizadas");
    } catch (error) {
      console.error('Error al refrescar notificaciones:', error);
      toast.error("Error al actualizar notificaciones");
    }
  }, [onRefrescar]);

  return {
    handleMarcarLeida,
    handleMarcarVariasLeidas,
    handleEliminar,
    handleRefrescar
  };
};
