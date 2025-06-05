// DTO defines the shape of data that will be transferred between layers (e.g., from the backend to the frontend). 
// It’s not tied to the database model, and usually only includes the data needed by the consumer.

export interface CrearReunionDTO {
    titulo: string;
    organizacion: string;
    hora_inicio: Date;
    hora_fin: Date;
    archivos: string[]; // urls de los archivos
    convocados: string[];
    lugar: string;
    tipo_reunion: 'Extraordinaria' | 'Ordinaria';
    modalidad: 'Presencial' | 'Virtual';
}