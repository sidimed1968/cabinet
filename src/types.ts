export type UserRole = 'patient' | 'doctor';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  role: UserRole;
  dateOfBirth?: string;
  address?: string;
  createdAt: string;
  
  // Patient specific
  ddr?: string; // Date des Dernières Règles (YYYY-MM-DD)
  bloodGroup?: string;
  emergencyContact?: string;
}

export type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';

export type AppointmentType = 
  | 'consultation_gyn' // Consultation Gynécologique
  | 'echo_obstetrique' // Échographie Obstétrique
  | 'echo_pelvienne'   // Échographie Pelvienne
  | 'suivi_grossesse'  // Suivi de Grossesse
  | 'planning_familial'// Planning Familial
  | 'post_partum'      // Post-Partum
  | 'urgence';         // Urgence

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  doctorId: string;
  doctorName?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm (e.g. "09:00")
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  reminderSent?: boolean;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  ddr?: string; // Date des Dernières Règles
  saCalculated?: number; // Semaines d'Aménorrhée
  gestationalAgeText?: string;
  gravida?: number; // Nombre de grossesses (G)
  para?: number;    // Nombre d'accouchements (P)
  abortions?: number; // Avortements (A)
  livingChildren?: number; // Enfants vivants (EV)
  medicalHistory?: string; // Antécédents médicaux
  surgicalHistory?: string; // Antécédents chirurgicaux
  gynecoHistory?: string; // Antécédents gynécologiques
  allergies?: string;
  generalNotes?: string;
  updatedAt: string;
}

export type UltrasoundType = 'datation' | 'morphologique_t1' | 'morphologique_t2' | 'morphologique_t3' | 'pelvienne' | 'suivi_croissance';

export interface UltrasoundRecord {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  date: string; // YYYY-MM-DD
  type: UltrasoundType;
  sa?: number; // SA constatées
  lccMm?: number; // Longueur Cranio-Caudale
  bipMm?: number; // Diamètre Bipariétal
  lfMm?: number;  // Longueur Fémorale
  datMm?: number; // Diamètre Abdominal Transverse
  cardiacActivity?: 'presente' | 'absente' | 'non_evaluee';
  heartRateBpm?: number;
  amnioticFluid?: 'normal' | 'oligo' | 'poly' | 'non_evalue';
  placentaLocation?: string; // ex: Antérieur, Postérieur, Previa
  fetalWeightGrams?: number;
  conclusion: string;
  images?: string[]; // URLs or base64 previews
  doctorNotes?: string;
  createdAt: string;
}

export interface PrescriptionItem {
  medicationName: string;
  dosage: string; // ex: 500mg
  frequency: string; // ex: 2 fois par jour
  duration: string; // ex: 7 jours
  instructions?: string; // ex: Pendant les repas
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  appointmentId?: string;
  date: string; // YYYY-MM-DD
  medications: PrescriptionItem[];
  generalInstructions?: string;
  doctorName: string;
  createdAt: string;
}

export interface ScheduleBlock {
  id: string;
  date: string; // YYYY-MM-DD
  blockedSlots: string[]; // HH:mm slots blocked
  isFullDayOff?: boolean;
  reason?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'confirmation' | 'cancellation' | 'medical_update';
  date: string;
  read: boolean;
  appointmentId?: string;
}
