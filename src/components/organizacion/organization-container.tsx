// src/components/organizacion/organization-container.tsx
"use client";

import { useOrganization } from "@/hooks/use-organization";
import { OrganizationInfo } from "./organization-info";
import { OrganizationForm } from "../auth/organization-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Loader2 } from "lucide-react";

export function OrganizationContainer() {
  const { organization, isLoading, error, refetch } = useOrganization();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando organización...</span>
        </div>
      </div>
    );
  }



  // Si no hay organización, mostrar formulario de creación
  if (!organization) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">¡Bienvenido a Agendafy!</h1>
          <p className="text-muted-foreground mb-6">
            Para comenzar a gestionar reuniones, necesitas crear tu organización.
          </p>
        </div>
        <OrganizationForm 
          onComplete={() => refetch()} 
          showSkipButton={false}
        />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <Building2 className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-xl text-red-600">Error al cargar organización</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => refetch()}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
        </CardContent>
      </Card>
    );
  }
  // Si hay organización, mostrar la información
  return <OrganizationInfo organization={organization} onUpdate={refetch} />;
}
