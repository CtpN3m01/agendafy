/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotificacionModel, INotificacion } from '@/models/Notificacion';
import { 
  CrearNotificacionDTO, 
  ActualizarNotificacionDTO, 
  NotificacionResponseDTO,
  FiltrosNotificacionDTO,
  TipoNotificacion
} from '@/types/NotificacionDTO';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

/**
 * Interface que define las operaciones del DAO de notificaciones
 */
export interface INotificacionDAO {
  crear(notificacion: CrearNotificacionDTO): Promise<NotificacionResponseDTO>;
  buscarPorId(id: string): Promise<NotificacionResponseDTO | null>;
  buscarPorDestinatario(destinatario: string, filtros?: FiltrosNotificacionDTO): Promise<NotificacionResponseDTO[]>;
  buscarPorEmisor(emisor: string, filtros?: FiltrosNotificacionDTO): Promise<NotificacionResponseDTO[]>;
  buscarPorTipo(tipo: TipoNotificacion, filtros?: FiltrosNotificacionDTO): Promise<NotificacionResponseDTO[]>;
  actualizar(id: string, datos: ActualizarNotificacionDTO): Promise<NotificacionResponseDTO | null>;
  marcarComoLeida(id: string): Promise<boolean>;
  marcarComoNoLeida(id: string): Promise<boolean>;
  marcarVariasComoLeidas(ids: string[]): Promise<number>;
  eliminar(id: string): Promise<boolean>;
  contarNoLeidas(destinatario: string): Promise<number>;
  buscarConFiltros(filtros: FiltrosNotificacionDTO): Promise<{
    notificaciones: NotificacionResponseDTO[];
    total: number;
    pagina: number;
    totalPaginas: number;
  }>;
}

/**
 * Implementación del DAO de notificaciones
 */
export class NotificacionDAOImpl implements INotificacionDAO {
  
  /**
   * Conecta a la base de datos antes de realizar operaciones
   */
  private async ensureConnection(): Promise<void> {
    await connectToDatabase();
  }

