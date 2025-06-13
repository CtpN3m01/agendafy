import { UserProfile } from "@/types";

interface AuthUser {
  id: string;
  nombreUsuario: string;
  nombre: string;
  apellidos: string;
  correo: string;
}

/**
 * Convierte los datos del usuario autenticado al formato UserProfile
 */
export function mapAuthUserToProfile(authUser: AuthUser): UserProfile {
  const now = new Date();
  return {
    id: authUser.id,
    name: `${authUser.nombre} ${authUser.apellidos}`,
    email: authUser.correo,
    avatar: undefined,
    phone: "",
    position: "",
    department: "",
    bio: "",
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Extrae el nombre y apellidos del nombre completo
 */
export function parseFullName(fullName: string): { nombre: string; apellidos: string } {
  const parts = fullName.trim().split(' ');
  const nombre = parts[0] || '';
  const apellidos = parts.slice(1).join(' ') || '';
  return { nombre, apellidos };
}

/**
 * Convierte los datos del perfil actualizado al formato de AuthUser
 */
export function mapProfileToAuthUser(profile: UserProfile, currentAuthUser: AuthUser): AuthUser {
  const { nombre, apellidos } = parseFullName(profile.name);
  
  return {
    ...currentAuthUser,
    nombre,
    apellidos,
    correo: profile.email
  };
}
