import { IActa } from '../models/Acta';

/*
La interfaz ActaBuilder define los métodos
que deben implementarse para construir un Acta.
*/

export interface ActaBuilder {
  reset(): void;
  crearEncabezado(): void;
  crearPaginaInicial(): void;
  crearIndicePuntos(): void;
  crearCuerpo(): void;
  crearPaginaFirmas(): void;
  crearPiePagina(): void;
  obtenerActa(): IActa;
}
