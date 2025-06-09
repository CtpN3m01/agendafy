// src/components/auth/organization-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Upload, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface OrganizationData {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  logo?: File | null;
}

interface OrganizationFormProps {
  onComplete?: () => void;
  showSkipButton?: boolean;
}

export function OrganizationForm({ onComplete, showSkipButton = true }: OrganizationFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<OrganizationData>({
    nombre: "",
    correo: user?.correo || "",
    telefono: "",
    direccion: "",
    logo: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = ["El nombre de la organización es requerido"];
    }

    if (!formData.correo.trim()) {
      newErrors.correo = ["El correo es requerido"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = ["El correo no es válido"];
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = ["El teléfono es requerido"];
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = ["La dirección es requerida"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit (igual que en el backend)
        setErrors(prev => ({ ...prev, logo: ["El archivo debe ser menor a 1MB"] }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: ["Solo se permiten archivos de imagen"] }));
        return;
      }

      setFormData(prev => ({ ...prev, logo: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear logo errors
      if (errors.logo) {
        setErrors(prev => ({ ...prev, logo: [] }));
      }
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }));
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('correo', formData.correo);
      formDataToSend.append('telefono', formData.telefono);
      formDataToSend.append('direccion', formData.direccion);
      
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }      // Obtener token del localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setErrors({ general: ["Error de autenticación. Por favor, inicia sesión nuevamente."] });
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/mongo/organizacion/crearOrganizacion', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        onComplete?.();
        router.push('/reuniones');
      } else {
        setErrors(data.errors || { general: [data.message || 'Error al crear la organización'] });
      }
    } catch (error) {
      setErrors({ general: ["Error de conexión. Por favor, intenta nuevamente."] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof OrganizationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar errores del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  const handleSkip = () => {
    router.push('/reuniones');
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl">Crear Organización</CardTitle>
          <CardDescription>
            Configura tu organización para comenzar a gestionar reuniones
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errors.general && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {errors.general[0]}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre de la Organización</Label>
              <Input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                required
                className="mt-1"
                placeholder="Ej: Mi Empresa S.A."
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="correo">Correo de la Organización</Label>
              <Input
                type="email"
                id="correo"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                required
                className="mt-1"
                placeholder="contacto@miempresa.com"
              />
              {errors.correo && (
                <p className="text-red-500 text-sm mt-1">{errors.correo[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                type="tel"
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                required
                className="mt-1"
                placeholder="+506 1234-5678"
              />
              {errors.telefono && (
                <p className="text-red-500 text-sm mt-1">{errors.telefono[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                type="text"
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                required
                className="mt-1"
                placeholder="Calle, Número, Ciudad"
              />
              {errors.direccion && (
                <p className="text-red-500 text-sm mt-1">{errors.direccion[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="logo">Logo (Opcional)</Label>
              <div className="mt-2">
                {logoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <span className="text-sm font-medium text-primary hover:text-primary/80">
                          Subir logo
                        </span>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 1MB</p>
                  </div>
                )}
              </div>
              {errors.logo && (
                <p className="text-red-500 text-sm mt-1">{errors.logo[0]}</p>
              )}
            </div>            <div className="flex gap-3">
              {showSkipButton && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Omitir por ahora
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className={showSkipButton ? "flex-1" : "w-full cursor-pointer"}
              >
                {isLoading ? 'Creando...' : 'Crear Organización'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
