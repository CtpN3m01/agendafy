import { ActaBuilder } from '@/models/ActaBuilder';
import { IActa, ActaModel } from '@/models/Acta';
import { CrearReunionDTO } from '@/types/ReunionDTO';
import { PuntoResponseDTO } from '@/types/PuntoDTO';

/*
La clase ActaRegularBuilder implementa la interfaz ActaBuilder
y proporciona una implementación concreta.
Esta clase se encarga de construir un Acta regular.
*/

export class ActaRegularBuilder implements ActaBuilder {
  private actaData: Partial<IActa> = {};
  private reunion?: CrearReunionDTO;
  private puntos: PuntoResponseDTO[] = [];

  constructor() {
    this.reset();
  }

  setDatos(reunion: CrearReunionDTO, puntos: PuntoResponseDTO[]): void {
    this.reunion = reunion;
    this.puntos = puntos;
  }

  reset(): void {
    this.actaData = {};
    this.reunion = undefined;
    this.puntos = [];
  }

  crearEncabezado(): void {
    if (!this.reunion) return;

    const fecha = new Date(this.reunion.hora_inicio).toLocaleDateString('es-CR');
    const hora = new Date(this.reunion.hora_inicio).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });

    this.actaData.encabezado = 
    `ACTA DE REUNIÓN ${this.reunion.tipo_reunion.toUpperCase()} - ${this.reunion.titulo.toUpperCase()}

    Fecha: ${fecha}
    Hora de inicio: ${hora}
    Lugar: ${this.reunion.lugar}
    Modalidad: ${this.reunion.modalidad}
    Organización: ${this.reunion.organizacion}`;
  }


  crearCuerpo(): void {
    if (!this.reunion || !this.puntos) return;

    let cuerpo = `AGENDA:\n${this.reunion.agenda}\n\n`;
    cuerpo += `PARTICIPANTES (${this.reunion.convocados.length}):\n${this.reunion.convocados.join(', ')}\n\n`;

    cuerpo += `ARTÍCULOS DE LA SESIÓN:\n`;

    this.puntos.forEach((punto, i) => {
      cuerpo += `
      Artículo ${i + 1}. ${punto.titulo}

      Tipo: ${punto.tipo}
      Expositor: ${punto.expositor}
      Duración estimada: ${punto.duracion} minutos
      ${punto.comentarios ? 'Comentarios: ' + punto.comentarios : ''}

      ${punto.votosAFavor !== undefined ? `Votos a favor: ${punto.votosAFavor}\nVotos en contra: ${punto.votosEnContra ?? 0}` : ''}
      ${punto.decisiones ? `Decisiones: ${punto.decisiones.join('; ')}` : ''}
      ------------------------------------------------------------`;
    });

    this.actaData.cuerpo = cuerpo;
  }

  crearPiePagina(): void {
    const fechaGeneracion = new Date().toLocaleDateString('es-CR');
    this.actaData.piePagina = 
    `Acta generada electrónicamente el ${fechaGeneracion}.

    _____________________________
    Presidente del Consejo

    _____________________________
    Secretario(a)
    `;
  }


  obtenerActa(): IActa {
    const acta = new ActaModel(this.actaData);
    this.reset();
    return acta;
  }
}
