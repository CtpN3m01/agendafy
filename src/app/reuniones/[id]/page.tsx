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
import { toast } from "sonner";

// Interfaces para los datos detallados de agenda y puntos
interface AgendaDetallada {
  _id: string;
  nombre: string;
  organizacion: string;
  puntos: string[];
  reuniones: string[];
}

interface PuntoDetallado {
  _id: string;
  titulo: string;
  tipo: string;
  duracion: number;
  detalles?: string;
  expositor: string;
  archivos?: string[];
  agenda: string;
}

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { organization } = useUserOrganization();
  const { getMeeting, deleteMeeting, sendEmail } = useMeetings(organization?.id);
    const [meeting, setMeeting] = useState<ReunionData | null>(null);
  const [agendaDetallada, setAgendaDetallada] = useState<AgendaDetallada | null>(null);
  const [puntosDetallados, setPuntosDetallados] = useState<PuntoDetallado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const meetingId = params?.id as string;
  // Cargar datos de la reunión y agenda detallada
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
          
          // Cargar información detallada de la agenda si existe
          if (data.agenda) {
            await loadAgendaDetallada(data.agenda);
          }
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

    const loadAgendaDetallada = async (agendaId: string) => {
      try {
        // Cargar información de la agenda
        const agendaResponse = await fetch(`/api/mongo/agenda/obtenerAgenda?id=${agendaId}&poblado=true`);
        if (agendaResponse.ok) {
          const agendaData = await agendaResponse.json();
          setAgendaDetallada(agendaData);
          
          // Cargar puntos detallados de la agenda
          const puntosResponse = await fetch(`/api/mongo/punto/obtenerPuntosPorAgenda?agendaId=${agendaId}`);
          if (puntosResponse.ok) {
            const puntosData = await puntosResponse.json();
            setPuntosDetallados(puntosData);
          }
        }
      } catch (err) {
        console.error("Error al cargar agenda detallada:", err);
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

  const getTipoPuntoColor = (tipo: string) => {
    switch (tipo) {
      case 'Informativo':
        return 'bg-blue-100 text-blue-800';
      case 'Aprobacion':
        return 'bg-green-100 text-green-800';
      case 'Fondo':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuracion = (minutos: number) => {
    if (minutos < 60) {
      return `${minutos} min`;
    } else {
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
    }
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

  const handleSendEmail = async () => {
    if (!meeting || !meeting.convocados || meeting.convocados.length === 0) {
      toast.error("No hay convocados para enviar el correo");
      return;
    }

    if (!organization?.id) {
      toast.error("No se pudo obtener la información de la organización");
      return;
    }

    try {
      setIsSendingEmail(true);
      
      // Preparar la lista de correos de los convocados
      const emailList = meeting.convocados
        .filter(convocado => convocado.correo && convocado.correo.trim() !== '')
        .map(convocado => convocado.correo);

      if (emailList.length === 0) {
        toast.error("No hay correos válidos para enviar");
        return;
      }

      // Preparar los puntos para el email (convertir de string[] a objeto con propiedades)
      const puntosForEmail = (meeting.puntos || []).map((punto, index) => ({
        duracion: 30, // Duración por defecto
        titulo: punto,
        tipo: "Informativo", // Tipo por defecto
        expositor: "Por definir" // Expositor por defecto
      }));

      // Preparar los datos del email según la estructura esperada por la API
      const emailData = {
        to: emailList,
        subject: `Convocatoria: ${meeting.titulo}`,
        detalles: {
          titulo: meeting.titulo,
          hora_inicio: meeting.hora_inicio,
          hora_fin: meeting.hora_fin,
          lugar: meeting.lugar,
          tipo_reunion: meeting.tipo_reunion,
          modalidad: meeting.modalidad,
          archivos: meeting.archivos || [],
          agenda: meeting.agenda,
          puntos: puntosForEmail,
          convocados: meeting.convocados,
          organizacionId: organization.id // Include organization ID for file URLs
        }
      };

      console.log("📧 Enviando correo con datos:", emailData);

      const success = await sendEmail(emailData);
      
      if (success) {
        toast.success(`Correo enviado exitosamente a ${emailList.length} destinatarios`);
      } else {
        toast.error("Error al enviar el correo");
      }
    } catch (error) {
      console.error("Error al enviar correo:", error);
      toast.error("Error al enviar el correo");
    } finally {
      setIsSendingEmail(false);
    }
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
                disabled={isSendingEmail}
              >
                {isSendingEmail ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
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
              )}              {/* Agenda */}
              {agendaDetallada && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Agenda: {agendaDetallada.nombre}
                  </h3>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Puntos totales:</span>
                        <span className="ml-2 text-muted-foreground">{puntosDetallados.length}</span>
                      </div>
                      <div>
                        <span className="font-medium">Duración estimada:</span>
                        <span className="ml-2 text-muted-foreground">
                          {formatDuracion(puntosDetallados.reduce((total, punto) => total + punto.duracion, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Fallback para mostrar agenda simple si no hay datos detallados */}
              {!agendaDetallada && meeting.agenda && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descripción de la Agenda
                  </h3>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{meeting.agenda}</p>
                  </div>
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
          )}          {/* Puntos de la reunión - Información detallada */}
          {puntosDetallados && puntosDetallados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Orden del Día ({puntosDetallados.length} puntos)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {puntosDetallados.map((punto, index) => (
                    <div key={punto._id} className="border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Título y tipo */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-base leading-tight">
                              {punto.titulo}
                            </h4>
                            <Badge className={`text-xs ${getTipoPuntoColor(punto.tipo)}`}>
                              {punto.tipo}
                            </Badge>
                          </div>
                          
                          {/* Detalles del punto */}
                          {punto.detalles && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {punto.detalles}
                            </p>
                          )}
                          
                          {/* Información adicional */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Duración:</span>
                              <span className="text-muted-foreground">{formatDuracion(punto.duracion)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Expositor:</span>
                              <span className="text-muted-foreground">{punto.expositor}</span>
                            </div>
                          </div>
                          
                          {/* Archivos del punto */}
                          {punto.archivos && punto.archivos.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Archivos relacionados:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {punto.archivos.map((archivo, archivoIndex) => {
                                  const filename = archivo.split('/').pop() || archivo;
                                  const bucketUrl = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_URL;
                                  const fileUrl = `${bucketUrl}/${organization?.id}/${filename}`;
                                  
                                  return (
                                    <a
                                      key={archivoIndex}
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs hover:bg-muted/80 transition-colors"
                                    >
                                      <FileText className="h-3 w-3" />
                                      {filename}
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Fallback para mostrar puntos simples si no hay datos detallados */}
          {(!puntosDetallados || puntosDetallados.length === 0) && meeting.puntos && meeting.puntos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Orden del Día ({meeting.puntos.length} puntos)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meeting.puntos.map((punto, index) => (
                    <div key={index} className="flex gap-4 p-4 border rounded-lg hover:bg-accent/20 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1">
                          Punto {index + 1}
                        </h4>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {punto}
                        </p>
                      </div>
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