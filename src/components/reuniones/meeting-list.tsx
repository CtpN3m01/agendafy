"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Plus,
  Search,
  Loader2,
  RefreshCw,
  AlertCircle,
  Edit,
  MoreVertical,
  Trash2
} from "lucide-react";
import { useMeetings } from "@/hooks/use-meetings";
import { CreateMeetingDialog } from "./create-meeting-dialog";
import { EditMeetingDialog } from "./edit-meeting-dialog";
import { DeleteMeetingDialog } from "./delete-meeting-dialog";
import { MeetingDetailsDialog } from "./meeting-details-dialog";
import { useRouter } from "next/navigation";

interface MeetingListProps {
  onCreateMeeting?: () => void;
  onJoinMeeting?: (meetingId: string) => void;
  organizacionId?: string;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}

export function MeetingList({ 
  onCreateMeeting, 
  onJoinMeeting, 
  organizacionId,
  enableAutoRefresh = false,
  refreshInterval = 30000 // 30 segundos por defecto
}: MeetingListProps) {
  const { meetings, isLoading, error, refetch, updateMeeting, deleteMeeting } = useMeetings(organizacionId);  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Auto-refresh functionality
  useEffect(() => {
    if (!enableAutoRefresh || !organizacionId) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [enableAutoRefresh, refreshInterval, organizacionId, refetch]);
  // Memoized filtered meetings for better performance
  const filteredMeetings = meetings.filter(meeting =>
    meeting.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (meeting.lugar && meeting.lugar.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (meeting.tipo_reunion && meeting.tipo_reunion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refetch]);
  // Determine meeting status based on dates
  const getMeetingStatus = useCallback((meeting: any) => {
    const now = new Date();
    const startTime = new Date(meeting.hora_inicio);
    const endTime = meeting.hora_fin ? new Date(meeting.hora_fin) : null;

    if (endTime && now > endTime) {
      return "finalizada";
    } else if (now >= startTime && (!endTime || now <= endTime)) {
      return "en_curso";
    } else {
      return "programada";
    }
  }, []);

  const getStatusColor = useCallback((estado: string) => {
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
  }, []);

  const getStatusText = useCallback((estado: string) => {
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
  }, []);  const formatDate = useCallback((dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Fecha inválida";
    }
  }, []);

  const formatTime = useCallback((timeStr: string) => {
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) {
        return "Hora inválida";
      }
      return new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (error) {
      console.error('Error formatting time:', error);
      return "Hora inválida";
    }
  }, []);
  const handleCreateMeeting = useCallback(() => {
    setShowCreateDialog(true);
    onCreateMeeting?.();
  }, [onCreateMeeting]);
  const handleMeetingClick = useCallback((meeting: any) => {
    setSelectedMeeting(meeting);
    setShowDetailsDialog(true);
    onJoinMeeting?.(meeting._id);
  }, [onJoinMeeting]);const handleMeetingCreated = useCallback(async (meeting: any) => {
    await refetch();
    setShowCreateDialog(false);
    return true;
  }, [refetch]);
  const handleEditMeeting = useCallback((meeting: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que se ejecute el click del card
    setSelectedMeeting(meeting);
    setShowEditDialog(true);
  }, []);

  const handleDeleteMeeting = useCallback((meeting: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que se ejecute el click del card
    setSelectedMeeting(meeting);
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(async (id: string) => {
    try {
      const result = await deleteMeeting(id);
      if (result) {
        await refetch(); // Refrescar la lista después de eliminar
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      return false;
    }
  }, [deleteMeeting, refetch]);

  const handleUpdateMeeting = useCallback(async (id: string, updateData: any) => {
    try {
      const result = await updateMeeting(id, updateData);
      if (result) {
        await refetch(); // Refrescar la lista después de actualizar
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating meeting:', error);
      return false;
    }
  }, [updateMeeting, refetch]);

  // Error boundary component
  const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Reintentar
        </Button>
      </AlertDescription>
    </Alert>
  );

  // Loading component
  const LoadingDisplay = () => (
    <div className="flex items-center justify-center h-48">
      <div className="text-center space-y-2">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-muted-foreground">Cargando reuniones...</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reuniones</h1>
            <p className="text-muted-foreground">
              Gestiona y organiza todas tus reuniones
            </p>
          </div>
        </div>
        <ErrorDisplay error={error} onRetry={handleRefresh} />
      </div>
    );
  }

  return (
    <div className="space-y-6">      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reuniones</h1>
          <p className="text-muted-foreground">
            Gestiona y organiza todas tus reuniones
            {meetings.length > 0 && ` (${meetings.length} reunión${meetings.length !== 1 ? 'es' : ''})`}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="flex-1 sm:flex-none"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar
          </Button>
          <Button onClick={handleCreateMeeting} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reunión
          </Button>
        </div>
      </div>      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, lugar o tipo de reunión..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => setSearchTerm("")}
          >
            ×
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading && <LoadingDisplay />}{/* Empty State */}
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
      )}      {/* Meetings List */}
      {!isLoading && filteredMeetings.length > 0 && (
        <div className="space-y-4">
          {/* Results counter */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {searchTerm 
                ? `${filteredMeetings.length} resultado${filteredMeetings.length !== 1 ? 's' : ''} para "${searchTerm}"`
                : `${filteredMeetings.length} reunión${filteredMeetings.length !== 1 ? 'es' : ''}`
              }
            </p>
            {enableAutoRefresh && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Actualización automática activada
              </div>
            )}
          </div>

          <ScrollArea className="h-[600px]">
            <div className="grid gap-4">
              {filteredMeetings.map((meeting) => {
                const status = getMeetingStatus(meeting);
                return (                  <Card 
                    key={meeting._id} 
                    className="hover:shadow-md transition-all duration-200 hover:border-primary/50"
                  ><CardHeader className="pb-3">
                      <div className="flex items-start justify-between">                        <div 
                          className="space-y-1 flex-1 cursor-pointer"
                          onClick={() => handleMeetingClick(meeting)}
                        >
                          <CardTitle className="text-xl">{meeting.titulo}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {meeting.lugar ? `Lugar: ${meeting.lugar}` : "Sin ubicación específica"}
                          </CardDescription>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {meeting.tipo_reunion}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {meeting.modalidad}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant={getStatusColor(status)}>
                            {getStatusText(status)}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => handleEditMeeting(meeting, e)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar reunión
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteMeeting(meeting, e)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar reunión
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>                    <CardContent 
                      className="cursor-pointer"
                      onClick={() => handleMeetingClick(meeting)}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>{formatDate(meeting.hora_inicio)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {formatTime(meeting.hora_inicio)}
                            {meeting.hora_fin && ` - ${formatTime(meeting.hora_fin)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span>{meeting.convocados?.length || 0} participante{(meeting.convocados?.length || 0) !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      {meeting.archivos && meeting.archivos.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            📎 {meeting.archivos.length} archivo{meeting.archivos.length !== 1 ? 's' : ''} adjunto{meeting.archivos.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}      {/* Create Meeting Dialog */}
      <CreateMeetingDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateMeeting={async () => true}
        organizacionId={organizacionId || ""} 
      />
    </div>
  );
}
