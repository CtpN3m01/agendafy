"use client";

import { AppLayout } from "@/components/layout";
import { MeetingList } from "@/components/reuniones";
import { ProtectedRoute } from "@/components/auth";
import { useUserOrganization } from "@/hooks/use-user-organization";
import { Loader2 } from "lucide-react";

export default function ReunionesPage() {
  const { organization, isLoading, error } = useUserOrganization();

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Cargando organización...</span>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <p className="text-muted-foreground">
                Crea una organización para comenzar a gestionar reuniones.
              </p>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <MeetingList organizacionId={organization?.id} />
      </AppLayout>
    </ProtectedRoute>
  );
}
