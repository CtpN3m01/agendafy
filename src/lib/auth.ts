import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_CONFIG } from './jwt-config';

export interface JWTPayload {
  userId: string;
  email: string;
  nombreUsuario: string;
  type?: 'usuario' | 'miembro'; // Para distinguir entre Usuario y Persona
  rol?: string; // Para el rol de la persona
  organizacion?: string; // Para la organización de la persona
}

export class AuthUtil {
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_CONFIG.SECRET, { expiresIn: JWT_CONFIG.EXPIRES_IN });
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_CONFIG.SECRET) as JWTPayload;
    } catch {
      return null;
    }
  }

  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static getResetTokenExpiration(): Date {
    return new Date(Date.now() + 3600000); // 1 hora
  }
}