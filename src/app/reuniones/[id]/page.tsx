"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Edit3, 
  Trash2,
  Mail,
  FileText,
  Loader2
} from "lucide-react";
import { useMeetings, type ReunionData } from "@/hooks/use-meetings";
import { useUserOrganization } from "@/hooks/use-user-organization";

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { organization } = useUserOrganization();
  const { getMeeting, deleteMeeting, sendEmail } = useMeetings(organization?.id);
  
  const [meeting, setMeeting] = useState<ReunionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const meetingId = params?.id as string;

  // Cargar datos de la reunión
  useEffect(() => {
    const loadMeeting = async () => {
      if (!meetingId) {
        setError("ID de reunión no válido");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getMeeting(meetingId);
        if (data) {
          setMeeting(data);
        } else {
          setError("Reunión no encontrada");
        }
      } catch (err) {
        console.error("Error al cargar la reunión:", err);
        setError("Error al cargar la reunión");
      } finally {
        setIsLoading(false);
      }
    };

    loadMeeting();
  }, [meetingId, getMeeting]);

  // Funciones de utilidad
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Sin fecha";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "Sin hora";
    const date = new Date(timeStr);
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "Sin fecha";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  // Handlers para los botones de acción
  const handleEdit = () => {
    // TODO: Implementar lógica de edición
    console.log("Editar reunión:", meetingId);
  };

  const handleDelete = async () => {
    if (!meetingId) return;
    
    try {
      setIsDeleting(true);
      const success = await deleteMeeting(meetingId);
      
      if (success) {
        // Redirigir a la lista de reuniones después de eliminar exitosamente
        router.push("/reuniones");
      } else {
        // El error ya se maneja en el hook, pero podemos mostrar una notificación adicional si es necesario
        console.error("No se pudo eliminar la reunión");
      }
    } catch (err) {
      console.error("Error al eliminar la reunión:", err);
    } finally {
      setIsDeleting(false);
    }
  };
  const handleSendEmail = () => {
    // TODO: Implementar lógica de envío de correo
    console.log("Enviar correo para reunión:", meetingId);
  };

  // Estados de carga y error
  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando reunión...</p>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (error || !meeting) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">{error || "Reunión no encontrada"}</p>
              <Button onClick={() => router.push("/reuniones")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Reuniones
              </Button>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          {/* Header con botones de acción */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/reuniones")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{meeting.titulo}</h1>
                <p className="text-muted-foreground">
                  {formatDateTime(meeting.hora_inicio)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendEmail}
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar Correo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar reunión?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. La reunión será eliminada permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Información principal */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Información General</CardTitle>
                <Badge variant="default">
                  {meeting.tipo_reunion}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Detalles básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Fecha</p>
                    <p className="text-muted-foreground">{formatDate(meeting.hora_inicio)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Hora de Inicio</p>
                    <p className="text-muted-foreground">{formatTime(meeting.hora_inicio)}</p>
                  </div>
                </div>

                {meeting.hora_fin && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Hora de Fin</p>
                      <p className="text-muted-foreground">{formatTime(meeting.hora_fin)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Modalidad</p>
                    <p className="text-muted-foreground">{meeting.modalidad}</p>
                  </div>
                </div>
              </div>

              {/* Lugar */}
              {meeting.lugar && (
                <div>
                  <h3 className="font-semibold mb-2">Ubicación</h3>
                  <p className="text-muted-foreground">{meeting.lugar}</p>
                </div>
              )}

              {/* Agenda */}
              {meeting.agenda && (
                <div>
                  <h3 className="font-semibold mb-2">Agenda</h3>
                  <p className="text-muted-foreground">{meeting.agenda}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Convocados */}
          {meeting.convocados && meeting.convocados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Convocados ({meeting.convocados.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {meeting.convocados.map((convocado, index) => (
                    <div key={convocado.correo || index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {convocado.nombre?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {convocado.nombre || 'Sin nombre'}
                        </p>
                        {convocado.correo && (
                          <p className="text-xs text-muted-foreground truncate">
                            {convocado.correo}
                          </p>
                        )}
                        <Badge 
                          variant={convocado.esMiembro ? "default" : "secondary"} 
                          className="text-xs mt-1"
                        >
                          {convocado.esMiembro ? "Miembro" : "Invitado"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}          {/* Archivos adjuntos */}
          {meeting.archivos && meeting.archivos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Archivos Adjuntos ({meeting.archivos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {meeting.archivos.map((archivo, index) => {
                    const filename = archivo.split('/').pop() || archivo;
                    const bucketUrl = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_URL;
                    const fileUrl = `${bucketUrl}/${organization?.id}/${filename}`;
                    
                    return (
                      <div key={index} className="flex items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                            title={filename}
                          >
                            {filename}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Puntos de la reunión */}
          {meeting.puntos && meeting.puntos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Puntos de la Reunión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {meeting.puntos.map((punto, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-sm text-muted-foreground mt-1">
                        {index + 1}.
                      </span>
                      <p className="text-sm">{punto}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}