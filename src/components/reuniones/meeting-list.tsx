"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  MapPin, 
  Plus,
  Filter,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Meeting, MeetingStatus } from "@/types";

interface MeetingListProps {
  meetings?: Meeting[];
  onCreateMeeting?: () => void;
  onJoinMeeting?: (meetingId: string) => void;
}

export function MeetingList({ meetings = [], onCreateMeeting, onJoinMeeting }: MeetingListProps) {
  // Datos de ejemplo
  const defaultMeetings: Meeting[] = [
    {
      id: "1",
      title: "Reunión de Equipo Semanal",
      description: "Revisión del progreso del proyecto y planificación de la próxima semana",
      startTime: new Date("2024-01-15T10:00:00"),
      endTime: new Date("2024-01-15T11:00:00"),
      location: {
        type: "virtual",
        virtualLink: "https://meet.google.com/abc-def-ghi",
        platform: "meet"
      },
      type: "team",
      status: "scheduled",
      organizer: {
        id: "1",
        name: "Ana García",
        email: "ana@example.com",
        preferences: {
          theme: "light",
          language: "es",
          timezone: "America/Mexico_City",
          notifications: {
            email: true,
            push: true,
            sms: false,
            meetingReminders: true,
            weeklyDigest: true
          },
          privacy: {
            profileVisibility: "organization",
            showOnlineStatus: true,
            allowDirectMessages: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      attendees: [
        {
          user: {
            id: "2",
            name: "Carlos López",
            email: "carlos@example.com",
            preferences: {
              theme: "light",
              language: "es",
              timezone: "America/Mexico_City",
              notifications: {
                email: true,
                push: true,
                sms: false,
                meetingReminders: true,
                weeklyDigest: true
              },
              privacy: {
                profileVisibility: "organization",
                showOnlineStatus: true,
                allowDirectMessages: true
              }
            },
            createdAt: new Date(),
            updatedAt: new Date()
          },
          status: "accepted",
          role: "attendee"
        }
      ],
      settings: {
        allowRecording: true,
        autoRecord: false,
        allowScreenShare: true,
        allowChat: true,
        requirePassword: false,
        waitingRoom: false,
        muteOnEntry: true,
        allowParticipantsToUnmute: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "2",
      title: "Presentación Cliente ABC",
      description: "Presentación del nuevo producto al cliente ABC",
      startTime: new Date("2024-01-16T14:00:00"),
      endTime: new Date("2024-01-16T15:30:00"),
      location: {
        type: "physical",
        address: "Sala de Juntas B, Piso 3",
        room: "Sala B"
      },
      type: "client",
      status: "scheduled",
      organizer: {
        id: "1",
        name: "Ana García",
        email: "ana@example.com",
        preferences: {
          theme: "light",
          language: "es",
          timezone: "America/Mexico_City",
          notifications: {
            email: true,
            push: true,
            sms: false,
            meetingReminders: true,
            weeklyDigest: true
          },
          privacy: {
            profileVisibility: "organization",
            showOnlineStatus: true,
            allowDirectMessages: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      attendees: [],
      settings: {
        allowRecording: false,
        autoRecord: false,
        allowScreenShare: true,
        allowChat: false,
        requirePassword: false,
        waitingRoom: true,
        muteOnEntry: false,
        allowParticipantsToUnmute: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const meetingData = meetings.length > 0 ? meetings : defaultMeetings;

  const getStatusColor = (status: MeetingStatus) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "in-progress":
        return "destructive";
      case "completed":
        return "secondary";
      case "cancelled":
        return "outline";
      case "postponed":
        return "outline";
      default:
        return "default";
    }
  };

  const getStatusText = (status: MeetingStatus) => {
    switch (status) {
      case "scheduled":
        return "Programada";
      case "in-progress":
        return "En progreso";
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      case "postponed":
        return "Pospuesta";
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Reuniones</h1>
            <p className="text-muted-foreground">Administra tus reuniones y eventos</p>
          </div>
        </div>
        <Button onClick={onCreateMeeting}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reunión
        </Button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar reuniones..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Hoy</span>
            </div>
            <div className="text-2xl font-bold mt-2">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Esta semana</span>
            </div>
            <div className="text-2xl font-bold mt-2">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Participantes</span>
            </div>
            <div className="text-2xl font-bold mt-2">24</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">En línea</span>
            </div>
            <div className="text-2xl font-bold mt-2">75%</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de reuniones */}
      <div className="space-y-4">
        {meetingData.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{meeting.title}</h3>
                    <Badge variant={getStatusColor(meeting.status)}>
                      {getStatusText(meeting.status)}
                    </Badge>
                    <Badge variant="outline">{meeting.type}</Badge>
                  </div>
                  
                  {meeting.description && (
                    <p className="text-muted-foreground mb-3">{meeting.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(meeting.startTime)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {meeting.location?.type === "virtual" ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      <span>
                        {meeting.location?.type === "virtual" 
                          ? "Virtual" 
                          : meeting.location?.room || "Presencial"
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{meeting.attendees.length + 1} participantes</span>
                    </div>
                  </div>
                  
                  {/* Participantes */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm text-muted-foreground">Organizador:</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {meeting.organizer.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{meeting.organizer.name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {meeting.status === "scheduled" && (
                    <Button 
                      onClick={() => onJoinMeeting?.(meeting.id)}
                      size="sm"
                    >
                      {meeting.location?.type === "virtual" ? "Unirse" : "Ver detalles"}
                    </Button>
                  )}
                  {meeting.status === "in-progress" && (
                    <Button 
                      onClick={() => onJoinMeeting?.(meeting.id)}
                      size="sm"
                      variant="destructive"
                    >
                      Unirse ahora
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {meetingData.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay reuniones programadas</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera reunión para comenzar a organizar tu agenda
            </p>
            <Button onClick={onCreateMeeting}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Reunión
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
