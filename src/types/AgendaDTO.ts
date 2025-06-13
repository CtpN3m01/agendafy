/*
DTO define la forma de los datos que se transferirán entre capas 
(p. ej., del backend al frontend). No está vinculado al modelo de 
base de datos y, por lo general, solo incluye los datos que necesita 
el consumidor.
*/

import mongoose from 'mongoose';

export interface CrearAgendaDTO {
    nombre: string;
    organizacion: mongoose.Types.ObjectId; // Referencia a organización
    puntos?: mongoose.Types.ObjectId[]; // Lista de referencias a puntos (opcional)
    reuniones?: mongoose.Types.ObjectId[]; // Lista de referencias a reuniones (opcional)
}

export interface ActualizarAgendaDTO {
    nombre?: string;
    organizacion?: mongoose.Types.ObjectId;
    puntos?: mongoose.Types.ObjectId[];
    reuniones?: mongoose.Types.ObjectId[];
}

export interface AgregarPuntoDTO {
    agendaId: mongoose.Types.ObjectId;
    puntoId: mongoose.Types.ObjectId;
}

export interface AgregarReunionDTO {
    agendaId: mongoose.Types.ObjectId;
    reunionId: mongoose.Types.ObjectId;
}