import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { NotificacionItem } from './notificacion-item';
import { NotificacionResponseDTO } from '@/types/NotificacionDTO';
import { cn } from '@/lib/utils';

interface NotificacionBellProps {
  notificaciones: NotificacionResponseDTO[];
  conteoNoLeidas: number;
  isLoading: boolean;
  onMarcarLeida: (id: string) => Promise<boolean>;
  onEliminar: (id: string) => Promise<boolean>;
  onVerTodas: () => void;
  onNotificacionClick?: (notificacion: NotificacionResponseDTO) => void;
  maxNotificacionesPreview?: number;
}

export const NotificacionBell: React.FC<NotificacionBellProps> = ({
  notificaciones,
  conteoNoLeidas,
  isLoading,
  onMarcarLeida,
  onEliminar,
  onVerTodas,
  onNotificacionClick,
  maxNotificacionesPreview = 5
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Obtener las notificaciones más recientes no leídas para el preview
  const notificacionesPreview = notificaciones
    .filter(n => !n.leida)
    .slice(0, maxNotificacionesPreview);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  const handleVerTodas = () => {
    setIsOpen(false);
    onVerTodas();
  };

  const handleNotificacionClick = (notificacion: NotificacionResponseDTO) => {
    setIsOpen(false);
    if (onNotificacionClick) {
      onNotificacionClick(notificacion);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2"
          onClick={handleBellClick}
        >
          <Bell className={cn(
            "h-5 w-5 transition-colors",
            conteoNoLeidas > 0 ? "text-blue-600" : "text-gray-600"
          )} />
          
          {conteoNoLeidas > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {conteoNoLeidas > 99 ? '99+' : conteoNoLeidas}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-80 p-0" 
        align="end" 
        sideOffset={5}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notificaciones</h3>
          <div className="flex items-center space-x-2">
            {conteoNoLeidas > 0 && (
              <Badge variant="secondary" className="text-xs">
                {conteoNoLeidas} nuevas
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-500">Cargando...</span>
            </div>
          ) : notificacionesPreview.length === 0 ? (
            <div className="py-6 text-center">
              <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No tienes notificaciones nuevas</p>
            </div>
          ) : (
            <div className="py-2">
              {notificacionesPreview.map((notificacion, index) => (
                <div key={notificacion.id}>
                  <div className="px-2">
                    <NotificacionItem
                      notificacion={notificacion}
                      onMarcarLeida={onMarcarLeida}
                      onEliminar={onEliminar}
                      onClick={handleNotificacionClick}
                      compact={true}
                    />
                  </div>
                  {index < notificacionesPreview.length - 1 && (
                    <Separator className="my-1" />
                  )}
                </div>
              ))}
              
              {conteoNoLeidas > maxNotificacionesPreview && (
                <>
                  <Separator className="my-2" />
                  <div className="px-4 py-2 text-center">
                    <p className="text-xs text-gray-500 mb-2">
                      Y {conteoNoLeidas - maxNotificacionesPreview} notificaciones más...
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </ScrollArea>

        {notificaciones.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={handleVerTodas}
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
