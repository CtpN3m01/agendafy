"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ReunionData } from "@/hooks/use-meetings";
import { toast } from "sonner";

interface EditMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: ReunionData | null;
  onUpdate: (id: string, data: Partial<ReunionData>) => Promise<boolean>;
}

// Función utilitaria para convertir Date a formato datetime-local
const formatDateForInput = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function EditMeetingDialog({ 
  open, 
  onOpenChange, 
  meeting, 
  onUpdate 
}: EditMeetingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    agenda: "",
    lugar: "",
    tipo_reunion: "Ordinaria" as "Ordinaria" | "Extraordinaria",
    modalidad: "Presencial" as "Presencial" | "Virtual",
    hora_inicio: "",
    hora_fin: "",
  });

  // Cargar datos de la reunión cuando se abre el diálogo
  useEffect(() => {
    if (meeting && open) {
      setFormData({
        titulo: meeting.titulo,
        agenda: meeting.agenda,
        lugar: meeting.lugar,
        tipo_reunion: meeting.tipo_reunion,
        modalidad: meeting.modalidad,
        hora_inicio: formatDateForInput(meeting.hora_inicio),
        hora_fin: meeting.hora_fin ? formatDateForInput(meeting.hora_fin) : "",
      });
    }
  }, [meeting, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meeting) return;

    setIsLoading(true);
    try {
      const updateData = {
        titulo: formData.titulo,
        agenda: formData.agenda,
        lugar: formData.lugar,
        tipo_reunion: formData.tipo_reunion,
        modalidad: formData.modalidad,
        hora_inicio: new Date(formData.hora_inicio).toISOString(),
        hora_fin: formData.hora_fin ? new Date(formData.hora_fin).toISOString() : undefined,
      };

      const success = await onUpdate(meeting._id, updateData);
      
      if (success) {
        toast.success("Reunión actualizada exitosamente");
        onOpenChange(false);
      } else {
        toast.error("Error al actualizar la reunión");
      }
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast.error("Error al actualizar la reunión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Reunión</DialogTitle>
          <DialogDescription>
            Modifica los detalles de la reunión
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo">Título de la reunión</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleInputChange("titulo", e.target.value)}
                placeholder="Ingresa el título de la reunión"
                required
              />
            </div>

            {/* Agenda */}
            <div className="space-y-2">
              <Label htmlFor="agenda">Agenda</Label>
              <Textarea
                id="agenda"
                value={formData.agenda}
                onChange={(e) => handleInputChange("agenda", e.target.value)}
                placeholder="Describe la agenda de la reunión"
                rows={3}
              />
            </div>

            {/* Lugar */}
            <div className="space-y-2">
              <Label htmlFor="lugar">Lugar</Label>
              <Input
                id="lugar"
                value={formData.lugar}
                onChange={(e) => handleInputChange("lugar", e.target.value)}
                placeholder="Ubicación de la reunión"
                required
              />
            </div>

            {/* Tipo y Modalidad */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de reunión</Label>
                <Select 
                  value={formData.tipo_reunion} 
                  onValueChange={(value) => handleInputChange("tipo_reunion", value)}
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
                <Label>Modalidad</Label>
                <Select 
                  value={formData.modalidad} 
                  onValueChange={(value) => handleInputChange("modalidad", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Virtual">Virtual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora de inicio</Label>
                <Input
                  id="hora_inicio"
                  type="datetime-local"
                  value={formData.hora_inicio}
                  onChange={(e) => handleInputChange("hora_inicio", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora_fin">Hora de fin</Label>
                <Input
                  id="hora_fin"
                  type="datetime-local"
                  value={formData.hora_fin}
                  onChange={(e) => handleInputChange("hora_fin", e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
