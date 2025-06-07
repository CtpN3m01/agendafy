// src/app/auth/register/page.tsx
"use client";

import { AppLayout } from "@/components/layout";
import { RegisterForm } from "@/components/auth/register-form";
import { RegisterData, AuthResponse } from "@/types";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      // Validar que las contraseñas coincidan
      if (data.password !== data.confirmPassword) {
        return {
          success: false,
          message: "Las contraseñas no coinciden",
          errors: {
            confirmPassword: ["Las contraseñas no coinciden"]
          }
        };
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password
        }),
      });

      const result: AuthResponse = await response.json();

      if (result.success && result.token) {
        // Guardar token en localStorage
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Redirigir al dashboard o página principal
        router.push('/dashboard');
      }

      return result;
    } catch (error) {
      console.error("Error en registro:", error);
      return {
        success: false,
        message: "Error de conexión"
      };
    }
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <AppLayout>
      <RegisterForm onRegister={handleRegister} onLogin={handleLogin} />
    </AppLayout>
  );
}