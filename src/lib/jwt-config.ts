// Configuración centralizada para JWT
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'agendafy-jwt-secret-key-2025-super-secure',
  EXPIRES_IN: '7d'
} as const;
