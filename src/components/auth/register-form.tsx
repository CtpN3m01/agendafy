"use client";

import { useState } from "react";
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RegisterData, AuthResponse } from "@/types";

interface RegisterFormProps {
  onRegister: (data: RegisterData) => Promise<AuthResponse>;
  onLogin: () => void;
}

export function RegisterForm({ onRegister, onLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    organizationCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    if (!formData.name.trim()) {
      newErrors.name = ["El nombre es requerido"];
    }

    if (!formData.email.trim()) {
      newErrors.email = ["El email es requerido"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = ["El email no es válido"];
    }

    if (!formData.password) {
      newErrors.password = ["La contraseña es requerida"];
    } else if (formData.password.length < 8) {
      newErrors.password = ["La contraseña debe tener al menos 8 caracteres"];
    }

    if (formData.password !== formData.confirmPassword) {
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
      const response = await onRegister(formData);
      if (!response.success) {
        setErrors(response.errors || {});
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
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <UserPlus className="h-6 w-6" />
            Crear Cuenta
          </CardTitle>
          <CardDescription>
            Únete a Agendafy y comienza a gestionar tus reuniones
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Error general */}
            {errors.general && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {errors.general[0]}
              </div>
            )}

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre completo
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Juan Pérez"
                required
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name[0]}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="juan@ejemplo.com"
                required
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email[0]}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password[0]}</p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                  className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword[0]}</p>
              )}
            </div>

            {/* Código de organización (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="organizationCode" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Código de organización
                <span className="text-xs text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="organizationCode"
                type="text"
                value={formData.organizationCode}
                onChange={(e) => handleInputChange("organizationCode", e.target.value)}
                placeholder="ABC123"
                className={errors.organizationCode ? "border-red-500" : ""}
              />
              {errors.organizationCode && (
                <p className="text-sm text-red-600">{errors.organizationCode[0]}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Si tienes un código de organización, ingrésalo para unirte automáticamente
              </p>
            </div>

            {/* Términos y condiciones */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange("acceptTerms", !!checked)}
                  className={errors.acceptTerms ? "border-red-500" : ""}
                />
                <Label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                  Acepto los{" "}
                  <Button variant="link" className="p-0 h-auto text-sm">
                    términos y condiciones
                  </Button>{" "}
                  y la{" "}
                  <Button variant="link" className="p-0 h-auto text-sm">
                    política de privacidad
                  </Button>
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600">{errors.acceptTerms[0]}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  o
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onLogin}
            >
              Ya tengo una cuenta
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
