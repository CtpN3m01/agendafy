import { 
  Calendar, 
  UserCircle, 
  Building, 
  Video,
  FileText
} from "lucide-react";
import { SidebarConfig } from "./types";

export const defaultSidebarConfig: SidebarConfig = {
  title: "Agendafy",
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
  ],
};
