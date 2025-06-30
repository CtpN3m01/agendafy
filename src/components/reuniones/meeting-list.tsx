// src/components/reuniones/meeting-list.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CalendarDays,
  Users,
  MapPin,
  Plus,
  Loader2,
  Eye,
  FileText,
  Info
} from "lucide-react";
import { useMeetings } from "@/hooks/use-meetings";
import { useUserPermissions, useUserRole } from "@/hooks/use-user-permissions";
import { useAuth } from "@/hooks/use-auth";
import { CreateMeetingDialog } from "./create-meeting-dialog";

interface MeetingListProps {
  organizacionId?: string;
}

export function MeetingList({ organizacionId }: MeetingListProps) {
  const router = useRouter();
  const { meetings, isLoading, error, refetch } = useMeetings(organizacionId);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Usar el sistema de permisos basado en Visitor Pattern
  const permissions = useUserPermissions();
  const { role, displayName } = useUserRole();
  const { user } = useAuth();
  
  // Filtrar reuniones según el rol del usuario
  const filteredMeetings = useMemo(() => {
    // LÓGICA MEJORADA: Si el tipo es undefined, asumimos que es administrador
    const isAdmin = (
      role === 'admin' || 
      user?.type === 'usuario' || 
      (!user?.type && permissions.canCreate) || 
      !user?.type 
    );
    
    if (isAdmin) {
      // Los administradores ven todas las reuniones
      return meetings;
    } else {
      // Los miembros de junta solo ven reuniones donde han sido convocados
      return meetings.filter(meeting => 
        meeting.convocados?.some(convocado => 
          convocado.correo === user?.correo
        )
      );
    }
  }, [meetings, role, user, permissions]);
  
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
      {/* Header con información según el rol */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">Reuniones</h2>
            <Badge variant={
              (role === 'admin' || user?.type === 'usuario' || !user?.type) ? 'default' : 'secondary'
            }>
              {user?.type === 'usuario' ? 'Administrador' : 
               (!user?.type ? 'Administrador' : displayName)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {filteredMeetings.length === 0 
              ? ((role === 'admin' || user?.type === 'usuario' || !user?.type)
                  ? "No hay reuniones registradas. Crea tu primera reunión para comenzar." 
                  : "No hay reuniones en las que hayas sido convocado")
              : `${filteredMeetings.length} reunión${filteredMeetings.length !== 1 ? 'es' : ''} encontrada${filteredMeetings.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        
        {/* Botón crear - Para administradores (incluye fallback para undefined) */}
        {(permissions.canCreate || user?.type === 'usuario' || !user?.type) && (
          <Button onClick={handleCreateMeeting}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reunión
          </Button>
        )}
      </div>

      {/* Mensaje informativo para miembros de junta */}
      {role === 'board-member' && user?.type === 'miembro' && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            👁️ <strong>Modo de visualización:</strong> Solo puedes ver las reuniones donde has sido convocado. 
            Los cambios los realiza el administrador de la organización.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de reuniones */}
      {filteredMeetings.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {(role === 'admin' || user?.type === 'usuario' || !user?.type) ? 'No hay reuniones' : 'No hay reuniones para ti'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {(role === 'admin' || user?.type === 'usuario' || !user?.type)
                  ? 'Comienza creando tu primera reunión para organizar tu agenda.'
                  : 'Aún no has sido convocado a ninguna reunión. El administrador puede agregarte a futuras reuniones.'
                }
              </p>
              {(permissions.canCreate || user?.type === 'usuario' || !user?.type) && (
                <Button onClick={handleCreateMeeting}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Reunión
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map((meeting) => (
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