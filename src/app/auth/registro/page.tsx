"use client";

import { AppLayout } from "@/components/layout";
import { RegisterForm } from "@/components/auth/register-form";

import { RegisterData, AuthResponse } from "@/types";

export default function RegisterPage() {
  const handleRegister = async (data: RegisterData): Promise<AuthResponse> => {
    console.log("Register:", data);
    // Aquí iría la lógica de registro
    return {
      success: true,
      message: "Registro exitoso"
    };
  };

  const handleLogin = () => {
    console.log("Ir a login");
    // Aquí puedes redirigir a la página de login
  };

  return (
    <AppLayout>
      <RegisterForm onRegister={handleRegister} onLogin={handleLogin} />
    </AppLayout>
  );
}
