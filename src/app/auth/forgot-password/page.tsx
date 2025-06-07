// src/app/auth/forgot-password/page.tsx
"use client";

import { AppLayout } from "@/components/layout";
import { RecoveryForm } from "@/components/auth/recovery-form";
import { RecoveryData, AuthResponse } from "@/types";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleRecovery = async (data: RecoveryData): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email
        }),
      });

      const result = await response.json();
      
      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error("Error en recuperación:", error);
      return {
        success: false,
        message: "Error de conexión"
      };
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <AppLayout>
      <RecoveryForm onRecovery={handleRecovery} onBackToLogin={handleBackToLogin} />
    </AppLayout>
  );
}