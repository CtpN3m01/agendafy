import { 
  Calendar, 
  UserCircle, 
  Building, 
  Video
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
    // {
    //   title: "Sistema",
    //   items: [
    //     {
    //       title: "Configuración",
    //       icon: Settings,
    //       href: "/configuracion",
    //     },
    //     {
    //       title: "Notificaciones",
    //       icon: Bell,
    //       href: "/notificaciones",
    //       badge: "3",
    //     },
    //   ],
    // },
  ],
};
