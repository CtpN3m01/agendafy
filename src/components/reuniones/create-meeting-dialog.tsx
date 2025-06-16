// src/components/reuniones/create-meeting-dialog.tsx
"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
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
import { useMeetings, type CreateReunionData } from "@/hooks/use-meetings";
import { useAgendas } from "@/hooks/use-agendas";
import { useUserOrganization } from "@/hooks/use-user-organization";
import { useOrganizationMembers, type OrganizationMember } from "@/hooks/use-organization-members";
import { CreateAgendaDialog } from "@/components/agenda";
import { type ConvocadoDTO } from "@/types/ReunionDTO";

// Types
interface CreateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateMeeting?: (data: CreateReunionData) => Promise<boolean>;
  organizacionId?: string;
}

interface FormData {
  titulo: string;
  agendaSeleccionada: string;
  convocados: ConvocadoDTO[];
  archivos: File[]; // Mantener como File[] para archivos en memoria
  hora: string;
  minutos: string;
  fecha: string;
  tipoReunion: "Extraordinaria" | "Ordinaria";
  modalidad: "Presencial" | "Virtual";
  lugar: string;
}

// Constants
const INITIAL_FORM_STATE: FormData = {
  titulo: "",
  agendaSeleccionada: "",
  convocados: [],
  archivos: [],
  hora: "09",
  minutos: "00",
  fecha: "",
  tipoReunion: "Ordinaria",
  modalidad: "Virtual",
  lugar: "",
};

// Custom Hooks
const useCreateMeetingForm = () => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Estado para el formulario de invitado externo
  const [guestForm, setGuestForm] = useState({ nombre: "", correo: "" });

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.titulo, formData.fecha, formData.hora, formData.agendaSeleccionada]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setGuestForm({ nombre: "", correo: "" });
  }, []);

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleConvocado = useCallback((member: OrganizationMember) => {
    setFormData(prev => {
      const exists = prev.convocados.find(c => c.correo === member.correo);
      
      if (exists) {
        // Remover convocado
        return {
          ...prev,
          convocados: prev.convocados.filter(c => c.correo !== member.correo)
        };
      } else {
        // Agregar convocado
        const convocado: ConvocadoDTO = {
          nombre: member.nombre,
          correo: member.correo,
          esMiembro: member.esMiembro,
        };
        return {
          ...prev,
          convocados: [...prev.convocados, convocado]
        };
      }
    });
  }, []);

  const addFiles = useCallback((files: File[]) => {
    setFormData(prev => ({
      ...prev,
      archivos: [...prev.archivos, ...files],
    }));
  }, []);

  const removeFile = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      archivos: prev.archivos.filter((_, i) => i !== index),
    }));
  }, []);

  const isConvocadoSelected = useCallback((member: OrganizationMember): boolean => {
    return formData.convocados.some(c => c.correo === member.correo);
  }, [formData.convocados]);

  const addExternalGuest = useCallback(() => {
    const { nombre, correo } = guestForm;
    
    // Validación simple
    if (!nombre.trim() || !correo.trim()) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return false;
    
    // Verificar que no exista ya
    const exists = formData.convocados.some(c => c.correo.toLowerCase() === correo.toLowerCase());
    if (exists) return false;
    
    // Agregar convocado externo
    const nuevoConvocado: ConvocadoDTO = {
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      esMiembro: false
    };
    
    setFormData(prev => ({
      ...prev,
      convocados: [...prev.convocados, nuevoConvocado]
    }));
    
    // Limpiar formulario
    setGuestForm({ nombre: "", correo: "" });
    return true;
  }, [guestForm, formData.convocados]);

  const removeConvocado = useCallback((correo: string) => {
    setFormData(prev => ({
      ...prev,
      convocados: prev.convocados.filter(c => c.correo !== correo)
    }));
  }, []);

  return {
    formData,
    errors,
    guestForm,
    setGuestForm,
    validateForm,
    resetForm,
    updateFormData,
    toggleConvocado,
    addFiles,
    removeFile,
    isConvocadoSelected,
    addExternalGuest,
    removeConvocado,
    setErrors,
  };
};

