// Tipos para Perfil
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  position?: string;
  department?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para Autenticación
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  organizationCode?: string;
  // Campos para el backend
  nombreUsuario?: string;
  nombre?: string;
  apellidos?: string;
  correo?: string;
  contrasena?: string;
}

export interface RecoveryData {
  email: string;
  // Campo para el backend
  correo?: string;
}

export interface ResetPasswordData {
  token: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    nombreUsuario: string;
    nombre: string;
    apellidos: string;
    correo: string;
  };
  errors?: Record<string, string[]>;
}

// Tipos para Organización
export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size: "small" | "medium" | "large" | "enterprise";
  settings: OrganizationSettings;
  members: OrganizationMember[];
  departments: Department[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  id: string;
  user: UserProfile;
  role: "owner" | "admin" | "manager" | "member";
  department?: string;
  joinedAt: Date;
  status: "active" | "inactive" | "pending";
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  members: string[]; // user IDs
  color?: string;
}

export interface OrganizationSettings {
  allowGuestMeetings: boolean;
  requireApprovalForMeetings: boolean;
  defaultMeetingDuration: number;
  workingHours: WorkingHours;
  timeZone: string;
  branding: BrandingSettings;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
  breaks: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  title?: string;
}

export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  favicon?: string;
}

// Tipos para Reuniones
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: MeetingLocation;
  type: MeetingType;
  status: MeetingStatus;
  organizer: UserProfile;
  attendees: MeetingAttendee[];
  agenda?: AgendaItem[];
  recordings?: MeetingRecording[];
  attachments?: FileAttachment[];
  settings: MeetingSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingLocation {
  type: "physical" | "virtual" | "hybrid";
  address?: string;
  room?: string;
  virtualLink?: string;
  platform?: "zoom" | "teams" | "meet" | "custom";
}

export type MeetingType = "one-on-one" | "team" | "all-hands" | "client" | "interview" | "training";
export type MeetingStatus = "scheduled" | "in-progress" | "completed" | "cancelled" | "postponed";

export interface MeetingAttendee {
  user: UserProfile;
  status: "invited" | "accepted" | "declined" | "tentative" | "no-response";
  role: "organizer" | "presenter" | "attendee" | "optional";
  joinedAt?: Date;
  leftAt?: Date;
}

export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  presenter?: string;
  order: number;
  completed: boolean;
}

export interface MeetingRecording {
  id: string;
  title: string;
  url: string;
  duration: number;
  size: number;
  createdAt: Date;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface MeetingSettings {
  allowRecording: boolean;
  autoRecord: boolean;
  allowScreenShare: boolean;
  allowChat: boolean;
  requirePassword: boolean;
  waitingRoom: boolean;
  muteOnEntry: boolean;
  allowParticipantsToUnmute: boolean;
}

// Tipos para formularios y validación
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  required?: boolean;
}

export interface FormState<T> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string[]>;
}

// Tipos para API responses
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
