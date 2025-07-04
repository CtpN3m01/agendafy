// src/components/agenda/create-agenda-dialog.tsx
"use client";

import { useState, useEffect, useRef } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Edit3,
  Clock, 
  User,
  Loader2,
  GripVertical,
  FileText,
  X
} from "lucide-react";

interface Agenda {
  _id?: string;
  nombre?: string;
  [key: string]: unknown;
}
import { useAgendas, usePuntos } from "@/hooks/use-agendas";
import { TipoPunto } from '@/types/punto-types';

interface ConvocadoData {
  nombre: string;
  correo: string;
  esMiembro: boolean;
}

interface PuntoFormData {
  id: string;
  titulo: string;
  tipo: TipoPunto;
  duracion: number;
  expositor: string;
  detalles?: string;
  anotaciones?: string;
  archivos?: string[]; // IDs de archivos asociados
}

interface CreateAgendaDialogProps {
  organizacionId: string;
  onAgendaCreated?: (agenda: Agenda) => void;
  onAgendaUpdated?: (agenda: Agenda) => void;
  trigger?: React.ReactNode;
  availableFiles?: File[]; // Archivos disponibles para asociar
  editMode?: boolean; // Modo edición
  agendaToEdit?: Agenda; // Agenda a editar
  open?: boolean; // Control externo del diálogo
  onOpenChange?: (open: boolean) => void; // Callback para cambio de estado
  convocados?: ConvocadoData[]; // Lista de convocados disponibles
}

