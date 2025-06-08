import { ActaBuilder } from '@/models/ActaBuilder';
import { IActa, ActaModel } from '@/models/Acta';

/*
La clase ActaRegularBuilder implementa la interfaz ActaBuilder
y proporciona una implementación concreta.
Esta clase se encarga de construir un Acta regular.
*/

export class ActaRegularBuilder implements ActaBuilder {
  private actaData: Partial<IActa> = {};

  constructor() {
    this.reset();
  }

  reset(): void {
    this.actaData = {};
  }

  crearEncabezado(): void {
    this.actaData.encabezado = 'Acta de reunión ordinaria';
  }

  crearCuerpo(): void {
    this.actaData.cuerpo = 'Cuerpo detallado con los puntos tratados.';
  }

  crearPiePagina(): void {
    this.actaData.piePagina = 'Firmas y fecha de la reunión.';
  }

  obtenerActa(): IActa {
    const acta = new ActaModel(this.actaData);
    this.reset();
    return acta;
  }
}
