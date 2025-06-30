import { 
  CrearNotificacionDTO, 
  NotificacionResponseDTO, 
  ActualizarNotificacionDTO,
  FiltrosNotificacionDTO,
  TipoNotificacion
} from '@/types/NotificacionDTO';
import { NotificacionDAO, INotificacionDAO } from '@/dao/NotificacionDAO';
import { 
  NotificacionFactory, 
  Notificacion 
} from '@/models/NotificacionTemplateMethod';

/**
 * Servicio para el manejo de notificaciones
 * Implementa la lógica de negocio y utiliza el patrón Template Method
 */
export class NotificacionService {
  private notificacionDAO: INotificacionDAO;

  constructor(notificacionDAO: INotificacionDAO = NotificacionDAO) {
    this.notificacionDAO = notificacionDAO;
  }

  /**
   * Crea una notificación usando el patrón Template Method
   */
  async crearNotificacion(
    tipo: TipoNotificacion,
    emisor: string,
    destinatario: string,
    datos: Record<string, unknown>
  ): Promise<NotificacionResponseDTO> {
    try {
      // Validaciones básicas
      this.validarParametrosBasicos(emisor, destinatario);

      // Crear instancia usando Factory
      const notificacion: Notificacion = NotificacionFactory.crear(tipo, emisor, destinatario);
      
      // Procesar la notificación usando Template Method
      const notificacionDTO: CrearNotificacionDTO = await notificacion.procesarNotificacion(datos);
      
      // Persistir en la base de datos
      return await this.notificacionDAO.crear(notificacionDTO);
      
    } catch (error) {
      throw new Error(`Error al crear notificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Crea una notificación de asignación
   */
  async crearNotificacionAsignacion(
    emisor: string,
    destinatario: string,
    datosAsignacion: {
      reunionId: string;
      rolAsignado: string;
      fechaReunion: Date;
    }
  ): Promise<NotificacionResponseDTO> {
    return await this.crearNotificacion(
      TipoNotificacion.ASIGNACION,
      emisor,
      destinatario,
      datosAsignacion
    );
  }

  /**
   * Crea una notificación de convocatoria
   */
  async crearNotificacionConvocatoria(
    emisor: string,
    destinatario: string,
    datosConvocatoria: {
      reunionId: string;
      fechaReunion: Date;
      lugarReunion: string;
      agendaId?: string;
    }
  ): Promise<NotificacionResponseDTO> {
    return await this.crearNotificacion(
      TipoNotificacion.CONVOCATORIA,
      emisor,
      destinatario,
      datosConvocatoria
    );
  }

  /**
   * Crea notificaciones masivas para múltiples destinatarios
   */
  async crearNotificacionesMasivas(
    tipo: TipoNotificacion,
    emisor: string,
    destinatarios: string[],
    datos: Record<string, unknown>
  ): Promise<NotificacionResponseDTO[]> {
    const resultados: NotificacionResponseDTO[] = [];
    const errores: string[] = [];

    for (const destinatario of destinatarios) {
      try {
        const notificacion = await this.crearNotificacion(tipo, emisor, destinatario, datos);
        resultados.push(notificacion);
      } catch (error) {
        errores.push(`Error para ${destinatario}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    if (errores.length > 0 && resultados.length === 0) {
      throw new Error(`Falló la creación de todas las notificaciones: ${errores.join(', ')}`);
    }

    if (errores.length > 0) {
      console.warn(`Algunas notificaciones fallaron: ${errores.join(', ')}`);
    }

    return resultados;
  }

  /**
   * Obtiene notificaciones por destinatario
   */
  async obtenerNotificacionesPorDestinatario(
    destinatario: string,
    filtros?: FiltrosNotificacionDTO
  ): Promise<NotificacionResponseDTO[]> {
    try {
      return await this.notificacionDAO.buscarPorDestinatario(destinatario, filtros);
    } catch (error) {
      throw new Error(`Error al obtener notificaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene notificaciones con paginación
   */
  async obtenerNotificacionesConPaginacion(
    filtros: FiltrosNotificacionDTO
  ): Promise<{
    notificaciones: NotificacionResponseDTO[];
    total: number;
    pagina: number;
    totalPaginas: number;
  }> {
    try {
      return await this.notificacionDAO.buscarConFiltros(filtros);
    } catch (error) {
      throw new Error(`Error al obtener notificaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Marca una notificación como leída
   */
  async marcarComoLeida(id: string): Promise<boolean> {
    try {
      return await this.notificacionDAO.marcarComoLeida(id);
    } catch (error) {
      throw new Error(`Error al marcar notificación como leída: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Marca múltiples notificaciones como leídas
   */
  async marcarVariasComoLeidas(ids: string[]): Promise<number> {
    try {
      return await this.notificacionDAO.marcarVariasComoLeidas(ids);
    } catch (error) {
      throw new Error(`Error al marcar notificaciones como leídas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene el conteo de notificaciones no leídas
   */
  async contarNotificacionesNoLeidas(destinatario: string): Promise<number> {
    try {
      return await this.notificacionDAO.contarNoLeidas(destinatario);
    } catch (error) {
      throw new Error(`Error al contar notificaciones no leídas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene una notificación por ID
   */
  async obtenerNotificacionPorId(id: string): Promise<NotificacionResponseDTO | null> {
    try {
      return await this.notificacionDAO.buscarPorId(id);
    } catch (error) {
      throw new Error(`Error al obtener notificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Actualiza una notificación
   */
  async actualizarNotificacion(
    id: string,
    datos: ActualizarNotificacionDTO
  ): Promise<NotificacionResponseDTO | null> {
    try {
      return await this.notificacionDAO.actualizar(id, datos);
    } catch (error) {
      throw new Error(`Error al actualizar notificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Elimina una notificación
   */
  async eliminarNotificacion(id: string): Promise<boolean> {
    try {
      return await this.notificacionDAO.eliminar(id);
    } catch (error) {
      throw new Error(`Error al eliminar notificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Eliminar todas las notificaciones de un destinatario
   */
  async deleteMany(destinatario: string): Promise<number> {
    try {
      const deletedCount = await this.notificacionDAO.deleteMany(destinatario);
      return deletedCount;
    } catch (error) {
      throw new Error(`Error al eliminar notificaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene notificaciones por tipo
   */
  async obtenerNotificacionesPorTipo(
    tipo: TipoNotificacion,
    filtros?: FiltrosNotificacionDTO
  ): Promise<NotificacionResponseDTO[]> {
    try {
      return await this.notificacionDAO.buscarPorTipo(tipo, filtros);
    } catch (error) {
      throw new Error(`Error al obtener notificaciones por tipo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Validaciones básicas para los parámetros
   */
  private validarParametrosBasicos(emisor: string, destinatario: string): void {
    if (!emisor || !emisor.trim()) {
      throw new Error('El emisor es requerido');
    }

    if (!destinatario || !destinatario.trim()) {
      throw new Error('El destinatario es requerido');
    }

    if (emisor === destinatario) {
      throw new Error('El emisor y destinatario no pueden ser la misma persona');
    }
  }
}

// Instancia singleton del servicio
export const notificacionService = new NotificacionService();
