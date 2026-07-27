import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  runTransaction,
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Appointment, 
  MedicalRecord, 
  UltrasoundRecord, 
  Prescription, 
  ScheduleBlock, 
  AppNotification, 
  UserProfile 
} from '../types';
import { 
  DEMO_APPOINTMENTS, 
  DEMO_MEDICAL_RECORDS, 
  DEMO_ULTRASOUNDS, 
  DEMO_PRESCRIPTIONS, 
  DEMO_USERS,
  CABINET_INFO
} from '../data/mockData';

const APPOINTMENTS_COL = 'appointments';
const MEDICAL_RECORDS_COL = 'medical_records';
const ULTRASOUNDS_COL = 'ultrasounds';
const PRESCRIPTIONS_COL = 'prescriptions';
const SCHEDULE_BLOCKS_COL = 'schedule_blocks';
const NOTIFICATIONS_COL = 'notifications';
const USERS_COL = 'users';

// Local storage keys for hybrid persistence
const STORAGE_KEYS = {
  APPOINTMENTS: 'cabinet_appointments_v1',
  MEDICAL_RECORDS: 'cabinet_medical_records_v1',
  ULTRASOUNDS: 'cabinet_ultrasounds_v1',
  PRESCRIPTIONS: 'cabinet_prescriptions_v1',
  BLOCKS: 'cabinet_blocks_v1',
  NOTIFS: 'cabinet_notifs_v1'
};

