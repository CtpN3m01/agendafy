import { ActaBuilder } from '../models/ActaBuilder';
import { IActa, ActaModel } from '../models/Acta';

import { CrearReunionDTO } from '../types/ReunionDTO';
import { PuntoResponseDTO } from '../types/PuntoDTO';
import { OrganizacionResponseDTO } from '../types/OrganizacionDTO';

/*
La clase ActaRegularBuilder implementa la interfaz ActaBuilder
y proporciona una implementación concreta.
Esta clase se encarga de construir un Acta regular.
*/

export class ActaRegularBuilder implements ActaBuilder {
  private actaData: Partial<IActa> = {};
  private reunion?: CrearReunionDTO;
  private organizacion?: OrganizacionResponseDTO;
  private puntos: PuntoResponseDTO[] = [];

  constructor() {
    this.reset();
  }

  setDatos(reunion: CrearReunionDTO, puntos: PuntoResponseDTO[], organizacion: OrganizacionResponseDTO): void {
    this.reunion = reunion;
    this.puntos = puntos;
    this.organizacion = organizacion;
  }

  reset(): void {
    this.actaData = {};
    this.reunion = undefined;
    this.puntos = [];
    this.organizacion = undefined;
  }

  crearEncabezado(): void {
    if (!this.organizacion) return;

    const { nombre, logo } = this.organizacion;

    this.actaData.encabezado = 
    `${nombre.toUpperCase()}
    ${logo ? `[Logo: ${logo}]` : ''}`.trim();
    this.actaData.logo = logo || '';
  }

  crearPaginaInicial(): void {
    if (!this.reunion || !this.organizacion) return;

    const fecha = new Date(this.reunion.hora_inicio);
    const fechaTexto = fecha.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const horaTexto = fecha.toLocaleTimeString('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const participantes = this.reunion.convocados.join('\n');

    this.actaData.paginaInicial = 
    `ACTA ${this.reunion.titulo.toUpperCase()}
    ${this.reunion.tipo_reunion.toUpperCase()}

    Sesión ${this.reunion.tipo_reunion.toLowerCase()} realizada el ${fechaTexto}, a la ${horaTexto}, en ${this.reunion.lugar}.
    Organización: ${this.organizacion.nombre}
    Modalidad: ${this.reunion.modalidad}

    Participantes convocados:
    ${participantes}

    Secretaria de Actas: \n
    \t\t\t ${this.organizacion.usuario.nombre}`;
  }

  crearIndicePuntos(): void {
    if (!this.reunion || !this.puntos || !this.organizacion) return;

    let indice = `AGENDA DE PUNTOS CONSULTADOS\n\n`;

    this.puntos.forEach((punto, index) => {
      indice += `${index + 1}. ${punto.titulo}\n`;
    });

    indice += `\n\n\n`;

    const horaInicio = new Date(this.reunion.hora_inicio).toLocaleTimeString('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Buscar al presidente
    const presidente = this.organizacion.miembros.find(m => m.rol?.toLowerCase() === 'presidente');

    const nombrePresidente = presidente?.nombre ?? '________________';
    const nombreOrg = this.organizacion.nombre;

    indice += `Hora de inicio: ${horaInicio}\n\n`;
    indice += `El presidente ${nombrePresidente}, quien preside el Consejo de la organización "${nombreOrg}", procede a dar la bienvenida a los miembros del consejo.`;

    this.actaData.indicePuntos = indice;
  }

  crearCuerpo(): void {
    if (!this.reunion || !this.puntos) return;

    let cuerpo = `ARTÍCULOS DE LA SESIÓN:\n`;

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

  crearPaginaFirmas(): void {
    if (!this.organizacion) return;

    const fechaGeneracion = new Date().toLocaleDateString('es-CR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const presidente = this.organizacion.miembros.find(
      m => m.rol?.trim().toLowerCase() === 'presidente'
    );
    const nombrePresidente = presidente?.nombre ?? '________________';
    const nombreSecretario = this.organizacion.usuario?.nombre ?? '________________';
    
    this.actaData.paginaFirmas =
      `Presidente del Consejo - ${nombrePresidente}\n` +
      `Secretario(a) - ${nombreSecretario}\n` +
      `Acta generada electrónicamente el ${fechaGeneracion}`;
  }

  crearPiePagina(): void {
    if (!this.organizacion) return;

    const { usuario, telefono } = this.organizacion;

    this.actaData.piePagina =
    `     ${usuario.nombre}
     ${usuario.correo}
     ${telefono}`;
  }

  obtenerActa(): IActa {
    const acta = new ActaModel(this.actaData);
    this.reset();
    return acta;
  }
}
