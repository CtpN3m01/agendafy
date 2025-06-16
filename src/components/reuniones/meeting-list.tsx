// src/components/reuniones/meeting-list.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarDays,
  Users,
  MapPin,
  Plus,
  Loader2,
  Eye,
  FileText
} from "lucide-react";
import { useMeetings } from "@/hooks/use-meetings";
import { CreateMeetingDialog } from "./create-meeting-dialog";

interface MeetingListProps {
  organizacionId?: string;
}

export function MeetingList({ organizacionId }: MeetingListProps) {
  const router = useRouter();
  const { meetings, isLoading, error, refetch } = useMeetings(organizacionId);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Sin fecha";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "Sin hora";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  // Handler para navegar al detalle de la reunión
  const handleMeetingClick = (meetingId: string) => {
    router.push(`/reuniones/${meetingId}`);
  };

  // Handler para crear nueva reunión
  const handleCreateMeeting = () => {
    setCreateDialogOpen(true);
  };

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando reuniones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de crear */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reuniones</h2>
          <p className="text-muted-foreground">
            {meetings.length === 0 
              ? "No hay reuniones registradas" 
              : `${meetings.length} reunión${meetings.length !== 1 ? 'es' : ''} encontrada${meetings.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <Button onClick={handleCreateMeeting}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reunión
        </Button>
      </div>

      {/* Lista de reuniones */}
      {meetings.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No hay reuniones</h3>
              <p className="text-muted-foreground mb-4">
                Comienza creando tu primera reunión para organizar tu agenda.
              </p>
              <Button onClick={handleCreateMeeting}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Reunión
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <Card 
              key={meeting._id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleMeetingClick(meeting._id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate" title={meeting.titulo}>
                      {meeting.titulo}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default" className="text-xs">
                        {meeting.tipo_reunion}
                      </Badge>
                      <Badge 
                        variant={meeting.modalidad === 'Virtual' ? 'secondary' : 'outline'} 
                        className="text-xs"
                      >
                        {meeting.modalidad}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMeetingClick(meeting._id);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Fecha y hora */}
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{formatDate(meeting.hora_inicio)}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatTime(meeting.hora_inicio)}
                      {meeting.hora_fin && ` - ${formatTime(meeting.hora_fin)}`}
                    </p>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate" title={meeting.lugar}>
                    {meeting.lugar || 'Sin ubicación especificada'}
                  </span>
                </div>

                {/* Convocados */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{meeting.convocados?.length || 0} convocados</span>
                  {meeting.convocados && meeting.convocados.length > 0 && (
                    <div className="flex -space-x-1 ml-2">
                      {meeting.convocados.slice(0, 3).map((convocado, index) => (
                        <Avatar key={index} className="h-6 w-6 border-2 border-background">
                          <AvatarFallback className="text-xs">
                            {convocado.nombre?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {meeting.convocados.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            +{meeting.convocados.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Archivos adjuntos */}
                {meeting.archivos && meeting.archivos.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{meeting.archivos.length} archivo{meeting.archivos.length !== 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Estado visual según fecha */}
                <div className="pt-2 border-t">
                  {new Date(meeting.hora_inicio) > new Date() ? (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                      Próxima
                    </div>
                  ) : new Date(meeting.hora_inicio).toDateString() === new Date().toDateString() ? (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                      Hoy
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                      Finalizada
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de crear reunión */}
      <CreateMeetingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        organizacionId={organizacionId}
      />
    </div>
  );
}