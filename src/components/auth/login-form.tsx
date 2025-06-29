// src/components/auth/login-form.tsx
"use client";

import { useState } from "react";
import { LoginCredentials, AuthResponse } from "@/types";

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<AuthResponse>;
  onForgotPassword: () => void;
  onRegister: () => void;
  onPersonaLogin?: () => void;
}

export function LoginForm({ onLogin, onForgotPassword, onRegister, onPersonaLogin }: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await onLogin(credentials);
      if (!response.success) {
        setErrors(response.errors || {});
      }
    } catch {
      setErrors({ general: ["Error de conexión. Por favor, intenta nuevamente."] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    // Limpiar errores del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  return (    
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
        <p className="text-gray-600">Accede a tu cuenta de Agendafy</p>
      </div>

      {errors.general && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {errors.general[0]}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email o Usuario
          </label>
          <input
            type="text"
            id="email"
            value={credentials.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={credentials.rememberMe}
              onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">Recordarme</span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>

        <div className="text-center">
          <span className="text-sm text-gray-600">¿No tienes cuenta? </span>
          <button
            type="button"
            onClick={onRegister}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            Regístrate aquí
          </button>
        </div>

        {onPersonaLogin && (
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">¿Eres miembro de la junta directiva?</p>
            <button
              type="button"
              onClick={onPersonaLogin}
              className="text-sm text-green-600 hover:text-green-500 font-medium"
            >
              Acceso para miembros
            </button>
          </div>
        )}
      </form>
    </div>
  );
}