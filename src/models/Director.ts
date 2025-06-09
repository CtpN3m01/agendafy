import { ActaBuilder } from '@/models/ActaBuilder';
import { IActa } from '@/models/Acta';

/*
Director es una clase que se encarga de construir un Acta completa utilizando un ActaBuilder.
El Director utiliza el ActaBuilder para crear las diferentes partes del Acta:
- Encabezado
- Cuerpo
- Pie de página
El Director puede cambiar el ActaBuilder en cualquier momento, permitiendo flexibilidad en la construcción del Acta.
*/

export class Director {
  private builder: ActaBuilder;

  constructor(builder: ActaBuilder) {
    this.builder = builder;
  }

  setBuilder(builder: ActaBuilder): void {
    this.builder = builder;
  }

  buildActaCompleta(): IActa {
    this.builder.crearEncabezado();
    this.builder.crearCuerpo();
    this.builder.crearPiePagina();
    return this.builder.obtenerActa();
  }
}
