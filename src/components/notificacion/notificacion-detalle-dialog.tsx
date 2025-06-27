import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificacionResponseDTO, TipoNotificacion } from '@/types/NotificacionDTO';
import { User, Calendar, Mail } from 'lucide-react';

interface NotificacionDetalleDialogProps {
  notificacion: NotificacionResponseDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarcarLeida?: (id: string) => Promise<void>;
}

export const NotificacionDetalleDialog: React.FC<NotificacionDetalleDialogProps> = ({
  notificacion,
  open,
  onOpenChange,
  onMarcarLeida
}) => {
  const getTipoIcon = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case TipoNotificacion.ASIGNACION:
        return <User className="h-4 w-4 text-blue-600" />;
      case TipoNotificacion.CONVOCATORIA:
        return <Calendar className="h-4 w-4 text-green-600" />;
      default:
        return <Mail className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatearFechaCompleta = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarcarLeida = async () => {
    if (notificacion && onMarcarLeida && !notificacion.leida) {
      await onMarcarLeida(notificacion.id);
      onOpenChange(false);
    }
  };

  if (!notificacion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            {getTipoIcon(notificacion.tipo)}
            <div className="flex-1">
              <DialogTitle className="text-lg leading-6">
                {notificacion.asunto}
              </DialogTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {notificacion.tipo === TipoNotificacion.ASIGNACION ? 'Asignación' : 'Convocatoria'}
                </Badge>
                {!notificacion.leida && (
                  <Badge variant="destructive" className="text-xs">
                    No leída
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <DialogDescription className="text-base leading-6">
              {notificacion.contenido}
            </DialogDescription>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">De:</span>
              <p className="mt-1">{notificacion.emisor}</p>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">Fecha:</span>
              <p className="mt-1">{formatearFechaCompleta(notificacion.fecha)}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            {!notificacion.leida && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarcarLeida}
              >
                Marcar como leída
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
