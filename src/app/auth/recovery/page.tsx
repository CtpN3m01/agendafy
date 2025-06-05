"use client";

import { AppLayout } from "@/components/layout";
import { RecoveryForm } from "@/components/auth/recovery-form";
import { RecoveryData, AuthResponse } from "@/types";

export default function RecoveryPage() {
  const handleRecovery = async (data: RecoveryData): Promise<AuthResponse> => {
    console.log("Recovery:", data);
    // Aquí iría la lógica de recuperación
    return {
      success: true,
      message: "Email de recuperación enviado"
    };
  };
  const handleBackToLogin = () => {
    console.log("Volver a login");
    // Aquí puedes redirigir a la página de login
  };

  return (
    <AppLayout>
      <RecoveryForm onRecovery={handleRecovery} onBackToLogin={handleBackToLogin} />
    </AppLayout>
  );
}
