// src/components/agenda/agenda-edit-dialog.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, GripVertical, Save, X, FileText, Clock, Users } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';

interface PuntoAgenda {
  _id?: string;
  titulo: string;
  descripcion?: string;
  tipo: 'informativo' | 'aprobacion' | 'discusion';
  orden: number;
  tiempoEstimado?: number;
  responsable?: string;
  documentos?: string[];
}

interface AgendaFormData {
  _id?: string;
  nombre: string;
  descripcion?: string;
  puntos: PuntoAgenda[];
  organizacion: string;
}

interface AgendaEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agenda: AgendaFormData | null;
  onSave: (agendaData: AgendaFormData) => Promise<void>;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function AgendaEditDialog({ 
  isOpen, 
  onClose, 
  agenda, 
  onSave, 
  isLoading = false,
  mode 
}: AgendaEditDialogProps) {
  const [formData, setFormData] = useState<AgendaFormData>({
    nombre: '',
    descripcion: '',
    puntos: [],
    organizacion: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Resetear form cuando cambia la agenda o el modo
  useEffect(() => {
    if (agenda) {
      setFormData(agenda);
    } else if (mode === 'create') {
      setFormData({
        nombre: '',
        descripcion: '',
        puntos: [],
        organizacion: ''
      });
    }
    setErrors({});
  }, [agenda, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la agenda es requerido';
    }

    // Validar puntos
    formData.puntos.forEach((punto, index) => {
      if (!punto.titulo.trim()) {
        newErrors[`punto_${index}_titulo`] = 'El título del punto es requerido';
      }
      if (punto.tiempoEstimado && punto.tiempoEstimado <= 0) {
        newErrors[`punto_${index}_tiempo`] = 'El tiempo estimado debe ser mayor a 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Reordenar puntos según su posición actual
      const puntosOrdenados = formData.puntos.map((punto, index) => ({
        ...punto,
        orden: index + 1
      }));

      await onSave({
        ...formData,
        puntos: puntosOrdenados
      });
      onClose();
    } catch (error) {
      console.error('Error al guardar agenda:', error);
      setErrors({ general: 'Error al guardar la agenda. Intente nuevamente.' });
    } finally {
      setIsSaving(false);
    }
  };

  const addPunto = () => {
    const nuevoPunto: PuntoAgenda = {
      titulo: '',
      descripcion: '',
      tipo: 'informativo',
      orden: formData.puntos.length + 1,
      tiempoEstimado: 5,
      responsable: '',
      documentos: []
    };
    
    setFormData(prev => ({
      ...prev,
      puntos: [...prev.puntos, nuevoPunto]
    }));
  };

  const removePunto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      puntos: prev.puntos.filter((_, i) => i !== index)
    }));
    
    // Limpiar errores del punto eliminado
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`punto_${index}_`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const updatePunto = (index: number, field: keyof PuntoAgenda, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      puntos: prev.puntos.map((punto, i) => 
        i === index ? { ...punto, [field]: value } : punto
      )
    }));

    // Limpiar error específico del campo
    const errorKey = `punto_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(formData.puntos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData(prev => ({
      ...prev,
      puntos: items
    }));
  };

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'informativo': return 'secondary';
      case 'aprobacion': return 'default';
      case 'discusion': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {mode === 'create' ? 'Crear Nueva Agenda' : 'Editar Agenda'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Complete la información para crear una nueva agenda'
              : 'Modifique la información de la agenda'
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {errors.general && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la Agenda *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Junta Ordinaria - Enero 2024"
                    className={errors.nombre ? 'border-red-500' : ''}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-red-500">{errors.nombre}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Descripción opcional de la agenda..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Puntos de la Agenda */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Puntos de la Agenda ({formData.puntos.length})
                  </CardTitle>
                  <Button onClick={addPunto} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Punto
                  </Button>
                </div>
                <CardDescription>
                  Defina los puntos que se tratarán en la agenda. Puede reordenarlos arrastrándolos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formData.puntos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay puntos en la agenda</p>
                    <p className="text-sm">Haga clic en &quot;Agregar Punto&quot; para empezar</p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="puntos">
                      {(provided: DroppableProvided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                          {formData.puntos.map((punto, index) => (
                            <Draggable key={index} draggableId={`punto-${index}`} index={index}>
                              {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`border rounded-lg p-4 space-y-4 transition-shadow ${
                                    snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab hover:cursor-grabbing"
                                    >
                                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                                      {index + 1}
                                    </span>
                                    <Badge variant={getTipoBadgeVariant(punto.tipo)}>
                                      {punto.tipo}
                                    </Badge>
                                    <div className="flex-1" />
                                    <Button
                                      onClick={() => removePunto(index)}
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Título del Punto *</Label>
                                      <Input
                                        value={punto.titulo}
                                        onChange={(e) => updatePunto(index, 'titulo', e.target.value)}
                                        placeholder="Ej: Aprobación del presupuesto 2024"
                                        className={errors[`punto_${index}_titulo`] ? 'border-red-500' : ''}
                                      />
                                      {errors[`punto_${index}_titulo`] && (
                                        <p className="text-sm text-red-500">{errors[`punto_${index}_titulo`]}</p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Tipo de Punto</Label>
                                      <Select
                                        value={punto.tipo}
                                        onValueChange={(value) => updatePunto(index, 'tipo', value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="informativo">Informativo</SelectItem>
                                          <SelectItem value="aprobacion">Aprobación</SelectItem>
                                          <SelectItem value="discusion">Discusión</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Tiempo Estimado (minutos)
                                      </Label>
                                      <Input
                                        type="number"
                                        value={punto.tiempoEstimado || ''}
                                        onChange={(e) => updatePunto(index, 'tiempoEstimado', parseInt(e.target.value) || undefined)}
                                        placeholder="5"
                                        min="1"
                                        className={errors[`punto_${index}_tiempo`] ? 'border-red-500' : ''}
                                      />
                                      {errors[`punto_${index}_tiempo`] && (
                                        <p className="text-sm text-red-500">{errors[`punto_${index}_tiempo`]}</p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Responsable
                                      </Label>
                                      <Input
                                        value={punto.responsable || ''}
                                        onChange={(e) => updatePunto(index, 'responsable', e.target.value)}
                                        placeholder="Nombre del responsable"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Descripción</Label>
                                    <Textarea
                                      value={punto.descripcion || ''}
                                      onChange={(e) => updatePunto(index, 'descripcion', e.target.value)}
                                      placeholder="Descripción detallada del punto..."
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Guardando..." : (mode === "create" ? "Crear Agenda" : "Guardar Cambios")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
