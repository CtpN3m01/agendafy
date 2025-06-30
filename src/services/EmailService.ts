// src/services/EmailService.ts
import nodemailer from 'nodemailer';

export class EmailService {
  private transporter;
  private emailConfigured: boolean;

  constructor() {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    
    this.emailConfigured = !!(gmailUser && gmailPassword);
    
    if (this.emailConfigured) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPassword,
        },
      });
    } else {
      console.warn('Email service not configured. Gmail credentials missing in environment variables.');
    }
  }
  async enviarCorreoRecuperacion(email: string, token: string): Promise<void> {
    if (!this.emailConfigured) {
      console.warn('Email service not configured. Skipping email sending.');
      return;
    }

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

    await this.transporter!.sendMail(mailOptions);
  }
  async enviarCorreoBienvenida(email: string, nombre: string): Promise<void> {
    if (!this.emailConfigured) {
      console.warn('Email service not configured. Skipping welcome email.');
      return;
    }

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
        </div>      `,
    };

    await this.transporter!.sendMail(mailOptions);
  }

  /**
   * Envía credenciales temporales a un nuevo miembro
   */
  async enviarCredencialesTemporales(email: string, nombre: string, contrasenasTemporal: string, organizacion: string): Promise<void> {
    if (!this.emailConfigured) {
      console.warn('Email service not configured. Skipping credentials email.');
      return;
    }

    const loginUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/login`;
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Credenciales de Acceso - Agendafy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">Agendafy</h1>
              <p style="color: #666; margin: 5px 0;">Sistema de Gestión de Reuniones</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">¡Bienvenido a la Junta Directiva!</h2>
            
            <p style="color: #333; margin-bottom: 15px;">Hola <strong>${nombre}</strong>,</p>
            
            <p style="color: #333; margin-bottom: 15px;">
              Has sido agregado como miembro de la junta directiva de <strong>${organizacion}</strong> en el sistema Agendafy.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #2563eb;">
              <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">Tus credenciales de acceso:</h3>
              <p style="margin: 10px 0;"><strong>Correo:</strong> ${email}</p>
              <p style="margin: 10px 0;"><strong>Contraseña temporal:</strong> <code style="background-color: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${contrasenasTemporal}</code></p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ Importante:</strong> Esta contraseña es temporal. Te recomendamos cambiarla después de tu primer inicio de sesión por seguridad.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                Iniciar Sesión Ahora
              </a>
            </div>
            
            <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
              <p style="color: #666; font-size: 14px; margin: 5px 0;">
                Si tienes alguna pregunta o problema para acceder, contacta al administrador de tu organización.
              </p>
              <p style="color: #666; font-size: 14px; margin: 5px 0;">
                Si no esperabas este mensaje, por favor ignóralo o contacta a soporte.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await this.transporter!.sendMail(mailOptions);
  }
}