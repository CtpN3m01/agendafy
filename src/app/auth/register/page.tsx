// src/app/auth/login/page.tsx
"use client";

import { AppLayout } from "@/components/layout";
import { LoginForm } from "@/components/auth/login-form";
import { LoginCredentials, AuthResponse } from "@/types";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.token) {
        // Guardar token en localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirigir al dashboard o página principal
        router.push('/dashboard');
      }

      return data;
    } catch (error) {
      console.error("Error en login:", error);
      return {
        success: false,
        message: "Error de conexión"
      };
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  return (
    <AppLayout>
      <LoginForm 
        onLogin={handleLogin} 
        onForgotPassword={handleForgotPassword}
        onRegister={handleRegister}
      />
    </AppLayout>
  );
}