// src/app/auth/reset-password/page.tsx
"use client";

import { AppLayout } from "@/components/layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ResetPasswordData, AuthResponse } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleResetPassword = async (data: ResetPasswordData): Promise<AuthResponse> => {
    try {
      if (!token) {
        return {
          success: false,
          message: "Token de recuperación no válido"
        };
      }

      if (data.nuevaContrasena !== data.confirmarContrasena) {
        return {
          success: false,
          message: "Las contraseñas no coinciden"
        };
      }

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          nuevaContrasena: data.nuevaContrasena,
          confirmarContrasena: data.confirmarContrasena
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirigir al login después de restablecer la contraseña
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }

      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error("Error en reset password:", error);
      return {
        success: false,
        message: "Error de conexión"
      };
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  if (!token) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Token inválido</h1>
            <p className="text-gray-600 mb-4">El enlace de recuperación no es válido o ha expirado.</p>
            <button 
              onClick={handleBackToLogin}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Volver al Login
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ResetPasswordForm 
        onResetPassword={handleResetPassword} 
        onBackToLogin={handleBackToLogin} 
      />
    </AppLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}