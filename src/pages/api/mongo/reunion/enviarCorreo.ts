import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

interface Punto {
  duracion: number;
  titulo: string;
  tipo: string;
  expositor: string;
}

interface Convocado {
  nombre: string;
  correo: string;
  esMiembro: boolean;
}

interface EmailDetalles {
  titulo: string;
  hora_inicio: string;
  hora_fin?: string;
  lugar: string;
  tipo_reunion: string;
  modalidad: string;
  archivos: string[];
  agenda: string;
  puntos: Punto[];
  convocados: Convocado[];
  organizacionId: string; // Added organization ID
}

interface EmailRequest {
  to: string[];
  subject: string;
  detalles: EmailDetalles;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, subject, detalles }: EmailRequest = req.body;

  // Validar campos requeridos
  if (!to || !Array.isArray(to) || to.length === 0) {
    return res.status(400).json({ message: 'Campo "to" es requerido y debe ser un array de emails' });
  }

  if (!subject) {
    return res.status(400).json({ message: 'Campo "subject" es requerido' });
  }

  if (!detalles || !detalles.titulo || !detalles.hora_inicio || !detalles.lugar) {
    return res.status(400).json({ message: 'Campos requeridos en detalles: titulo, hora_inicio, lugar' });
  }

  if (!detalles.organizacionId) {
    return res.status(400).json({ message: 'Campo "organizacionId" es requerido en detalles' });
  }

  try {
    // Parsear las fechas de inicio y fin
    const horaInicioDate = new Date(detalles.hora_inicio);
    const horaFinDate = detalles.hora_fin ? new Date(detalles.hora_fin) : null;

    // Validar que las fechas sean válidas
    if (isNaN(horaInicioDate.getTime())) {
      return res.status(400).json({ message: 'Formato de fecha inválido en hora_inicio' });
    }

    if (detalles.hora_fin && horaFinDate && isNaN(horaFinDate.getTime())) {
      return res.status(400).json({ message: 'Formato de fecha inválido en hora_fin' });
    }

    // Formatear fecha y horas
    const fecha = horaInicioDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const hora_inicio = horaInicioDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const hora_fin = horaFinDate ? horaFinDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) : null;

    // Construir enlaces de archivos con el ID de la organización
    const SUPABASE_BUCKET_URL = process.env.SUPABASE_BUCKET_URL;
    const archivosLinks = (detalles.archivos || [])
      .map((url: string) => {
        const filename = url.split('/').pop();
        // Construct URL with organization ID: supabaseUrl/orgID/filename
        const fullUrl = `${SUPABASE_BUCKET_URL}/${detalles.organizacionId}/${filename}`;
        return `<li><a href="${fullUrl}" style="color: #1976d2; text-decoration: none;">${filename}</a></li>`;
      })
      .join('');

    // Construir lista de puntos de la agenda
    const puntosHtml = (detalles.puntos || [])
      .map((punto: Punto, index: number) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${index + 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${punto.titulo}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${punto.tipo}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${punto.expositor || '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${punto.duracion} min</td>
        </tr>
      `).join('');

    // Construir lista de convocados
    const convocadosHtml = (detalles.convocados || [])
      .map((convocado: Convocado) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${convocado.nombre}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${convocado.correo}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">
            <span style="color: ${convocado.esMiembro ? '#4caf50' : '#ff9800'}; font-weight: bold;">
              ${convocado.esMiembro ? 'Miembro' : 'Invitado'}
            </span>
          </td>
        </tr>
      `).join('');

    // Construcción del HTML del email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto;">
        <div style="background-color: #1976d2; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">📅 Convocatoria a Reunión</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f5f5f5;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            Estimado/a participante,<br>
            Se le convoca a la siguiente reunión:
          </p>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1976d2; margin-top: 0;">📋 Detalles de la Reunión</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="font-weight: bold; padding: 8px; width: 30%; background-color: #f8f9fa;">Título:</td>
                <td style="padding: 8px;">${detalles.titulo}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding: 8px; background-color: #f8f9fa;">Fecha:</td>
                <td style="padding: 8px;">${fecha}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding: 8px; background-color: #f8f9fa;">Hora de inicio:</td>
                <td style="padding: 8px;">${hora_inicio}</td>
              </tr>
              ${hora_fin ? `
              <tr>
                <td style="font-weight: bold; padding: 8px; background-color: #f8f9fa;">Hora de fin:</td>
                <td style="padding: 8px;">${hora_fin}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="font-weight: bold; padding: 8px; background-color: #f8f9fa;">Tipo de reunión:</td>
                <td style="padding: 8px;">${detalles.tipo_reunion}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding: 8px; background-color: #f8f9fa;">Modalidad:</td>
                <td style="padding: 8px;">${detalles.modalidad}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding: 8px; background-color: #f8f9fa;">Lugar:</td>
                <td style="padding: 8px;">${detalles.lugar}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding: 8px; background-color: #f8f9fa;">Agenda:</td>
                <td style="padding: 8px;">${detalles.agenda || 'No especificada'}</td>
              </tr>
            </table>
          </div>

          ${detalles.archivos && detalles.archivos.length > 0 ? `
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #1976d2; margin-top: 0;">📎 Archivos Adjuntos</h3>
            <ul style="list-style: none; padding: 0;">
              ${archivosLinks}
            </ul>
          </div>
          ` : ''}

          ${detalles.puntos && detalles.puntos.length > 0 ? `
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #1976d2; margin-top: 0;">📝 Puntos a Tratar</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">#</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Título</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Tipo</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Expositor</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Duración</th>
                </tr>
              </thead>
              <tbody>
                ${puntosHtml}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${detalles.convocados && detalles.convocados.length > 0 ? `
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #1976d2; margin-top: 0;">👥 Lista de Convocados</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Nombre</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Correo</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Estado</th>
                </tr>
              </thead>
              <tbody>
                ${convocadosHtml}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #1976d2;">
            <p style="margin: 0; font-style: italic; color: #1565c0;">
              📧 Por favor, confirme su asistencia respondiendo a este correo.
            </p>
          </div>
        </div>

        <div style="background-color: #37474f; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Este es un correo automático generado por el sistema de gestión de reuniones.</p>
        </div>
      </div>
    `;

    // Configurar y enviar el email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to.join(', '),
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: 'Email enviado exitosamente',
      info: {
        messageId: info.messageId,
        recipients: to.length,
        subject: subject
      }
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      message: 'Error al enviar el correo', 
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
