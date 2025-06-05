"use client";

import { AppLayout } from "@/components/layout";
import { ProfileInfo } from "@/components/perfil";

import { UserProfile } from "@/types";

export default function PerfilPage() {
  // Usuario por defecto (en una app real vendría del contexto/API)
  const defaultUser: UserProfile = {
    id: "1",
    name: "Saymon",
    email: "CtpN3m0@example.com",
    phone: "+52 555 123 4567",
    position: "Desarrollador Senior",
    department: "Tecnología",
    bio: "Desarrollador full-stack con experiencia en React, Node.js y bases de datos.",
    preferences: {
      theme: "light",
      language: "es",
      timezone: "America/Mexico_City",
      notifications: {
        email: true,
        push: true,
        sms: false,
        meetingReminders: true,
        weeklyDigest: true
      },
      privacy: {
        profileVisibility: "organization",
        showOnlineStatus: true,
        allowDirectMessages: true
      }
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date()
  };

  const handleUpdate = async (data: Partial<UserProfile>) => {
    console.log("Actualizar perfil:", data);
  };

  return (
    <AppLayout>
      <ProfileInfo user={defaultUser} onUpdate={handleUpdate} />
    </AppLayout>
  );
}
