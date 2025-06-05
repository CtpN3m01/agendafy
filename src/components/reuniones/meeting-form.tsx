"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  MapPin,
  Plus,
  X,
  Settings
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Meeting, MeetingType, UserProfile } from "@/types";

interface MeetingFormProps {
  meeting?: Meeting;
  onSave?: (meeting: Partial<Meeting>) => void;
  onCancel?: () => void;
}

export function MeetingForm({ meeting, onSave, onCancel }: MeetingFormProps) {
  const isEditing = !!meeting;

  const handleSave = () => {
    // Aquí iría la lógica para recopilar los datos del formulario
    const meetingData: Partial<Meeting> = {
      title: "Nueva Reunión",
      description: "Descripción de la reunión",
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hora después
      type: "team",
      status: "scheduled"
    };
    onSave?.(meetingData);
  };

  // Datos de ejemplo para participantes sugeridos
  const suggestedAttendees: UserProfile[] = [
    {
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
    {
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
    }
  ];

  const meetingTypes: { value: MeetingType; label: string }[] = [
    { value: "one-on-one", label: "Uno a uno" },
    { value: "team", label: "Equipo" },
    { value: "all-hands", label: "General" },
    { value: "client", label: "Cliente" },
    { value: "interview", label: "Entrevista" },
    { value: "training", label: "Capacitación" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? "Editar Reunión" : "Nueva Reunión"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Modifica los detalles de la reunión" : "Crea una nueva reunión"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? "Guardar Cambios" : "Crear Reunión"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Básica */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información Básica
              </CardTitle>
              <CardDescription>
                Detalles principales de la reunión
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la reunión *</Label>
                <Input
                  id="title"
                  defaultValue={meeting?.title || ""}
                  placeholder="Ej: Reunión de equipo semanal"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  defaultValue={meeting?.description || ""}
                  placeholder="Descripción opcional de la reunión"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de inicio *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    defaultValue={meeting?.startTime ? 
                      new Date(meeting.startTime.getTime() - (meeting.startTime.getTimezoneOffset() * 60000))
                        .toISOString().slice(0, 16) : ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha de fin *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    defaultValue={meeting?.endTime ? 
                      new Date(meeting.endTime.getTime() - (meeting.endTime.getTimezoneOffset() * 60000))
                        .toISOString().slice(0, 16) : ""
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de reunión</Label>
                <select 
                  id="type" 
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  defaultValue={meeting?.type || "team"}
                >
                  {meetingTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Ubicación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación
              </CardTitle>
              <CardDescription>
                Define dónde se realizará la reunión
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="virtual" 
                    name="locationType" 
                    value="virtual"
                    defaultChecked={meeting?.location?.type === "virtual" || !meeting}
                  />
                  <Label htmlFor="virtual" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Virtual
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="physical" 
                    name="locationType" 
                    value="physical"
                    defaultChecked={meeting?.location?.type === "physical"}
                  />
                  <Label htmlFor="physical" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Presencial
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="hybrid" 
                    name="locationType" 
                    value="hybrid"
                    defaultChecked={meeting?.location?.type === "hybrid"}
                  />
                  <Label htmlFor="hybrid" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <MapPin className="h-4 w-4" />
                    Híbrida
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationDetails">Detalles de ubicación</Label>
                <Input
                  id="locationDetails"
                  placeholder="Ej: Sala de juntas B, https://meet.google.com/abc-def-ghi"
                  defaultValue={
                    meeting?.location?.address || 
                    meeting?.location?.virtualLink || 
                    meeting?.location?.room || ""
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Participantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participantes
              </CardTitle>
              <CardDescription>
                Invita personas a la reunión
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="attendeeEmail">Agregar participante</Label>
                <div className="flex gap-2">
                  <Input
                    id="attendeeEmail"
                    placeholder="email@ejemplo.com"
                    className="flex-1"
                  />
                  <Button type="button">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Participantes sugeridos</Label>
                <div className="space-y-2">
                  {suggestedAttendees.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Invitar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuración */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración
              </CardTitle>
              <CardDescription>
                Opciones avanzadas de la reunión
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="allowRecording" 
                    defaultChecked={meeting?.settings.allowRecording ?? true}
                  />
                  <Label htmlFor="allowRecording" className="text-sm">
                    Permitir grabación
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="autoRecord" 
                    defaultChecked={meeting?.settings.autoRecord ?? false}
                  />
                  <Label htmlFor="autoRecord" className="text-sm">
                    Grabar automáticamente
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="allowScreenShare" 
                    defaultChecked={meeting?.settings.allowScreenShare ?? true}
                  />
                  <Label htmlFor="allowScreenShare" className="text-sm">
                    Permitir compartir pantalla
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="allowChat" 
                    defaultChecked={meeting?.settings.allowChat ?? true}
                  />
                  <Label htmlFor="allowChat" className="text-sm">
                    Permitir chat
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="waitingRoom" 
                    defaultChecked={meeting?.settings.waitingRoom ?? false}
                  />
                  <Label htmlFor="waitingRoom" className="text-sm">
                    Sala de espera
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="muteOnEntry" 
                    defaultChecked={meeting?.settings.muteOnEntry ?? true}
                  />
                  <Label htmlFor="muteOnEntry" className="text-sm">
                    Silenciar al ingresar
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>
                Vista previa de la reunión
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duración estimada</span>
                <Badge variant="outline">1 hora</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Participantes</span>
                <Badge variant="outline">
                  {meeting?.attendees.length ? meeting.attendees.length + 1 : 1}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tipo</span>
                <Badge variant="secondary">
                  {meetingTypes.find(t => t.value === (meeting?.type || "team"))?.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
