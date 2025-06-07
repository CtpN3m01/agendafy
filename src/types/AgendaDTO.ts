import { CrearPuntoDTO } from './PuntoDTO';

export interface CrearAgendaDTO {
  titulo: string;
  puntos: string[]; // IDs de los puntos
}