export function CreateAgendaDialog({ 
  organizacionId, 
  onAgendaCreated,
  onAgendaUpdated,
  trigger,
  availableFiles = [],
  editMode = false,
  agendaToEdit,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  convocados = []
}: CreateAgendaDialogProps) {
  const { createAgendaWithPuntos, updateAgenda, getPuntosByAgenda } = useAgendas();
  const { createPunto: createPuntoAPI, updatePunto: updatePuntoAPI, deletePunto: deletePuntoAPI } = usePuntos();
  const [internalOpen, setInternalOpen] = useState(false);
  const isExternallyControlled = externalOpen !== undefined;
  const open = isExternallyControlled ? externalOpen : internalOpen;
  const setOpen = (newOpen: boolean) => {
    if (isExternallyControlled) {
      externalOnOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false); // Estado para controlar si ya se cargaron los datos
  const loadingRef = useRef(false); // Ref para evitar cargas duplicadas
  
  // Estados para rastrear cambios en modo edición
  const [originalPuntos, setOriginalPuntos] = useState<PuntoFormData[]>([]);
  const [deletedPuntoIds, setDeletedPuntoIds] = useState<string[]>([]);

  const [agendaData, setAgendaData] = useState({
    nombre: "",
  });
  const [puntos, setPuntos] = useState<PuntoFormData[]>([
    {
      id: `initial-${Date.now()}`,
      titulo: "",
      tipo: TipoPunto.Informativo,
      duracion: 15,
      expositor: "",
      detalles: "",
      anotaciones: "",
      archivos: [],
    }
  ]);

  const [editingPunto, setEditingPunto] = useState<string | null>(null);  // useEffect para cargar datos cuando se abre en modo edición
  useEffect(() => {
    if (open && editMode && agendaToEdit?._id && !dataLoaded && !loadingRef.current) {
      // Usar una variable para evitar múltiples llamadas
      let isMounted = true;
      loadingRef.current = true; // Marcar que está cargando
      
      const loadData = async () => {
        if (!isMounted || dataLoaded || !loadingRef.current) return; // Triple verificación
        
        try {
          setIsLoading(true);
          setError(null);

          // Cargar datos de la agenda
          setAgendaData({
            nombre: agendaToEdit.nombre || "",
          });

          // Cargar puntos de la agenda
          if (agendaToEdit._id) {
            const puntosData = await getPuntosByAgenda(agendaToEdit._id);
            
            if (!isMounted || dataLoaded) return; // Verificar si el componente aún está montado y datos no cargados
            
            console.log('Puntos cargados desde el backend:', puntosData);
            
            if (puntosData && puntosData.length > 0) {
              const puntosFormData = puntosData.map((punto) => ({
                id: punto._id || `temp-${Date.now()}-${Math.random()}`,
                titulo: punto.titulo || "",
                tipo: punto.tipo as TipoPunto,
                duracion: punto.duracion || 15,
                expositor: punto.expositor || "",
                detalles: punto.detalles || "",
                anotaciones: punto.anotaciones || "",
                archivos: punto.archivos || [],
              }));
              setPuntos(puntosFormData);
              setOriginalPuntos(JSON.parse(JSON.stringify(puntosFormData))); // Copia profunda
              console.log('Puntos procesados para el formulario:', puntosFormData);
            } else {
              // Si no hay puntos, crear uno vacío para empezar
              const defaultPuntos = [
                {
                  id: `new-${Date.now()}`,
                  titulo: "",
                  tipo: TipoPunto.Informativo,
                  duracion: 15,
                  expositor: "",
                  detalles: "",
                  anotaciones: "",
                  archivos: [],
                }
              ];
              setPuntos(defaultPuntos);
              setOriginalPuntos([]);
            }
          }
          
          if (isMounted) {
            setDataLoaded(true); // Marcar que los datos fueron cargados
          }
        } catch (error) {
          console.error('Error loading agenda data:', error);
          if (isMounted) {
            setError('Error al cargar los datos de la agenda');
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
            loadingRef.current = false; // Limpiar la bandera de carga
          }
        }
      };
      
      loadData();
      
      return () => {
        isMounted = false;
        loadingRef.current = false; // Limpiar la bandera de carga
      };
    }
  }, [open, editMode, agendaToEdit?._id, agendaToEdit?.nombre, dataLoaded, getPuntosByAgenda]); // Agregar dependencias faltantes

  // useEffect para resetear estado cuando se cierra el diálogo
  useEffect(() => {
    if (!open) {
      // Resetear todos los estados cuando se cierra el diálogo
      setDataLoaded(false);
      setError(null);
      setEditingPunto(null);
      loadingRef.current = false; // Limpiar ref de carga
      
      if (!editMode) {
        // Solo resetear datos del formulario si no está en modo edición
        setAgendaData({ nombre: "" });
        setPuntos([
          {
            id: `initial-${Date.now()}`,
            titulo: "",
            tipo: TipoPunto.Informativo,
            duracion: 15,
            expositor: "",
            detalles: "",
            anotaciones: "",
            archivos: [],
          }
        ]);
      }
      
      // En modo edición, resetear también los estados de seguimiento
      if (editMode) {
        setOriginalPuntos([]);
        setDeletedPuntoIds([]);
      }
    }
  }, [open, editMode]);

  const addPunto = () => {
    const newPunto: PuntoFormData = {
      id: `new-${Date.now()}-${Math.random()}`, // ID único más robusto
      titulo: "",
      tipo: TipoPunto.Informativo,
      duracion: 15,
      expositor: "",
      detalles: "",
      anotaciones: "",
      archivos: [],
    };
    setPuntos([...puntos, newPunto]);
    setEditingPunto(newPunto.id);
  };

  const updatePunto = (id: string, updates: Partial<PuntoFormData>) => {
    setPuntos(prev => prev.map(punto => 
      punto.id === id ? { ...punto, ...updates } : punto
    ));
  };  const deletePunto = (id: string) => {
    if (editMode) {
      // En modo edición, verificar si es un punto existente
      const puntoOriginal = originalPuntos.find(p => p.id === id);
      if (puntoOriginal) {
        // Es un punto existente, agregarlo a la lista de eliminados
        setDeletedPuntoIds(prev => [...prev, id]);
      }
    }
    // Siempre remover de la lista actual
    setPuntos(prev => prev.filter(punto => punto.id !== id));
  };

  const addFileToPoint = (puntoId: string, fileIndex: number) => {
    const fileName = availableFiles[fileIndex]?.name;
    if (!fileName) return;

    setPuntos(prev => prev.map(punto => 
      punto.id === puntoId 
        ? { 
            ...punto, 
            archivos: [...(punto.archivos || []), fileName]
          }
        : punto
    ));
  };

  const removeFileFromPoint = (puntoId: string, fileName: string) => {
    setPuntos(prev => prev.map(punto => 
      punto.id === puntoId 
        ? { 
            ...punto, 
            archivos: punto.archivos?.filter(archivo => archivo !== fileName) || []
          }
        : punto
    ));
  };

  const getDurationText = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
  };

  const updateAgendaWithPuntos = async () => {    if (!agendaToEdit || !agendaToEdit._id) return null;

    try {
      // 1. Actualizar la agenda
      const agendaActualizada = await updateAgenda(agendaToEdit._id, {
        nombre: agendaData.nombre,
      });

      if (!agendaActualizada) {
        throw new Error("Error al actualizar la agenda");
      }

      // 2. Eliminar puntos marcados para eliminación
      for (const puntoId of deletedPuntoIds) {
        if (puntoId.startsWith('new-')) continue;
        await deletePuntoAPI(puntoId);
      }

      // 3. Procesar puntos actuales
      const puntosCreados: string[] = [];
      
      for (const punto of puntos) {
        const isNewPunto = punto.id.startsWith('new-') || !originalPuntos.find(p => p.id === punto.id);
        
        if (isNewPunto) {
          // Crear nuevo punto
          const puntoData = {
            titulo: punto.titulo,
            tipo: punto.tipo,
            duracion: punto.duracion,
            expositor: punto.expositor,
            detalles: punto.detalles || "",
            anotaciones: punto.anotaciones || "",
            archivos: punto.archivos || [],
            agenda: agendaToEdit._id
          };
          
          const nuevoPunto = await createPuntoAPI(puntoData);
          if (nuevoPunto && nuevoPunto._id) {
            puntosCreados.push(nuevoPunto._id);
          }
        } else {
          // Actualizar punto existente
          const puntoOriginal = originalPuntos.find(p => p.id === punto.id);
          if (puntoOriginal && hasPointChanged(puntoOriginal, punto)) {
            const updateData = {
              titulo: punto.titulo,
              tipo: punto.tipo,
              duracion: punto.duracion,
              expositor: punto.expositor,
              detalles: punto.detalles || "",
              anotaciones: punto.anotaciones || "",
              archivos: punto.archivos || [],
            };
            
            await updatePuntoAPI(punto.id, updateData);
          }
          puntosCreados.push(punto.id);
        }
      }

      // 4. Actualizar la agenda con los IDs de puntos actualizados (solo si hay puntos)
      if (puntosCreados.length > 0) {
        await updateAgenda(agendaToEdit._id, {
          nombre: agendaData.nombre, // Mantener solo campos válidos
        });
      }

      return agendaActualizada;
    } catch (error) {
      console.error('Error updating agenda with puntos:', error);
      throw error;
    }
  };

  // Función para verificar si un punto ha cambiado
  const hasPointChanged = (original: PuntoFormData, current: PuntoFormData): boolean => {
    return (
      original.titulo !== current.titulo ||
      original.tipo !== current.tipo ||
      original.duracion !== current.duracion ||
      original.expositor !== current.expositor ||
      original.detalles !== current.detalles ||
      original.anotaciones !== current.anotaciones ||
      JSON.stringify(original.archivos) !== JSON.stringify(current.archivos)
    );  };

  const getTotalDuration = () => {
    return puntos.reduce((total, punto) => total + punto.duracion, 0);
  };

  const handleSubmit = async () => {
    if (!agendaData.nombre.trim()) {
      setError("El nombre de la agenda es requerido");
      return;
    }

    if (puntos.length === 0) {
      setError("Debe agregar al menos un punto a la agenda");
      return;
    }

    // Validar que todos los puntos tengan título y expositor
    const puntosIncompletos = puntos.filter(p => !p.titulo.trim());
    if (puntosIncompletos.length > 0) {
      setError("Todos los puntos deben tener un título");
      return;
    }

    const puntosSinExpositor = puntos.filter(p => !p.expositor.trim());
    if (puntosSinExpositor.length > 0) {
      setError("Todos los puntos deben tener un expositor asignado");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (editMode && agendaToEdit) {
        // Modo edición - actualizar agenda con puntos
        const agendaActualizada = await updateAgendaWithPuntos();

        if (agendaActualizada) {
          onAgendaUpdated?.(agendaActualizada as unknown as Agenda);
          setOpen(false);
          resetForm();
        } else {
          setError("Error al actualizar la agenda");
        }
      } else {
        // Modo creación - crear nueva agenda      
        const puntosParaCrear = puntos.map(punto => ({
          titulo: punto.titulo,
          tipo: punto.tipo,
          duracion: punto.duracion,
          expositor: punto.expositor,
          detalles: punto.detalles || "",
          anotaciones: punto.anotaciones || "",
          archivos: punto.archivos || [],
        }));

        const nuevaAgenda = await createAgendaWithPuntos(
          {
            nombre: agendaData.nombre,
            organizacion: organizacionId,
          },
          puntosParaCrear
        );

        if (nuevaAgenda) {
          onAgendaCreated?.(nuevaAgenda as unknown as Agenda);
          setOpen(false);
          resetForm();
        } else {
          setError("Error al crear la agenda");
        }
      }    } catch {
      setError(editMode ? "Error al actualizar la agenda" : "Error al crear la agenda");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAgendaData({ nombre: "" });        
    setPuntos([
      {
        id: `new-${Date.now()}`,
        titulo: "",
        tipo: TipoPunto.Informativo,
        duracion: 15,
        expositor: "",
        detalles: "",
        anotaciones: "",
        archivos: [],
      }
    ]);
    setEditingPunto(null);
    setOriginalPuntos([]);
    setDeletedPuntoIds([]);
    setDataLoaded(false);
    loadingRef.current = false; // Limpiar ref de carga
  };
  const handleCancel = () => {
    setOpen(false);
    setEditingPunto(null);
    setError(null);
    if (!editMode) {
      resetForm();
    }
  };  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!editMode && (
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Agenda
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[900px] lg:max-w-[1100px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editMode ? "Editar Agenda" : "Crear Agenda"}</DialogTitle>
          <DialogDescription>
            {editMode 
              ? "Edita la agenda y modifica sus puntos de discusión."
              : "Crea una nueva agenda y configura sus puntos de discusión."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la Agenda */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de Agenda</Label>
              <Input
                id="nombre"
                placeholder="Nombre de la Agenda"
                value={agendaData.nombre}
                onChange={(e) => setAgendaData(prev => ({ ...prev, nombre: e.target.value }))}
              />
            </div>
          </div>

          {/* Puntos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Puntos</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  Total: {getDurationText(getTotalDuration())}
                </Badge>
                <Button onClick={addPunto} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Punto
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {puntos.map((punto) => (
                <Card key={punto.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <CardTitle className="text-sm">
                          {editingPunto === punto.id ? (
                            <Input
                              value={punto.titulo}
                              onChange={(e) => updatePunto(punto.id, { titulo: e.target.value })}
                              placeholder="Título del punto"
                              className="h-8 min-w-[400px]"
                            />
                          ) : (
                            punto.titulo || "Sin título"
                          )}
                        </CardTitle>
                      </div>                      
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary">{punto.tipo}</Badge>
                        <Badge variant="outline">
                          {getDurationText(punto.duracion)}
                        </Badge>
                        {punto.archivos && punto.archivos.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {punto.archivos.length}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPunto(
                            editingPunto === punto.id ? null : punto.id
                          )}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        {puntos.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePunto(punto.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {editingPunto === punto.id && (
                    <CardContent className="pt-0 space-y-4">                      
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Select
                            value={punto.tipo}
                            onValueChange={(value: TipoPunto) => updatePunto(punto.id, { tipo: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={TipoPunto.Informativo}>Informativo</SelectItem>
                              <SelectItem value={TipoPunto.Aprobacion}>Aprobación</SelectItem>
                              <SelectItem value={TipoPunto.Fondo}>Fondo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Duración (minutos)</Label>
                          <Input
                            type="number"
                            value={punto.duracion}
                            onChange={(e) => updatePunto(punto.id, { 
                              duracion: parseInt(e.target.value) || 0 
                            })}
                            min="1"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Expositor</Label>
                          {convocados && convocados.length > 0 ? (
                            <Select
                              value={punto.expositor}
                              onValueChange={(value) => updatePunto(punto.id, { expositor: value })}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona un expositor" />
                              </SelectTrigger>
                              <SelectContent>
                                {convocados.map((convocado, index) => (
                                  <SelectItem 
                                    key={index} 
                                    value={convocado.nombre}
                                    className="cursor-pointer py-3"
                                  >
                                    <div className="flex flex-col items-start w-full">
                                      <span className="font-medium text-sm leading-tight">{convocado.nombre}</span>
                                      <span className="text-xs text-muted-foreground leading-tight">{convocado.correo}</span>
                                      <span className={`text-xs leading-tight ${
                                        convocado.esMiembro 
                                          ? "text-green-600" 
                                          : "text-blue-600"
                                      }`}>
                                        {convocado.esMiembro ? "Miembro de la junta" : "Invitado externo"}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={punto.expositor}
                              onChange={(e) => updatePunto(punto.id, { expositor: e.target.value })
                              }
                              placeholder="Nombre del expositor"
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Detalles</Label>
                        <Textarea
                          value={punto.detalles || ""}
                          onChange={(e) => updatePunto(punto.id, { detalles: e.target.value })}
                          placeholder="Detalles adicionales..."
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Anotaciones</Label>
                        <Textarea
                          value={punto.anotaciones || ""}
                          onChange={(e) => updatePunto(punto.id, { anotaciones: e.target.value })}
                          placeholder="Anotaciones adicionales..."
                          rows={2}
                        />
                      </div>                      
                      {/* Archivos */}
                      <div className="space-y-2">
                        <Label>Archivos asociados</Label>
                        {availableFiles.length > 0 ? (
                          <div className="space-y-2">                            
                          {/* Archivos ya asociados */}
                            {punto.archivos && punto.archivos.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Archivos asociados:</div>
                                <div className="flex flex-wrap gap-1">
                                  {punto.archivos.map((fileName, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs max-w-48">
                                      <FileText className="h-3 w-3 mr-1 flex-shrink-0" />
                                      <span className="truncate" title={fileName}>{fileName}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 ml-1 flex-shrink-0"
                                        onClick={() => removeFileFromPoint(punto.id, fileName)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                              {/* Selector de archivos disponibles */}
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Archivos disponibles:</div>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                                {availableFiles.map((file, index) => {
                                  const isSelected = punto.archivos?.includes(file.name) || false;
                                  return (
                                    <Button
                                      key={index}
                                      variant={isSelected ? "secondary" : "outline"}
                                      size="sm"
                                      className="justify-start text-xs h-8 truncate"
                                      disabled={isSelected}
                                      onClick={() => !isSelected && addFileToPoint(punto.id, index)}
                                      title={file.name} // Tooltip para nombres completos
                                    >
                                      <FileText className="h-3 w-3 mr-1 flex-shrink-0" />
                                      <span className="truncate">{file.name}</span>
                                      {isSelected && <span className="ml-auto text-xs flex-shrink-0">(asociado)</span>}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded border-dashed border">
                            No hay archivos disponibles. Sube archivos en el formulario de reunión para asociarlos a los puntos.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}                  
                  {editingPunto !== punto.id && (
                    <CardContent className="pt-0 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{punto.expositor || "Sin expositor"}</span>
                        {/* Mostrar información adicional si el expositor está en la lista de convocados */}
                        {convocados.length > 0 && punto.expositor && (
                          (() => {
                            const convocado = convocados.find(c => c.nombre === punto.expositor);
                            return convocado ? (
                              <Badge variant="outline" className="text-xs">
                                {convocado.esMiembro ? "Miembro" : "Invitado"}
                              </Badge>
                            ) : null;
                          })()
                        )}
                      </div>                      
                      {punto.archivos && punto.archivos.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {punto.archivos.map((fileName, index) => (
                            <Badge key={index} variant="outline" className="text-xs max-w-32">
                              <FileText className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate" title={fileName}>{fileName}</span>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>          
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {editMode ? "Actualizando..." : "Creando..."}
              </>
            ) : (
              editMode ? "Actualizar" : "Crear"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
