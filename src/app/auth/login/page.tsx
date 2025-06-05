"use client";

import { AppLayout } from "@/components/layout";
import { LoginForm } from "@/components/auth/login-form";
import { LoginCredentials, AuthResponse } from "@/types";

export default function LoginPage() {
  const handleLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log("Login:", credentials);
    // Aquí iría la lógica de autenticación
    return {
      success: true,
      message: "Login exitoso"
    };
  };

  const handleForgotPassword = () => {
    console.log("Ir a recuperación");
    // Aquí puedes redirigir a la página de recuperación
  };

  const handleRegister = () => {
    console.log("Ir a registro");
    // Aquí puedes redirigir a la página de registro
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
