import { ObjectId } from 'mongodb'; // Importa ObjectId de MongoDB

/*
DTO define la forma de los datos que se transferirán entre capas 
(p. ej., del backend al frontend). No está vinculado al modelo de 
base de datos y, por lo general, solo incluye los datos que necesita 
el consumidor.
*/

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