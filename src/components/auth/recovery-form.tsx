"use client";

import { useState } from "react";
import { KeyRound, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecoveryData, AuthResponse } from "@/types";

interface RecoveryFormProps {
  onRecovery: (data: RecoveryData) => Promise<AuthResponse>;
  onBackToLogin: () => void;
}

export function RecoveryForm({ onRecovery, onBackToLogin }: RecoveryFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrors({ email: ["El email es requerido"] });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: ["El email no es válido"] });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await onRecovery({ email });
      if (response.success) {
        setIsSuccess(true);
      } else {
        setErrors(response.errors || {});
      }
    } catch (error) {
      setErrors({ general: ["Error de conexión. Por favor, intenta nuevamente."] });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              Email Enviado
            </CardTitle>
            <CardDescription>
              Hemos enviado las instrucciones de recuperación a tu email
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                Revisa tu bandeja de entrada (y la carpeta de spam) para encontrar el email con el enlace de recuperación.
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Email enviado a:</p>
              <p className="font-medium text-foreground">{email}</p>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <p>¿No recibiste el email?</p>
              <ul className="list-disc text-left space-y-1 ml-4">
                <li>Verifica que el email sea correcto</li>
                <li>Revisa tu carpeta de spam</li>
                <li>El enlace expira en 24 horas</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={() => {
                setIsSuccess(false);
                setEmail("");
              }}
              variant="outline" 
              className="w-full"
            >
              Enviar a otro email
            </Button>
            
            <Button 
              onClick={onBackToLogin}
              variant="ghost" 
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <KeyRound className="h-6 w-6" />
            Recuperar Contraseña
          </CardTitle>
          <CardDescription>
            Ingresa tu email para recibir un enlace de recuperación
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

            {/* Información */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                Te enviaremos un enlace seguro para restablecer tu contraseña a tu dirección de email.
              </p>
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: [] }));
                  }
                }}
                placeholder="tu@ejemplo.com"
                required
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email[0]}</p>
              )}
            </div>

            {/* Información adicional */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• El enlace de recuperación expirará en 24 horas</p>
              <p>• Solo se puede usar una vez</p>
              <p>• Revisa tu carpeta de spam si no lo recibes</p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar Enlace de Recuperación"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onBackToLogin}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
