// src/components/auth/persona-login-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonaLoginDTO, PersonaAuthResponseDTO } from "@/types/PersonaDTO";

interface PersonaLoginFormProps {
  onLogin: (credentials: PersonaLoginDTO) => Promise<PersonaAuthResponseDTO>;
  onForgotPassword: () => void;
  onBackToUser?: () => void;
}

export function PersonaLoginForm({ onLogin, onForgotPassword, onBackToUser }: PersonaLoginFormProps) {
  const [formData, setFormData] = useState<PersonaLoginDTO>({
    correo: "",
    contrasena: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await onLogin(formData);
      
      if (!response.success) {
        if (response.errors) {
          const errorMap: Record<string, string> = {};
          Object.entries(response.errors).forEach(([key, messages]) => {
            errorMap[key] = messages[0];
          });
          setErrors(errorMap);
        } else {
          setErrors({ general: response.message });
        }
      }
    } catch (error) {
      setErrors({ general: "Error de conexión" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo al empezar a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Acceso Junta Directiva
        </CardTitle>
        <CardDescription className="text-center">
          Ingresa tu correo y contraseña para acceder al sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {errors.general}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="correo">Correo electrónico</Label>
            <Input
              id="correo"
              name="correo"
              type="email"
              placeholder="tu@email.com"
              value={formData.correo}
              onChange={handleChange}
              required
              className={errors.correo ? "border-red-500" : ""}
            />
            {errors.correo && (
              <p className="text-sm text-red-600">{errors.correo}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrasena">Contraseña</Label>
            <Input
              id="contrasena"
              name="contrasena"
              type="password"
              placeholder="••••••••"
              value={formData.contrasena}
              onChange={handleChange}
              required
              className={errors.contrasena ? "border-red-500" : ""}
            />
            {errors.contrasena && (
              <p className="text-sm text-red-600">{errors.contrasena}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>

          <div className="flex flex-col space-y-2 text-center text-sm">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
            
            {onBackToUser && (
              <button
                type="button"
                onClick={onBackToUser}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                ¿Eres administrador? Inicia sesión aquí
              </button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
