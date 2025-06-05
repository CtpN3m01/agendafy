"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, Users, Settings, Clock, Globe } from "lucide-react";
import { Organization, OrganizationSettings } from "@/types";

interface OrganizationSettingsProps {
  organization?: Organization;
  onSave?: (settings: OrganizationSettings) => void;
}

export function OrganizationSettingsComponent({ organization, onSave }: OrganizationSettingsProps) {
  const defaultSettings: OrganizationSettings = {
    allowGuestMeetings: true,
    requireApprovalForMeetings: false,
    defaultMeetingDuration: 60,
    workingHours: {
      monday: { enabled: true, startTime: "09:00", endTime: "17:00", breaks: [] },
      tuesday: { enabled: true, startTime: "09:00", endTime: "17:00", breaks: [] },
      wednesday: { enabled: true, startTime: "09:00", endTime: "17:00", breaks: [] },
      thursday: { enabled: true, startTime: "09:00", endTime: "17:00", breaks: [] },
      friday: { enabled: true, startTime: "09:00", endTime: "17:00", breaks: [] },
      saturday: { enabled: false, startTime: "09:00", endTime: "17:00", breaks: [] },
      sunday: { enabled: false, startTime: "09:00", endTime: "17:00", breaks: [] }
    },
    timeZone: "America/Mexico_City",
    branding: {
      primaryColor: "#000000",
      secondaryColor: "#666666"
    }
  };

  const settings = organization?.settings || defaultSettings;

  const handleSave = () => {
    onSave?.(settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Configuración de Organización</h1>
            <p className="text-muted-foreground">Administra la configuración de tu organización</p>
          </div>
        </div>
        <Button onClick={handleSave}>
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Configuración General
            </CardTitle>
            <CardDescription>
              Configuración básica de la organización
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Nombre de la Organización</Label>
              <Input
                id="orgName"
                defaultValue={organization?.name || "Mi Organización"}
                placeholder="Nombre de la organización"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgDescription">Descripción</Label>
              <Input
                id="orgDescription"
                defaultValue={organization?.description || ""}
                placeholder="Descripción de la organización"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeZone">Zona Horaria</Label>
              <Input
                id="timeZone"
                defaultValue={settings.timeZone}
                placeholder="America/Mexico_City"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Reuniones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Reuniones
            </CardTitle>
            <CardDescription>
              Configuración de reuniones y permisos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="allowGuests" 
                defaultChecked={settings.allowGuestMeetings}
              />
              <Label htmlFor="allowGuests">Permitir invitados externos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="requireApproval" 
                defaultChecked={settings.requireApprovalForMeetings}
              />
              <Label htmlFor="requireApproval">Requiere aprobación para reuniones</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultDuration">Duración por defecto (minutos)</Label>
              <Input
                id="defaultDuration"
                type="number"
                defaultValue={settings.defaultMeetingDuration}
                placeholder="60"
              />
            </div>
          </CardContent>
        </Card>

        {/* Horarios de Trabajo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios de Trabajo
            </CardTitle>
            <CardDescription>
              Define los horarios laborales de la organización
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(settings.workingHours).map(([day, schedule]) => (
              <div key={day} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox defaultChecked={schedule.enabled} />
                  <span className="capitalize text-sm font-medium">{day}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    className="w-20 h-8"
                    defaultValue={schedule.startTime}
                    disabled={!schedule.enabled}
                  />
                  <span className="text-sm text-muted-foreground">-</span>
                  <Input
                    className="w-20 h-8"
                    defaultValue={schedule.endTime}
                    disabled={!schedule.enabled}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Configuración de Marca */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Marca y Apariencia
            </CardTitle>
            <CardDescription>
              Personaliza la apariencia de tu organización
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Color Primario</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  defaultValue={settings.branding.primaryColor}
                  className="w-16 h-10"
                />
                <Input
                  defaultValue={settings.branding.primaryColor}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Color Secundario</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  defaultValue={settings.branding.secondaryColor}
                  className="w-16 h-10"
                />
                <Input
                  defaultValue={settings.branding.secondaryColor}
                  placeholder="#666666"
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado Actual</CardTitle>
          <CardDescription>
            Resumen de la configuración actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{organization?.members.length || 1}</div>
              <div className="text-sm text-muted-foreground">Miembros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{organization?.departments.length || 0}</div>
              <div className="text-sm text-muted-foreground">Departamentos</div>
            </div>
            <div className="text-center">
              <Badge variant={settings.allowGuestMeetings ? "default" : "secondary"}>
                {settings.allowGuestMeetings ? "Invitados OK" : "Solo miembros"}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Política de reuniones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{settings.defaultMeetingDuration}m</div>
              <div className="text-sm text-muted-foreground">Duración por defecto</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
