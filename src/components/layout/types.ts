import { LucideIcon } from "lucide-react";

export interface SidebarMenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
  badge?: string | number;
  isActive?: boolean;
}

export interface SidebarSection {
  title?: string;
  items: SidebarMenuItem[];
}

export interface SidebarConfig {
  title: string;
  logo?: LucideIcon;
  sections: SidebarSection[];
  user?: {
    name: string;
    email?: string;
    avatar?: string;
    initials?: string;
  };
}
