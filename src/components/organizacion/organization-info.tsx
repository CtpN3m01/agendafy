"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {  Mail, Phone, MapPin, Loader2, Upload, X, Image as ImageIcon, Pencil, Info } from "lucide-react";
import { OrganizationLogo } from "./organization-logo";
import { BoardMembersTable } from "./board-members-table";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useUserPermissions, useUserRole } from "@/hooks/use-user-permissions";

interface OrganizationData {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrganizationInfoProps {
  organization: OrganizationData;
  onUpdate?: () => void;
}

export function OrganizationInfo({ organization, onUpdate }: OrganizationInfoProps) {
  const { user } = useAuth();
  
  // Usar el sistema de permisos basado en Visitor Pattern
  const permissions = useUserPermissions();
  const { role, displayName } = useUserRole();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);const [formData, setFormData] = useState({
    nombre: organization.nombre,
    correo: organization.correo,
    telefono: organization.telefono,
    direccion: organization.direccion
  });
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedLogo(file);
      // Crear preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };
  const clearLogo = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedLogo(null);
    setPreviewUrl(null);
  };

  // Cleanup del preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);const handleSave = async () => {
    setIsLoading(true);
    
    // Validar que tenemos el usuario autenticado
    if (!user?.id) {
      toast.error("Error: Usuario no autenticado");
      setIsLoading(false);
      return;
    }
    
    // Debug: verificar que tenemos los datos necesarios
    console.log('Organization ID:', organization.id);
    console.log('User ID:', user.id);
    console.log('Form data:', formData);    try {
      let response;
      
      // Si hay un logo seleccionado, usar FormData y la API original
      if (selectedLogo) {
        const formDataWithLogo = new FormData();
        formDataWithLogo.append('nombre', formData.nombre);
        formDataWithLogo.append('correo', formData.correo);
        formDataWithLogo.append('telefono', formData.telefono);
        formDataWithLogo.append('direccion', formData.direccion);
        formDataWithLogo.append('usuarioId', user.id);
        formDataWithLogo.append('logo', selectedLogo);

        response = await fetch(`/api/mongo/organizacion/actualizarOrganizacion?id=${organization.id}&usuarioId=${user.id}`, {
          method: 'PUT',
          body: formDataWithLogo
        });
      } else {
        // Si no hay logo, usar la API sin multer
        response = await fetch(`/api/mongo/organizacion/actualizarDatos?id=${organization.id}&usuarioId=${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: formData.nombre,
            correo: formData.correo,
            telefono: formData.telefono,
            direccion: formData.direccion
          })
        });
      }

      const result = await response.json();      if (result.success) {
        toast.success("Organización actualizada exitosamente");
        setIsEditing(false);
        if (onUpdate) {
          onUpdate();
        } else {
          // Fallback: recargar la página solo si no hay función de actualización
          window.location.reload();
        }
      } else {
        toast.error(result.message || "No se pudieron guardar los cambios");
      }
    } catch (error) {
      toast.error("Ocurrió un error al guardar los cambios");
      console.error('Error updating organization:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancel = () => {
    setFormData({
      nombre: organization.nombre,
      correo: organization.correo,
      telefono: organization.telefono,
      direccion: organization.direccion
    });
    clearLogo();
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header con información de rol */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <OrganizationLogo 
            logoUrl={organization.logo}
            organizationName={organization.nombre}
            size="md"
          />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{organization.nombre}</h1>
              <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                {displayName}
              </Badge>
            </div>
            <p className="text-muted-foreground">Organización activa</p>
          </div>
        </div>
        
        {/* Botón editar solo para administradores */}
        {permissions.canManageOrganization && (
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button>
                <Pencil className="h-4 w-4 mr-2" />
                Editar Información
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Organización</DialogTitle>
              <DialogDescription>
                Actualiza la información de tu organización aquí.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la organización</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Nombre de la organización"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="correo">Correo electrónico</Label>
                <Input
                  id="correo"
                  type="email"
                  value={formData.correo}
                  onChange={(e) => handleInputChange('correo', e.target.value)}
                  placeholder="correo@organizacion.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="Número de teléfono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder="Dirección completa"                  rows={3}
                />
              </div>
              
              {/* Sección de Logo */}
              <div className="space-y-2">
                <Label htmlFor="logo">Logo de la organización</Label>
                <div className="flex items-center gap-4">
                  {/* Preview del logo actual o nuevo */}                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Preview del nuevo logo"
                        width={64}
                        height={64}
                        className="object-cover rounded-lg"
                      />
                    ) : organization.logo ? (
                      <Image
                        src={organization.logo}
                        alt={`Logo de ${organization.nombre}`}
                        width={64}
                        height={64}
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Controles del logo */}
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Label htmlFor="logo-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm">
                          <Upload className="h-4 w-4" />
                          Subir logo
                        </div>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </Label>
                      
                      {(selectedLogo || previewUrl) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={clearLogo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {selectedLogo ? `Nuevo archivo: ${selectedLogo.name}` : 
                       organization.logo ? 'Logo actual' : 
                       'Formatos: JPG, PNG, GIF. Máximo 5MB'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Mensaje informativo para miembros de junta */}
      {role === 'board-member' && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            👁️ <strong>Modo de visualización:</strong> Solo puedes ver la información de la organización. 
            Las modificaciones las realiza el administrador.
          </AlertDescription>
        </Alert>
      )}

      {/* Card de Información de Contacto - Ahora ocupa todo el ancho */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
          <CardDescription>
            Datos de contacto de la organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Correo electrónico</p>
                <p className="text-base font-semibold">{organization.correo}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Phone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                <p className="text-base font-semibold">{organization.telefono}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                <p className="text-base font-semibold">{organization.direccion}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Miembros de la Junta */}
      <BoardMembersTable organizationId={organization.id} />
    </div>
  );
}
