// src/hooks/use-user-permissions.ts
"use client";

import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  RolePermissionVisitor, 
  PermissionContext,
  AdminPermissions,
  BoardMemberPermissions
} from '@/components/layout/role-based-permissions';

/**
 * Hook para obtener permisos del usuario actual basado en el patrón Visitor
 */
export function useUserPermissions(): AdminPermissions | BoardMemberPermissions {
  const { user } = useAuth();
  
  return useMemo(() => {
    const visitor = new RolePermissionVisitor();
    const context = new PermissionContext(visitor);
    
    if (!user?.type) {
      return context.getPermissions('usuario'); // Default admin
    }
    
    return context.getPermissions(user.type);
  }, [user?.type]);
}

/**
 * Hook para verificar si el usuario puede realizar una acción específica
 */
export function useCanPerformAction() {
  const permissions = useUserPermissions();

  return useMemo(() => {
    return (action: keyof (AdminPermissions & BoardMemberPermissions)): boolean => {
      return permissions[action];
    };
  }, [permissions]);
}

/**
 * Hook para obtener el rol descriptivo del usuario
 */
export function useUserRole(): { role: 'admin' | 'board-member' | 'unknown', displayName: string } {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user?.type) {
      return { role: 'unknown', displayName: 'Usuario' };
    }
    
    switch (user.type) {
      case 'usuario':
        return { role: 'admin', displayName: 'Administrador' };
      case 'miembro':
        return { role: 'board-member', displayName: `Miembro de Junta${user.rol ? ` - ${user.rol}` : ''}` };
      default:
        return { role: 'unknown', displayName: 'Usuario' };
    }
  }, [user?.type, user?.rol]);
}
