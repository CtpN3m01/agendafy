import { CrearPuntoDTO } from './PuntoDTO';

export interface CrearAgendaDTO {
  titulo: string;
  puntos: CrearPuntoDTO[];
}