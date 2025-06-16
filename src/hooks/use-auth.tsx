// src/hooks/use-auth.ts
"use client";

import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useMounted } from './use-mounted';

interface User {
  id: string;
  nombreUsuario: string;
  nombre: string;
  apellidos: string;
  correo: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useMounted();  const router = useRouter();
  const isAuthenticated = !!token && !!user;

  const logout = useCallback(() => {
    if (!isMounted) return;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Eliminar cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    
    setToken(null);
    setUser(null);
    router.push('/auth/login');
  }, [isMounted, router]);

  const checkAuth = useCallback((): boolean => {
    if (!isMounted) return false;
    
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        // Verificar si el token no ha expirado
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (tokenPayload.exp > currentTime) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsLoading(false);
          return true;
        } else {
          // Token expirado
          logout();
          return false;
        }
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {      console.error('Error checking auth:', error);
      logout();
      setIsLoading(false);
      return false;
    }
  }, [isMounted, logout]);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    if (isMounted) {
      checkAuth();
    }
  }, [isMounted, checkAuth]);

  const login = (newToken: string, newUser: User) => {
    if (!isMounted) return;
    
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // También establecer como cookie para el middleware
    document.cookie = `authToken=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 días
      setToken(newToken);
    setUser(newUser);
  };

  const updateUser = (userData: Partial<User>) => {
    if (!isMounted || !user) return;
    
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };
  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook para proteger rutas en el cliente
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}
