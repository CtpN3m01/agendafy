// src/components/layout/role-based-permissions.ts

/**
 * Patrón Visitor para definir permisos y capacidades por rol
 */
export interface PermissionVisitor {
  visitAdmin(): AdminPermissions;
  visitBoardMember(): BoardMemberPermissions;
}

/**
 * Permisos para administradores
 */
export interface AdminPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageOrganization: boolean;
  canViewNotifications: boolean;
  canManageUsers: boolean;
  canAccessSettings: boolean;
}

/**
 * Permisos para miembros de junta
 */
export interface BoardMemberPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageOrganization: boolean;
  canViewNotifications: boolean;
  canManageUsers: boolean;
  canAccessSettings: boolean;
}

/**
 * Visitor concreto que define permisos específicos
 */
export class RolePermissionVisitor implements PermissionVisitor {
  
  /**
   * Permisos para administradores - acceso completo
   */
  visitAdmin(): AdminPermissions {
    return {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canManageOrganization: true,
      canViewNotifications: false, // Los admins NO ven notificaciones automáticas
      canManageUsers: true,
      canAccessSettings: true,
    };
  }

  /**
   * Permisos para miembros de junta - principalmente visualización
   */
  visitBoardMember(): BoardMemberPermissions {
    return {
      canCreate: false, // Pueden crear puntos en reuniones donde participen
      canEdit: false,   // Pueden editar solo su perfil
      canDelete: false,
      canManageOrganization: false, // Solo visualización
      canViewNotifications: true,   // SÍ reciben notificaciones
      canManageUsers: false,
      canAccessSettings: false,
    };
  }
}

/**
 * Context para aplicar permisos según el rol
 */
export class PermissionContext {
  private visitor: PermissionVisitor;

  constructor(visitor: PermissionVisitor) {
    this.visitor = visitor;
  }

  /**
   * Obtiene los permisos según el tipo de usuario
   */
  getPermissions(userType: 'usuario' | 'persona'): AdminPermissions | BoardMemberPermissions {
    switch (userType) {
      case 'usuario':
        return this.visitor.visitAdmin();
      case 'persona':
        return this.visitor.visitBoardMember();
      default:
        return this.visitor.visitAdmin();
    }
  }
}

/**
 * Hook para obtener permisos del usuario actual
 */
export function useUserPermissions() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAuth } = require('@/hooks/use-auth');
  const { user } = useAuth();
  
  const visitor = new RolePermissionVisitor();
  const context = new PermissionContext(visitor);
  
  if (!user?.type) {
    return context.getPermissions('usuario'); // Default admin
  }
  
  return context.getPermissions(user.type);
}

/**
 * Utility function para verificar si el usuario puede realizar una acción
 */
export function canUserPerformAction(
  userType: 'usuario' | 'persona' | undefined,
  action: keyof (AdminPermissions & BoardMemberPermissions)
): boolean {
  if (!userType) return false;
  
  const visitor = new RolePermissionVisitor();
  const context = new PermissionContext(visitor);
  const permissions = context.getPermissions(userType);
  
  return permissions[action];
}
