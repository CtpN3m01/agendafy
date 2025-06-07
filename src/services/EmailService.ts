import nodemailer from 'nodemailer';

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async enviarCorreoRecuperacion(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Recuperación de Contraseña - Agendafy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Recuperación de Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña en Agendafy.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Restablecer Contraseña
          </a>
          <p style="margin-top: 20px; color: #666;">
            Este enlace expirará en 1 hora por seguridad.
          </p>
          <p style="color: #666;">
            Si no solicitaste este cambio, puedes ignorar este correo.
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async enviarCorreoBienvenida(email: string, nombre: string): Promise<void> {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Bienvenido a Agendafy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">¡Bienvenido a Agendafy, ${nombre}!</h2>
          <p>Tu cuenta ha sido creada exitosamente.</p>
          <p>Ya puedes comenzar a gestionar tus reuniones y agendas.</p>
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/login" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Iniciar Sesión
          </a>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}