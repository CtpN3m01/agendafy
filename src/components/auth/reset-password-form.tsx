"use client";

import { useState } from "react";
import { ResetPasswordData, AuthResponse } from "@/types";

interface ResetPasswordFormProps {
  onResetPassword: (data: ResetPasswordData) => Promise<AuthResponse>;
  onBackToLogin: () => void;
}

export function ResetPasswordForm({ onResetPassword, onBackToLogin }: ResetPasswordFormProps) {
  const [formData, setFormData] = useState<ResetPasswordData>({
    token: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await onResetPassword(formData);
      
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });

      if (result.success) {
        setFormData({
          token: '',
          nuevaContrasena: '',
          confirmarContrasena: ''
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error de conexión'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Restablecer Contraseña</h2>
      
      {message && (
        <div className={`p-4 rounded mb-4 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nuevaContrasena" className="block text-sm font-medium text-gray-700">
            Nueva Contraseña
          </label>
          <input
            type="password"
            id="nuevaContrasena"
            name="nuevaContrasena"
            value={formData.nuevaContrasena}
            onChange={handleChange}
            required
            minLength={8}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="confirmarContrasena" className="block text-sm font-medium text-gray-700">
            Confirmar Contraseña
          </label>
          <input
            type="password"
            id="confirmarContrasena"
            name="confirmarContrasena"
            value={formData.confirmarContrasena}
            onChange={handleChange}
            required
            minLength={8}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
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