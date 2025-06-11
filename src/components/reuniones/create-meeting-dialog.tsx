// src/components/reuniones/create-meeting-dialog.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Users, Upload, Share2, Plus, FileText, X, Copy, Edit3 } from "lucide-react";
import { useMeetings } from "@/hooks/use-meetings";
import { useAgendas } from "@/hooks/use-agendas";
import { useUserOrganization } from "@/hooks/use-user-organization";
import { CreateAgendaDialog } from "@/components/agenda";

interface CreateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateMeeting?: (data: any) => Promise<boolean>;
  organizacionId?: string;
}

// Mock data para miembros - estos deberían venir de APIs reales
const availableMembers = [
  { id: "1", nombre: "Juan Pérez", email: "juan@company.com" },
  { id: "2", nombre: "María González", email: "maria@company.com" },
  { id: "3", nombre: "Carlos Rodríguez", email: "carlos@company.com" },
  { id: "4", nombre: "Ana López", email: "ana@company.com" },
];

// Componentes memorizados para mejor rendimiento
const MemberBadge = React.memo(({ member, onRemove }: { member: any, onRemove: (id: string) => void }) => (
  <Badge
    variant="secondary"
    className="flex items-center justify-between gap-1 p-2 max-w-none"
  >
    <div className="flex flex-col items-start min-w-0 flex-1">
      <span className="text-xs font-medium truncate w-full">{member.nombre}</span>
      <span className="text-xs text-muted-foreground truncate w-full">{member.email}</span>
    </div>
    <button
      type="button"
      onClick={() => onRemove(member.id)}
      className="text-red-500 hover:text-red-700 flex-shrink-0"
    >
      <X className="h-3 w-3" />
    </button>
  </Badge>
));

const FileBadge = React.memo(({ file, index, onRemove }: { file: File, index: number, onRemove: (index: number) => void }) => (
  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <FileText className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm truncate" title={file.name}>{file.name}</span>
      <span className="text-xs text-gray-500 flex-shrink-0">
        ({Math.round(file.size / 1024)}KB)
      </span>
    </div>
    <button
      type="button"
      onClick={() => onRemove(index)}
      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
));

