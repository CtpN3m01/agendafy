"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Save, 
  Trash2,
  Loader2
} from "lucide-react";
import { useMeetings } from "@/hooks/use-meetings";

// Interface que coincide con la estructura de ReunionData del hook
interface ReunionData {
  _id: string;
  titulo: string;
  organizacion: string;
  hora_inicio: string;
  hora_fin?: string;
  archivos?: string[];
  convocados?: string[];
  lugar?: string;
  tipo_reunion?: string;
  modalidad?: string;
  agenda?: string;
  puntos?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export default function ReunionPage() {
  const params = useParams();
  const router = useRouter();
  const { getMeeting, updateMeeting, deleteMeeting } = useMeetings();
  
  const [reunion, setReunion] = useState<ReunionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    organizacion: "",
    hora_inicio: "",
    hora_fin: "",
    lugar: "",
    tipo_reunion: "",
    modalidad: "",
    convocados: [] as string[],
  });

  const reunionId = params?.id as string;
  useEffect(() => {
    const loadReunion = async () => {
      if (!reunionId) return;
      
      setIsLoading(true);
      try {
        const data = await getMeeting(reunionId);
        if (data) {
          setReunion(data);
          setFormData({
            titulo: data.titulo,
            organizacion: data.organizacion,
            hora_inicio: data.hora_inicio,
            hora_fin: data.hora_fin || "",
            lugar: data.lugar || "",
            tipo_reunion: data.tipo_reunion || "",
            modalidad: data.modalidad || "",
            convocados: data.convocados || [],
          });
        } else {
          setError("Reunión no encontrada");
        }
      } catch (err) {
        setError("Error al cargar la reunión");
      } finally {
        setIsLoading(false);
      }
    };

    loadReunion();
  }, [reunionId, getMeeting]);
  const handleSave = async () => {
    if (!reunion) return;
    
    setIsSaving(true);
    try {
      const updatedReunion = await updateMeeting(reunion._id, formData);
      if (updatedReunion) {
        setReunion(updatedReunion);
        setIsEditing(false);
      } else {
        setError("Error al actualizar la reunión");
      }
    } catch (err) {
      setError("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!reunion) return;
    
    try {
      const success = await deleteMeeting(reunion._id);
      if (success) {
        router.push("/reuniones");
      } else {
        setError("Error al eliminar la reunión");
      }
    } catch (err) {
      setError("Error al eliminar la reunión");
    }
  };
  const handleCancel = () => {
    if (reunion) {
      setFormData({
        titulo: reunion.titulo,
        organizacion: reunion.organizacion,
        hora_inicio: reunion.hora_inicio,
        hora_fin: reunion.hora_fin || "",
        lugar: reunion.lugar || "",
        tipo_reunion: reunion.tipo_reunion || "",
        modalidad: reunion.modalidad || "",
        convocados: reunion.convocados || [],
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateStr: string | Date | undefined) => {
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
    return timeStr;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (error || !reunion) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">{error || "Reunión no encontrada"}</p>
              <Button onClick={() => router.push("/reuniones")}>
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/reuniones")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>              <div>
                <h1 className="text-3xl font-bold">{reunion.titulo}</h1>
                <p className="text-muted-foreground">
                  Creada el {formatDate(reunion.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
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
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar
                  </Button>
                </>
              )}
            </div>
          </div>          {/* Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalles de la Reunión</CardTitle>
                <Badge variant="default">
                  {reunion.tipo_reunion || "Sin tipo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                /* Edit Form */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizacion">Organización</Label>
                    <Input
                      id="organizacion"
                      value={formData.organizacion}
                      onChange={(e) => setFormData(prev => ({ ...prev, organizacion: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hora_inicio">Hora de Inicio</Label>
                      <Input
                        id="hora_inicio"
                        type="datetime-local"
                        value={formData.hora_inicio}
                        onChange={(e) => setFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hora_fin">Hora de Fin</Label>
                      <Input
                        id="hora_fin"
                        type="datetime-local"
                        value={formData.hora_fin}
                        onChange={(e) => setFormData(prev => ({ ...prev, hora_fin: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lugar">Lugar</Label>
                      <Input
                        id="lugar"
                        value={formData.lugar}
                        onChange={(e) => setFormData(prev => ({ ...prev, lugar: e.target.value }))}
                        placeholder="Ubicación de la reunión"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Modalidad</Label>
                      <Select
                        value={formData.modalidad}
                        onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, modalidad: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar modalidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="presencial">Presencial</SelectItem>
                          <SelectItem value="virtual">Virtual</SelectItem>
                          <SelectItem value="hibrida">Híbrida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Reunión</Label>
                    <Select
                      value={formData.tipo_reunion}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, tipo_reunion: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ordinaria">Ordinaria</SelectItem>
                        <SelectItem value="extraordinaria">Extraordinaria</SelectItem>
                        <SelectItem value="emergencia">Emergencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Información General</h3>
                    <p className="text-muted-foreground">
                      {reunion.tipo_reunion || "Sin tipo especificado"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Inicio</p>
                        <p className="text-muted-foreground">{formatTime(reunion.hora_inicio)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Fin</p>
                        <p className="text-muted-foreground">{formatTime(reunion.hora_fin || "No especificada")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Lugar</p>
                        <p className="text-muted-foreground">{reunion.lugar || "No especificado"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Modalidad</p>
                        <p className="text-muted-foreground">{reunion.modalidad || "No especificada"}</p>
                      </div>
                    </div>
                  </div>

                  {reunion.convocados && reunion.convocados.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Convocados</h3>
                      <div className="flex flex-wrap gap-2">
                        {reunion.convocados.map((convocado, index) => (
                          <Badge key={index} variant="outline">
                            {convocado}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {reunion.archivos && reunion.archivos.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Archivos</h3>
                      <div className="flex flex-wrap gap-2">
                        {reunion.archivos.map((archivo, index) => (
                          <Badge key={index} variant="secondary">
                            {archivo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
