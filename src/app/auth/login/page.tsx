// src/app/auth/login/page.tsx
"use client";

import { AuthLayout } from "@/components/layout";
import { LoginForm } from "@/components/auth/login-form";
import { LoginCredentials, AuthResponse } from "@/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/reuniones');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/auth/unified-login', {
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

      if (data.success && data.token && data.user) {
        // Usar el hook de autenticación para manejar el login
        login(data.token, data.user);

        console.log("Login exitoso:", data);
        
        // Redirigir al dashboard principal de reuniones
        router.push('/reuniones');
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
    <AuthLayout>
      <LoginForm 
        onLogin={handleLogin} 
        onForgotPassword={handleForgotPassword}
        onRegister={handleRegister}
      />
    </AuthLayout>
  );
}