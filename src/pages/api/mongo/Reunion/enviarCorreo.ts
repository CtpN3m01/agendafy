import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { to, subject, detalles } = req.body;
  // detalles = {
  //   "fecha": "2023-10-01",
  //   "hora_inicio": "10:00",
  //   "hora_fin": "11:00",
  //   "lugar": "Sala de reuniones 1",
  //   "titulo": "Reunión para discutir el proyecto X"
  // }

  const text = "Se te ha convocado a una reunion con los siguientes detalles:\n\n"
    // `Fecha: ${detalles.fecha}\n` +
    // `Hora de inicio: ${detalles.hora_inicio}\n`
  
  

  // {
  //  "to": "johndoe@email.com, dev.john@email.com",
  //  "subject": "Mailgun + Next.js + TypeScript",
  //  "text": "This is a test email sent from your app!"
  // }

  if (!to || !subject) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

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
      subject,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent', info });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error });
  }
}
