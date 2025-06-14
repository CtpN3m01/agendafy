// src/components/reuniones/meetings-dashboard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  Settings,
  Filter,
  Edit,
  MoreVertical,
  Trash2
} from "lucide-react";
import { useMeetingsOptimized } from "@/hooks/use-meetings-optimized";
import { useMeetings } from "@/hooks/use-meetings";
import { MeetingsStats } from "./meetings-stats";
import { MeetingsPagination } from "./meetings-pagination";
import { CreateMeetingDialog } from "./create-meeting-dialog";
import { EditMeetingDialog } from "./edit-meeting-dialog";
import { DeleteMeetingDialog } from "./delete-meeting-dialog";
import { MeetingDetailsDialog } from "./meeting-details-dialog";
import { useRouter } from "next/navigation";

interface MeetingsDashboardProps {
  organizacionId?: string;
  enableFeatures?: {
    stats?: boolean;
    pagination?: boolean;
    autoRefresh?: boolean;
    sorting?: boolean;
  };
}

export function MeetingsDashboard({ 
  organizacionId,
  enableFeatures = {
    stats: true,
    pagination: true,
    autoRefresh: true,
    sorting: true
  }
}: MeetingsDashboardProps) {  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [enableAutoRefresh, setEnableAutoRefresh] = useState(false);
  const [pageSize, setPageSize] = useState(10);  const {
    paginatedMeetings,
    isLoading,
    isRefreshing,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    stats,
    searchTerm,
    setSearchTerm,
    setCurrentPage,
    refresh,
    getMeetingStatus,
    updateMeeting
  } = useMeetingsOptimized({
    organizacionId,
    enableAutoRefresh,
    refreshInterval: 30000,
    enablePagination: enableFeatures.pagination,
    pageSize
  });

  // Obtener deleteMeeting del hook normal
  const { deleteMeeting } = useMeetings(organizacionId);

  const router = useRouter();

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Fecha inválida";
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch {
      return "Fecha inválida";
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return "Hora inválida";
      return new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch {
      return "Hora inválida";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "programada": return "default";
      case "en_curso": return "destructive";
      case "finalizada": return "secondary";
      default: return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "programada": return "Programada";
      case "en_curso": return "En Curso";
      case "finalizada": return "Finalizada";
      default: return status;
    }
  };
  const handleMeetingClick = (meeting: any) => {
    setSelectedMeeting(meeting);
    setShowDetailsDialog(true);
  };
  const handleMeetingCreated = async () => {
    await refresh();
    setShowCreateDialog(false);
    return true;
  };

  const handleEditMeeting = (meeting: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMeeting(meeting);
    setShowEditDialog(true);
  };

  const handleDeleteMeeting = (meeting: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMeeting(meeting);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      const result = await deleteMeeting(id);
      if (result) {
        await refresh();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      return false;
    }
  };

  const handleUpdateMeeting = async (id: string, updateData: any) => {
    try {
      const result = await updateMeeting(id, updateData);
      if (result) {
        await refresh();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating meeting:', error);
      return false;
    }
  };

  // Error Display Component
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reuniones</h1>
            <p className="text-muted-foreground">Dashboard de gestión de reuniones</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Reintentar"}
            </Button>
          </AlertDescription>
        </Alert>
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
            Dashboard de gestión de reuniones
            {stats.total > 0 && ` (${stats.total} reunión${stats.total !== 1 ? 'es' : ''})`}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={refresh} 
            disabled={isRefreshing}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reunión
          </Button>
        </div>
      </div>

      {/* Stats */}
      {enableFeatures.stats && (
        <MeetingsStats stats={stats} isLoading={isLoading} />
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
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
        </div>        {/* Auto-refresh toggle */}
        {enableFeatures.autoRefresh && (
          <div className="flex items-center space-x-2 whitespace-nowrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEnableAutoRefresh(!enableAutoRefresh)}
              className="text-xs"
            >
              {enableAutoRefresh ? 'Desactivar' : 'Activar'} auto-actualización
            </Button>
            {enableAutoRefresh && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <div className="text-center space-y-2">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Cargando reuniones...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && paginatedMeetings.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay reuniones aún</h3>
          <p className="text-muted-foreground mb-6">
            Crea tu primera reunión para comenzar a organizar tu tiempo
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Primera Reunión
          </Button>
        </div>
      )}

      {/* No Search Results */}
      {!isLoading && paginatedMeetings.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron reuniones</h3>
          <p className="text-muted-foreground">
            No hay reuniones que coincidan con &quot;{searchTerm}&quot;
          </p>
        </div>
      )}

      {/* Meetings List */}
      {!isLoading && paginatedMeetings.length > 0 && (
        <div className="space-y-4">
          {/* Results info */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {searchTerm 
                ? `${stats.total} resultado${stats.total !== 1 ? 's' : ''} para "${searchTerm}"`
                : `${stats.total} reunión${stats.total !== 1 ? 'es' : ''}`
              }
            </p>
          </div>

          {/* Meetings grid */}
          <div className="grid gap-4">
            {paginatedMeetings.map((meeting) => {
              const status = getMeetingStatus(meeting);
              return (                <Card 
                  key={meeting._id} 
                  className="hover:shadow-md transition-all duration-200 hover:border-primary/50"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">                      <div 
                        className="space-y-1 flex-1 cursor-pointer"
                        onClick={() => handleMeetingClick(meeting)}
                      >
                        <CardTitle className="text-xl">{meeting.titulo}</CardTitle>
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
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => handleEditMeeting(meeting, e)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar reunión
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteMeeting(meeting, e)}
                              className="cursor-pointer text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar reunión
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>                  <CardContent 
                    className="cursor-pointer"
                    onClick={() => handleMeetingClick(meeting)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
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
                    {meeting.lugar && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        📍 {meeting.lugar}
                      </div>
                    )}
                    {meeting.archivos && meeting.archivos.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        📎 {meeting.archivos.length} archivo{meeting.archivos.length !== 1 ? 's' : ''} adjunto{meeting.archivos.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {enableFeatures.pagination && totalPages > 1 && (
            <MeetingsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              pageSize={pageSize}
              totalItems={stats.total}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              disabled={isLoading || isRefreshing}
            />
          )}
        </div>
      )}      {/* Create Meeting Dialog */}
      <CreateMeetingDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateMeeting={handleMeetingCreated}
        organizacionId={organizacionId || ""} 
      />      {/* Edit Meeting Dialog */}
      <EditMeetingDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        meeting={selectedMeeting}
        onUpdate={handleUpdateMeeting}
        organizacionId={organizacionId}
      />      {/* Delete Meeting Dialog */}
      <DeleteMeetingDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        meeting={selectedMeeting}
        onDelete={handleConfirmDelete}
      />      {/* Meeting Details Dialog */}
      <MeetingDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        meeting={selectedMeeting}
        organizacionId={organizacionId || ""}
      />
    </div>
  );
}
