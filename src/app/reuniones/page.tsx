"use client";

import { AppLayout } from "@/components/layout";
import { MeetingList } from "@/components/reuniones";
import { ProtectedRoute } from "@/components/auth";

export default function ReunionesPage() {
  const handleCreateMeeting = () => {
    console.log("Crear nueva reunión");
    // Aquí puedes redirigir a la página de creación o abrir un modal
  };

  const handleJoinMeeting = (meetingId: string) => {
    console.log("Unirse a reunión:", meetingId);
    // Aquí puedes redirigir a la sala de reunión
  };
  return (
    <ProtectedRoute>
      <AppLayout>
        <MeetingList 
          onCreateMeeting={handleCreateMeeting}
          onJoinMeeting={handleJoinMeeting}
        />
      </AppLayout>
    </ProtectedRoute>
  );
}
