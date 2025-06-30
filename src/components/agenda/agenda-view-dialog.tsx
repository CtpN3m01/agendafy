// src/components/agenda/agenda-view-dialog.tsx
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Users, Clock, MapPin, Edit, Settings } from 'lucide-react';
import { useUserPermissions, useUserRole } from '@/hooks/use-user-permissions';

interface PuntoAgenda {
  _id: string;
  titulo: string;
  descripcion?: string;
  tipo: 'informativo' | 'aprobacion' | 'discusion';
  orden: number;
  tiempoEstimado?: number;
  responsable?: string;
  documentos?: string[];
}

interface ReunionAsociada {
  _id: string;
  titulo: string;
  fecha: string;
  lugar: string;
  estado: 'programada' | 'en_curso' | 'finalizada' | 'cancelada';
}

interface AgendaDetalle {
  _id: string;
  nombre: string;
  descripcion?: string;
  puntos: PuntoAgenda[];
  reuniones: ReunionAsociada[];
  organizacion: string;
  createdAt: string;
  updatedAt: string;
}

interface AgendaViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agenda: AgendaDetalle | null;
  isLoading?: boolean;
  onEdit?: () => void; // Función opcional para editar la agenda
}

export function AgendaViewDialog({ isOpen, onClose, agenda, isLoading, onEdit }: AgendaViewDialogProps) {
  const permissions = useUserPermissions();
  const { role, displayName } = useUserRole();
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'informativo': return 'secondary';
      case 'aprobacion': return 'default';
      case 'discusion': return 'outline';
      default: return 'secondary';
    }
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'programada': return 'default';
      case 'en_curso': return 'destructive';
      case 'finalizada': return 'secondary';
      case 'cancelada': return 'outline';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Cargando Agenda</DialogTitle>
            <DialogDescription>
              Por favor espere mientras se carga la información de la agenda.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Cargando agenda...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!agenda) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Agenda no encontrada</DialogTitle>
            <DialogDescription>
              No se pudo cargar la información de la agenda.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {agenda.nombre}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                {displayName}
              </Badge>
              {permissions.canEdit && onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onEdit}
                  className="ml-2"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            {role === 'admin' 
              ? 'Información detallada de la agenda - Puede editar todos los elementos'
              : 'Vista de la agenda para revisión - Solo lectura'
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {agenda.descripcion && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                    <p className="text-sm mt-1">{agenda.descripcion}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Creada</label>
                    <p className="text-sm mt-1">{formatDate(agenda.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Última actualización</label>
                    <p className="text-sm mt-1">{formatDate(agenda.updatedAt)}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{agenda.puntos.length} puntos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{agenda.reuniones.length} reuniones</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Puntos de la Agenda */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Puntos de la Agenda ({agenda.puntos.length})
                  </CardTitle>
                  {permissions.canEdit && (
                    <Badge variant="outline" className="text-xs">
                      <Settings className="h-3 w-3 mr-1" />
                      Editable
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {role === 'admin' 
                    ? 'Lista completa de puntos con detalles administrativos'
                    : 'Puntos que se tratarán en la agenda'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agenda.puntos.length === 0 ? (
                  <div className="text-muted-foreground text-center py-8 space-y-2">
                    <FileText className="h-8 w-8 mx-auto opacity-50" />
                    <p className="font-medium">No hay puntos definidos</p>
                    <p className="text-sm">Esta agenda aún no tiene puntos configurados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agenda.puntos
                      .sort((a, b) => a.orden - b.orden)
                      .map((punto, index) => (
                        <Card key={punto._id} className="border-l-4 border-l-primary/20">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                  {index + 1}
                                </span>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-semibold text-lg leading-tight">{punto.titulo}</h4>
                                    <Badge variant={getTipoBadgeVariant(punto.tipo)} className="capitalize">
                                      {punto.tipo}
                                    </Badge>
                                  </div>
                                  {punto.descripcion && (
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                      {punto.descripcion}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          
                          {/* Información adicional del punto */}
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {punto.tiempoEstimado && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium">Duración:</span>
                                  <span>{punto.tiempoEstimado} minutos</span>
                                </div>
                              )}
                              
                              {punto.responsable && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="h-4 w-4 text-green-500" />
                                  <span className="font-medium">Responsable:</span>
                                  <span>{punto.responsable}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 text-sm">
                                <Settings className="h-4 w-4 text-purple-500" />
                                <span className="font-medium">Orden:</span>
                                <span>#{punto.orden}</span>
                              </div>
                            </div>
                            
                            {/* Documentos asociados */}
                            {punto.documentos && punto.documentos.length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="h-4 w-4 text-orange-500" />
                                  <span className="font-medium text-sm">Documentos adjuntos:</span>
                                </div>
                                <div className="space-y-1">
                                  {punto.documentos.map((doc, docIndex) => (
                                    <div 
                                      key={docIndex} 
                                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors"
                                    >
                                      <FileText className="h-3 w-3" />
                                      <span>{doc}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reuniones Asociadas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Reuniones Asociadas ({agenda.reuniones.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {agenda.reuniones.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay reuniones asociadas a esta agenda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {agenda.reuniones.map((reunion) => (
                      <div
                        key={reunion._id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <h4 className="font-medium">{reunion.titulo}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(reunion.fecha)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {reunion.lugar}
                            </div>
                          </div>
                        </div>
                        <Badge variant={getEstadoBadgeVariant(reunion.estado)}>
                          {reunion.estado.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
