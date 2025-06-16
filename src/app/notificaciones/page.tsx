"use client";

import { AppLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Calendar, 
  Users, 
  Settings,
  Check,
  X,
  Clock,
  AlertCircle
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "meeting" | "system" | "invitation" | "reminder";
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export default function NotificacionesPage() {
  // Datos de ejemplo
  const notifications: Notification[] = [
    {
      id: "1",
      title: "Reunión en 15 minutos",
      message: "La reunión 'Daily Standup' comenzará en 15 minutos",
      type: "reminder",
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      actionUrl: "/reuniones/1"
    },
    {
      id: "2",
      title: "Nueva invitación",
      message: "Ana García te ha invitado a la reunión 'Revisión de Proyecto'",
      type: "invitation",
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      actionUrl: "/reuniones/2"
    },
    {
      id: "3",
      title: "Reunión completada",
      message: "La grabación de 'Team Meeting' está disponible",
      type: "meeting",
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      actionUrl: "/reuniones/3"
    },
    {
      id: "4",
      title: "Actualización del sistema",
      message: "Nueva versión disponible con mejoras de rendimiento",
      type: "system",
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ];

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "meeting":
        return Calendar;
      case "invitation":
        return Users;
      case "reminder":
        return Clock;
      case "system":
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "meeting":
        return "default";
      case "invitation":
        return "secondary";
      case "reminder":
        return "destructive";
      case "system":
        return "outline";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type: Notification["type"]) => {
    switch (type) {
      case "meeting":
        return "Reunión";
      case "invitation":
        return "Invitación";
      case "reminder":
        return "Recordatorio";
      case "system":
        return "Sistema";
      default:
        return "Notificación";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  return (
    <ProtectedRoute>
      <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Notificaciones</h1>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Mantente al día con todas tus notificaciones
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Marcar todas como leídas
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Sin leer</span>
              </div>
              <div className="text-2xl font-bold mt-2">{unreadCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Recordatorios</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {notifications.filter(n => n.type === "reminder").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Invitaciones</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {notifications.filter(n => n.type === "invitation").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Reuniones</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {notifications.filter(n => n.type === "meeting").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de notificaciones */}
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = getTypeIcon(notification.type);
            return (
              <Card key={notification.id} className={`transition-all hover:shadow-md ${
                !notification.isRead ? "border-l-4 border-l-primary bg-primary/5" : ""
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        !notification.isRead ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${
                            !notification.isRead ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {notification.title}
                          </h3>
                          <Badge variant={getTypeColor(notification.type)} className="text-xs">
                            {getTypeLabel(notification.type)}
                          </Badge>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatTime(notification.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.actionUrl && (
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {notifications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tienes notificaciones</h3>
              <p className="text-muted-foreground mb-4">
                Cuando tengas nuevas notificaciones, aparecerán aquí
              </p>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurar Notificaciones
              </Button>            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
    </ProtectedRoute>
  );
}
