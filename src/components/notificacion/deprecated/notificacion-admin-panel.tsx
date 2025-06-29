/* eslint-disable @typescript-eslint/no-unused-vars */
// Este archivo está deprecated y fue movido aquí para mantener historial
// Los warnings de ESLint se ignoran porque el archivo ya no está en uso activo

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TipoNotificacion } from '@/types/NotificacionDTO';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { 
  Bell, 
  Send, 
  User, 
  Users, 
  Calendar, 
  Settings, 
  TestTube, 
  AlertTriangle,
  Info
} from 'lucide-react';

interface FormDataState {
  destinatario: string;
  rolAsignado: string;
  lugarReunion: string;
  fechaReunion: string;
}

export const NotificacionAdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormDataState>({
    destinatario: '',
    rolAsignado: 'Presidente',
    lugarReunion: 'Sala de Juntas Principal',
    fechaReunion: ''
  });

  const handleInputChange = (field: keyof FormDataState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const obtenerFechaMinima = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  const enviarNotificacionPrueba = async (tipo: TipoNotificacion) => {
    if (!user?.correo) {
      toast.error('Usuario no autenticado');
      return;
    }

    if (!formData.destinatario || !formData.fechaReunion) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    const fechaReunion = new Date(formData.fechaReunion);
    if (fechaReunion <= new Date()) {
      toast.error('La fecha de reunión debe ser futura');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = tipo === TipoNotificacion.ASIGNACION 
        ? '/api/mongo/notificacion/asignacion'
        : '/api/mongo/notificacion/convocatoria';

      const body = tipo === TipoNotificacion.ASIGNACION ? {
        emisor: user.correo,
        destinatario: formData.destinatario,
        reunionId: 'test-' + Date.now(),
        rolAsignado: formData.rolAsignado,
        fechaReunion: fechaReunion.toISOString()
      } : {
        emisor: user.correo,
        destinatario: formData.destinatario,
        reunionId: 'test-' + Date.now(),
        fechaReunion: fechaReunion.toISOString(),
        lugarReunion: formData.lugarReunion,
        agendaId: 'agenda-test-' + Date.now()
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Notificación de ${tipo.toLowerCase()} enviada exitosamente`);
        setFormData(prev => ({ ...prev, destinatario: '', fechaReunion: '' }));
      } else {
        toast.error(data.message || 'Error al enviar notificación');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Debes iniciar sesión para usar estas herramientas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información del sistema */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema Automático:</strong> Las notificaciones se envían automáticamente cuando se crean reuniones. 
          Este panel es solo para pruebas y gestión administrativa.
        </AlertDescription>
      </Alert>

      {/* Panel de pruebas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-blue-600" />
            Herramientas de Prueba
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destinatario">Destinatario de Prueba (Email)</Label>
              <Input
                id="destinatario"
                type="email"
                placeholder="usuario@empresa.com"
                value={formData.destinatario}
                onChange={(e) => handleInputChange('destinatario', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaReunion">Fecha y Hora Simulada</Label>
              <Input
                id="fechaReunion"
                type="datetime-local"
                min={obtenerFechaMinima()}
                value={formData.fechaReunion}
                onChange={(e) => handleInputChange('fechaReunion', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rolAsignado">Rol para Prueba de Asignación</Label>
              <Select
                value={formData.rolAsignado}
                onValueChange={(value) => handleInputChange('rolAsignado', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Presidente">Presidente</SelectItem>
                  <SelectItem value="Secretario">Secretario</SelectItem>
                  <SelectItem value="Miembro">Miembro</SelectItem>
                  <SelectItem value="Observador">Observador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lugarReunion">Lugar para Prueba de Convocatoria</Label>
              <Input
                id="lugarReunion"
                placeholder="Sala de Juntas Principal"
                value={formData.lugarReunion}
                onChange={(e) => handleInputChange('lugarReunion', e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Button 
              onClick={() => enviarNotificacionPrueba(TipoNotificacion.ASIGNACION)}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Probar Asignación
            </Button>

            <Button 
              onClick={() => enviarNotificacionPrueba(TipoNotificacion.CONVOCATORIA)}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Probar Convocatoria
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información sobre el flujo automático */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            Flujo Automático de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Creación de Reunión</h4>
                <p className="text-sm text-gray-600">
                  Cuando se crea una nueva reunión, automáticamente se envían notificaciones de convocatoria 
                  a todos los miembros de la organización que fueron convocados.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Asignación de Roles</h4>
                <p className="text-sm text-gray-600">
                  Las notificaciones de asignación se pueden enviar cuando se asignan roles específicos 
                  a miembros para reuniones particulares.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <Bell className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium">Gestión Inteligente</h4>
                <p className="text-sm text-gray-600">
                  El sistema filtra automáticamente para enviar notificaciones solo a miembros oficiales 
                  de la organización, evitando spam a invitados externos.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advertencia de desarrollo */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Herramientas de Desarrollo:</strong> Este panel está diseñado para pruebas y desarrollo. 
          En producción, las notificaciones deben enviarse únicamente a través del flujo automático de reuniones.
        </AlertDescription>
      </Alert>
    </div>
  );
};
