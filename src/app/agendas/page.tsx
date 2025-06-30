"use client";

import { useState } from 'react';
import { AppLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { AgendaViewDialog } from '@/components/agenda/agenda-view-dialog';
import { CreateAgendaDialog } from '@/components/agenda/create-agenda-dialog';
import { useAgendas } from '@/hooks/use-agendas';
import { useUserOrganization } from '@/hooks/use-user-organization';
import { useOrganizationMembers } from '@/hooks/use-organization-members';
import { useUserPermissions, useUserRole } from '@/hooks/use-user-permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Loader2, Edit, Trash2, Eye, Plus } from "lucide-react";

interface AgendaResponse {
  _id: string;
  nombre: string;
  organizacion: string | unknown;
  puntos?: string[] | unknown[];
  reuniones?: string[] | unknown[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface AgendaCardProps {
  agenda: AgendaResponse;
  onEdit: (agenda: AgendaResponse) => void;
  onDelete: (agenda: AgendaResponse) => void;
  onView: (agenda: AgendaResponse) => void;
  canEdit: boolean;
  canDelete: boolean;
}

function AgendaCard({ agenda, onEdit, onDelete, onView, canEdit, canDelete }: AgendaCardProps) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const puntosCount = Array.isArray(agenda.puntos) ? agenda.puntos.length : 0;
  const reunionesCount = Array.isArray(agenda.reuniones) ? agenda.reuniones.length : 0;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {agenda.nombre}
        </CardTitle>
        <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Puntos: {puntosCount}</span>
            <span>Reuniones: {reunionesCount}</span>
          </div>
          <div className="text-xs">
            Actualizada: {formatDate(agenda.updatedAt)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          {/* Botón Ver - siempre visible */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(agenda)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Ver
          </Button>
          
          {/* Botón Editar - solo para administradores */}
          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(agenda)}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          )}
          
          {/* Botón Eliminar - solo para administradores */}
          {canDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(agenda)}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Eliminar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AgendaListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AgendasPage() {
  const { organization, isLoading: orgLoading, error: orgError } = useUserOrganization();
  const { members } = useOrganizationMembers(organization?.id);
  const { 
    agendas, 
    isLoading: agendasLoading, 
    error, 
    deleteAgenda, 
    getAgenda,
    refetch 
  } = useAgendas(organization?.id);

  // Usar el sistema de permisos basado en Visitor Pattern
  const permissions = useUserPermissions();
  const { role, displayName } = useUserRole();

  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para los nuevos diálogos
  const [viewingAgenda, setViewingAgenda] = useState<unknown>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  
  const [editingAgenda, setEditingAgenda] = useState<unknown>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('edit');
  
  // Estados para modal de confirmación de eliminación
  const [deletingAgenda, setDeletingAgenda] = useState<AgendaResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Combinamos los estados de carga
  const isLoadingData = orgLoading || (organization?.id && agendasLoading);

  // Convertir miembros a formato esperado por CreateAgendaDialog
  const convocados = members.map(member => ({
    nombre: member.nombre,
    correo: member.correo,
    esMiembro: member.esMiembro
  }));

  const filteredAgendas = agendas.filter(agenda =>
    agenda.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleView = async (agenda: AgendaResponse) => {
    try {
      setIsViewLoading(true);
      setIsViewDialogOpen(true);
      
      // Obtener la agenda completa con datos poblados
      const agendaCompleta = await getAgenda(agenda._id, true);
      if (agendaCompleta) {
        setViewingAgenda(agendaCompleta);
      }
    } catch (error) {
      console.error('Error al cargar agenda:', error);
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleEditFromView = async () => {
    if (viewingAgenda) {
      // Cerrar el diálogo de vista
      setIsViewDialogOpen(false);
      
      // Abrir el diálogo de edición con la agenda ya cargada
      setEditMode('edit');
      setEditingAgenda(viewingAgenda);
      setIsEditDialogOpen(true);
    }
  };

  const handleEdit = async (agenda: AgendaResponse) => {
    try {
      setEditMode('edit');
      setIsEditDialogOpen(true);
      
      // Obtener la agenda completa para edición
      const agendaCompleta = await getAgenda(agenda._id, true);
      if (agendaCompleta) {
        setEditingAgenda(agendaCompleta);
      }
    } catch (error) {
      console.error('Error al cargar agenda para edición:', error);
    }
  };

  const handleCreate = () => {
    setEditMode('create');
    setEditingAgenda(null);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (agenda: AgendaResponse) => {
    setDeletingAgenda(agenda);
    setIsDeleteDialogOpen(true);
  };

  const handleAgendaCreated = async () => {
    // Refrescar la lista de agendas
    await refetch();
  };

  const handleAgendaUpdated = async () => {
    // Refrescar la lista de agendas
    await refetch();
  };

  const handleConfirmDelete = async () => {
    if (!deletingAgenda) return;

    try {
      setIsDeleting(true);
      const success = await deleteAgenda(deletingAgenda._id);
      if (success) {
        setIsDeleteDialogOpen(false);
        setDeletingAgenda(null);
      }
    } catch (error) {
      console.error('Error al eliminar agenda:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeletingAgenda(null);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setViewingAgenda(null);
  };

  // Estado de carga inicial
  if (orgLoading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Cargando organización...</span>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  // Error de organización
  if (orgError || !organization) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Error al cargar organización
              </h2>
              <p className="text-red-600 dark:text-red-300 mb-4">
                {orgError || 'No se pudo obtener la información de la organización'}
              </p>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                Reintentar
              </Button>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  // Error de agendas
  if (error) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Error al cargar las agendas
              </h2>
              <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
              <Button onClick={refetch} variant="outline" size="sm">
                Reintentar
              </Button>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Mis Agendas
                </h1>
                <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                  {displayName}
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Organización: {organization.nombre}
              </p>
              {role === 'board-member' && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  👁️ Modo de visualización - Los cambios los realiza el administrador
                </p>
              )}
            </div>
            
            {/* Botón Crear Agenda - solo para administradores */}
            {permissions.canCreate && (
              <Button onClick={handleCreate} className="shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Crear Agenda
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar agendas por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>          {/* Content */}
          {isLoadingData ? (
            <AgendaListSkeleton />
          ) : filteredAgendas.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {searchTerm ? 'No se encontraron agendas' : 'No tienes agendas aún'}
                </h3>                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm 
                    ? `No hay agendas que coincidan con &quot;${searchTerm}&quot;`
                    : 'No hay agendas disponibles para mostrar.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgendas.map((agenda) => (
                <AgendaCard
                  key={agenda._id}
                  agenda={agenda}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  canEdit={permissions.canEdit}
                  canDelete={permissions.canDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Nuevos Diálogos */}
        <AgendaViewDialog
          isOpen={isViewDialogOpen}
          onClose={handleCloseViewDialog}
          agenda={viewingAgenda as never}
          isLoading={isViewLoading}
          onEdit={permissions.canEdit ? handleEditFromView : undefined}
        />

        <CreateAgendaDialog
          organizacionId={organization?.id || ''}
          onAgendaCreated={handleAgendaCreated}
          onAgendaUpdated={handleAgendaUpdated}
          editMode={editMode === 'edit'}
          agendaToEdit={editingAgenda as never}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          convocados={convocados}
        />

        {/* Modal de Confirmación de Eliminación */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar esta agenda? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            {deletingAgenda && (
              <div className="py-4">
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                    Agenda a eliminar: &quot;{deletingAgenda.nombre}&quot;
                  </h4>
                  <div className="text-sm text-red-800 dark:text-red-200 space-y-1">
                    <div>• Puntos registrados: {Array.isArray(deletingAgenda.puntos) ? deletingAgenda.puntos.length : 0}</div>
                    <div>• Reuniones asociadas: {Array.isArray(deletingAgenda.reuniones) ? deletingAgenda.reuniones.length : 0}</div>
                    <div className="mt-2 font-medium">
                      ⚠️ Todos los datos relacionados también se eliminarán permanentemente.
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar Agenda
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AppLayout>
    </ProtectedRoute>
  );
}
