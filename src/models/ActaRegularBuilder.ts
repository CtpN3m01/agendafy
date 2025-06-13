import { ActaBuilder } from '@/models/ActaBuilder';
import { IActa, ActaModel } from '@/models/Acta';

import { IAgenda } from '@/models/Agenda';
import { IPunto } from '@/models/Punto';
import { OrganizacionResponseDTO } from '@/types/OrganizacionDTO';
import { CrearReunionDTO } from '../types/ReunionDTO';

/*
La clase ActaRegularBuilder implementa la interfaz ActaBuilder
y proporciona una implementación concreta.
Esta clase se encarga de construir un Acta regular.
*/

export class ActaRegularBuilder implements ActaBuilder {
  private actaData: Partial<IActa> = {};
  private reunion?: CrearReunionDTO;
  private organizacion?: OrganizacionResponseDTO;
  private puntos: IPunto[] = [];
  private agenda?: IAgenda;

  constructor() {
    this.reset();
  }

  setDatos(reunion: CrearReunionDTO, agenda: IAgenda, puntos: IPunto[], organizacion: OrganizacionResponseDTO): void {
    this.reunion = reunion;
    this.puntos = puntos;
    this.organizacion = organizacion;
    this.agenda = agenda;
  }

  reset(): void {
    this.actaData = {};
    this.reunion = undefined;
    this.puntos = [];
    this.organizacion = undefined;
    this.agenda = undefined;
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
    if (!this.reunion || !this.organizacion || !this.agenda) return;

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

    // Participantes con viñetas y marcador para centrar
    const participantes = this.reunion.convocados
      .map(nombre => `*CENTRAR*• ${nombre}`)
      .join('\n');

    this.actaData.paginaInicial = 
    `*CENTRAR*Acta ${this.agenda.nombre}
    ${this.reunion.tipo_reunion.toUpperCase()}

    Sesión ${this.reunion.tipo_reunion.toLowerCase()} realizada el ${fechaTexto}, a la ${horaTexto}, en ${this.reunion.lugar}.
    Organización: ${this.organizacion.nombre}
    Modalidad: ${this.reunion.modalidad}

    Participantes convocados:
    ${participantes}

    Secretari(@) de Actas:
    *CENTRAR*${this.organizacion.usuario.nombre}`;
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
      cuerpo += `\nArtículo ${i + 1}. ${punto.titulo}\n`;

      cuerpo += `Tipo: ${punto.tipo}\n`;
      cuerpo += `Expositor: ${punto.expositor}\n`;
      cuerpo += `Duración estimada: ${punto.duracion} minutos\n`;

      if (punto.anotaciones) {
        cuerpo += `Anotaciones: ${punto.anotaciones}\n`;
      }

      if (punto.detalles) {
        cuerpo += `Detalles: ${punto.detalles}\n`;
      }

      // Condicional por tipo de punto
      const tipo = punto.tipo.toLowerCase();

      if (tipo.includes("aprobación") || tipo.includes("aprobacion")) {
        if (punto.votosAFavor !== undefined) {
          cuerpo += `Votos a favor: ${punto.votosAFavor}\n`;
          cuerpo += `Votos en contra: ${punto.votosEnContra ?? 0}\n`;
        }
      }

      if (tipo.includes("fondo")) {
        if (punto.decisiones && punto.decisiones.length > 0) {
          cuerpo += `Decisiones: ${punto.decisiones.join('; ')}\n`;
        }
      }

      // Línea separadora
      cuerpo += `------------------------------------------------------------\n`;
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
