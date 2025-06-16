// src/components/auth/recovery-form.tsx
"use client";

import { useState } from "react";
import { RecoveryData, AuthResponse } from "@/types";

interface RecoveryFormProps {
  onRecovery: (data: RecoveryData) => Promise<AuthResponse>;
  onBackToLogin: () => void;
}

export function RecoveryForm({ onRecovery, onBackToLogin }: RecoveryFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrors({ email: ["El email es requerido"] });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: ["El email no es válido"] });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await onRecovery({ email });
      if (response.success) {
        setIsSuccess(true);
      } else {
        setErrors(response.errors || { general: [response.message] });
      }
    } catch {
      setErrors({ general: ["Error de conexión. Por favor, intenta nuevamente."] });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Correo enviado!</h2>
          <p className="text-gray-600 mb-6">
            Te hemos enviado un enlace de recuperación a tu correo electrónico.
            Revisa tu bandeja de entrada y sigue las instrucciones.
          </p>
          <button
            onClick={onBackToLogin}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recuperar Contraseña</h2>
        <p className="text-gray-600">Ingresa tu email para recibir un enlace de recuperación</p>
      </div>

      {errors.general && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {errors.general[0]}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="tu@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </button>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Volver al Login
        </button>
      </form>
    </div>
  );
}