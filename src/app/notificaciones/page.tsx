"use client";

import React, { useState } from 'react';
import { AppLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { 
  NotificacionLista, 
  NotificacionResumen, 
  NotificacionDetalleDialog,
  CrearNotificacionDemo 
} from "@/components/notificacion";
import { useAuth } from "@/hooks/use-auth";
import { useNotificaciones } from "@/hooks/use-notificaciones";
import { useNotificacionActions } from "@/hooks/use-notificacion-actions";
import { NotificacionResponseDTO } from "@/types/NotificacionDTO";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Bell, AlertCircle, Settings } from "lucide-react";

export default function NotificacionesPage() {
  const { user } = useAuth();
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState<NotificacionResponseDTO | null>(null);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [mostrarDemo, setMostrarDemo] = useState(false);

  const {
    notificaciones,
    conteoNoLeidas,
    isLoading,
    error,
    marcarComoLeida,
    marcarVariasComoLeidas,
    eliminarNotificacion,
    refrescarNotificaciones
  } = useNotificaciones(user?.correo);

  const {
    handleMarcarLeida,
    handleMarcarVariasLeidas,
    handleEliminar,
    handleRefrescar
  } = useNotificacionActions({
    onMarcarLeida: marcarComoLeida,
    onMarcarVariasLeidas: marcarVariasComoLeidas,
    onEliminar: eliminarNotificacion,
    onRefrescar: refrescarNotificaciones
  });

  const handleNotificacionClick = (notificacion: NotificacionResponseDTO) => {
    setNotificacionSeleccionada(notificacion);
    setDialogAbierto(true);
    
    // Marcar como leída si no lo está
    if (!notificacion.leida) {
      handleMarcarLeida(notificacion.id);
    }
  };

  const handleMarcarLeidaDialog = async (id: string) => {
    await handleMarcarLeida(id);
    // Actualizar la notificación seleccionada
    if (notificacionSeleccionada) {
      setNotificacionSeleccionada({
        ...notificacionSeleccionada,
        leida: true
      });
    }
  };

  if (!user) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <AlertCircle className="h-8 w-8 text-amber-500 mr-3" />
                <p>Debes iniciar sesión para ver tus notificaciones.</p>
              </CardContent>
            </Card>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header de la página */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Bell className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Buzón de Notificaciones
                </h1>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarDemo(!mostrarDemo)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {mostrarDemo ? 'Ocultar Panel' : 'Enviar Notificación'}
              </Button>
            </div>
            <p className="text-gray-600">
              Mantente al día con las notificaciones importantes de tu organización
            </p>
          </div>

          {/* Resumen rápido */}
          <div className="mb-6">
            <NotificacionResumen 
              notificaciones={notificaciones}
              conteoNoLeidas={conteoNoLeidas}
            />
          </div>

          {/* Error alert */}
          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Lista de notificaciones */}
          <NotificacionLista
            notificaciones={notificaciones}
            conteoNoLeidas={conteoNoLeidas}
            isLoading={isLoading}
            onMarcarLeida={handleMarcarLeida}
            onMarcarVariasLeidas={handleMarcarVariasLeidas}
            onEliminar={handleEliminar}
            onRefrescar={handleRefrescar}
            onNotificacionClick={handleNotificacionClick}
          />

          {/* Panel para crear notificaciones */}
          {mostrarDemo && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Panel de Envío de Notificaciones
                </h2>
                <p className="text-sm text-gray-600">
                  Envía notificaciones a los miembros de tu organización
                </p>
              </div>
              <CrearNotificacionDemo />
            </div>
          )}

          {/* Dialog para mostrar detalles de notificación */}
          <NotificacionDetalleDialog
            notificacion={notificacionSeleccionada}
            open={dialogAbierto}
            onOpenChange={setDialogAbierto}
            onMarcarLeida={handleMarcarLeidaDialog}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
