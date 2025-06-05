"use client";

import { useState } from "react";
import { Settings, Bell, Shield, Palette, Globe, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { UserPreferences } from "@/types";

interface ProfilePreferencesProps {
  preferences: UserPreferences;
  onUpdate: (preferences: Partial<UserPreferences>) => Promise<void>;
}

export function ProfilePreferences({ preferences, onUpdate }: ProfilePreferencesProps) {
  const [formData, setFormData] = useState(preferences);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onUpdate(formData);
    } catch (error) {
      console.error("Error updating preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotifications = (key: keyof typeof formData.notifications, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const updatePrivacy = (key: keyof typeof formData.privacy, value: any) => {
    setFormData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Tema y Apariencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tema y Apariencia
          </CardTitle>
          <CardDescription>
            Personaliza la apariencia de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Tema</Label>
            <RadioGroup
              value={formData.theme}
              onValueChange={(value: "light" | "dark" | "system") => 
                setFormData(prev => ({ ...prev, theme: value }))
              }
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Claro</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Oscuro</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system">Sistema</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Idioma y Región */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Idioma y Región
          </CardTitle>
          <CardDescription>
            Configura tu idioma y zona horaria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="language" className="text-base font-medium">Idioma</Label>
            <RadioGroup
              value={formData.language}
              onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="es" id="es" />
                <Label htmlFor="es">Español</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en">English</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="timezone" className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Zona Horaria
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Actual: {formData.timezone}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Configura qué notificaciones quieres recibir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="text-sm font-medium">
                  Notificaciones por email
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recibe actualizaciones importantes por correo
                </p>
              </div>
              <Checkbox
                id="email-notifications"
                checked={formData.notifications.email}
                onCheckedChange={(checked) => updateNotifications("email", !!checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications" className="text-sm font-medium">
                  Notificaciones push
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recibe notificaciones en tiempo real
                </p>
              </div>
              <Checkbox
                id="push-notifications"
                checked={formData.notifications.push}
                onCheckedChange={(checked) => updateNotifications("push", !!checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="meeting-reminders" className="text-sm font-medium">
                  Recordatorios de reuniones
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recibe recordatorios antes de las reuniones
                </p>
              </div>
              <Checkbox
                id="meeting-reminders"
                checked={formData.notifications.meetingReminders}
                onCheckedChange={(checked) => updateNotifications("meetingReminders", !!checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-digest" className="text-sm font-medium">
                  Resumen semanal
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recibe un resumen de tus actividades semanales
                </p>
              </div>
              <Checkbox
                id="weekly-digest"
                checked={formData.notifications.weeklyDigest}
                onCheckedChange={(checked) => updateNotifications("weeklyDigest", !!checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacidad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacidad
          </CardTitle>
          <CardDescription>
            Controla quién puede ver tu información
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Visibilidad del perfil</Label>
            <RadioGroup
              value={formData.privacy.profileVisibility}
              onValueChange={(value: "public" | "private" | "organization") => 
                updatePrivacy("profileVisibility", value)
              }
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public">Público</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="organization" id="organization" />
                <Label htmlFor="organization">Solo organización</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private">Privado</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-online" className="text-sm font-medium">
                Mostrar estado en línea
              </Label>
              <Checkbox
                id="show-online"
                checked={formData.privacy.showOnlineStatus}
                onCheckedChange={(checked) => updatePrivacy("showOnlineStatus", !!checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="allow-messages" className="text-sm font-medium">
                Permitir mensajes directos
              </Label>
              <Checkbox
                id="allow-messages"
                checked={formData.privacy.allowDirectMessages}
                onCheckedChange={(checked) => updatePrivacy("allowDirectMessages", !!checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Settings className="h-4 w-4 mr-2" />
          {isLoading ? "Guardando..." : "Guardar Preferencias"}
        </Button>
      </div>
    </div>
  );
}
