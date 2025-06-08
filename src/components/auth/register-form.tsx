// src/components/auth/register-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface RegisterData {
  nombreUsuario: string;
  nombre: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export function RegisterForm() {
  const { login } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<RegisterData>({
    nombreUsuario: "",
    nombre: "",
    apellidos: "",
    correo: "",
    contrasena: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    if (!formData.nombreUsuario.trim()) {
      newErrors.nombreUsuario = ["El nombre de usuario es requerido"];
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = ["El nombre es requerido"];
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = ["Los apellidos son requeridos"];
    }

    if (!formData.correo.trim()) {
      newErrors.correo = ["El correo es requerido"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = ["El correo no es válido"];
    }

    if (!formData.contrasena) {
      newErrors.contrasena = ["La contraseña es requerida"];
    } else if (formData.contrasena.length < 8) {
      newErrors.contrasena = ["La contraseña debe tener al menos 8 caracteres"];
    }

    if (formData.contrasena !== formData.confirmPassword) {
      newErrors.confirmPassword = ["Las contraseñas no coinciden"];
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = ["Debes aceptar los términos y condiciones"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombreUsuario: formData.nombreUsuario,
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          correo: formData.correo,
          contrasena: formData.contrasena,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Iniciar sesión automáticamente después del registro
        login(data.token, data.user);
        router.push('/reuniones');
      } else {
        setErrors(data.errors || { general: [data.message || 'Error en el registro'] });
      }
    } catch (error) {
      setErrors({ general: ["Error de conexión. Por favor, intenta nuevamente."] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar errores del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
        <p className="text-gray-600">Únete a Agendafy</p>
      </div>

      {errors.general && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {errors.general[0]}
        </div>
      )}      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nombreUsuario">Nombre de Usuario</Label>
          <Input
            type="text"
            id="nombreUsuario"
            value={formData.nombreUsuario}
            onChange={(e) => handleInputChange('nombreUsuario', e.target.value)}
            required
            className="mt-1"
          />
          {errors.nombreUsuario && (
            <p className="text-red-500 text-sm mt-1">{errors.nombreUsuario[0]}</p>
          )}
        </div>

        <div>
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            type="text"
            id="nombre"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            required
            className="mt-1"
          />
          {errors.nombre && (
            <p className="text-red-500 text-sm mt-1">{errors.nombre[0]}</p>
          )}
        </div>

        <div>
          <Label htmlFor="apellidos">Apellidos</Label>
          <Input
            type="text"
            id="apellidos"
            value={formData.apellidos}
            onChange={(e) => handleInputChange('apellidos', e.target.value)}
            required
            className="mt-1"
          />
          {errors.apellidos && (
            <p className="text-red-500 text-sm mt-1">{errors.apellidos[0]}</p>
          )}
        </div>

        <div>
          <Label htmlFor="correo">Correo Electrónico</Label>
          <Input
            type="email"
            id="correo"
            value={formData.correo}
            onChange={(e) => handleInputChange('correo', e.target.value)}
            required
            className="mt-1"
          />
          {errors.correo && (
            <p className="text-red-500 text-sm mt-1">{errors.correo[0]}</p>
          )}
        </div>

        <div>
          <Label htmlFor="contrasena">Contraseña</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="contrasena"
              value={formData.contrasena}
              onChange={(e) => handleInputChange('contrasena', e.target.value)}
              required
              className="mt-1 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.contrasena && (
            <p className="text-red-500 text-sm mt-1">{errors.contrasena[0]}</p>
          )}
        </div>        <div>
          <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
              className="mt-1 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword[0]}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
          />
          <Label htmlFor="acceptTerms" className="text-sm">
            Acepto los términos y condiciones
          </Label>
          {errors.acceptTerms && (
            <p className="text-red-500 text-sm mt-1">{errors.acceptTerms[0]}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>

        <div className="text-center">
          <span className="text-sm text-muted-foreground">¿Ya tienes cuenta? </span>
          <button
            type="button"
            onClick={() => router.push('/auth/login')}
            className="text-sm text-primary hover:underline font-medium"
          >
            Inicia sesión aquí
          </button>
        </div>
      </form>
    </div>
  );
}