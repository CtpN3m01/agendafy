// src/components/organizacion/board-member-form.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface BoardMember {
  _id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: string;
}

interface BoardMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (member: Omit<BoardMember, '_id'>) => Promise<boolean>;
  member?: BoardMember | null;
  isEditing?: boolean;
}

const roles = [
  { value: 'Presidente', label: 'Presidente' },
  { value: 'Vicepresidente', label: 'Vicepresidente' },
  { value: 'Tesorero', label: 'Tesorero' },
  { value: 'Vocal', label: 'Vocal' },
  { value: 'Miembro', label: 'Miembro' },
];

export function BoardMemberForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  member, 
  isEditing = false 
}: BoardMemberFormProps) {  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    rol: 'Vocal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (isOpen) {
      if (isEditing && member) {        setFormData({
          nombre: member.nombre || '',
          apellidos: member.apellidos || '',
          correo: member.correo || '',
          rol: member.rol || 'Vocal'
        });
      } else {        
        setFormData({
          nombre: '',
          apellidos: '',
          correo: '',
          rol: 'Vocal'
        });
      }
      setError(null);
    }
  }, [isOpen, isEditing, member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      setError('Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Miembro' : 'Agregar Miembro'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica la información del miembro de la junta directiva.'
              : 'Agrega un nuevo miembro a la junta directiva.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Nombre"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos *</Label>
              <Input
                id="apellidos"
                value={formData.apellidos}
                onChange={(e) => handleInputChange('apellidos', e.target.value)}
                placeholder="Apellidos"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo">Correo Electrónico *</Label>
            <Input
              id="correo"
              type="email"
              value={formData.correo}
              onChange={(e) => handleInputChange('correo', e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol</Label>
            <Select 
              value={formData.rol} 
              onValueChange={(value) => handleInputChange('rol', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((rol) => (
                  <SelectItem key={rol.value} value={rol.value}>
                    {rol.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
