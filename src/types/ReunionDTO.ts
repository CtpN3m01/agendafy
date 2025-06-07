// DTO defines the shape of data that will be transferred between layers (e.g., from the backend to the frontend). 
// It’s not tied to the database model, and usually only includes the data needed by the consumer.

// If you are using MongoDB, import ObjectId from 'mongodb' or define it as a type alias if needed.
import { ObjectId } from 'mongodb';

export interface CrearReunionDTO {
    _id: string; // ID generado por el cliente
    titulo: string;
    organizacion: string;
    hora_inicio: Date;
    hora_fin: Date;
    archivos: string[]; // urls de los archivos
    convocados: string[];
    lugar: string;
    tipo_reunion: 'Extraordinaria' | 'Ordinaria';
    modalidad: 'Presencial' | 'Virtual';
    agenda: string;
    puntos: ObjectId[];
}