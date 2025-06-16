"use client";

import { useState } from 'react';
import { AppLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { useAgendas } from '@/hooks/use-agendas';
import { useUserOrganization } from '@/hooks/use-user-organization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Loader2, Edit, Trash2 } from "lucide-react";

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
}

function AgendaCard({ agenda, onEdit, onDelete }: AgendaCardProps) {
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(agenda)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(agenda)}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Eliminar
          </Button>
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
  const { organization, isLoading: orgLoading, error: orgError } = useUserOrganization();const { 
    agendas, 
    isLoading: agendasLoading, 
    error, 
    deleteAgenda, 
    updateAgenda,
    refetch 
  } = useAgendas(organization?.id);

  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para modal de edición
  const [editingAgenda, setEditingAgenda] = useState<AgendaResponse | null>(null);
  const [editAgendaName, setEditAgendaName] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados para modal de confirmación de eliminación
  const [deletingAgenda, setDeletingAgenda] = useState<AgendaResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Combinamos los estados de carga
  const isLoadingData = orgLoading || (organization?.id && agendasLoading);

  const filteredAgendas = agendas.filter(agenda =>
    agenda.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleEdit = (agenda: AgendaResponse) => {
    setEditingAgenda(agenda);
    setEditAgendaName(agenda.nombre);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (agenda: AgendaResponse) => {
    setDeletingAgenda(agenda);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAgenda || !editAgendaName.trim()) return;

    try {
      setIsSaving(true);
      const success = await updateAgenda(editingAgenda._id, { nombre: editAgendaName });
      if (success) {
        setIsEditDialogOpen(false);
        setEditingAgenda(null);
        setEditAgendaName('');
      }
    } catch (error) {
      console.error('Error al actualizar agenda:', error);
    } finally {
      setIsSaving(false);
    }
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

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingAgenda(null);
    setEditAgendaName('');
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeletingAgenda(null);
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Mis Agendas
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Organización: {organization.nombre}
              </p>
            </div>
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
                  onDelete={handleDelete}                />
              ))}
            </div>
          )}
        </div>

        {/* Modal de Edición */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Agenda</DialogTitle>
              <DialogDescription>
                Modifica el nombre de la agenda y guarda los cambios.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-agenda-name">Nombre de la Agenda</Label>
                <Input
                  id="edit-agenda-name"
                  value={editAgendaName}
                  onChange={(e) => setEditAgendaName(e.target.value)}
                  placeholder="Ingresa el nombre de la agenda"
                  className="text-base"
                />
                {editAgendaName.trim() === '' && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    El nombre de la agenda es obligatorio
                  </p>
                )}
              </div>
              {editingAgenda && (
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Información de la Agenda
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Puntos registrados:</span>
                      <span>{Array.isArray(editingAgenda.puntos) ? editingAgenda.puntos.length : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reuniones asociadas:</span>
                      <span>{Array.isArray(editingAgenda.reuniones) ? editingAgenda.reuniones.length : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Última actualización:</span>
                      <span>
                        {editingAgenda.updatedAt 
                          ? new Date(editingAgenda.updatedAt).toLocaleDateString('es-ES')
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving || !editAgendaName.trim() || editAgendaName === editingAgenda?.nombre}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
