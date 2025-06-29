// src/app/auth/persona/set-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout";
import { SetPasswordForm } from "@/components/auth/set-password-form";

export default function SetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Obtener email de URL params en el cliente
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      router.push('/auth/persona/login');
    }, 3000);
  };

  const handleCancel = () => {
    router.push('/auth/persona/login');
  };

  if (showSuccess) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md mx-auto text-center">
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              ¡Contraseña establecida!
            </h2>
            <p className="text-green-600">
              Tu contraseña ha sido establecida exitosamente. 
              Serás redirigido al login en unos segundos...
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (!email) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md mx-auto text-center">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Error
            </h2>
            <p className="text-red-600 mb-4">
              No se proporcionó un email válido.
            </p>
            <button
              onClick={() => router.push('/auth/persona/login')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Volver al login
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <SetPasswordForm 
        email={email}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </AuthLayout>
  );
}
