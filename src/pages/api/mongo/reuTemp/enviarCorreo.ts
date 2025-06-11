import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { to, subject, detalles } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Parsear las fechas de inicio y fin
  const horaInicioDate = new Date(detalles.hora_inicio);
  const horaFinDate = new Date(detalles.hora_fin);

  // Formatear fecha como YYYY-MM-DD
  const fecha = horaInicioDate.toISOString().slice(0, 10);

  // Formatear hora como HH:MM (24h)
  const hora_inicio = horaInicioDate.toISOString().slice(11, 16);
  const hora_fin = horaFinDate.toISOString().slice(11, 16);

  // CONSTRUCCION DEL EMAIL
  const subjectList = Array.isArray(subject) ? subject.join(', ') : subject;

  const SUPABASE_BUCKET_URL = process.env.SUPABASE_BUCKET_URL;
  const archivosLinks = (detalles.archivos || [])
    .map((url: string) => {
      const filename = url.split('/').pop();
      const fullUrl = `${SUPABASE_BUCKET_URL}${url}`;
      return `<a href="${fullUrl}">${filename}</a>`;
    })
    .join(', ');

  const text = `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2 style="color: #1976d2;">Invitación a reunión</h2>
      <p>Se te ha convocado a una reunión con los siguientes detalles:</p>
      <table style="border-collapse: collapse;">
        <tr>
          <td style="font-weight: bold; padding: 4px 8px;">Título:</td>
          <td style="padding: 4px 8px;">${detalles.titulo}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 4px 8px;">Fecha:</td>
          <td style="padding: 4px 8px;">${fecha}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 4px 8px;">Hora de inicio:</td>
          <td style="padding: 4px 8px;">${hora_inicio}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 4px 8px;">Hora de fin:</td>
          <td style="padding: 4px 8px;">${hora_fin}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 4px 8px;">Tipo:</td>
          <td style="padding: 4px 8px;">${detalles.tipo_reunion || '-'}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 4px 8px;">Modalidad:</td>
          <td style="padding: 4px 8px;">${detalles.modalidad || '-'}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 4px 8px;">Lugar:</td>
          <td style="padding: 4px 8px;">${detalles.lugar}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 4px 8px;">Archivos adjuntos:</td>
          <td style="padding: 4px 8px;">${detalles.archivos && detalles.archivos.length ? archivosLinks : 'Ninguno'}</td>
        </tr>
      </table>
    </div>
  `;

  // {
  //  "to": "johndoe@email.com, dev.john@email.com",
  //  "subject": "Mailgun + Next.js + TypeScript",
  //  "text": "This is a test email sent from your app!"
  // }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject: subjectList,
      html: text,
    };

    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent', info });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error });
  }
}
