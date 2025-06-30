// src/components/organizacion/board-members-table.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Loader2, Link, Copy } from "lucide-react";
import { useBoardMembers } from "@/hooks/use-board-members";
import { BoardMemberForm } from "./board-member-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BoardMember {
  _id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: string;
  contrasena?: string; // Opcional para incluir contraseña
}

interface BoardMembersTableProps {
  organizationId: string;
}

export function BoardMembersTable({ organizationId }: BoardMembersTableProps) {
  const { members, isLoading, error, addMember, updateMember, deleteMember } = useBoardMembers(organizationId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleAddMember = async (memberData: Omit<BoardMember, '_id'>): Promise<boolean> => {
    setIsRefreshing(true);
    try {
      const success = await addMember(memberData);
      if (success) {
        setIsFormOpen(false);
      }
      return success;
    } finally {
      setIsRefreshing(false);
    }
  };
  const handleEditMember = async (memberData: Omit<BoardMember, '_id'>): Promise<boolean> => {
    if (!editingMember || !editingMember._id) {
      console.error('No editing member or missing ID');
      return false;
    }
    
    setIsRefreshing(true);
    try {
      const success = await updateMember(editingMember._id, memberData);
      if (success) {
        setEditingMember(null);
      }
      return success;
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    setDeletingId(id);
    const success = await deleteMember(id);
    setDeletingId(null);
    
    if (!success) {
      // El error ya se maneja en el hook
    }
  };

  const handleCopyPasswordLink = (email: string) => {
    const link = `${window.location.origin}/auth/set-password?email=${encodeURIComponent(email)}`;
    navigator.clipboard.writeText(link).then(() => {
      // Aquí podrías agregar una notificación de éxito
      alert('Enlace copiado al portapapeles');
    }).catch(() => {
      alert('Error al copiar enlace');
    });
  };
  const openEditForm = (member: BoardMember) => {
    console.log('Opening edit form for member:', member);
    setEditingMember(member);
  };

  const closeEditForm = () => {
    setEditingMember(null);
  };
  const getRoleBadgeVariant = (rol: string) => {
    if (!rol) return 'secondary';
    
    switch (rol.toLowerCase()) {
      case 'presidente':
        return 'default';
      case 'subpresidente':
        return 'secondary';
      case 'tesorero':
        return 'outline';
      case 'vocal':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Miembros de la Junta Directiva
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Cargando miembros...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Miembros de la Junta Directiva
              </CardTitle>
              <CardDescription>
                Gestiona los miembros de la junta directiva de tu organización
              </CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Miembro
            </Button>
          </div>
        </CardHeader>        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isRefreshing && (
            <div className="flex items-center justify-center py-2 mb-4 bg-muted/50 rounded-md">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Actualizando lista...</span>
              </div>
            </div>
          )}

          {members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay miembros registrados</h3>
              <p className="text-muted-foreground mb-4">
                Comienza agregando miembros a la junta directiva
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Miembro
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>                
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Apellidos</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Posición</TableHead>
                    <TableHead>Estado Acceso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member, index) => (
                    <TableRow key={member._id || `member-${index}`}>
                      <TableCell className="font-medium">
                        {member.nombre}
                      </TableCell>
                      <TableCell className="font-medium">
                        {member.apellidos}
                      </TableCell>
                      <TableCell>{member.correo}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.rol)}>
                          {member.rol || 'Sin posición'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={member.contrasena ? 'default' : 'secondary'}
                          className={member.contrasena ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        >
                          {member.contrasena ? 'Acceso Activo' : 'Sin Contraseña'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!member.contrasena && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyPasswordLink(member.correo)}
                              title="Copiar enlace para configurar contraseña"
                            >
                              <Link className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditForm(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMember(member._id)}
                            disabled={deletingId === member._id}
                          >
                            {deletingId === member._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario para agregar miembro */}
      <BoardMemberForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddMember}
        isEditing={false}
      />

      {/* Formulario para editar miembro */}
      <BoardMemberForm
        isOpen={!!editingMember}
        onClose={closeEditForm}
        onSubmit={handleEditMember}
        member={editingMember}
        isEditing={true}
      />
    </>
  );
}
