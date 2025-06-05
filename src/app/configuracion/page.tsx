"use client";

import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Monitor,
  Moon,
  Sun
} from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Configuración</h1>
              <p className="text-muted-foreground">Administra las configuraciones de tu cuenta</p>
            </div>
          </div>
          <Button>
            Guardar Cambios
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuración General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General
              </CardTitle>
              <CardDescription>
                Configuración general de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <select 
                  id="language" 
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  defaultValue="es"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Horaria</Label>
                <select 
                  id="timezone" 
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  defaultValue="America/Mexico_City"
                >
                  <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                  <option value="America/New_York">Nueva York (GMT-5)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Apariencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Apariencia
              </CardTitle>
              <CardDescription>
                Personaliza la apariencia de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Tema</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Sun className="h-4 w-4 mr-2" />
                      Claro
                    </Button>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Moon className="h-4 w-4 mr-2" />
                      Oscuro
                    </Button>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="default" size="sm" className="w-full">
                      <Monitor className="h-4 w-4 mr-2" />
                      Sistema
                    </Button>
                  </div>
                </div>
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
                Configura qué notificaciones recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recordatorios de reuniones</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones antes de las reuniones
                    </p>
                  </div>
                  <Checkbox defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email semanal</Label>
                    <p className="text-sm text-muted-foreground">
                      Resumen semanal de actividades
                    </p>
                  </div>
                  <Checkbox defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones push</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones en tiempo real
                    </p>
                  </div>
                  <Checkbox />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacidad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacidad y Seguridad
              </CardTitle>
              <CardDescription>
                Configura tu privacidad y seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Perfil público</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que otros vean tu perfil
                    </p>
                  </div>
                  <Checkbox defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Estado en línea</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar cuando estás en línea
                    </p>
                  </div>
                  <Checkbox defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mensajes directos</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir mensajes directos de otros usuarios
                    </p>
                  </div>
                  <Checkbox defaultChecked />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button variant="destructive" size="sm">
                  Eliminar Cuenta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estado del Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Estado del Sistema
            </CardTitle>
            <CardDescription>
              Información sobre el estado actual del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Badge variant="default" className="mb-2">Activo</Badge>
                <div className="text-sm text-muted-foreground">Estado del servidor</div>
              </div>
              <div className="text-center">
                <Badge variant="default" className="mb-2">99.9%</Badge>
                <div className="text-sm text-muted-foreground">Tiempo de actividad</div>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="mb-2">v1.0.0</Badge>
                <div className="text-sm text-muted-foreground">Versión</div>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-2">12ms</Badge>
                <div className="text-sm text-muted-foreground">Latencia</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
