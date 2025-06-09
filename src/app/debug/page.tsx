"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

export default function DebugPage() {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<{
    token: string | null;
    user: string | null;
  }>({ token: null, user: null });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalStorageData({
        token: localStorage.getItem('authToken'),
        user: localStorage.getItem('user')
      });
    }
  }, []);

  const testAPI = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Test API Response:', response.status, await response.text());
    } catch (error) {
      console.error('Test API Error:', error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug - Estado de Autenticación</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Hook useAuth()</h2>
          <pre className="text-sm">
            {JSON.stringify({
              isAuthenticated,
              isLoading,
              hasUser: !!user,
              hasToken: !!token,
              tokenPreview: token ? token.substring(0, 30) + '...' : 'null',
              user: user ? {
                id: user.id,
                nombreUsuario: user.nombreUsuario,
                correo: user.correo
              } : null
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">localStorage</h2>
          <pre className="text-sm">
            {JSON.stringify({
              hasToken: !!localStorageData.token,
              tokenPreview: localStorageData.token ? localStorageData.token.substring(0, 30) + '...' : 'null',
              hasUser: !!localStorageData.user,
              user: localStorageData.user ? JSON.parse(localStorageData.user) : null
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Test API</h2>
          <button 
            onClick={testAPI}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test /api/user/profile
          </button>
          <p className="text-sm mt-2 text-gray-600">
            Revisa la consola para ver la respuesta
          </p>
        </div>
      </div>
    </div>
  );
}
