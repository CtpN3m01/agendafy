
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/reuniones'); // Redirigir al dashboard
      } else {
        router.push('/auth/login'); // Redirigir al login
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenidos a Agendafy
          </h1>
          <p className="text-muted-foreground">
            Sistema de gestión de agendas y citas
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold">Citas de Hoy</h3>
            <p className="text-2xl font-bold text-primary">5</p>
            <p className="text-sm text-muted-foreground">2 pendientes</p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold">Esta Semana</h3>
            <p className="text-2xl font-bold text-primary">23</p>
            <p className="text-sm text-muted-foreground">8 completadas</p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold">Contactos</h3>
            <p className="text-2xl font-bold text-primary">127</p>
            <p className="text-sm text-muted-foreground">5 nuevos</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