  /**
   * Convierte un documento de MongoDB a DTO de respuesta
   */
  private toResponseDTO(doc: INotificacion): NotificacionResponseDTO {
    return {
      id: doc._id.toString(),
      emisor: doc.emisor,
      destinatario: doc.destinatario,
      asunto: doc.asunto,
      contenido: doc.contenido,
      fecha: doc.fecha,
      leida: doc.leida,
      tipo: doc.tipo,
      datosAdicionales: doc.datosAdicionales,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  /**
   * Construye el filtro de consulta basado en los parámetros
   */
  private buildFilter(filtros: FiltrosNotificacionDTO): any {
    const filter: any = {};

    if (filtros.destinatario) {
      filter.destinatario = filtros.destinatario;
    }

    if (filtros.emisor) {
      filter.emisor = filtros.emisor;
    }

    if (filtros.tipo) {
      filter.tipo = filtros.tipo;
    }

    if (filtros.leida !== undefined) {
      filter.leida = filtros.leida;
    }

    if (filtros.fechaDesde || filtros.fechaHasta) {
      filter.fecha = {};
      if (filtros.fechaDesde) {
        filter.fecha.$gte = filtros.fechaDesde;
      }
      if (filtros.fechaHasta) {
        filter.fecha.$lte = filtros.fechaHasta;
      }
    }

    return filter;
  }

  async crear(notificacion: CrearNotificacionDTO): Promise<NotificacionResponseDTO> {
    await this.ensureConnection();
    
    const nuevaNotificacion = new NotificacionModel({
      emisor: notificacion.emisor,
      destinatario: notificacion.destinatario,
      asunto: notificacion.asunto,
      contenido: notificacion.contenido,
      tipo: notificacion.tipo,
      datosAdicionales: notificacion.datosAdicionales || {}
    });

    const savedNotificacion = await nuevaNotificacion.save();
    return this.toResponseDTO(savedNotificacion);
  }

  async buscarPorId(id: string): Promise<NotificacionResponseDTO | null> {
    await this.ensureConnection();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const notificacion = await NotificacionModel.findById(id).exec();
    return notificacion ? this.toResponseDTO(notificacion) : null;
  }

  async buscarPorDestinatario(
    destinatario: string, 
    filtros: FiltrosNotificacionDTO = {}
  ): Promise<NotificacionResponseDTO[]> {
    await this.ensureConnection();
    
    const filter = this.buildFilter({ ...filtros, destinatario });
    
    const notificaciones = await NotificacionModel
      .find(filter)
      .sort({ fecha: -1 })
      .limit(filtros.limite || 50)
      .exec();

    return notificaciones.map(doc => this.toResponseDTO(doc));
  }

  async buscarPorEmisor(
    emisor: string, 
    filtros: FiltrosNotificacionDTO = {}
  ): Promise<NotificacionResponseDTO[]> {
    await this.ensureConnection();
    
    const filter = this.buildFilter({ ...filtros, emisor });
    
    const notificaciones = await NotificacionModel
      .find(filter)
      .sort({ fecha: -1 })
      .limit(filtros.limite || 50)
      .exec();

    return notificaciones.map(doc => this.toResponseDTO(doc));
  }

  async buscarPorTipo(
    tipo: TipoNotificacion, 
    filtros: FiltrosNotificacionDTO = {}
  ): Promise<NotificacionResponseDTO[]> {
    await this.ensureConnection();
    
    const filter = this.buildFilter({ ...filtros, tipo });
    
    const notificaciones = await NotificacionModel
      .find(filter)
      .sort({ fecha: -1 })
      .limit(filtros.limite || 50)
      .exec();

    return notificaciones.map(doc => this.toResponseDTO(doc));
  }

  async actualizar(
    id: string, 
    datos: ActualizarNotificacionDTO
  ): Promise<NotificacionResponseDTO | null> {
    await this.ensureConnection();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const notificacionActualizada = await NotificacionModel
      .findByIdAndUpdate(
        id, 
        { ...datos, updatedAt: new Date() }, 
        { new: true, runValidators: true }
      )
      .exec();

    return notificacionActualizada ? this.toResponseDTO(notificacionActualizada) : null;
  }

  async marcarComoLeida(id: string): Promise<boolean> {
    await this.ensureConnection();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await NotificacionModel
      .updateOne(
        { _id: id }, 
        { leida: true, updatedAt: new Date() }
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async marcarComoNoLeida(id: string): Promise<boolean> {
    await this.ensureConnection();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await NotificacionModel
      .updateOne(
        { _id: id }, 
        { leida: false, updatedAt: new Date() }
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async marcarVariasComoLeidas(ids: string[]): Promise<number> {
    await this.ensureConnection();
    
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return 0;
    }

    const result = await NotificacionModel
      .updateMany(
        { _id: { $in: validIds } }, 
        { leida: true, updatedAt: new Date() }
      )
      .exec();

    return result.modifiedCount;
  }

  async eliminar(id: string): Promise<boolean> {
    await this.ensureConnection();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await NotificacionModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async contarNoLeidas(destinatario: string): Promise<number> {
    await this.ensureConnection();
    
    return await NotificacionModel
      .countDocuments({ destinatario, leida: false })
      .exec();
  }

  async buscarConFiltros(filtros: FiltrosNotificacionDTO): Promise<{
    notificaciones: NotificacionResponseDTO[];
    total: number;
    pagina: number;
    totalPaginas: number;
  }> {
    await this.ensureConnection();
    
    const filter = this.buildFilter(filtros);
    const limite = filtros.limite || 20;
    const pagina = filtros.pagina || 1;
    const skip = (pagina - 1) * limite;

    const [notificaciones, total] = await Promise.all([
      NotificacionModel
        .find(filter)
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limite)
        .exec(),
      NotificacionModel.countDocuments(filter).exec()
    ]);

    const totalPaginas = Math.ceil(total / limite);

    return {
      notificaciones: notificaciones.map(doc => this.toResponseDTO(doc)),
      total,
      pagina,
      totalPaginas
    };
  }
}

// Instancia singleton del DAO
export const NotificacionDAO = new NotificacionDAOImpl();
