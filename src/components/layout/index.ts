export { AppLayout } from "./app-layout";
export { AuthLayout } from "./auth-layout";
export { defaultSidebarConfig } from "./sidebar-config";
export { createSidebarConfig, SidebarConfigVisitor, SidebarContext } from "./sidebar-visitor";
export { 
  RolePermissionVisitor, 
  PermissionContext, 
  canUserPerformAction 
} from "./role-based-permissions";
export type { SidebarConfig, SidebarMenuItem, SidebarSection } from "./types";
export type { 
  SidebarVisitor 
} from "./sidebar-visitor";
export type { 
  PermissionVisitor,
  AdminPermissions,
  BoardMemberPermissions
} from "./role-based-permissions";