// Components
const FileBadge = React.memo(({ file, index, onRemove }: { 
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

FileBadge.displayName = 'FileBadge';

const MemberButton = React.memo(({ 
  member, 
  isSelected, 
  onClick 
}: { 
  member: OrganizationMember; 
  isSelected: boolean; 
  onClick: () => void; 
}) => (
  <Button
    type="button"
    variant={isSelected ? "default" : "outline"}
    size="sm"
    className={`justify-start text-xs h-auto py-3 transition-colors ${
      isSelected 
        ? "bg-blue-600 hover:bg-blue-700 text-white" 
        : "hover:bg-gray-50"
    }`}
    onClick={onClick}
  >
    <div className="flex flex-col items-start w-full">
      <span className="font-medium">{member.nombre}</span>
      <span className={`text-xs ${isSelected ? "text-blue-100" : "text-muted-foreground"}`}>
        {member.correo}
      </span>
      <span className={`text-xs ${
        isSelected 
          ? "text-blue-200" 
          : member.esMiembro 
            ? "text-green-600" 
            : "text-gray-500"
      }`}>
        {member.esMiembro ? "Miembro" : "Invitado"}
      </span>
    </div>  </Button>
));

MemberButton.displayName = 'MemberButton';

// Main Component
export function CreateMeetingDialog({ 
  open, 
  onOpenChange, 
  organizacionId = ""
}: CreateMeetingDialogProps) {

  const { organization } = useUserOrganization();
  
  // Usar la organización del usuario o la que se pasa como prop
  const currentOrganizationId = useMemo(() => 
    organizacionId || organization?.id || "", 
    [organizacionId, organization?.id]
  );
  

  // Hooks - usar currentOrganizationId en lugar de organizacionId
  const { createMeeting, refetch } = useMeetings(currentOrganizationId);
  
  const { agendas, isLoading: agendasLoading, refetch: refetchAgendas } = useAgendas(
    open ? currentOrganizationId : undefined
  );
  const { members, isLoading: membersLoading } = useOrganizationMembers(
    open ? currentOrganizationId : undefined
  );
  const {
    formData,
    errors,
    guestForm,
    setGuestForm,
    validateForm,
    resetForm,
    updateFormData,
    toggleConvocado,
    addFiles,
    removeFile,
    isConvocadoSelected,
    addExternalGuest,
    removeConvocado,
    setErrors,
  } = useCreateMeetingForm();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<Record<string, unknown> | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  }, [addFiles]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Convertir la hora a formato ISO
      const horaInicio = `${formData.fecha}T${formData.hora}:${formData.minutos}:00.000Z`;
      
      const meetingData: CreateReunionData = {
        titulo: formData.titulo,
        organizacion: currentOrganizationId,
        hora_inicio: horaInicio,
        lugar: formData.lugar,
        tipo_reunion: formData.tipoReunion,
        modalidad: formData.modalidad,
        agenda: formData.agendaSeleccionada,
        convocados: formData.convocados,
        archivosFiles: formData.archivos, // Pasar los archivos en memoria al hook
      };

      if (typeof createMeeting !== 'function') {
        setErrors({ general: "Error: createMeeting no está disponible" });
        return;
      }
      
      // El hook se encarga de subir los archivos y crear la reunión
      const result = await createMeeting(meetingData);
      const success = !!result;

      if (success) {
        // Refrescar la lista de reuniones desde el servidor
        await refetch();
        resetForm();
        onOpenChange(false);
      } else {
        setErrors({ general: "Error al crear la reunión" });
      }    } catch {
      setErrors({ general: "Error al crear la reunión" });
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, createMeeting, refetch, currentOrganizationId, resetForm, onOpenChange, setErrors]);

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
              onChange={(e) => updateFormData({ titulo: e.target.value })}
              placeholder="Ej: Reunión mensual de equipo"
              className={errors.titulo ? "border-red-500" : ""}
            />
            {errors.titulo && (
              <p className="text-sm text-red-500">{errors.titulo}</p>
            )}
          </div>

          {/* Miembros Convocados */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Convocados ({formData.convocados.length} seleccionados)
            </Label>
            
            {/* Lista de convocados seleccionados */}
            {formData.convocados.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground font-medium">
                  Lista de convocados:
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {formData.convocados.map((convocado) => (
                    <div key={convocado.correo} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border">
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium text-sm truncate">{convocado.nombre}</span>
                        <span className="text-xs text-muted-foreground truncate">{convocado.correo}</span>
                        <span className={`text-xs ${
                          convocado.esMiembro 
                            ? "text-green-600" 
                            : "text-blue-600"
                        }`}>
                          {convocado.esMiembro ? "Miembro de la junta" : "Invitado externo"}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeConvocado(convocado.correo)}
                        className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Miembros de la organización */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground font-medium">
                Miembros de la junta directiva:
              </div>
              {membersLoading ? (
                <div className="text-sm text-muted-foreground">Cargando miembros...</div>
              ) : members.length === 0 ? (
                <div className="text-sm text-muted-foreground">No hay miembros disponibles</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {members.map((member) => (
                    <MemberButton
                      key={member.id}
                      member={member}
                      isSelected={isConvocadoSelected(member)}
                      onClick={() => toggleConvocado(member)}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Convocados Externos */}
            <div className="space-y-2 border-t pt-4">
              <div className="text-xs text-muted-foreground font-medium">
                Agregar invitado externo:
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={guestForm.nombre}
                  onChange={(e) => setGuestForm({ ...guestForm, nombre: e.target.value })}
                  placeholder="Nombre del invitado"
                  className="flex-1"
                />
                <Input
                  type="email"
                  value={guestForm.correo}
                  onChange={(e) => setGuestForm({ ...guestForm, correo: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addExternalGuest}
                  disabled={!guestForm.nombre.trim() || !guestForm.correo.trim()}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>
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
                onChange={(e) => updateFormData({ fecha: e.target.value })}
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
                  onValueChange={(value) => updateFormData({ hora: value })}
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
                  onValueChange={(value) => updateFormData({ minutos: value })}
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
            {/* Tipo de Reunión */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Tipo de reunión
              </Label>
              <Select
                value={formData.tipoReunion}
                onValueChange={(value) => updateFormData({ tipoReunion: value as "Extraordinaria" | "Ordinaria" })}
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
                onValueChange={(value) => updateFormData({ modalidad: value as "Presencial" | "Virtual" })}
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
          </div>          {/* Lugar o URL */}
          <div className="space-y-2">
            <Label htmlFor="lugar" className="text-sm font-medium">
              {formData.modalidad === "Virtual" ? "URL de la reunión" : "Lugar"}
            </Label>            
            <Input
              id="lugar"
              value={formData.lugar}
              onChange={(e) => updateFormData({ lugar: e.target.value })}
              placeholder={formData.modalidad === "Virtual" ? "Enlace de videollamada (ej: https://meet.google.com/...)" : "Dirección o sala de reuniones"}
            />
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
                onValueChange={(value) => updateFormData({ agendaSeleccionada: value })}
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
                      setEditingAgenda(selectedAgenda as unknown as Record<string, unknown>);
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
                convocados={formData.convocados}
                onAgendaCreated={(agenda) => {
                  refetchAgendas();
                  updateFormData({ agendaSeleccionada: agenda._id });
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
            {errors.agenda && (
              <p className="text-sm text-red-500">{errors.agenda}</p>
            )}
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
              convocados={formData.convocados}
              editMode={true}
              agendaToEdit={editingAgenda}
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              onAgendaUpdated={() => {
                refetchAgendas();
                setEditDialogOpen(false);
                setEditingAgenda(null);
              }}
            />
          )}

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
            onClick={(e) => {
              handleSubmit(e);
            }}
            disabled={isLoading || !formData.titulo.trim() || !formData.fecha || !formData.agendaSeleccionada}
          >
            {isLoading ? "Creando..." : "Crear Reunión"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
