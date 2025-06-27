import React, { useState, useMemo } from 'react';
import { NotificacionResponseDTO, TipoNotificacion } from '@/types/NotificacionDTO';
import { NotificacionItem } from './notificacion-item';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  CheckCheck, 
  Filter, 
  Mail, 
  MailOpen, 
  RefreshCw, 
  Search, 
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificacionListaProps {
  notificaciones: NotificacionResponseDTO[];
  conteoNoLeidas: number;
  isLoading: boolean;
  onMarcarLeida: (id: string) => Promise<boolean>;
  onMarcarVariasLeidas: (ids: string[]) => Promise<number>;
  onEliminar: (id: string) => Promise<boolean>;
  onRefrescar: () => Promise<void>;
  onNotificacionClick?: (notificacion: NotificacionResponseDTO) => void;
}

type FiltroTipo = 'TODOS' | TipoNotificacion;
type FiltroEstado = 'TODOS' | 'LEIDAS' | 'NO_LEIDAS';

export const NotificacionLista: React.FC<NotificacionListaProps> = ({
  notificaciones,
  conteoNoLeidas,
  isLoading,
  onMarcarLeida,
  onMarcarVariasLeidas,
  onEliminar,
  onRefrescar,
  onNotificacionClick
}) => {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODOS');
  const [notificacionesSeleccionadas, setNotificacionesSeleccionadas] = useState<string[]>([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const notificacionesFiltradas = useMemo(() => {
    return notificaciones.filter(notif => {
      // Filtro por texto
      const coincideTexto = !filtroTexto || 
        notif.asunto.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        notif.contenido.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        notif.emisor.toLowerCase().includes(filtroTexto.toLowerCase());

      // Filtro por tipo
      const coincideTipo = filtroTipo === 'TODOS' || notif.tipo === filtroTipo;

      // Filtro por estado
      let coincideEstado = true;
      if (filtroEstado === 'LEIDAS') coincideEstado = notif.leida;
      if (filtroEstado === 'NO_LEIDAS') coincideEstado = !notif.leida;

      return coincideTexto && coincideTipo && coincideEstado;
    });
  }, [notificaciones, filtroTexto, filtroTipo, filtroEstado]);

  const handleSeleccionarNotificacion = (id: string, seleccionado: boolean) => {
    if (seleccionado) {
      setNotificacionesSeleccionadas(prev => [...prev, id]);
    } else {
      setNotificacionesSeleccionadas(prev => prev.filter(nId => nId !== id));
    }
  };

  const handleSeleccionarTodas = () => {
    const noLeidas = notificacionesFiltradas.filter(n => !n.leida).map(n => n.id);
    setNotificacionesSeleccionadas(noLeidas);
  };

  const handleDeseleccionarTodas = () => {
    setNotificacionesSeleccionadas([]);
  };

  const handleMarcarSeleccionadasLeidas = async () => {
    if (notificacionesSeleccionadas.length > 0) {
      await onMarcarVariasLeidas(notificacionesSeleccionadas);
      setNotificacionesSeleccionadas([]);
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltroTexto('');
    setFiltroTipo('TODOS');
    setFiltroEstado('TODOS');
    setMostrarFiltros(false);
  };

  const hayFiltrosActivos = filtroTexto || filtroTipo !== 'TODOS' || filtroEstado !== 'TODOS';

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Buzón de Notificaciones</CardTitle>
              {conteoNoLeidas > 0 && (
                <Badge variant="destructive" className="h-5">
                  {conteoNoLeidas}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={cn(mostrarFiltros && "bg-gray-100")}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtros
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onRefrescar}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filtros */}
        {mostrarFiltros && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Búsqueda por texto */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar en notificaciones..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filtro por tipo */}
                <Select
                  value={filtroTipo}
                  onValueChange={(value) => setFiltroTipo(value as FiltroTipo)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de notificación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos los tipos</SelectItem>
                    <SelectItem value={TipoNotificacion.ASIGNACION}>Asignación</SelectItem>
                    <SelectItem value={TipoNotificacion.CONVOCATORIA}>Convocatoria</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro por estado */}
                <Select
                  value={filtroEstado}
                  onValueChange={(value) => setFiltroEstado(value as FiltroEstado)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todas</SelectItem>
                    <SelectItem value="NO_LEIDAS">No leídas</SelectItem>
                    <SelectItem value="LEIDAS">Leídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Acciones de filtros */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {hayFiltrosActivos && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLimpiarFiltros}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpiar filtros
                    </Button>
                  )}
                  
                  <span className="text-sm text-gray-500">
                    {notificacionesFiltradas.length} de {notificaciones.length} notificaciones
                  </span>
                </div>

                {/* Acciones masivas */}
                <div className="flex items-center space-x-2">
                  {notificacionesSeleccionadas.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarcarSeleccionadasLeidas}
                      >
                        <CheckCheck className="h-4 w-4 mr-1" />
                        Marcar leídas ({notificacionesSeleccionadas.length})
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeseleccionarTodas}
                      >
                        Deseleccionar
                      </Button>
                    </>
                  )}
                  
                  {notificacionesSeleccionadas.length === 0 && conteoNoLeidas > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSeleccionarTodas}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Seleccionar no leídas
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <Separator className="mt-4" />
          </CardContent>
        )}
      </Card>

      {/* Lista de notificaciones */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] max-h-[70vh]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Cargando notificaciones...</span>
              </div>
            ) : notificacionesFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                {notificaciones.length === 0 ? (
                  <>
                    <MailOpen className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No tienes notificaciones</p>
                    <p className="text-gray-400 text-sm">Las nuevas notificaciones aparecerán aquí</p>
                  </>
                ) : (
                  <>
                    <Search className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No se encontraron notificaciones</p>
                    <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {notificacionesFiltradas.map((notificacion, index) => (
                  <div key={notificacion.id} className="relative">
                    {/* Checkbox para selección múltiple */}
                    {!notificacion.leida && (
                      <div className="absolute top-4 left-4 z-10">
                        <input
                          type="checkbox"
                          checked={notificacionesSeleccionadas.includes(notificacion.id)}
                          onChange={(e) => handleSeleccionarNotificacion(notificacion.id, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </div>
                    )}
                    
                    <div className={cn(
                      "transition-all duration-200",
                      notificacionesSeleccionadas.includes(notificacion.id) && "ml-8"
                    )}>
                      <NotificacionItem
                        notificacion={notificacion}
                        onMarcarLeida={onMarcarLeida}
                        onEliminar={onEliminar}
                        onClick={onNotificacionClick}
                        compact={true}
                      />
                    </div>
                    
                    {index < notificacionesFiltradas.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