export function CreateMeetingDialog({ 
  open, 
  onOpenChange, 
  onCreateMeeting,
  organizacionId = ""
}: CreateMeetingDialogProps) {
  const { createMeeting } = useMeetings(organizacionId);
  const { organization } = useUserOrganization();
  
  // Usar la organización del usuario o la que se pasa como prop
  const currentOrganizationId = useMemo(() => 
    organizacionId || organization?.id || "", 
    [organizacionId, organization?.id]
  );
  
  // Hook para manejar agendas - solo cargar cuando el diálogo esté abierto
  const { agendas, isLoading: agendasLoading, refetch: refetchAgendas } = useAgendas(
    open ? currentOrganizationId : undefined
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingAgenda, setEditingAgenda] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    titulo: "",
    agendaSeleccionada: "",
    miembrosConvocados: [] as string[],
    archivos: [] as File[],
    linkInvitacion: "",
    hora: "07",
    minutos: "00", 
    amPm: "AM",
    fecha: "",
    organizacion: currentOrganizationId,
    tipoReunion: "Ordinaria" as "Extraordinaria" | "Ordinaria",
    modalidad: "Virtual" as "Presencial" | "Virtual",
    lugar: "",
  });

  // Actualizar lugar por defecto cuando cambia la modalidad solo si está vacío
  useEffect(() => {
    if (formData.modalidad === "Virtual" && (formData.lugar === "" || formData.lugar === "Sala de reuniones")) {
      setFormData(prev => ({ ...prev, lugar: "" }));
    } else if (formData.modalidad === "Presencial" && (formData.lugar === "" || formData.lugar === "Virtual")) {
      setFormData(prev => ({ ...prev, lugar: "" }));
    }
  }, [formData.modalidad]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "El título es requerido";
    }

    if (!formData.fecha) {
      newErrors.fecha = "La fecha es requerida";
    }

    if (!formData.hora) {
      newErrors.hora = "La hora es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.titulo, formData.fecha, formData.hora]);

  const resetForm = useCallback(() => {
    setFormData({
      titulo: "",
      agendaSeleccionada: "",
      miembrosConvocados: [],      
      archivos: [],
      linkInvitacion: "",
      hora: "07",
      minutos: "00",
      amPm: "AM",
      fecha: "",
      organizacion: currentOrganizationId,
      tipoReunion: "Ordinaria" as "Extraordinaria" | "Ordinaria",
      modalidad: "Virtual" as "Presencial" | "Virtual",
      lugar: "",
    });
    setErrors({});
  }, [currentOrganizationId]);

  const generateInviteLink = useCallback(() => {
    const baseUrl = window.location.origin;
    const meetingId = `meeting_${Date.now()}`;
    const link = `${baseUrl}/reuniones/join/${meetingId}`;
    setFormData(prev => ({ ...prev, linkInvitacion: link }));
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (formData.linkInvitacion) {
      await navigator.clipboard.writeText(formData.linkInvitacion);
    }
  }, [formData.linkInvitacion]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      archivos: [...prev.archivos, ...files]
    }));
  }, []);

  const removeFile = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      archivos: prev.archivos.filter((_, i) => i !== index)
    }));
  }, []);

  const addMember = useCallback((memberId: string) => {
    setFormData(prev => {
      if (!prev.miembrosConvocados.includes(memberId)) {
        return {
          ...prev,
          miembrosConvocados: [...prev.miembrosConvocados, memberId]
        };
      }
      return prev;
    });
  }, []);

  const removeMember = useCallback((memberId: string) => {
    setFormData(prev => ({
      ...prev,
      miembrosConvocados: prev.miembrosConvocados.filter(id => id !== memberId)
    }));
  }, []);

  // Handlers optimizados para inputs frecuentes
  const handleTituloChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, titulo: e.target.value }));
  }, []);

  const handleLugarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, lugar: e.target.value }));
  }, []);

  const handleFechaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, fecha: e.target.value }));
  }, []);

  const handleHoraChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, hora: value }));
  }, []);

  const handleMinutosChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, minutos: value }));
  }, []);

  const handleAmPmChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, amPm: value }));
  }, []);

  const handleTipoReunionChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, tipoReunion: value as "Extraordinaria" | "Ordinaria" }));
  }, []);

  const handleModalidadChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, modalidad: value as "Presencial" | "Virtual" }));
  }, []);

  const handleAgendaChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, agendaSeleccionada: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {      const meetingData = {
        titulo: formData.titulo,
        organizacion: currentOrganizationId,
        hora_inicio: `${formData.fecha}T${formData.hora}:${formData.minutos}:00.000Z`,
        lugar: formData.lugar,
        tipo_reunion: formData.tipoReunion,
        modalidad: formData.modalidad,
        agenda: formData.agendaSeleccionada,
        convocados: formData.miembrosConvocados,
      };

      let success = false;
      if (onCreateMeeting) {
        success = await onCreateMeeting(meetingData);
      } else {
        const result = await createMeeting(meetingData);
        success = !!result;
      }

      if (success) {
        resetForm();
        onOpenChange(false);
      } else {
        setErrors({ general: "Error al crear la reunión" });
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      setErrors({ general: "Error al crear la reunión" });
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, onCreateMeeting, createMeeting, currentOrganizationId, resetForm, onOpenChange]);

  const handleCancel = useCallback(() => {
    resetForm();
    onOpenChange(false);
  }, [resetForm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] lg:max-w-[1100px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Crear Nueva Reunión
          </DialogTitle>
          <DialogDescription>
            Completa los detalles de la reunión que quieres crear.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error general */}
          {errors.general && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-sm font-medium">
              Título de la reunión *
            </Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={handleTituloChange}
              placeholder="Ej: Reunión mensual de equipo"
              className={errors.titulo ? "border-red-500" : ""}
            />
            {errors.titulo && (
              <p className="text-sm text-red-500">{errors.titulo}</p>
            )}
          </div>

          {/* Agenda */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Agenda
            </Label>
            <div className="flex gap-2">
              <Select
                value={formData.agendaSeleccionada}
                onValueChange={handleAgendaChange}
                disabled={agendasLoading}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={
                    agendasLoading 
                      ? "Cargando agendas..." 
                      : agendas.length === 0 
                        ? "No hay agendas disponibles"
                        : "Selecciona una agenda"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {agendas.map((agenda) => (
                    <SelectItem key={agenda._id} value={agenda._id}>
                      {agenda.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>              
              
              {/* Botón para editar agenda seleccionada */}
              {formData.agendaSeleccionada && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const selectedAgenda = agendas.find(a => a._id === formData.agendaSeleccionada);
                    if (selectedAgenda) {
                      setEditingAgenda(selectedAgenda);
                      setEditDialogOpen(true);
                    }
                  }}
                  title="Editar agenda seleccionada"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
              
              {/* Botón para crear nueva agenda */}
              <CreateAgendaDialog
                organizacionId={currentOrganizationId}
                availableFiles={formData.archivos}
                onAgendaCreated={(agenda) => {
                  refetchAgendas();
                  setFormData(prev => ({ ...prev, agendaSeleccionada: agenda._id }));
                }}
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Crear nueva agenda"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
            {formData.agendaSeleccionada && (
              <div className="text-xs text-muted-foreground">
                Agenda seleccionada: {agendas.find(a => a._id === formData.agendaSeleccionada)?.nombre}
              </div>
            )}
          </div>

          {/* Diálogo de Edición de Agenda */}
          {editingAgenda && (
            <CreateAgendaDialog
              organizacionId={currentOrganizationId}
              availableFiles={formData.archivos}
              editMode={true}
              agendaToEdit={editingAgenda}
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              onAgendaUpdated={(agenda) => {
                refetchAgendas();
                setEditDialogOpen(false);
                setEditingAgenda(null);
              }}
            />
          )}

          {/* Miembros Convocados */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Miembros convocados
            </Label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {availableMembers.map((member) => (
                <Button
                  key={member.id}
                  type="button"
                  variant={formData.miembrosConvocados.includes(member.id) ? "secondary" : "outline"}
                  size="sm"
                  className="justify-start text-xs h-auto py-2"
                  onClick={() => {
                    if (formData.miembrosConvocados.includes(member.id)) {
                      removeMember(member.id);
                    } else {
                      addMember(member.id);
                    }
                  }}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{member.nombre}</span>
                    <span className="text-muted-foreground">{member.email}</span>
                  </div>
                </Button>
              ))}
            </div>
            
            {formData.miembrosConvocados.length > 0 && (
              <div className="space-y-2 mt-2">
                <div className="text-xs text-muted-foreground">
                  Miembros seleccionados ({formData.miembrosConvocados.length}):
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                  {formData.miembrosConvocados.map((memberId) => {
                    const member = availableMembers.find(m => m.id === memberId);
                    return member ? (
                      <MemberBadge key={memberId} member={member} onRemove={removeMember} />
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Archivos */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Archivos adjuntos
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir archivos
              </Button>
            </div>
            
            {formData.archivos.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Archivos seleccionados ({formData.archivos.length}):
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {formData.archivos.map((file, index) => (
                    <FileBadge key={index} file={file} index={index} onRemove={removeFile} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="fecha" className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Fecha *
              </Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={handleFechaChange}
                className={errors.fecha ? "border-red-500" : ""}
              />
              {errors.fecha && (
                <p className="text-sm text-red-500">{errors.fecha}</p>
              )}
            </div>

            {/* Hora */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hora *
              </Label>
              <div className="flex gap-2">
                <Select
                  value={formData.hora}
                  onValueChange={handleHoraChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const hour = (i + 1).toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                <Select
                  value={formData.minutos}
                  onValueChange={handleMinutosChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>                  
                  <SelectContent>
                    {Array.from({ length: 60 }, (_, i) => {
                      const minute = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={minute} value={minute}>
                          {minute}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                <Select
                  value={formData.amPm}
                  onValueChange={handleAmPmChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Configuración de la Reunión */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Reunión */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Tipo de reunión
              </Label>
              <Select
                value={formData.tipoReunion}
                onValueChange={handleTipoReunionChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ordinaria">Ordinaria</SelectItem>
                  <SelectItem value="Extraordinaria">Extraordinaria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Modalidad */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Modalidad
              </Label>
              <Select
                value={formData.modalidad}
                onValueChange={handleModalidadChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Virtual">Virtual</SelectItem>
                  <SelectItem value="Presencial">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lugar o URL */}
          <div className="space-y-2">
            <Label htmlFor="lugar" className="text-sm font-medium">
              {formData.modalidad === "Virtual" ? "URL de la reunión" : "Lugar"}
            </Label>            
            <Input
              id="lugar"
              value={formData.lugar}
              onChange={handleLugarChange}
              placeholder={formData.modalidad === "Virtual" ? "Enlace de videollamada (ej: https://meet.google.com/...)" : "Dirección o sala de reuniones"}
            />
          </div>
        </form>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading || !formData.titulo.trim() || !formData.fecha}
          >
            {isLoading ? "Creando..." : "Crear Reunión"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>  );
}
