import mongoose, { Schema, Document } from 'mongoose';
import { TipoNotificacion } from '@/types/NotificacionDTO';

// Interfaz base para el documento de notificación
export interface INotificacion extends Document {
  _id: mongoose.Types.ObjectId;
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

// Schema base para notificaciones
const NotificacionSchema = new Schema<INotificacion>({
  emisor: {
    type: String,
    required: true,
    trim: true
  },
  destinatario: {
    type: String,
    required: true,
    trim: true
  },
  asunto: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  contenido: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  leida: {
    type: Boolean,
    default: false
  },
  tipo: {
    type: String,
    enum: Object.values(TipoNotificacion),
    required: true
  },
  datosAdicionales: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'notificaciones'
});

// Índices para optimizar consultas
NotificacionSchema.index({ destinatario: 1, fecha: -1 });
NotificacionSchema.index({ emisor: 1, fecha: -1 });
NotificacionSchema.index({ tipo: 1, fecha: -1 });
NotificacionSchema.index({ leida: 1, destinatario: 1 });

export const NotificacionModel = mongoose.models.Notificacion || 
  mongoose.model<INotificacion>('Notificacion', NotificacionSchema);
