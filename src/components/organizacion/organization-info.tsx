"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building, Users, Calendar, Settings } from "lucide-react";
import { Organization } from "@/types";

interface OrganizationInfoProps {
  organization?: Organization;
}

export function OrganizationInfo({ organization }: OrganizationInfoProps) {  const defaultOrg: Organization = {
    id: "1",
    name: "Mi Organización",
    description: "Descripción de la organización",
    logo: undefined,
    website: undefined,
    industry: "Tecnología",
    size: "medium",
    members: [
      {
        id: "1",
        user: {
          id: "1",
          name: "Usuario 1",
          email: "user1@example.com",
          preferences: {
            theme: "light",
            language: "es",
            timezone: "America/Mexico_City",
            notifications: {
              email: true,
              push: true,
              sms: false,
              meetingReminders: true,
              weeklyDigest: true
            },
            privacy: {
              profileVisibility: "organization",
              showOnlineStatus: true,
              allowDirectMessages: true
            }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        role: "owner",
        joinedAt: new Date(),
        status: "active"
      }
    ],
    departments: [],
    settings: {
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
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date()
  };

  const org = organization || defaultOrg;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{org.name}</h1>
            <p className="text-muted-foreground">{org.description}</p>
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
            <CardTitle className="text-sm font-medium">Miembros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{org.members.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 nuevos este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reuniones</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Total organizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <Badge variant="secondary">Activa</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Desde</div>
            <p className="text-xs text-muted-foreground">
              {org.createdAt.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración Actual</CardTitle>
          <CardDescription>
            Configuración actual de la organización
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">          <div className="flex items-center justify-between">
            <span className="text-sm">Reuniones de invitados</span>
            <Badge variant={org.settings.allowGuestMeetings ? "default" : "secondary"}>
              {org.settings.allowGuestMeetings ? "Permitidas" : "No permitidas"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Requiere aprobación</span>
            <Badge variant={org.settings.requireApprovalForMeetings ? "default" : "secondary"}>
              {org.settings.requireApprovalForMeetings ? "Sí" : "No"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Duración por defecto</span>
            <Badge variant="outline">
              {org.settings.defaultMeetingDuration} min
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
