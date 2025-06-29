// src/app/auth/persona/login/page.tsx
"use client";

import { AuthLayout } from "@/components/layout";
import { PersonaLoginForm } from "@/components/auth/persona-login-form";
import { PersonaLoginDTO, PersonaAuthResponseDTO } from "@/types/PersonaDTO";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function PersonaLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/reuniones');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (credentials: PersonaLoginDTO): Promise<PersonaAuthResponseDTO> => {
    try {
      const response = await fetch('/api/auth/persona/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.correo,
          password: credentials.contrasena
        }),
      });

      const data: PersonaAuthResponseDTO = await response.json();

      if (data.success && data.token && data.persona) {
        // Adaptar los datos de persona al formato de usuario para el hook de auth
        const adaptedUser = {
          id: data.persona.id,
          correo: data.persona.correo,
          nombreUsuario: `${data.persona.nombre}_${data.persona.apellidos}`,
          nombre: data.persona.nombre,
          apellidos: data.persona.apellidos,
          type: 'persona' as const,
          rol: data.persona.rol,
          organizacion: data.persona.organizacion
        };
        
        // Usar el hook de autenticación para manejar el login
        login(data.token, adaptedUser);
        
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
    router.push('/auth/persona/forgot-password');
  };

  const handleBackToUser = () => {
    router.push('/auth/login');
  };

  return (
    <AuthLayout>
      <PersonaLoginForm 
        onLogin={handleLogin} 
        onForgotPassword={handleForgotPassword}
        onBackToUser={handleBackToUser}
      />
    </AuthLayout>
  );
}
