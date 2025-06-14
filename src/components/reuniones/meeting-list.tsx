"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Plus,
  Search,
  Loader2
} from "lucide-react";
import { useMeetings } from "@/hooks/use-meetings";
import { CreateMeetingDialog } from "./create-meeting-dialog";
import { useRouter } from "next/navigation";

interface MeetingListProps {
  onCreateMeeting?: () => void;
  onJoinMeeting?: (meetingId: string) => void;
  organizacionId?: string;
}

export function MeetingList({ onCreateMeeting, onJoinMeeting, organizacionId }: MeetingListProps) {
  const { meetings, isLoading, error, refetch } = useMeetings(organizacionId);  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const router = useRouter();

  const filteredMeetings = meetings.filter(meeting =>
    meeting.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (meeting.agenda && meeting.agenda.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "programada":
        return "default";
      case "en_curso":
        return "destructive";
      case "finalizada":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case "programada":
        return "Programada";
      case "en_curso":
        return "En Curso";
      case "finalizada":
        return "Finalizada";
      default:
        return estado;
    }
  };
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const handleCreateMeeting = () => {
    setShowCreateDialog(true);
    onCreateMeeting?.();
  };

  const handleMeetingClick = (meetingId: string) => {
    router.push(`/reuniones/${meetingId}`);
    onJoinMeeting?.(meetingId);
  };

  const handleMeetingCreated = (meeting: any) => {
    refetch();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch}>Intentar de nuevo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reuniones</h1>
          <p className="text-muted-foreground">
            Gestiona y organiza todas tus reuniones
          </p>
        </div>
        <Button onClick={handleCreateMeeting} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reunión
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar reuniones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}      {/* Empty State */}
      {!isLoading && filteredMeetings.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay reuniones aún</h3>
          <p className="text-muted-foreground mb-6">
            Crea tu primera reunión para comenzar a organizar tu tiempo
          </p>
          <Button onClick={handleCreateMeeting}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Primera Reunión
          </Button>
        </div>
      )}

      {/* No Search Results */}
      {!isLoading && filteredMeetings.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron reuniones</h3>
          <p className="text-muted-foreground">
            No hay reuniones que coincidan con &quot;{searchTerm}&quot;
          </p>
        </div>
      )}

      {/* Meetings List */}
      {!isLoading && filteredMeetings.length > 0 && (
        <ScrollArea className="h-[600px]">
          <div className="grid gap-4">
            {filteredMeetings.map((meeting) => (
              <Card 
                key={meeting._id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleMeetingClick(meeting._id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{meeting.titulo}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {meeting.agenda || "Sin agenda específica"}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor("programada")}>
                      {getStatusText("programada")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(meeting.hora_inicio)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(meeting.hora_inicio)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{meeting.convocados?.length || 0} participantes</span>
                    </div>
                    {meeting.lugar && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{meeting.lugar}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}      {/* Create Meeting Dialog */}
      <CreateMeetingDialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          // Refrescar la lista cuando se cierra el diálogo
          if (!open) {
            refetch();
          }
        }}
        organizacionId={organizacionId || ""} 
      />
    </div>
  );
}
