import { 
  CrearNotificacionDTO, 
  TipoNotificacion, 
  NotificacionAsignacionDTO, 
  NotificacionConvocatoriaDTO 
} from '@/types/NotificacionDTO';

/**
 * Clase abstracta que implementa el patrón Template Method para notificaciones
 * Define el algoritmo base para crear y enviar notificaciones
 */
export abstract class Notificacion {
  protected emisor: string;
  protected destinatario: string;
  protected asunto: string = '';
  protected contenido: string = '';
  protected fecha: Date;

  constructor(emisor: string, destinatario: string) {
    this.emisor = emisor;
    this.destinatario = destinatario;
    this.fecha = new Date();
  }

  /**
   * Template Method - Define el algoritmo principal
   * Este método no debe ser sobrescrito por las subclases
   */
  public async procesarNotificacion(datos: any): Promise<CrearNotificacionDTO> {
    // 1. Establecer asunto específico
    this.setAsunto(datos);
    
    // 2. Establecer contenido específico
    this.setContenido(datos);
    
    // 3. Establecer fecha específica
    this.setFecha(datos);
    
    // 4. Validar datos específicos
    this.validarDatos(datos);
    
    // 5. Crear el DTO final
    return this.crearDTO(datos);
  }

  /**
   * Métodos abstractos que deben ser implementados por las subclases
   */
  protected abstract setAsunto(datos: any): void;
  protected abstract setContenido(datos: any): void;
  protected abstract validarDatos(datos: any): void;
  protected abstract getTipo(): TipoNotificacion;

  /**
   * Métodos con implementación por defecto que pueden ser sobrescritos
   */
  protected setFecha(datos: any): void {
    // Por defecto usa la fecha actual, pero puede ser sobrescrito
    this.fecha = datos.fecha || new Date();
  }

  /**
   * Método final para crear el DTO
   */
  private crearDTO(datos: any): CrearNotificacionDTO {
    return {
      emisor: this.emisor,
      destinatario: this.destinatario,
      asunto: this.asunto,
      contenido: this.contenido,
      tipo: this.getTipo(),
      datosAdicionales: this.procesarDatosAdicionales(datos)
    };
  }

  /**
   * Método que puede ser sobrescrito para procesar datos adicionales específicos
   */
  protected procesarDatosAdicionales(datos: any): any {
    return datos;
  }
}

/**
 * Implementación concreta para notificaciones de asignación
 */
export class NotificacionAsignacion extends Notificacion {
  protected setAsunto(datos: { rolAsignado: string; fechaReunion: Date }): void {
    this.asunto = `Nueva asignación: ${datos.rolAsignado}`;
  }
  
  protected setContenido(datos: { 
    rolAsignado: string; 
    fechaReunion: Date; 
    reunionId: string 
  }): void {
    const fechaFormateada = datos.fechaReunion.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    this.contenido = `Se te ha asignado el rol de ${datos.rolAsignado} para la reunión programada el ${fechaFormateada}. Por favor, revisa los detalles y confirma tu participación.`;
  }

  protected validarDatos(datos: any): void {
    if (!datos.rolAsignado || !datos.fechaReunion || !datos.reunionId) {
      throw new Error('Datos insuficientes para crear notificación de asignación');
    }
    
    if (new Date(datos.fechaReunion) <= new Date()) {
      throw new Error('La fecha de la reunión debe ser futura');
    }
  }

  protected getTipo(): TipoNotificacion {
    return TipoNotificacion.ASIGNACION;
  }

  protected procesarDatosAdicionales(datos: any): any {
    return {
      reunionId: datos.reunionId,
      rolAsignado: datos.rolAsignado,
      fechaReunion: datos.fechaReunion
    };
  }
}

/**
 * Implementación concreta para notificaciones de convocatoria
 */
export class NotificacionConvocatoria extends Notificacion {
  protected setAsunto(datos: { fechaReunion: Date }): void {
    const fechaFormateada = datos.fechaReunion.toLocaleDateString('es-ES');
    this.asunto = `Convocatoria a reunión - ${fechaFormateada}`;
  }

  protected setContenido(datos: { 
    fechaReunion: Date; 
    lugarReunion: string; 
    reunionId: string;
    agendaId?: string;
  }): void {
    const fechaFormateada = datos.fechaReunion.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    this.contenido = `Está convocado a la reunión programada para el ${fechaFormateada} en ${datos.lugarReunion}. ${datos.agendaId ? 'Por favor, revise la agenda adjunta.' : 'La agenda será enviada próximamente.'}`;
  }

  protected validarDatos(datos: any): void {
    if (!datos.fechaReunion || !datos.lugarReunion || !datos.reunionId) {
      throw new Error('Datos insuficientes para crear notificación de convocatoria');
    }
    
    if (new Date(datos.fechaReunion) <= new Date()) {
      throw new Error('La fecha de la reunión debe ser futura');
    }

    if (!datos.lugarReunion.trim()) {
      throw new Error('El lugar de la reunión es requerido');
    }
  }

  protected getTipo(): TipoNotificacion {
    return TipoNotificacion.CONVOCATORIA;
  }

  protected procesarDatosAdicionales(datos: any): any {
    return {
      reunionId: datos.reunionId,
      fechaReunion: datos.fechaReunion,
      lugarReunion: datos.lugarReunion,
      agendaId: datos.agendaId
    };
  }

  protected setFecha(datos: any): void {
    // Para convocatorias, la fecha se establece inmediatamente
    this.fecha = new Date();
  }
}

/**
 * Factory para crear instancias de notificaciones
 */
export class NotificacionFactory {
  static crear(
    tipo: TipoNotificacion, 
    emisor: string, 
    destinatario: string
  ): Notificacion {
    switch (tipo) {
      case TipoNotificacion.ASIGNACION:
        return new NotificacionAsignacion(emisor, destinatario);
      
      case TipoNotificacion.CONVOCATORIA:
        return new NotificacionConvocatoria(emisor, destinatario);
      
      default:
        throw new Error(`Tipo de notificación no soportado: ${tipo}`);
    }
  }
}
