"use client";

import { AppLayout } from "@/components/layout";
import { ProfileInfo } from "@/components/perfil";
import { ProtectedRoute } from "@/components/auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function PerfilPage() {
  const { userProfile, loading, error, updateUserProfile } = useUserProfile();
  const { user: authUser, token, isAuthenticated } = useAuth();
  
  const handleUpdate = async (data: Partial<NonNullable<typeof userProfile>>) => {
    try {
      console.log('Perfil Page - Estado de auth:', { 
        isAuthenticated, 
        hasToken: !!token, 
        hasAuthUser: !!authUser,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
      });
      
      await updateUserProfile(data);
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error("Error al actualizar el perfil");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            <p className="ml-4">Cargando perfil...</p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (error || !userProfile) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center text-red-600 p-8">
            <p className="text-lg font-medium">Error al cargar el perfil</p>
            <p className="text-sm mt-2">{error || "No se pudo obtener la información del usuario"}</p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <ProfileInfo user={userProfile} onUpdate={handleUpdate} />
      </AppLayout>
    </ProtectedRoute>
  );
}
