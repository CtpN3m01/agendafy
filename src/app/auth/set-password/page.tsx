// src/app/auth/set-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout";

export default function SetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Obtener email de URL params en el cliente
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      setError('No se proporcionó un email válido');
    }
  }, []);

  const handleGenerateToken = async () => {
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccess(true);
      } else {
        setError(data.message || 'Error al generar el enlace');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md mx-auto text-center">
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              ¡Enlace generado!
            </h2>
            <p className="text-green-600 mb-4">
              Se ha enviado un enlace a tu correo electrónico para establecer tu contraseña.
              Revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Ir al login
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (error && !email) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md mx-auto text-center">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Error
            </h2>
            <p className="text-red-600 mb-4">
              {error}
            </p>
            <button
              onClick={() => router.push('/auth/login')}
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
      <div className="w-full max-w-md mx-auto">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Establecer Contraseña
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p>
                Se generará un enlace seguro y se enviará a tu correo electrónico 
                para que puedas establecer tu contraseña.
              </p>
            </div>

            <button
              onClick={handleGenerateToken}
              disabled={isLoading || !email}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generando enlace...' : 'Generar enlace'}
            </button>

            <div className="text-center">
              <button
                onClick={() => router.push('/auth/login')}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Volver al login
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
