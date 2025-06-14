// src/components/reuniones/create-meeting-dialog.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CalendarDays, Clock, Users, Upload, Plus, FileText, X, Edit3 } from "lucide-react";
import { useMeetings, CreateReunionData } from "@/hooks/use-meetings";
import { useAgendas } from "@/hooks/use-agendas";
import { useUserOrganization } from "@/hooks/use-user-organization";
import { useBoardMembers } from "@/hooks/use-board-members";
import { CreateAgendaDialog } from "@/components/agenda";
import { ConvocadoDTO } from "@/types/ReunionDTO";

interface CreateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateMeeting?: (data: CreateReunionData) => Promise<boolean>;
  organizacionId?: string;
}

// Interfaces locales para el formulario
interface FormData {
  titulo: string;
  agendaSeleccionada: string;
  convocados: string[]; // Array de IDs de miembros
  archivos: File[];
  hora: string;
  minutos: string;
  fecha: string;
  organizacion: string;
  tipo_reunion: "Extraordinaria" | "Ordinaria";
  modalidad: "Presencial" | "Virtual";
  lugar: string;
}

// Componente memoizado para archivos
const FileItem = React.memo(({ 
  file, 
  index, 
  onRemove 
}: { 
  file: File; 
  index: number; 
  onRemove: (index: number) => void; 
}) => (
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

// Componente memoizado para miembros
const MemberButton = React.memo(({ 
  member, 
  isSelected, 
  onToggle 
}: { 
  member: { _id: string; nombre: string; apellidos: string; correo: string }; 
  isSelected: boolean; 
  onToggle: () => void; 
}) => (
  <Button
    type="button"
    variant={isSelected ? "default" : "outline"}
    size="sm"
    className={`justify-start text-xs h-auto py-2 transition-all duration-200 ${
      isSelected 
        ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" 
        : "hover:bg-gray-50"
    }`}
    onClick={onToggle}
  >
    <div className="flex flex-col items-start">
      <span className="font-medium">{member.nombre} {member.apellidos}</span>
      <span className={isSelected ? "text-blue-100" : "text-muted-foreground"}>
        {member.correo}
      </span>
    </div>
  </Button>
));

export function CreateMeetingDialog({ 
  open, 
  onOpenChange, 
  onCreateMeeting,
  organizacionId = ""
}: CreateMeetingDialogProps) {
  const { createMeeting } = useMeetings(organizacionId);
  const { organization } = useUserOrganization();
  
  // Determinar la organización actual
  const currentOrganizationId = useMemo(() => 
    organizacionId || organization?.id || "", 
    [organizacionId, organization?.id]
  );

  // Hooks condicionalmente cargados
  const { agendas, isLoading: agendasLoading, refetch: refetchAgendas } = useAgendas(
    open ? currentOrganizationId : undefined
  );
  
  const { members: boardMembers, isLoading: membersLoading } = useBoardMembers(
    open ? currentOrganizationId : null
  );
  
  // Estados del formulario
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingAgenda, setEditingAgenda] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado inicial del formulario
  const initialFormData: FormData = useMemo(() => ({
    titulo: "",
    agendaSeleccionada: "",
    convocados: [],
    archivos: [],
    hora: "07",
    minutos: "00",
    fecha: "",
    organizacion: currentOrganizationId,
    tipo_reunion: "Ordinaria",
    modalidad: "Virtual",
    lugar: "",
  }), [currentOrganizationId]);

  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Resetear formulario cuando cambie la organización
  useEffect(() => {
    setFormData(prev => ({ ...prev, organizacion: currentOrganizationId }));
  }, [currentOrganizationId]);

  // Validación del formulario
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

    if (!formData.agendaSeleccionada) {
      newErrors.agenda = "La agenda es requerida";
    }

    if (!formData.lugar.trim()) {
      newErrors.lugar = "El lugar es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Resetear formulario
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, [initialFormData]);

  // Conversión de convocados para CreateAgendaDialog
  const convocadosData = useMemo((): Array<{ nombre: string; correo: string; esMiembro: boolean }> => {
    return formData.convocados.map(memberId => {
      const member = boardMembers.find(m => m._id === memberId);
      if (member) {
        return {
          nombre: `${member.nombre} ${member.apellidos}`,
          correo: member.correo,
          esMiembro: true
        };
      }
      return null;
    }).filter(Boolean) as Array<{ nombre: string; correo: string; esMiembro: boolean }>;
  }, [formData.convocados, boardMembers]);

  // Conversión de convocados para la API
  const getConvocadosForAPI = useCallback((): ConvocadoDTO[] => {
    return convocadosData;
  }, [convocadosData]);

  // Handlers para archivos
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

  // Handlers para miembros
  const toggleMember = useCallback((memberId: string) => {
    setFormData(prev => ({
      ...prev,
      convocados: prev.convocados.includes(memberId)
        ? prev.convocados.filter(id => id !== memberId)
        : [...prev.convocados, memberId]
    }));
  }, []);

  // Handlers optimizados para inputs
  const updateField = useCallback(<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Crear hora_inicio en formato ISO
  const createHoraInicio = useCallback((): string => {
    return `${formData.fecha}T${formData.hora}:${formData.minutos}:00.000Z`;
  }, [formData.fecha, formData.hora, formData.minutos]);

  // Submit del formulario
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const meetingData: CreateReunionData = {
        titulo: formData.titulo,
        organizacion: currentOrganizationId,
        hora_inicio: createHoraInicio(),
        lugar: formData.lugar,
        tipo_reunion: formData.tipo_reunion,
        modalidad: formData.modalidad,
        agenda: formData.agendaSeleccionada,
        convocados: getConvocadosForAPI(),
        archivos: [], // Las URLs de archivos se manejarían en el backend
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
  }, [
    formData, 
    validateForm, 
    onCreateMeeting, 
    createMeeting, 
    currentOrganizationId, 
    createHoraInicio, 
    getConvocadosForAPI, 
    resetForm, 
    onOpenChange
  ]);

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
              onChange={(e) => updateField('titulo', e.target.value)}
              placeholder="Ej: Reunión mensual de equipo"
              className={errors.titulo ? "border-red-500" : ""}
            />
            {errors.titulo && (
              <p className="text-sm text-red-500">{errors.titulo}</p>
            )}
          </div>

          {/* Miembros Convocados */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Personas convocadas
              {formData.convocados.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({formData.convocados.length} seleccionados)
                </span>
              )}
            </Label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {membersLoading ? (
                <div className="col-span-full text-center text-sm text-muted-foreground">
                  Cargando miembros...
                </div>
              ) : boardMembers.length === 0 ? (
                <div className="col-span-full text-center text-sm text-muted-foreground">
                  No hay miembros registrados en la organización
                </div>
              ) : (
                boardMembers.map((member) => (
                  <MemberButton
                    key={member._id}
                    member={member}
                    isSelected={formData.convocados.includes(member._id)}
                    onToggle={() => toggleMember(member._id)}
                  />
                ))
              )}
            </div>
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
                    <FileItem 
                      key={`${file.name}-${index}`} 
                      file={file} 
                      index={index} 
                      onRemove={removeFile} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha" className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Fecha *
              </Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => updateField('fecha', e.target.value)}
                className={errors.fecha ? "border-red-500" : ""}
              />
              {errors.fecha && (
                <p className="text-sm text-red-500">{errors.fecha}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hora *
              </Label>
              <div className="flex gap-2">
                <Select
                  value={formData.hora}
                  onValueChange={(value) => updateField('hora', value)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
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
                  onValueChange={(value) => updateField('minutos', value)}
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
              </div>
              {errors.hora && (
                <p className="text-sm text-red-500">{errors.hora}</p>
              )}
            </div>
          </div>

          {/* Configuración de la Reunión */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Tipo de reunión
              </Label>
              <Select
                value={formData.tipo_reunion}
                onValueChange={(value: "Extraordinaria" | "Ordinaria") => 
                  updateField('tipo_reunion', value)
                }
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

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Modalidad
              </Label>
              <Select
                value={formData.modalidad}
                onValueChange={(value: "Presencial" | "Virtual") => 
                  updateField('modalidad', value)
                }
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
              {formData.modalidad === "Virtual" ? "URL de la reunión" : "Lugar"} *
            </Label>            
            <Input
              id="lugar"
              value={formData.lugar}
              onChange={(e) => updateField('lugar', e.target.value)}
              placeholder={
                formData.modalidad === "Virtual" 
                  ? "Enlace de videollamada (ej: https://meet.google.com/...)" 
                  : "Dirección o sala de reuniones"
              }
              className={errors.lugar ? "border-red-500" : ""}
            />
            {errors.lugar && (
              <p className="text-sm text-red-500">{errors.lugar}</p>
            )}
          </div>

          {/* Agenda */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Agenda *
            </Label>
            <div className="flex gap-2">
              <Select
                value={formData.agendaSeleccionada}
                onValueChange={(value) => updateField('agendaSeleccionada', value)}
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
                convocados={convocadosData}
                onAgendaCreated={(agenda) => {
                  refetchAgendas();
                  updateField('agendaSeleccionada', agenda._id);
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
            {errors.agenda && (
              <p className="text-sm text-red-500">{errors.agenda}</p>
            )}
          </div>

          {/* Diálogo de Edición de Agenda */}
          {editingAgenda && (
            <CreateAgendaDialog
              organizacionId={currentOrganizationId}
              availableFiles={formData.archivos}
              convocados={convocadosData}
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
              disabled={isLoading || !formData.titulo.trim() || !formData.fecha || !formData.agendaSeleccionada}
            >
              {isLoading ? "Creando..." : "Crear Reunión"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
