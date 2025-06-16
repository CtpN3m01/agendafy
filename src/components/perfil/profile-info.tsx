"use client";

import { useState } from "react";
import { Mail, Phone, Edit, Save, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/types";

interface ProfileInfoProps {
  user: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => Promise<void>;
}

// Función utilitaria para formatear fechas
const formatDate = (date: Date | string | unknown): string => {
  try {
    let dateObj: Date;
    
    if (!date) return 'Fecha no disponible';
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (typeof date === 'object' && date && '$date' in date) {
      // Handle MongoDB date format
      dateObj = new Date((date as { $date: string }).$date);
    } else {
      // Try to convert to string first
      dateObj = new Date(String(date));
    }
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Fecha no válida';
    }
    
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'Fecha no disponible';
  }
};

export function ProfileInfo({ user, onUpdate }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    position: user.position || "",
    department: user.department || "",
    bio: user.bio || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      position: user.position || "",
      department: user.department || "",
      bio: user.bio || "",
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>
            Gestiona tu información personal y de contacto
          </CardDescription>
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar y nombre */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-lg">
              {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            {!isEditing ? (
              <>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{user.position || "Sin cargo"}</Badge>
                  {user.department && (
                    <Badge variant="outline">{user.department}</Badge>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div>
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="position">Cargo</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Ej: Desarrollador Senior"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Ej: Tecnología"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información de contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            {!isEditing ? (
              <p className="text-sm text-muted-foreground">{user.email}</p>
            ) : (
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono
            </Label>
            {!isEditing ? (
              <p className="text-sm text-muted-foreground">
                {user.phone || "No especificado"}
              </p>
            ) : (
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Ej: +1 234 567 8900"
              />
            )}
          </div>
        </div>

        {/* Biografía */}
        <div className="space-y-2">
          <Label htmlFor="bio">Biografía</Label>
          {!isEditing ? (
            <p className="text-sm text-muted-foreground">
              {user.bio || "No hay biografía disponible"}
            </p>
          ) : (
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Escribe algo sobre ti..."
              rows={3}
            />
          )}
        </div>        {/* Información adicional */}
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Cuenta creada: {formatDate(user.createdAt)}</p>
            <p>Última actualización: {formatDate(user.updatedAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
