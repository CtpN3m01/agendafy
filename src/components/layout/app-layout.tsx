"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useNotificaciones } from "@/hooks/use-notificaciones";
import { useNotificacionCount } from "@/hooks/use-notificacion-count";
import { NotificacionBell } from "@/components/notificacion";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarConfig } from "./types";
import { defaultSidebarConfig } from "./sidebar-config";
import { NotificacionResponseDTO } from "@/types/NotificacionDTO";
import { toast } from "sonner";

interface AppLayoutProps {
  children: React.ReactNode;
  sidebarConfig?: SidebarConfig;
  onLogout?: () => void;
}

function AppSidebar({ config, onLogout }: { config: SidebarConfig; onLogout?: () => void }) {
  const { user, isLoading } = useAuth();
  const { conteoNoLeidas } = useNotificacionCount();
  const LogoIcon = config.logo;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          {LogoIcon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LogoIcon className="h-4 w-4" />
            </div>
          )}
          <span className="text-lg font-semibold">{config.title}</span>
        </div>
      </SidebarHeader>      
      <SidebarContent className="overflow-hidden">
        {config.sections.map((section, index) => (
          <React.Fragment key={index}>
            {index > 0 && <SidebarSeparator />}
            <SidebarGroup>
              {section.title && (
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={item.isActive}>
                        <a href={item.href} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </div>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                          {item.href === "/notificaciones" && conteoNoLeidas > 0 && (
                            <Badge variant="destructive" className="ml-auto">
                              {conteoNoLeidas}
                            </Badge>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </React.Fragment>
        ))}
      </SidebarContent>      <SidebarFooter>
        <SidebarMenu>
          {!isLoading && user && (
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {`${user.nombre?.charAt(0) || ''}${user.apellidos?.charAt(0) || ''}`.toUpperCase() ||
                     user.nombreUsuario?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left text-sm">
                  <div className="font-medium">
                    {`${user.nombre} ${user.apellidos}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.correo}
                  </div>
                </div>
              </div>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button onClick={onLogout} className="w-full">
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppLayout({ children, sidebarConfig, onLogout }: AppLayoutProps) {
  const config = sidebarConfig || defaultSidebarConfig;
  const { logout, user } = useAuth();
  const router = useRouter();

  const {
    notificaciones,
    conteoNoLeidas,
    isLoading: notificacionesLoading,
    marcarComoLeida,
    eliminarNotificacion,
  } = useNotificaciones(user?.correo);

  const handleLogout = () => {
    console.log("Cerrando sesión...");
    onLogout?.();
    logout();
  };

  const handleMarcarLeida = async (id: string): Promise<boolean> => {
    try {
      const resultado = await marcarComoLeida(id);
      if (resultado) {
        toast.success("Notificación marcada como leída");
      }
      return resultado;
    } catch {
      toast.error("Error al marcar como leída");
      return false;
    }
  };

  const handleEliminar = async (id: string): Promise<boolean> => {
    try {
      const resultado = await eliminarNotificacion(id);
      if (resultado) {
        toast.success("Notificación eliminada");
      }
      return resultado;
    } catch {
      toast.error("Error al eliminar notificación");
      return false;
    }
  };

  const handleVerTodas = () => {
    router.push('/notificaciones');
  };

  const handleNotificacionClick = (notificacion: NotificacionResponseDTO) => {
    // Marcar como leída si no lo está
    if (!notificacion.leida) {
      handleMarcarLeida(notificacion.id);
    }

    // Redireccionar según el tipo de notificación
    switch (notificacion.tipo) {
      case 'CONVOCATORIA':
        if (notificacion.datosAdicionales?.reunionId) {
          router.push(`/reuniones/${notificacion.datosAdicionales.reunionId}`);
        } else {
          router.push('/reuniones');
        }
        break;
      case 'ASIGNACION':
        if (notificacion.datosAdicionales?.reunionId) {
          router.push(`/reuniones/${notificacion.datosAdicionales.reunionId}`);
        } else {
          router.push('/reuniones');
        }
        break;
      default:
        router.push('/notificaciones');
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar config={config} onLogout={handleLogout} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold">Panel de Control</h1>
          </div>
          
          {/* Campana de notificaciones */}
          <div className="flex items-center gap-3">
            {user && (
              <NotificacionBell
                notificaciones={notificaciones}
                conteoNoLeidas={conteoNoLeidas}
                isLoading={notificacionesLoading}
                onMarcarLeida={handleMarcarLeida}
                onEliminar={handleEliminar}
                onVerTodas={handleVerTodas}
                onNotificacionClick={handleNotificacionClick}
              />
            )}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