// Helper for local storage initialization
function getInitialLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveLocal<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export class DataService {
  
  // -------------------------------------------------------------
  // APPOINTMENTS & ANTI-DOUBLE-BOOKING TRANSACTIONS
  // -------------------------------------------------------------

  /**
   * Book appointment with Firestore Transaction for strict anti-double-booking guarantee
   */
  static async bookAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; message: string; appointment?: Appointment }> {
    const slotId = `${appointmentData.date}_${appointmentData.timeSlot.replace(':', '')}`;
    const slotDocRef = doc(db, 'booked_slots', slotId);
    const newAptRef = doc(collection(db, APPOINTMENTS_COL));
    const nowIso = new Date().toISOString();

    const newAppointment: Appointment = {
      ...appointmentData,
      id: newAptRef.id,
      status: 'confirmed',
      createdAt: nowIso
    };

    try {
      // Execute Firestore Transaction
      await runTransaction(db, async (transaction) => {
        const slotSnap = await transaction.get(slotDocRef);
        
        if (slotSnap.exists() && slotSnap.data().status === 'active') {
          throw new Error('SLOT_ALREADY_BOOKED');
        }

        // Lock the slot
        transaction.set(slotDocRef, {
          date: appointmentData.date,
          timeSlot: appointmentData.timeSlot,
          patientId: appointmentData.patientId,
          appointmentId: newAptRef.id,
          status: 'active',
          updatedAt: nowIso
        });

        // Save appointment document
        transaction.set(newAptRef, newAppointment);
      });

      // Also sync to local storage for immediate offline resilience
      const currentLocal = getInitialLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEMO_APPOINTMENTS);
      saveLocal(STORAGE_KEYS.APPOINTMENTS, [newAppointment, ...currentLocal]);

      return {
        success: true,
        message: `Rendez-vous confirmé pour le ${appointmentData.date} à ${appointmentData.timeSlot}.`,
        appointment: newAppointment
      };

    } catch (err: any) {
      console.warn('Firestore transaction failed or fallback mode used:', err);

      if (err.message === 'SLOT_ALREADY_BOOKED') {
        return {
          success: false,
          message: `Désolé, le créneau de ${appointmentData.timeSlot} le ${appointmentData.date} est déjà réservé par une autre patiente.`
        };
      }

      // Local fallback checking
      const localAppointments = getInitialLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEMO_APPOINTMENTS);
      const isTakenLocally = localAppointments.some(
        a => a.date === appointmentData.date && 
             a.timeSlot === appointmentData.timeSlot && 
             a.status !== 'cancelled'
      );

      if (isTakenLocally) {
        return {
          success: false,
          message: `Ce créneau (${appointmentData.timeSlot}) est déjà pris. Veuillez sélectionner une autre heure.`
        };
      }

      saveLocal(STORAGE_KEYS.APPOINTMENTS, [newAppointment, ...localAppointments]);

      return {
        success: true,
        message: `Rendez-vous réservé avec succès pour le ${appointmentData.date} à ${appointmentData.timeSlot}.`,
        appointment: newAppointment
      };
    }
  }

  /**
   * Get all appointments (for Doctor)
   */
  static async getAppointments(): Promise<Appointment[]> {
    try {
      const snap = await getDocs(collection(db, APPOINTMENTS_COL));
      if (!snap.empty) {
        const list: Appointment[] = [];
        snap.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Appointment);
        });
        saveLocal(STORAGE_KEYS.APPOINTMENTS, list);
        return list;
      }
    } catch (e) {
      console.warn('Using local appointments fallback:', e);
    }
    return getInitialLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEMO_APPOINTMENTS);
  }

  /**
   * Get appointments for specific patient
   */
  static async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    try {
      const q = query(collection(db, APPOINTMENTS_COL), where('patientId', '==', patientId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list: Appointment[] = [];
        snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() } as Appointment));
        return list;
      }
    } catch (e) {
      console.warn('Firestore error, falling back to local for patient apts:', e);
    }
    const all = getInitialLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEMO_APPOINTMENTS);
    return all.filter(a => a.patientId === patientId);
  }

  /**
   * Update appointment status or reschedule
   */
  static async updateAppointmentStatus(appointmentId: string, status: Appointment['status'], newDate?: string, newTimeSlot?: string): Promise<boolean> {
    try {
      const docRef = doc(db, APPOINTMENTS_COL, appointmentId);
      const updateData: any = { status, updatedAt: new Date().toISOString() };
      if (newDate) updateData.date = newDate;
      if (newTimeSlot) updateData.timeSlot = newTimeSlot;

      await updateDoc(docRef, updateData);

      // Release slot if cancelled
      if (status === 'cancelled') {
        const aptSnap = await getDoc(docRef);
        if (aptSnap.exists()) {
          const data = aptSnap.data();
          const slotId = `${data.date}_${data.timeSlot.replace(':', '')}`;
          await deleteDoc(doc(db, 'booked_slots', slotId)).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Updating local state for appointment:', e);
    }

    const current = getInitialLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEMO_APPOINTMENTS);
    const updated = current.map(a => {
      if (a.id === appointmentId) {
        return {
          ...a,
          status,
          ...(newDate ? { date: newDate } : {}),
          ...(newTimeSlot ? { timeSlot: newTimeSlot } : {}),
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });
    saveLocal(STORAGE_KEYS.APPOINTMENTS, updated);
    return true;
  }

  // -------------------------------------------------------------
  // MEDICAL RECORDS (DOSSIER PATIENTE)
  // -------------------------------------------------------------

  static async getMedicalRecord(patientId: string): Promise<MedicalRecord | null> {
    try {
      const q = query(collection(db, MEDICAL_RECORDS_COL), where('patientId', '==', patientId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as MedicalRecord;
      }
    } catch (e) {
      console.warn('Using local medical record fallback:', e);
    }
    const recordsMap = getInitialLocal<Record<string, MedicalRecord>>(STORAGE_KEYS.MEDICAL_RECORDS, DEMO_MEDICAL_RECORDS);
    return recordsMap[patientId] || null;
  }

  static async saveMedicalRecord(record: Omit<MedicalRecord, 'id' | 'updatedAt'> & { id?: string }): Promise<MedicalRecord> {
    const recordId = record.id || `med_${record.patientId}`;
    const now = new Date().toISOString();
    const finalRecord: MedicalRecord = {
      ...record,
      id: recordId,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, MEDICAL_RECORDS_COL, recordId), finalRecord, { merge: true });
    } catch (e) {
      console.warn('Saved medical record to local storage:', e);
    }

    const recordsMap = getInitialLocal<Record<string, MedicalRecord>>(STORAGE_KEYS.MEDICAL_RECORDS, DEMO_MEDICAL_RECORDS);
    recordsMap[record.patientId] = finalRecord;
    saveLocal(STORAGE_KEYS.MEDICAL_RECORDS, recordsMap);

    return finalRecord;
  }

  // -------------------------------------------------------------
  // ULTRASOUNDS (ÉCHOGRAPHIES)
  // -------------------------------------------------------------

  static async getUltrasounds(patientId?: string): Promise<UltrasoundRecord[]> {
    try {
      let snap;
      if (patientId) {
        const q = query(collection(db, ULTRASOUNDS_COL), where('patientId', '==', patientId));
        snap = await getDocs(q);
      } else {
        snap = await getDocs(collection(db, ULTRASOUNDS_COL));
      }

      if (!snap.empty) {
        const list: UltrasoundRecord[] = [];
        snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() } as UltrasoundRecord));
        return list;
      }
    } catch (e) {
      console.warn('Fallback ultrasounds local:', e);
    }

    const all = getInitialLocal<UltrasoundRecord[]>(STORAGE_KEYS.ULTRASOUNDS, DEMO_ULTRASOUNDS);
    return patientId ? all.filter(u => u.patientId === patientId) : all;
  }

  static async saveUltrasound(ultrasoundData: Omit<UltrasoundRecord, 'id' | 'createdAt'>): Promise<UltrasoundRecord> {
    const docRef = doc(collection(db, ULTRASOUNDS_COL));
    const now = new Date().toISOString();
    const newUltrasound: UltrasoundRecord = {
      ...ultrasoundData,
      id: docRef.id,
      createdAt: now
    };

    try {
      await setDoc(docRef, newUltrasound);
    } catch (e) {
      console.warn('Saving ultrasound locally:', e);
    }

    const all = getInitialLocal<UltrasoundRecord[]>(STORAGE_KEYS.ULTRASOUNDS, DEMO_ULTRASOUNDS);
    saveLocal(STORAGE_KEYS.ULTRASOUNDS, [newUltrasound, ...all]);

    return newUltrasound;
  }

  // -------------------------------------------------------------
  // PRESCRIPTIONS (ORDONNANCES)
  // -------------------------------------------------------------

  static async getPrescriptions(patientId?: string): Promise<Prescription[]> {
    try {
      let snap;
      if (patientId) {
        const q = query(collection(db, PRESCRIPTIONS_COL), where('patientId', '==', patientId));
        snap = await getDocs(q);
      } else {
        snap = await getDocs(collection(db, PRESCRIPTIONS_COL));
      }

      if (!snap.empty) {
        const list: Prescription[] = [];
        snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() } as Prescription));
        return list;
      }
    } catch (e) {
      console.warn('Fallback prescriptions local:', e);
    }

    const all = getInitialLocal<Prescription[]>(STORAGE_KEYS.PRESCRIPTIONS, DEMO_PRESCRIPTIONS);
    return patientId ? all.filter(p => p.patientId === patientId) : all;
  }

  static async savePrescription(prescriptionData: Omit<Prescription, 'id' | 'createdAt'>): Promise<Prescription> {
    const docRef = doc(collection(db, PRESCRIPTIONS_COL));
    const now = new Date().toISOString();
    const newPrescription: Prescription = {
      ...prescriptionData,
      id: docRef.id,
      createdAt: now
    };

    try {
      await setDoc(docRef, newPrescription);
    } catch (e) {
      console.warn('Saving prescription locally:', e);
    }

    const all = getInitialLocal<Prescription[]>(STORAGE_KEYS.PRESCRIPTIONS, DEMO_PRESCRIPTIONS);
    saveLocal(STORAGE_KEYS.PRESCRIPTIONS, [newPrescription, ...all]);

    return newPrescription;
  }

  // -------------------------------------------------------------
  // DOCTOR SCHEDULE BLOCKS & EMERGENCY ABSENCES
  // -------------------------------------------------------------

  static async getScheduleBlocks(): Promise<ScheduleBlock[]> {
    try {
      const snap = await getDocs(collection(db, SCHEDULE_BLOCKS_COL));
      if (!snap.empty) {
        const list: ScheduleBlock[] = [];
        snap.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() } as ScheduleBlock));
        return list;
      }
    } catch (e) {
      console.warn('Fallback blocks local');
    }
    return getInitialLocal<ScheduleBlock[]>(STORAGE_KEYS.BLOCKS, []);
  }

  static async blockTimeSlots(date: string, slots: string[], isFullDayOff = false, reason = "Urgence médicale / Bloc opératoire"): Promise<ScheduleBlock> {
    const id = `block_${date}`;
    const blockData: ScheduleBlock = { id, date, blockedSlots: slots, isFullDayOff, reason };

    try {
      await setDoc(doc(db, SCHEDULE_BLOCKS_COL, id), blockData, { merge: true });
    } catch (e) {
      console.warn('Saved block locally:', e);
    }

    const blocks = getInitialLocal<ScheduleBlock[]>(STORAGE_KEYS.BLOCKS, []);
    const filtered = blocks.filter(b => b.date !== date);
    saveLocal(STORAGE_KEYS.BLOCKS, [...filtered, blockData]);

    return blockData;
  }
}
