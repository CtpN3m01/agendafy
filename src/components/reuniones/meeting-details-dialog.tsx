"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Mail,
  Link as LinkIcon,
  CheckCircle,
  Info,
  AlertCircle
} from "lucide-react";
import { ReunionData } from "@/hooks/use-meetings";
import { useAgendas } from "@/hooks/use-agendas";

interface MeetingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: ReunionData | null;
  organizacionId: string;
}

export function MeetingDetailsDialog({
  open,
  onOpenChange,
  meeting,
  organizacionId
}: MeetingDetailsDialogProps) {
  const { agendas } = useAgendas(organizacionId);
  const [selectedAgenda, setSelectedAgenda] = useState<any>(null);
  useEffect(() => {
    if (meeting && agendas.length > 0) {
      const agenda = agendas.find(a => a._id === meeting.agenda);
      setSelectedAgenda(agenda || null);
    }
  }, [meeting, agendas]);

  if (!meeting) return null;
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Fecha inválida";
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return "Hora inválida";
      }
      return new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (error) {
      console.error('Error formatting time:', error);
      return "Hora inválida";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'programada':
        return 'default';
      case 'en_progreso':
        return 'secondary';
      case 'finalizada':
        return 'outline';
      case 'cancelada':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'programada':
        return 'Programada';
      case 'en_progreso':
        return 'En Progreso';
      case 'finalizada':
        return 'Finalizada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status || 'Sin estado';
    }
  };

  const getTipoReunionText = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'ordinaria':
        return 'Ordinaria';
      case 'presencial':
        return 'Presencial';
      case 'virtual':
        return 'Virtual';
      case 'hibrida':
        return 'Híbrida';
      default:
        return tipo || 'No especificado';
    }
  };

  const getPuntoIcon = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'informativo':
        return <Info className="h-4 w-4" />;
      case 'aprobacion':
        return <CheckCircle className="h-4 w-4" />;
      case 'de_fondo':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getPuntoColor = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'informativo':
        return 'text-blue-600';
      case 'aprobacion':
        return 'text-green-600';
      case 'de_fondo':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {meeting.titulo}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Fecha:</span>
                  <span>{formatDate(meeting.hora_inicio)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Hora:</span>
                  <span>{formatTime(meeting.hora_inicio)}</span>
                </div>

                {meeting.lugar && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Lugar:</span>
                    <span>{meeting.lugar}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Convocados:</span>
                  <span>{meeting.convocados?.length || 0}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Modalidad:</span>
                  <Badge variant="outline">
                    {meeting.modalidad}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">Tipo:</span>
                  <Badge variant="outline">
                    {getTipoReunionText(meeting.tipo_reunion)}
                  </Badge>
                </div>

                {meeting.hora_fin && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Hora fin:</span>
                    <span>{formatTime(meeting.hora_fin)}</span>
                  </div>
                )}
              </div>
            </div>{/* Convocados */}
            {meeting.convocados && meeting.convocados.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Convocados ({meeting.convocados.length})
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {meeting.convocados.map((convocado, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{convocado.nombre}</p>
                          <p className="text-sm text-muted-foreground">{convocado.correo}</p>
                          {convocado.esMiembro && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Miembro
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Agenda y Puntos */}
            {selectedAgenda && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Agenda: {selectedAgenda.nombre}
                  </h3>

                  {selectedAgenda.descripcion && (
                    <p className="text-muted-foreground mb-4">
                      {selectedAgenda.descripcion}
                    </p>
                  )}

                  {selectedAgenda.puntos && selectedAgenda.puntos.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-base">Puntos de la Agenda:</h4>
                      <div className="space-y-3">
                        {selectedAgenda.puntos.map((punto: any, index: number) => (
                          <div 
                            key={punto._id || index}
                            className="border rounded-lg p-4 bg-muted/50"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 ${getPuntoColor(punto.tipo)}`}>
                                {getPuntoIcon(punto.tipo)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="font-medium">{punto.titulo}</h5>
                                  <Badge variant="outline" className="text-xs">
                                    {punto.tipo || 'General'}
                                  </Badge>
                                </div>
                                {punto.descripcion && (
                                  <p className="text-sm text-muted-foreground">
                                    {punto.descripcion}
                                  </p>
                                )}
                                {punto.duracionEstimada && (
                                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{punto.duracionEstimada} minutos</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}            {/* Archivos */}
            {meeting.archivos && meeting.archivos.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Archivos Adjuntos ({meeting.archivos.length})
                  </h3>
                  <div className="space-y-2">
                    {meeting.archivos.map((archivo, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 text-sm">{archivo}</span>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Botón de enviar correo */}
            <Separator />
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {
                  // TODO: Implementar envío de correo
                  console.log('Enviar correo para reunión:', meeting._id);
                }}
              >
                <Mail className="h-4 w-4" />
                Enviar Correo
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
