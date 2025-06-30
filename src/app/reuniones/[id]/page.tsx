"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  Loader2,
  Play,
  Square,
  Save,
  Timer,
  Pause,
  ThumbsUp,
  ThumbsDown,
  Vote,
  Eye,
  Shield
} from "lucide-react";
import { usePuntos } from "@/hooks/use-agendas";
import { useMeetings, type ReunionData } from "@/hooks/use-meetings";
import { useUserOrganization } from "@/hooks/use-user-organization";
import { useUserPermissions, useUserRole } from "@/hooks/use-user-permissions";
import { EditMeetingDialog } from "@/components/reuniones";
import { toast } from "sonner";

// Interfaces para los datos detallados de agenda y puntos
interface AgendaDetallada {
  _id: string;
  nombre: string;
  organizacion: string;
  puntos: string[];
  reuniones: string[];
}

interface ConvocadoEmail {
  nombre: string;
  correo: string;
  esMiembro: boolean;
}

interface PuntoEmail {
  duracion: number;
  titulo: string;
  tipo: string;
  expositor: string;
  detalles?: string;
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
  anotaciones?: string;
  votosAFavor?: number;
  votosEnContra?: number;
}

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { organization } = useUserOrganization();
  const permissions = useUserPermissions();
  const { role, displayName } = useUserRole();
  const { getMeeting, deleteMeeting, sendEmail, startMeeting, endMeeting } = useMeetings(organization?.id);
  const { updatePunto } = usePuntos();
  const [meeting, setMeeting] = useState<ReunionData | null>(null);
  const [agendaDetallada, setAgendaDetallada] = useState<AgendaDetallada | null>(null);
  const [puntosDetallados, setPuntosDetallados] = useState<PuntoDetallado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isStartingMeeting, setIsStartingMeeting] = useState(false);
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);  const [pointAnnotations, setPointAnnotations] = useState<Record<string, string>>({});
  const [savingAnnotations, setSavingAnnotations] = useState<Record<string, boolean>>({});
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [pointTimers, setPointTimers] = useState<Record<string, { startTime: Date; elapsed: number }>>({});
  const [timerIntervals, setTimerIntervals] = useState<Record<string, NodeJS.Timeout>>({});
  const [votosAFavor, setVotosAFavor] = useState<Record<string, number>>({});
  const [votosEnContra, setVotosEnContra] = useState<Record<string, number>>({});

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
              // Cargar las anotaciones existentes en el estado local
            const anotacionesExistentes: Record<string, string> = {};
            const votosAFavorExistentes: Record<string, number> = {};
            const votosEnContraExistentes: Record<string, number> = {};
            puntosData.forEach((punto: PuntoDetallado) => {
              if (punto.anotaciones) {
                anotacionesExistentes[punto._id] = punto.anotaciones;
              }
              if (punto.votosAFavor !== undefined) {
                votosAFavorExistentes[punto._id] = punto.votosAFavor;
              }
              if (punto.votosEnContra !== undefined) {
                votosEnContraExistentes[punto._id] = punto.votosEnContra;
              }
            });
            setPointAnnotations(anotacionesExistentes);
            setVotosAFavor(votosAFavorExistentes);
            setVotosEnContra(votosEnContraExistentes);
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
    setEditDialogOpen(true);
  };

  const handleMeetingUpdated = async () => {
    // Recargar los datos de la reunión después de actualizarla
    if (meetingId) {
      try {
        const updatedMeeting = await getMeeting(meetingId);
        if (updatedMeeting) {
          setMeeting(updatedMeeting);
          
          // Recargar agenda detallada si cambió
          if (updatedMeeting.agenda) {
            const agendaResponse = await fetch(`/api/mongo/agenda/obtenerAgenda?id=${updatedMeeting.agenda}&poblado=true`);
            if (agendaResponse.ok) {
              const agendaData = await agendaResponse.json();
              setAgendaDetallada(agendaData);
              
              const puntosResponse = await fetch(`/api/mongo/punto/obtenerPuntosPorAgenda?agendaId=${updatedMeeting.agenda}`);
              if (puntosResponse.ok) {
                const puntosData = await puntosResponse.json();
                setPuntosDetallados(puntosData);
              }
            }
          }
        }
        toast.success("Reunión actualizada exitosamente");
      } catch (error) {
        console.error("Error al recargar la reunión:", error);
        toast.error("Error al recargar los datos de la reunión");
      }
    }
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

  // Función para iniciar la reunión
  const handleStartMeeting = async () => {
    if (!meetingId) return;
    
    try {
      setIsStartingMeeting(true);
      const success = await startMeeting(meetingId);
      
      if (success) {
        // Recargar los datos de la reunión para mostrar la nueva hora de inicio
        const updatedMeeting = await getMeeting(meetingId);
        if (updatedMeeting) {
          setMeeting(updatedMeeting);
        }
        toast.success("Reunión iniciada exitosamente");
      }
    } catch (error) {
      console.error("Error al iniciar la reunión:", error);
      toast.error("Error al iniciar la reunión");
    } finally {
      setIsStartingMeeting(false);
    }
  };
  // Función para terminar la reunión
  const handleEndMeeting = async () => {
    if (!meetingId) return;
    
    try {
      setIsEndingMeeting(true);
      
      // Detener cualquier punto activo antes de terminar la reunión
      if (activePointId && timerIntervals[activePointId]) {
        clearInterval(timerIntervals[activePointId]);
        setActivePointId(null);
        setTimerIntervals(prev => {
          const newIntervals = { ...prev };
          delete newIntervals[activePointId];
          return newIntervals;
        });
      }
      
      const success = await endMeeting(meetingId);
      
      if (success) {
        // Recargar los datos de la reunión para mostrar la nueva hora de fin
        const updatedMeeting = await getMeeting(meetingId);
        if (updatedMeeting) {
          setMeeting(updatedMeeting);
        }
        toast.success("Reunión terminada exitosamente");
      }
    } catch (error) {
      console.error("Error al terminar la reunión:", error);
      toast.error("Error al terminar la reunión");
    } finally {
      setIsEndingMeeting(false);
    }
  };  // Función para guardar punto completo (anotaciones y duración real)
  const handleSavePoint = async (pointId: string) => {
    const annotations = pointAnnotations[pointId] || '';
    const pointTimer = pointTimers[pointId];
    const duracionReal = pointTimer ? Math.ceil(pointTimer.elapsed / 60) : 0; // Convertir segundos a minutos
    
    try {
      setSavingAnnotations(prev => ({ ...prev, [pointId]: true }));
        // Crear el payload con anotaciones y duración real actualizada
      const updateData: {
        anotaciones: string;
        duracion: number;
        votosAFavor?: number;
        votosEnContra?: number;
      } = {
        anotaciones: annotations,
        duracion: duracionReal // Actualizar la duración con el tiempo real transcurrido
      };
        // Agregar datos de votación si es un punto de aprobación
      const punto = puntosDetallados.find(p => p._id === pointId);
      if (punto?.tipo === 'Aprobacion') {
        const votosAFavorValue = votosAFavor[pointId] || 0;
        const votosEnContraValue = votosEnContra[pointId] || 0;
        const totalVotos = votosAFavorValue + votosEnContraValue;
        const totalConvocados = meeting?.convocados?.length || 0;
        
        // Validar que el total de votos no supere los convocados
        if (totalVotos > totalConvocados) {
          toast.error(`El total de votos (${totalVotos}) no puede superar los ${totalConvocados} convocados`);
          return;
        }
        
        updateData.votosAFavor = votosAFavorValue;
        updateData.votosEnContra = votosEnContraValue;
      }// Usar el hook para actualizar el punto
      const updatedPoint = await updatePunto(pointId, updateData);
      
      if (updatedPoint) {
        toast.success("Punto guardado exitosamente");
        
        // Si el punto estaba activo, detener el cronómetro
        if (activePointId === pointId) {
          handleStopPoint(pointId);
        }
          // Actualizar el punto en el estado local
        setPuntosDetallados(prev => 
          prev.map(punto => 
            punto._id === pointId 
              ? { 
                  ...punto, 
                  anotaciones: annotations, 
                  duracion: duracionReal, // Actualizar la duración con el tiempo real
                  ...(punto.tipo === 'Aprobacion' && {
                    votosAFavor: votosAFavor[pointId] || 0,
                    votosEnContra: votosEnContra[pointId] || 0
                  })
                }
              : punto
          )
        );
      } else {
        throw new Error('Error al guardar el punto');
      }
    } catch (error) {
      console.error("Error al guardar punto:", error);
      toast.error("Error al guardar el punto");
    } finally {
      setSavingAnnotations(prev => ({ ...prev, [pointId]: false }));
    }
  };const handleAnnotationChange = (pointId: string, value: string) => {
    setPointAnnotations(prev => ({ ...prev, [pointId]: value }));
  };
  // Función para manejar cambios en los votos
  const handleVotosAFavorChange = (pointId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const totalConvocados = meeting?.convocados?.length || 0;
    const votosEnContraActuales = votosEnContra[pointId] || 0;
    
    // Validar que el total no supere los convocados
    const maxVotosAFavor = Math.max(0, totalConvocados - votosEnContraActuales);
    const votosValidados = Math.min(Math.max(0, numValue), maxVotosAFavor);
    
    setVotosAFavor(prev => ({ ...prev, [pointId]: votosValidados }));
    
    // Mostrar advertencia si se intenta exceder el límite
    if (numValue > maxVotosAFavor && totalConvocados > 0) {
      toast.warning(`El total de votos no puede superar los ${totalConvocados} convocados`);
    }
  };

  const handleVotosEnContraChange = (pointId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const totalConvocados = meeting?.convocados?.length || 0;
    const votosAFavorActuales = votosAFavor[pointId] || 0;
    
    // Validar que el total no supere los convocados
    const maxVotosEnContra = Math.max(0, totalConvocados - votosAFavorActuales);
    const votosValidados = Math.min(Math.max(0, numValue), maxVotosEnContra);
    
    setVotosEnContra(prev => ({ ...prev, [pointId]: votosValidados }));
    
    // Mostrar advertencia si se intenta exceder el límite
    if (numValue > maxVotosEnContra && totalConvocados > 0) {
      toast.warning(`El total de votos no puede superar los ${totalConvocados} convocados`);
    }
  };

  // Función para iniciar un punto específico
  const handleStartPoint = (pointId: string) => {
    const now = new Date();
    
    // Detener cualquier punto activo anterior
    if (activePointId && timerIntervals[activePointId]) {
      clearInterval(timerIntervals[activePointId]);
    }
    
    // Establecer el nuevo punto activo
    setActivePointId(pointId);
    
    // Inicializar el timer para este punto
    setPointTimers(prev => ({
      ...prev,
      [pointId]: {
        startTime: now,
        elapsed: 0
      }
    }));
    
    // Crear intervalo para actualizar el cronómetro
    const interval = setInterval(() => {
      setPointTimers(prev => {
        const pointTimer = prev[pointId];
        if (pointTimer) {
          const elapsed = Math.floor((new Date().getTime() - pointTimer.startTime.getTime()) / 1000);
          return {
            ...prev,
            [pointId]: {
              ...pointTimer,
              elapsed
            }
          };
        }
        return prev;
      });
    }, 1000);
    
    // Guardar la referencia del intervalo
    setTimerIntervals(prev => ({
      ...prev,
      [pointId]: interval
    }));
  };

  // Función para detener un punto específico
  const handleStopPoint = (pointId: string) => {
    if (timerIntervals[pointId]) {
      clearInterval(timerIntervals[pointId]);
    }
    
    setActivePointId(null);
    
    // Limpiar el intervalo del estado
    setTimerIntervals(prev => {
      const newIntervals = { ...prev };
      delete newIntervals[pointId];
      return newIntervals;
    });
  };

  // Función para formatear el tiempo del cronómetro
  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Limpiar intervalos cuando el componente se desmonte
  useEffect(() => {
    return () => {
      Object.values(timerIntervals).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, [timerIntervals]);

  // Determinar el estado de la reunión
  const isMeetingStarted = () => {
    if (!meeting?.hora_inicio) return false;
    const startTime = new Date(meeting.hora_inicio);
    const now = new Date();
    return startTime <= now;
  };

  const isMeetingEnded = () => {
    return meeting?.hora_fin != null;
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
      
      // Separar convocados por tipo (miembros y no miembros)
      const miembros = meeting.convocados.filter(convocado => 
        convocado.esMiembro && convocado.correo && convocado.correo.trim() !== ''
      );
      
      const noMiembros = meeting.convocados.filter(convocado => 
        !convocado.esMiembro && convocado.correo && convocado.correo.trim() !== ''
      );

      if (miembros.length === 0 && noMiembros.length === 0) {
        toast.error("No hay correos válidos para enviar");
        return;
      }

      // Usar puntos detallados si están disponibles, si no usar los básicos
      const puntosParaEmail = puntosDetallados.length > 0 
        ? puntosDetallados.map(punto => ({
            duracion: punto.duracion,
            titulo: punto.titulo,
            tipo: punto.tipo,
            expositor: punto.expositor,
            detalles: punto.detalles
          }))
        : (meeting.puntos || []).map((punto) => ({
            duracion: 30, // Duración por defecto
            titulo: punto,
            tipo: "Informativo", // Tipo por defecto
            expositor: "Por definir", // Expositor por defecto
            detalles: ""
          }));

      const emailsEnviados = [];

      // Enviar correo completo a miembros
      if (miembros.length > 0) {
        const emailDataMiembros = {
          to: miembros.map(m => m.correo),
          subject: `Convocatoria: ${meeting.titulo}`,
          detalles: {
            titulo: meeting.titulo,
            hora_inicio: meeting.hora_inicio,
            hora_fin: meeting.hora_fin,
            lugar: meeting.lugar,
            tipo_reunion: meeting.tipo_reunion,
            modalidad: meeting.modalidad,
            archivos: meeting.archivos || [],
            agenda: agendaDetallada?.nombre || meeting.agenda || "",
            puntos: puntosParaEmail,
            convocados: meeting.convocados,
            organizacionId: organization.id,
            esMiembro: true // Indicar que son miembros
          }
        };

        const successMiembros = await sendEmail(emailDataMiembros);
        if (successMiembros) {
          emailsEnviados.push(`${miembros.length} miembros`);
        }
      }

      // Enviar correo limitado a no miembros con horario calculado
      if (noMiembros.length > 0) {
        // Calcular horarios de entrada para cada no miembro
        const noMiembrosConHorario = await Promise.all(
          noMiembros.map(async (noMiembro) => {
            const horarioEntrada = calcularHorarioEntrada(noMiembro, puntosParaEmail, meeting.hora_inicio);
            return {
              ...noMiembro,
              horario_entrada: horarioEntrada
            };
          })
        );

        const emailDataNoMiembros = {
          to: noMiembros.map(nm => nm.correo),
          subject: `Convocatoria: ${meeting.titulo}`,
          detalles: {
            titulo: meeting.titulo,
            hora_inicio: meeting.hora_inicio,
            hora_fin: meeting.hora_fin,
            lugar: meeting.lugar,
            tipo_reunion: meeting.tipo_reunion,
            modalidad: meeting.modalidad,
            archivos: [], // No archivos para no miembros
            agenda: "", // No agenda detallada para no miembros
            puntos: [], // No puntos para no miembros
            convocados: noMiembrosConHorario,
            organizacionId: organization.id,
            esMiembro: false // Indicar que no son miembros
          }
        };

        const successNoMiembros = await sendEmail(emailDataNoMiembros);
        if (successNoMiembros) {
          emailsEnviados.push(`${noMiembros.length} invitados`);
        }
      }

      if (emailsEnviados.length > 0) {
        toast.success(`Correo enviado exitosamente a: ${emailsEnviados.join(', ')}`);
      } else {
        toast.error("Error al enviar los correos");
      }
    } catch (error) {
      console.error("Error al enviar correo:", error);
      toast.error("Error al enviar el correo");
    } finally {
      setIsSendingEmail(false);
    }
  };  // Función para calcular el horario de entrada según los puntos de la agenda
  const calcularHorarioEntrada = (convocado: ConvocadoEmail, puntos: PuntoEmail[], horaInicio: string) => {
    const fechaInicio = new Date(horaInicio);
    let tiempoAcumulado = 0;
    
    // Lógica más sofisticada para determinar cuándo debe entrar cada no miembro
    // Buscar si el convocado está mencionado en algún punto específico como expositor
    const puntoDelConvocado = puntos.findIndex(punto => 
      punto.expositor && punto.expositor.toLowerCase().includes(convocado.nombre.toLowerCase())
    );
    
    if (puntoDelConvocado !== -1) {
      // El convocado es expositor de un punto específico
      // Calcular tiempo hasta ese punto
      for (let i = 0; i < puntoDelConvocado; i++) {
        tiempoAcumulado += puntos[i].duracion || 30;
      }
      // Entrar 15 minutos antes del punto donde debe exponer
      tiempoAcumulado = Math.max(0, tiempoAcumulado - 15);
    } else {
      // Estrategia por defecto: entrar después de puntos administrativos iniciales
      // Los primeros puntos suelen ser: verificación de quórum, aprobación de acta anterior, etc.
      const puntosAdministrativos = Math.min(2, Math.floor(puntos.length * 0.3));
      
      for (let i = 0; i < puntosAdministrativos; i++) {
        tiempoAcumulado += puntos[i].duracion || 30;
      }
      
      // Si hay muchos puntos, calcular un momento estratégico
      if (puntos.length > 5) {
        // Entrar en el 30% de la reunión para puntos importantes
        const duracionTotal = puntos.reduce((total, punto) => total + (punto.duracion || 30), 0);
        tiempoAcumulado = Math.floor(duracionTotal * 0.3);
      }
    }
    
    const fechaEntrada = new Date(fechaInicio.getTime() + (tiempoAcumulado * 60000));
    
    return fechaEntrada.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleFinishAct = async (reunionId: string) => { 

    const reunionRes = await fetch(`/api/mongo/reunion/obtenerReunion?id=${reunionId}`);
    const reunion = await reunionRes.json();

    const puntosRes = await fetch(`/api/mongo/punto/obtenerPuntosPorAgenda?agendaId=${reunion.agenda}`);
    const puntos = await puntosRes.json();

    const agendaRes = await fetch(`/api/mongo/agenda/obtenerAgenda?id=${reunion.agenda}`);
    const agenda = await agendaRes.json();

    const organizacionRes = await fetch(`/api/mongo/organizacion/obtenerOrganizacion?id=${reunion.organizacion}`);
    const organizacion = await organizacionRes.json();

    const response = await fetch('/api/generarPDF/downloadPDF', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reunion, puntos, organizacion, agenda })
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;

      const fileName = `${agenda.nombre
        .normalize("NFD")                  // Separa letras y tildes (á → a +  ́)
        .replace(/[\u0300-\u036f]/g, '')  // Elimina las tildes ( ́)
        .replace(/[^a-zA-Z0-9-_]/g, '_')  // Reemplaza los demás caracteres no válidos
      }.pdf`;

      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert("PDF descargado con éxito.");
    } else {
      alert("Error al generar el PDF");
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
          {/* Indicador de rol del usuario */}
          {role === 'board-member' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Accediendo como: {displayName}
                  </p>
                  <p className="text-xs text-blue-700">
                    Está visualizando la información de la reunión. Los controles administrativos están restringidos.
                  </p>
                </div>
              </div>
            </div>
          )}

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
            
            {/* Botones de acción - Solo para administradores */}
            <div className="flex items-center gap-2">
              {/* Botón Ver (para miembros de junta) */}
              {role === 'board-member' && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Modo Lectura
                </Button>
              )}

              {/* Botones administrativos - Solo para administradores */}
              {permissions.canEdit && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendEmail}
                    disabled={isSendingEmail || isMeetingEnded()}
                  >
                    {isSendingEmail ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Enviar Correo
                  </Button>
                  
                  {/* Botón Editar: solo si NO ha iniciado NI terminado */}
                  {!isMeetingStarted() && !isMeetingEnded() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}

                  {/* Botón Terminar Acta: solo si ya terminó */}
                  {isMeetingEnded() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFinishAct(meeting._id)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Terminar Acta
                    </Button>
                  )}
                </>
              )}

              {/* Botón Eliminar - Solo para administradores */}
              {permissions.canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting || isMeetingStarted()}
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
              )}
            </div>
          </div>

          {/* Información principal */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Información General</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="default">
                    {meeting.tipo_reunion}
                  </Badge>
                  
                  {/* Controles de reunión - Solo para administradores */}
                  {permissions.canEdit && !isMeetingStarted() && !isMeetingEnded() && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleStartMeeting}
                      disabled={isStartingMeeting}
                    >
                      {isStartingMeeting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Iniciar Reunión
                    </Button>
                  )}
                  
                  {/* Estados de la reunión */}
                  {isMeetingStarted() && !isMeetingEnded() && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Reunión en Curso
                    </Badge>
                  )}
                  {isMeetingEnded() && (
                    <Badge variant="outline" className="text-gray-600 border-gray-600">
                      Reunión Finalizada
                    </Badge>
                  )}
                </div>
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
          {puntosDetallados && puntosDetallados.length > 0 && (            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Orden del Día ({puntosDetallados.length} puntos)
                  </CardTitle>
                  {/* Indicador de punto activo */}
                  {activePointId && isMeetingStarted() && !isMeetingEnded() && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-red-900">Punto en curso</span>
                      </div>
                      {(() => {
                        const activePointIndex = puntosDetallados.findIndex(p => p._id === activePointId);
                        const activePoint = puntosDetallados[activePointIndex];
                        return activePoint ? (
                          <div className="flex items-center gap-2 text-sm text-red-700">
                            <span>#{activePointIndex + 1}:</span>
                            <span className="font-medium truncate max-w-32">{activePoint.titulo}</span>
                            <span className="font-mono text-red-600">
                              {pointTimers[activePointId] ? formatTimer(pointTimers[activePointId].elapsed) : '00:00'}
                            </span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
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
                          )}                          {/* Información adicional */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Duración estimada:</span>
                              <span className="text-muted-foreground">{formatDuracion(punto.duracion)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Expositor:</span>
                              <span className="text-muted-foreground">{punto.expositor}</span>
                            </div>
                          </div>                            {/* Mostrar estado completado si el punto tiene anotaciones guardadas */}
                          {punto.anotaciones && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                                  <span className="font-medium text-green-800">Punto completado</span>
                                </div>
                                <div className="flex items-center gap-4 text-green-700">
                                  <span>Duración final: <strong>{formatDuracion(punto.duracion)}</strong></span>
                                </div>
                              </div>
                                {/* Mostrar votación registrada si es un punto de aprobación completado */}
                              {punto.tipo === 'Aprobacion' && (punto.votosAFavor !== undefined || punto.votosEnContra !== undefined) && (
                                <div className="mt-2 pt-2 border-t border-green-200">
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <Vote className="h-3 w-3 text-green-600" />
                                      <span className="font-medium text-green-800">Votación registrada:</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1 text-xs">
                                        <ThumbsUp className="h-3 w-3 text-green-600" />
                                        <span>{punto.votosAFavor || 0}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-xs">
                                        <ThumbsDown className="h-3 w-3 text-red-600" />
                                        <span>{punto.votosEnContra || 0}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}                          {/* Cronómetro y botón de iniciar punto - Solo visible si la reunión ha iniciado, el punto no ha sido completado Y el usuario es admin */}
                          {permissions.canEdit && isMeetingStarted() && !isMeetingEnded() && !punto.anotaciones && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <Timer className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">Cronómetro:</span>
                                    <span className={`text-lg font-mono font-bold ${
                                      activePointId === punto._id ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                      {pointTimers[punto._id] ? formatTimer(pointTimers[punto._id].elapsed) : '00:00'}
                                    </span>
                                  </div>
                                  {pointTimers[punto._id] && activePointId === punto._id && (
                                    <Badge variant="destructive" className="animate-pulse">
                                      En curso
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {activePointId !== punto._id ? (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleStartPoint(punto._id)}
                                      disabled={activePointId !== null}
                                    >
                                      <Play className="h-4 w-4 mr-2" />
                                      Iniciar Punto
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleStopPoint(punto._id)}
                                    >
                                      <Pause className="h-4 w-4 mr-2" />
                                      Detener
                                    </Button>
                                  )}
                                </div>
                              </div>
                              {/* Indicador de tiempo estimado vs tiempo real */}
                              {pointTimers[punto._id] && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  <div className="flex justify-between">
                                    <span>Tiempo estimado: {formatDuracion(punto.duracion)}</span>
                                    <span className={`font-medium ${
                                      pointTimers[punto._id].elapsed > punto.duracion * 60 
                                        ? 'text-red-600' 
                                        : 'text-green-600'
                                    }`}>
                                      {pointTimers[punto._id].elapsed > punto.duracion * 60 
                                        ? `+${Math.floor((pointTimers[punto._id].elapsed - punto.duracion * 60) / 60)}m excedido`
                                        : `${Math.floor((punto.duracion * 60 - pointTimers[punto._id].elapsed) / 60)}m restantes`
                                      }
                                    </span>
                                  </div>
                                  {/* Barra de progreso */}
                                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-1000 ${
                                        pointTimers[punto._id].elapsed > punto.duracion * 60 
                                          ? 'bg-red-500' 
                                          : 'bg-green-500'
                                      }`}
                                      style={{ 
                                        width: `${Math.min(100, (pointTimers[punto._id].elapsed / (punto.duracion * 60)) * 100)}%` 
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
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
                          )}                          {/* Anotaciones del punto - Visible si la reunión ha iniciado Y el usuario es admin */}
                          {permissions.canEdit && isMeetingStarted() && (
                            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                              <p className="text-sm font-medium mb-2">Anotaciones del punto:</p>
                              <div className="space-y-3">
                                <Textarea
                                  placeholder="Escriba sus anotaciones aquí..."
                                  value={pointAnnotations[punto._id] || ''}
                                  onChange={(e) => handleAnnotationChange(punto._id, e.target.value)}
                                  className="min-h-[80px] resize-none"
                                />                                {/* Sección de votación - Solo para puntos de aprobación */}
                                {punto.tipo === 'Aprobacion' && (
                                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        <Vote className="h-4 w-4 text-amber-600" />
                                        <span className="text-sm font-medium text-amber-900">Registro de votación:</span>
                                      </div>
                                      <div className="text-xs text-amber-700">
                                        Total convocados: {meeting?.convocados?.length || 0}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <label className="text-xs font-medium text-green-700 flex items-center gap-1">
                                          <ThumbsUp className="h-3 w-3" />
                                          Votos a favor
                                        </label>
                                        <Input
                                          type="number"
                                          min="0"
                                          max={Math.max(0, (meeting?.convocados?.length || 0) - (votosEnContra[punto._id] || 0))}
                                          placeholder="0"
                                          value={votosAFavor[punto._id] || ''}
                                          onChange={(e) => handleVotosAFavorChange(punto._id, e.target.value)}
                                          className="text-center border-green-300 focus:border-green-500"
                                        />
                                        <div className="text-xs text-green-600 text-center">
                                          Máx: {Math.max(0, (meeting?.convocados?.length || 0) - (votosEnContra[punto._id] || 0))}
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-xs font-medium text-red-700 flex items-center gap-1">
                                          <ThumbsDown className="h-3 w-3" />
                                          Votos en contra
                                        </label>
                                        <Input
                                          type="number"
                                          min="0"
                                          max={Math.max(0, (meeting?.convocados?.length || 0) - (votosAFavor[punto._id] || 0))}
                                          placeholder="0"
                                          value={votosEnContra[punto._id] || ''}
                                          onChange={(e) => handleVotosEnContraChange(punto._id, e.target.value)}
                                          className="text-center border-red-300 focus:border-red-500"
                                        />
                                        <div className="text-xs text-red-600 text-center">
                                          Máx: {Math.max(0, (meeting?.convocados?.length || 0) - (votosAFavor[punto._id] || 0))}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Indicador de votos utilizados */}
                                    {((votosAFavor[punto._id] || 0) + (votosEnContra[punto._id] || 0)) > 0 && (
                                      <div className="mt-3 pt-3 border-t border-amber-200">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-amber-700">Votos registrados:</span>
                                          <span className="font-medium">
                                            {(votosAFavor[punto._id] || 0) + (votosEnContra[punto._id] || 0)} / {meeting?.convocados?.length || 0}
                                          </span>
                                        </div>
                                        
                                        {/* Barra de progreso de votos */}
                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                          <div 
                                            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                                            style={{ 
                                              width: `${Math.min(100, ((votosAFavor[punto._id] || 0) + (votosEnContra[punto._id] || 0)) / (meeting?.convocados?.length || 1) * 100)}%` 
                                            }}
                                          />
                                        </div>
                                        
                                        {/* Votos pendientes */}
                                        {((meeting?.convocados?.length || 0) - (votosAFavor[punto._id] || 0) - (votosEnContra[punto._id] || 0)) > 0 && (
                                          <div className="mt-1 text-xs text-amber-600 text-center">
                                            {(meeting?.convocados?.length || 0) - (votosAFavor[punto._id] || 0) - (votosEnContra[punto._id] || 0)} votos sin registrar
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Información de duración para el guardado */}
                                {pointTimers[punto._id] && (
                                  <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border">
                                    <div className="flex justify-between items-center">
                                      <span>Duración estimada: {formatDuracion(punto.duracion)}</span>
                                      <span className="font-medium">
                                        Duración real: {formatDuracion(Math.ceil(pointTimers[punto._id].elapsed / 60))}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSavePoint(punto._id)}
                                  disabled={savingAnnotations[punto._id]}
                                  className="w-full"
                                >
                                  {savingAnnotations[punto._id] ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                  )}
                                  Guardar Punto
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Vista de solo lectura para miembros de junta */}
                          {role === 'board-member' && isMeetingStarted() && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-3">
                                <Eye className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">Información del punto</span>
                                <Badge variant="outline" className="text-xs">Solo lectura</Badge>
                              </div>
                              
                              {/* Mostrar anotaciones existentes si las hay */}
                              {punto.anotaciones && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-blue-700 mb-2">Anotaciones registradas:</p>
                                  <div className="bg-white p-3 rounded border text-sm text-gray-700 whitespace-pre-wrap">
                                    {punto.anotaciones}
                                  </div>
                                </div>
                              )}
                              
                              {/* Mostrar información de votación si es un punto de aprobación */}
                              {punto.tipo === 'Aprobacion' && (punto.votosAFavor !== undefined || punto.votosEnContra !== undefined) && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-blue-700 mb-2">Resultado de votación:</p>
                                  <div className="bg-white p-3 rounded border">
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                          <ThumbsUp className="h-4 w-4 text-green-600" />
                                          <span className="text-green-700 font-medium">A favor: {punto.votosAFavor || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <ThumbsDown className="h-4 w-4 text-red-600" />
                                          <span className="text-red-700 font-medium">En contra: {punto.votosEnContra || 0}</span>
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Total: {(punto.votosAFavor || 0) + (punto.votosEnContra || 0)} / {meeting?.convocados?.length || 0}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Estado del punto */}
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  {punto.anotaciones ? (
                                    <>
                                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                                      <span className="text-green-700 font-medium">Punto completado</span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                                      <span className="text-yellow-700 font-medium">
                                        {activePointId === punto._id ? 'En discusión' : 'Pendiente'}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div className="text-blue-600">
                                  Duración: {formatDuracion(punto.duracion)}
                                </div>
                              </div>
                              
                              {/* Información adicional para el contexto */}
                              {!punto.anotaciones && (
                                <div className="mt-2 text-xs text-blue-600 bg-blue-100 p-2 rounded">
                                  <div className="flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    <span>El administrador de la reunión está gestionando este punto.</span>
                                  </div>
                                </div>
                              )}
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
              </CardContent>            </Card>          )}

          {/* Botón Terminar Reunión - Solo visible si la reunión ha iniciado pero no ha terminado Y el usuario es admin */}
          {permissions.canEdit && isMeetingStarted() && !isMeetingEnded() && (
            <div className="flex justify-center">
              <Button
                variant="destructive"
                size="lg"
                onClick={handleEndMeeting}
                disabled={isEndingMeeting}
                className="w-full max-w-md"
              >
                {isEndingMeeting ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Square className="h-5 w-5 mr-2" />
                )}
                Terminar Reunión
              </Button>
            </div>
          )}
        </div>

        {/* Diálogo de Edición */}
        {meeting && (
          <EditMeetingDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            meeting={meeting}
            onMeetingUpdated={handleMeetingUpdated}
          />
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}