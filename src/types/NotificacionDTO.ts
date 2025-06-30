// DTOs para el manejo de notificaciones
export interface NotificacionDTO {
  id?: string;
  emisor: string;
  destinatario: string;
  asunto: string;
  contenido: string;
  fecha: Date;
  leida?: boolean;
  tipo: TipoNotificacion;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CrearNotificacionDTO {
  emisor: string;
  destinatario: string;
  asunto: string;
  contenido: string;
  tipo: TipoNotificacion;
  datosAdicionales?: Record<string, unknown>; // Para datos específicos según el tipo
}

export interface ActualizarNotificacionDTO {
  asunto?: string;
  contenido?: string;
  leida?: boolean;
}

export interface NotificacionResponseDTO {
  id: string;
  emisor: string;
  destinatario: string;
  asunto: string;
  contenido: string;
  fecha: Date;
  leida: boolean;
  tipo: TipoNotificacion;
  datosAdicionales?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface FiltrosNotificacionDTO {
  destinatario?: string;
  emisor?: string;
  tipo?: TipoNotificacion;
  leida?: boolean;
  fechaDesde?: Date;
  fechaHasta?: Date;
  limite?: number;
  pagina?: number;
}

export enum TipoNotificacion {
  ASIGNACION = 'ASIGNACION',
  CONVOCATORIA = 'CONVOCATORIA'
}

// DTOs específicos para cada tipo de notificación
export interface NotificacionAsignacionDTO extends CrearNotificacionDTO {
  tipo: TipoNotificacion.ASIGNACION;
  datosAdicionales: {
    reunionId: string;
    rolAsignado: string;
    fechaReunion: Date;
  };
}

export interface NotificacionConvocatoriaDTO extends CrearNotificacionDTO {
  tipo: TipoNotificacion.CONVOCATORIA;
  datosAdicionales: {
    reunionId: string;
    fechaReunion: Date;
    lugarReunion: string;
    agendaId?: string;
  };
}
