"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Users, Calendar, Settings, Mail, Phone, MapPin } from "lucide-react";
import { OrganizationLogo } from "./organization-logo";

interface OrganizationData {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrganizationInfoProps {
  organization: OrganizationData;
}

export function OrganizationInfo({ organization }: OrganizationInfoProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">        <div className="flex items-center gap-4">
          <OrganizationLogo 
            logoUrl={organization.logo}
            organizationName={organization.nombre}
            size="md"
          />
          <div>
            <h1 className="text-2xl font-bold">{organization.nombre}</h1>
            <p className="text-muted-foreground">Organización activa</p>
          </div>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configurar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <Badge variant="default">Activa</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Creada el</div>
            <p className="text-xs text-muted-foreground">
              {new Date(organization.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reuniones</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Total organizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Tú como administrador
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
            <CardDescription>
              Datos de contacto de la organización
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Correo</p>
                <p className="text-xs text-muted-foreground">{organization.correo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Teléfono</p>
                <p className="text-xs text-muted-foreground">{organization.telefono}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Dirección</p>
                <p className="text-xs text-muted-foreground">{organization.direccion}</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
