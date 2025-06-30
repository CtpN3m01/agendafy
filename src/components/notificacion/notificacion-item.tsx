import React from 'react';
import { NotificacionResponseDTO, TipoNotificacion } from '@/types/NotificacionDTO';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, CheckCircle, Clock, Mail, Trash2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificacionItemProps {
  notificacion: NotificacionResponseDTO;
  onMarcarLeida?: (id: string) => void;
  onEliminar?: (id: string) => void;
  onClick?: (notificacion: NotificacionResponseDTO) => void;
  compact?: boolean;
}

export const NotificacionItem: React.FC<NotificacionItemProps> = ({
  notificacion,
  onMarcarLeida,
  onEliminar,
  onClick,
  compact = false
}) => {
  const formatearFecha = (fecha: Date) => {
    const now = new Date();
    const notifDate = new Date(fecha);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return notifDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

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

  const getTipoBadgeColor = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case TipoNotificacion.ASIGNACION:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case TipoNotificacion.CONVOCATORIA:
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleMarcarLeida = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarcarLeida && !notificacion.leida) {
      onMarcarLeida(notificacion.id);
    }
  };

  const handleEliminar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEliminar) {
      onEliminar(notificacion.id);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(notificacion);
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
          !notificacion.leida 
            ? "bg-blue-50 border-blue-200 hover:bg-blue-100" 
            : "bg-white hover:bg-gray-50",
          "border-l-4",
          !notificacion.leida ? "border-l-blue-500" : "border-l-gray-300"
        )}
        onClick={handleClick}
      >
        <div className="flex-shrink-0 mt-1">
          {getTipoIcon(notificacion.tipo)}
        </div>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium leading-5",
                !notificacion.leida ? "text-gray-900" : "text-gray-600"
              )}>
                {notificacion.asunto}
              </p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-4">
                {notificacion.contenido}
              </p>
            </div>
            
            <div className="flex flex-col items-end space-y-1 flex-shrink-0">
              <span className="text-xs text-gray-500">
                {formatearFecha(notificacion.fecha)}
              </span>
              {!notificacion.leida && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              {/* Botón borrar */}
              <Button
                size="icon"
                variant="ghost"
                onClick={handleEliminar}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              De: {notificacion.emisor}
            </span>
            <Badge 
              variant="secondary" 
              className={cn("text-xs px-2 py-0.5", getTipoBadgeColor(notificacion.tipo))}
            >
              {notificacion.tipo === TipoNotificacion.ASIGNACION ? 'Asignación' : 'Convocatoria'}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      "transition-all duration-200 cursor-pointer",
      !notificacion.leida 
        ? "bg-blue-50 border-blue-200 shadow-md hover:shadow-lg" 
        : "bg-white hover:shadow-md",
      "border-l-4",
      !notificacion.leida ? "border-l-blue-500" : "border-l-gray-300"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between space-x-3">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gray-200">
                {getTipoIcon(notificacion.tipo)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={cn(
                  "text-sm truncate",
                  !notificacion.leida ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                )}>
                  {notificacion.asunto}
                </h4>
                
                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", getTipoBadgeColor(notificacion.tipo))}
                  >
                    {notificacion.tipo}
                  </Badge>
                  
                  {!notificacion.leida && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  De: {notificacion.emisor}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatearFecha(notificacion.fecha)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0" onClick={handleClick}>
        <p className="text-sm text-gray-600 mb-4">
          {notificacion.contenido}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!notificacion.leida ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarcarLeida}
                className="text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Marcar como leída
              </Button>
            ) : (
              <span className="text-xs text-green-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Leída
              </span>
            )}
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEliminar}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
