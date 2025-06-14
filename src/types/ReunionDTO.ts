/*
DTO define la forma de los datos que se transferirán entre capas 
(p. ej., del backend al frontend). No está vinculado al modelo de 
base de datos y, por lo general, solo incluye los datos que necesita 
el consumidor.
*/

import mongoose from 'mongoose';

export interface ConvocadoDTO {
    nombre: string;
    correo: string;
    esMiembro: boolean;
}

export interface CrearReunionDTO {
    _id: mongoose.Types.ObjectId; // ID generado por el cliente
    titulo: string;
    organizacion: mongoose.Types.ObjectId;
    hora_inicio: Date;
    hora_fin: Date;
    archivos: string[]; // urls de los archivos
    convocados: ConvocadoDTO[];
    lugar: string;
    tipo_reunion: 'Extraordinaria' | 'Ordinaria';
    modalidad: 'Presencial' | 'Virtual';
    agenda: mongoose.Types.ObjectId;
}