import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TipoNotificacion } from '@/types/NotificacionDTO';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Bell, Send, User, Users, Calendar } from 'lucide-react';

type TipoEnvio = 'individual' | 'masivo';

interface FormDataState {
  tipoEnvio: TipoEnvio;
  tipo: TipoNotificacion;
  destinatario: string;
  rolAsignado: string;
  lugarReunion: string;
  fechaReunion: string;
}

export const CrearNotificacionDemo: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormDataState>({
    tipoEnvio: 'individual',
    tipo: TipoNotificacion.ASIGNACION,
    destinatario: '',
    rolAsignado: 'Presidente',
    lugarReunion: 'Sala de Juntas Principal',
    fechaReunion: ''
  });

  const handleInputChange = (field: keyof FormDataState, value: string | TipoNotificacion | TipoEnvio) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!user?.correo) {
      toast.error('Usuario no autenticado');
      return false;
    }

    if (!formData.fechaReunion) {
      toast.error('La fecha de reunión es requerida');
      return false;
    }

    if (formData.tipoEnvio === 'individual' && !formData.destinatario) {
      toast.error('El destinatario es requerido para envío individual');
      return false;
    }

    const fechaReunion = new Date(formData.fechaReunion);
    if (fechaReunion <= new Date()) {
      toast.error('La fecha de reunión debe ser futura');
      return false;
    }

    return true;
  };

  const enviarNotificacion = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (formData.tipoEnvio === 'individual') {
        await enviarNotificacionIndividual();
      } else {
        await enviarNotificacionMasiva();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const enviarNotificacionIndividual = async () => {
    const fechaReunion = new Date(formData.fechaReunion);
    const endpoint = formData.tipo === TipoNotificacion.ASIGNACION 
      ? '/api/mongo/notificacion/asignacion'
      : '/api/mongo/notificacion/convocatoria';

    const body = formData.tipo === TipoNotificacion.ASIGNACION ? {
      emisor: user!.correo,
      destinatario: formData.destinatario,
      reunionId: 'demo-' + Date.now(),
      rolAsignado: formData.rolAsignado,
      fechaReunion: fechaReunion.toISOString()
    } : {
      emisor: user!.correo,
      destinatario: formData.destinatario,
      reunionId: 'demo-' + Date.now(),
      fechaReunion: fechaReunion.toISOString(),
      lugarReunion: formData.lugarReunion,
      agendaId: 'agenda-demo-' + Date.now()
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (data.success) {
      toast.success(`Notificación de ${formData.tipo.toLowerCase()} enviada exitosamente`);
      resetForm();
    } else {
      toast.error(data.message || 'Error al enviar notificación');
    }
  };

  const enviarNotificacionMasiva = async () => {
    const fechaReunion = new Date(formData.fechaReunion);
    const destinatarios = [
      'miembro1@empresa.com',
      'miembro2@empresa.com',
      'miembro3@empresa.com',
      user!.correo
    ];

    const datos = formData.tipo === TipoNotificacion.ASIGNACION ? {
      reunionId: 'demo-masivo-' + Date.now(),
      rolAsignado: 'Miembro',
      fechaReunion: fechaReunion.toISOString()
    } : {
      reunionId: 'demo-masivo-' + Date.now(),
      fechaReunion: fechaReunion.toISOString(),
      lugarReunion: formData.lugarReunion,
      agendaId: 'agenda-masivo-' + Date.now()
    };

    const response = await fetch('/api/mongo/notificacion/masivo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: formData.tipo,
        emisor: user!.correo,
        destinatarios,
        datos
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      toast.success(`${data.data.cantidadCreadas} notificaciones masivas enviadas exitosamente`);
      resetForm();
    } else {
      toast.error(data.message || 'Error al enviar notificaciones');
    }
  };

  const resetForm = () => {
    setFormData(prev => ({ 
      ...prev, 
      destinatario: '', 
      fechaReunion: '' 
    }));
  };

  const obtenerFechaMinima = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // Al menos 1 hora en el futuro
    return now.toISOString().slice(0, 16);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Debes iniciar sesión para usar esta herramienta</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          Panel de Envío de Notificaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selector de tipo de envío */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.tipoEnvio === 'individual' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => handleInputChange('tipoEnvio', 'individual')}
          >
            <div className="flex items-center space-x-3">
              <User className={`h-5 w-5 ${formData.tipoEnvio === 'individual' ? 'text-blue-600' : 'text-gray-500'}`} />
              <div>
                <h3 className="font-medium">Envío Individual</h3>
                <p className="text-sm text-gray-600">Enviar a un destinatario específico</p>
              </div>
            </div>
          </div>
          
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.tipoEnvio === 'masivo' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => handleInputChange('tipoEnvio', 'masivo')}
          >
            <div className="flex items-center space-x-3">
              <Users className={`h-5 w-5 ${formData.tipoEnvio === 'masivo' ? 'text-blue-600' : 'text-gray-500'}`} />
              <div>
                <h3 className="font-medium">Envío Masivo</h3>
                <p className="text-sm text-gray-600">Enviar a múltiples destinatarios</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tipo de notificación */}
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Notificación</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value) => handleInputChange('tipo', value as TipoNotificacion)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TipoNotificacion.ASIGNACION}>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Asignación de Rol</span>
                </div>
              </SelectItem>
              <SelectItem value={TipoNotificacion.CONVOCATORIA}>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Convocatoria a Reunión</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campos del formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Destinatario solo para envío individual */}
          {formData.tipoEnvio === 'individual' && (
            <div className="space-y-2">
              <Label htmlFor="destinatario">Destinatario (Email)</Label>
              <Input
                id="destinatario"
                type="email"
                placeholder="usuario@empresa.com"
                value={formData.destinatario}
                onChange={(e) => handleInputChange('destinatario', e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fechaReunion">Fecha y Hora de Reunión</Label>
            <Input
              id="fechaReunion"
              type="datetime-local"
              min={obtenerFechaMinima()}
              value={formData.fechaReunion}
              onChange={(e) => handleInputChange('fechaReunion', e.target.value)}
            />
          </div>
        </div>

        {/* Campos específicos según el tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.tipo === TipoNotificacion.ASIGNACION && (
            <div className="space-y-2">
              <Label htmlFor="rolAsignado">Rol a Asignar</Label>
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
          )}

          {formData.tipo === TipoNotificacion.CONVOCATORIA && (
            <div className="space-y-2">
              <Label htmlFor="lugarReunion">Lugar de Reunión</Label>
              <Input
                id="lugarReunion"
                placeholder="Sala de Juntas Principal"
                value={formData.lugarReunion}
                onChange={(e) => handleInputChange('lugarReunion', e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Información sobre envío masivo */}
        {formData.tipoEnvio === 'masivo' && (
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Información del envío masivo:</p>
            <p>Se enviará la notificación a 4 usuarios de prueba, incluyéndote a ti.</p>
          </div>
        )}

        {/* Botón de envío */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={enviarNotificacion}
            disabled={isLoading}
            size="lg"
            className="flex items-center gap-2 min-w-[200px]"
          >
            <Send className="h-4 w-4" />
            {isLoading ? 'Enviando...' : `Enviar ${formData.tipoEnvio === 'individual' ? 'Notificación' : 'Notificaciones'}`}
          </Button>
        </div>

        {/* Información adicional */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <strong>Información:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Todas las fechas deben ser futuras</li>
            <li>• {formData.tipoEnvio === 'individual' 
              ? 'La notificación se enviará al destinatario especificado'
              : 'Las notificaciones masivas incluyen usuarios de prueba'}
            </li>
            <li>• Verifica tu buzón de notificaciones después del envío</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
