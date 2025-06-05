"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
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

interface AppLayoutProps {
  children: React.ReactNode;
  sidebarConfig?: SidebarConfig;
  onLogout?: () => void;
}

function AppSidebar({ config, onLogout }: { config: SidebarConfig; onLogout?: () => void }) {
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
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </React.Fragment>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {config.user && (
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {config.user.initials || config.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left text-sm">
                  <div className="font-medium">{config.user.name}</div>
                  {config.user.email && (
                    <div className="text-xs text-muted-foreground">
                      {config.user.email}
                    </div>
                  )}
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

  const handleLogout = () => {
    console.log("Cerrando sesión...");
    onLogout?.();
  };

  return (
    <SidebarProvider>
      <AppSidebar config={config} onLogout={handleLogout} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">Panel de Control</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
