import { IPunto} from '@/models/Punto';

/*
DTO define la forma de los datos que se transferirán entre capas 
(p. ej., del backend al frontend). No está vinculado al modelo de 
base de datos y, por lo general, solo incluye los datos que necesita 
el consumidor.
*/

export interface crearAgendaDTO {
  titulo: string;
  puntos: IPunto[];
}