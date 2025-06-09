"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { UserProfile } from '@/types';
import { mapAuthUserToProfile, mapProfileToAuthUser } from '@/lib/user-mapper';

// Función para normalizar datos del perfil del API
const normalizeProfileData = (data: any): UserProfile => {
  const normalizeDate = (dateValue: any): Date => {
    if (!dateValue) return new Date();
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string') return new Date(dateValue);
    // Handle MongoDB ObjectDate or other formats
    if (typeof dateValue === 'object' && dateValue.$date) return new Date(dateValue.$date);
    return new Date(dateValue);
  };

  return {
    ...data,
    createdAt: normalizeDate(data.createdAt),
    updatedAt: normalizeDate(data.updatedAt),
  };
};

export function useUserProfile() {
  const { user: authUser, token, isAuthenticated, updateUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el perfil completo del usuario
  const fetchUserProfile = async () => {
    if (!isAuthenticated || !token || !authUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });      if (response.ok) {
        const profileData = await response.json();
        const normalizedProfile = normalizeProfileData(profileData);
        setUserProfile(normalizedProfile);      } else {
        // Si la API falla, usar datos básicos del auth
        const basicProfile = mapAuthUserToProfile(authUser);
        const normalizedBasicProfile = normalizeProfileData(basicProfile);
        setUserProfile(normalizedBasicProfile);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);      // En caso de error, usar datos básicos del auth
      if (authUser) {
        const basicProfile = mapAuthUserToProfile(authUser);
        const normalizedBasicProfile = normalizeProfileData(basicProfile);
        setUserProfile(normalizedBasicProfile);
      }
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };
  // Función para actualizar el perfil
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    try {
      console.log('Hook: updateUserProfile - Datos a enviar:', data);
      
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Hook: updateUserProfile - Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Hook: updateUserProfile - Error response:', errorData);
        throw new Error(`Error al actualizar el perfil: ${response.status} - ${errorData}`);
      }      const updatedProfile = await response.json();
      console.log('Hook: updateUserProfile - Perfil actualizado:', updatedProfile);
      const normalizedUpdatedProfile = normalizeProfileData(updatedProfile);
      setUserProfile(normalizedUpdatedProfile);
      
      // Actualizar también el contexto de autenticación para que el sidebar se actualice
      if (authUser) {
        const updatedAuthUser = mapProfileToAuthUser(normalizedUpdatedProfile, authUser);
        updateUser(updatedAuthUser);
      }
      
      return normalizedUpdatedProfile;
    } catch (err) {
      console.error('Hook: Error updating profile:', err);
      throw err;
    }
  };

  // Cargar el perfil cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && authUser) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, authUser, token]);

  return {
    userProfile,
    loading,
    error,
    updateUserProfile,
    refreshProfile: fetchUserProfile
  };
}
