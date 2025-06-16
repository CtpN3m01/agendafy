"use client";

import { useState } from "react";

export default function TokenDebugPage() {  const [tokenInfo, setTokenInfo] = useState<{
    error?: string;
    header?: unknown;
    payload?: unknown;
    isExpired?: boolean;
    expiresAt?: string;
    currentTime?: string;
    raw?: string;
    details?: unknown;
  } | null>(null);

  const analyzeToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setTokenInfo({ error: 'No token found' });
      return;
    }

    try {
      // Decodificar el token JWT manualmente (solo para debug)
      const parts = token.split('.');
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      setTokenInfo({
        raw: token,
        header,
        payload,
        isExpired: payload.exp < Date.now() / 1000
      });
    } catch (error) {
      setTokenInfo({ error: 'Invalid token format', details: error });
    }
  };

  const testWithDifferentSecrets = async () => {
    const token = localStorage.getItem('authToken');
    
    // Test con diferentes posibles secrets
    const secrets = [
      'agendafy-jwt-secret-key-2025-super-secure',
      'your-secret-key',
      'tu-secreto-super-seguro-aqui'
    ];

    for (const secret of secrets) {
      try {
        const response = await fetch('/api/debug/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, secret })
        });
        const result = await response.json();
        console.log(`Secret "${secret}":`, result);
      } catch (error) {
        console.error(`Error with secret "${secret}":`, error);
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Token Debug</h1>
      
      <div className="space-y-4">
        <button 
          onClick={analyzeToken}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Analizar Token
        </button>

        <button 
          onClick={testWithDifferentSecrets}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-4"
        >
          Test con diferentes secrets
        </button>

        {tokenInfo && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-semibold mb-2">Información del Token</h2>
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(tokenInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
