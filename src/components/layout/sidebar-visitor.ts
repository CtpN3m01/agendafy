// src/components/layout/sidebar-visitor.ts
import { SidebarConfig } from "./types";

/**
 * Patrón Visitor para generar configuraciones de sidebar específicas por rol
 */
export interface SidebarVisitor {
  visitAdmin(): SidebarConfig;
  visitBoardMember(): SidebarConfig;
}

/**
 * Visitor concreto que genera configuraciones de sidebar
 */
export class SidebarConfigVisitor implements SidebarVisitor {
  
  /**
   * Configuración para administradores (usuarios tipo 'usuario')
   * - Acceso completo a todas las funcionalidades
   * - Puede crear, editar y eliminar
   * - NO recibe notificaciones automáticas
   */
  visitAdmin(): SidebarConfig {
    const { 
      Calendar, 
      UserCircle, 
      Building, 
      Video,
      FileText,
      Settings
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    } = require("lucide-react");

    return {
      title: "Agendafy - Admin",
      logo: Calendar,
      sections: [
        {
          title: "Principal",
          items: [
            {
              title: "Reuniones",
              icon: Video,
              href: "/reuniones",
            },
            {
              title: "Agendas",
              icon: FileText,
              href: "/agendas",
            },
            {
              title: "Organización",
              icon: Building,
              href: "/organizacion",
            },
            {
              title: "Perfil",
              icon: UserCircle,
              href: "/perfil",
            },
          ],
        },
        {
          title: "Administración",
          items: [
            {
              title: "Configuración",
              icon: Settings,
              href: "/configuracion",
            },
          ],
        },
      ],
    };
  }

  /**
   * Configuración para miembros de junta (usuarios tipo 'miembro')
   * - Acceso principalmente de visualización
   * - Pueden participar en reuniones
   * - Reciben notificaciones automáticas
   */
  visitBoardMember(): SidebarConfig {
    const { 
      Calendar, 
      UserCircle, 
      Building, 
      Video,
      FileText,
      BellDotIcon
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    } = require("lucide-react");

    return {
      title: "Agendafy - Miembro",
      logo: Calendar,
      sections: [
        {
          title: "Principal",
          items: [
            {
              title: "Reuniones",
              icon: Video,
              href: "/reuniones",
            },
            {
              title: "Agendas",
              icon: FileText,
              href: "/agendas",
            },
            {
              title: "Organización",
              icon: Building,
              href: "/organizacion",
            },
            {
              title: "Perfil",
              icon: UserCircle,
              href: "/perfil",
            },
          ],
        },
        {
          title: "Buzón",
          items: [
            {
              title: "Notificaciones",
              icon: BellDotIcon,
              href: "/notificaciones",
            },
          ],
        },
      ],
    };
  }
}

/**
 * Context para aplicar el visitor según el tipo de usuario
 */
export class SidebarContext {
  private visitor: SidebarVisitor;

  constructor(visitor: SidebarVisitor) {
    this.visitor = visitor;
  }

  /**
   * Genera la configuración del sidebar según el tipo de usuario
   */
  generateConfig(userType: 'usuario' | 'miembro'): SidebarConfig {
    switch (userType) {
      case 'usuario':
        return this.visitor.visitAdmin();
      case 'miembro':
        return this.visitor.visitBoardMember();
      default:
        // Configuración por defecto (usuario administrador)
        return this.visitor.visitAdmin();
    }
  }
}

/**
 * Factory para crear la configuración del sidebar
 */
export function createSidebarConfig(userType?: 'usuario' | 'miembro'): SidebarConfig {
  // Crear instancias una sola vez para evitar re-renders
  const visitor = new SidebarConfigVisitor();
  const context = new SidebarContext(visitor);
  
  return context.generateConfig(userType || 'usuario');
}
