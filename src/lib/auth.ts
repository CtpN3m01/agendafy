import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-aqui';

export interface JWTPayload {
  userId: string;
  email: string;
  nombreUsuario: string;
}

export class AuthUtil {
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
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