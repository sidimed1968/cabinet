import { UserProfile, Appointment, MedicalRecord, UltrasoundRecord, Prescription } from '../types';

export const CABINET_INFO = {
  name: "Cabinet Gynécologique & Obstétrique Moktar Ould Daddah",
  doctorName: "Dr. Mariem Mint Cheikh",
  doctorTitle: "Spécialiste en Gynécologie - Obstétrique & Échographie Prénatale",
  doctorDiploma: "Ancienne Chef de Clinique, Diplômée de la Faculté de Médecine de Rabat & Paris V",
  address: "Rue Moktar Ould Daddah (près du Carrefour Madrid), Tevragh Zeina, Nouakchott",
  phone1: "+222 45 25 33 00",
  phone2: "+222 36 20 11 22",
  email: "contact@cabinet-cheikh.mr",
  workingHours: "Lundi - Samedi : 08h30 - 17h30 (Vendredi : 08h30 - 12h30)",
  timeSlots: [
    "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ]
};

export const DEMO_USERS: UserProfile[] = [
  {
    uid: "patient_fatimetou",
    email: "fatimetou.sidi@gmail.com",
    displayName: "Fatimetou Mint Sidi",
    phone: "+222 46 55 12 34",
    role: "patient",
    dateOfBirth: "1995-04-12",
    address: "Tevragh Zeina, Nouakchott",
    createdAt: "2026-01-15T10:00:00Z",
    ddr: "2026-02-10",
    bloodGroup: "O+",
    emergencyContact: "+222 22 10 99 88 (Epoux: Mohamed)"
  },
  {
    uid: "patient_aichetou",
    email: "aichetou.ahmed@yahoo.fr",
    displayName: "Aichetou Mint Ahmed",
    phone: "+222 36 88 44 22",
    role: "patient",
    dateOfBirth: "1989-11-20",
    address: "Ksar, Nouakchott",
    createdAt: "2026-02-01T09:30:00Z",
    ddr: "2026-06-01",
    bloodGroup: "A+",
    emergencyContact: "+222 44 33 22 11"
  },
  {
    uid: "patient_khadija",
    email: "khadija.oumar@hotmail.com",
    displayName: "Khadija Oumar Ba",
    phone: "+222 26 11 00 99",
    role: "patient",
    dateOfBirth: "1998-07-05",
    address: "Sebkha, Nouakchott",
    createdAt: "2026-03-10T14:00:00Z",
    ddr: "2026-05-25",
    bloodGroup: "B+",
    emergencyContact: "+222 33 44 55 66"
  },
  {
    uid: "doctor_mariem",
    email: "docteur@cabinet-cheikh.mr",
    displayName: "Dr. Mariem Mint Cheikh",
    phone: "+222 45 25 33 00",
    role: "doctor",
    address: "Tevragh Zeina, Nouakchott",
    createdAt: "2025-01-01T08:00:00Z"
  }
];

export const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: "apt_001",
    patientId: "patient_fatimetou",
    patientName: "Fatimetou Mint Sidi",
    patientPhone: "+222 46 55 12 34",
    doctorId: "doctor_mariem",
    doctorName: "Dr. Mariem Mint Cheikh",
    date: "2026-07-28", // Tomorrow
    timeSlot: "10:00",
    type: "suivi_grossesse",
    status: "confirmed",
    notes: "Consultation 2ème trimestre + Échographie de morphologie T2",
    createdAt: "2026-07-20T11:00:00Z"
  },
  {
    id: "apt_002",
    patientId: "patient_aichetou",
    patientName: "Aichetou Mint Ahmed",
    patientPhone: "+222 36 88 44 22",
    doctorId: "doctor_mariem",
    doctorName: "Dr. Mariem Mint Cheikh",
    date: "2026-07-28",
    timeSlot: "11:00",
    type: "echo_pelvienne",
    status: "confirmed",
    notes: "Bilan kystique pelvien de contrôle",
    createdAt: "2026-07-22T09:15:00Z"
  },
  {
    id: "apt_003",
    patientId: "patient_khadija",
    patientName: "Khadija Oumar Ba",
    patientPhone: "+222 26 11 00 99",
    doctorId: "doctor_mariem",
    doctorName: "Dr. Mariem Mint Cheikh",
    date: "2026-07-29",
    timeSlot: "09:30",
    type: "echo_obstetrique",
    status: "confirmed",
    notes: "Échographie de datation T1",
    createdAt: "2026-07-24T15:30:00Z"
  },
  {
    id: "apt_004",
    patientId: "patient_fatimetou",
    patientName: "Fatimetou Mint Sidi",
    patientPhone: "+222 46 55 12 34",
    doctorId: "doctor_mariem",
    doctorName: "Dr. Mariem Mint Cheikh",
    date: "2026-06-15",
    timeSlot: "09:00",
    type: "suivi_grossesse",
    status: "completed",
    notes: "Premier bilan prénatal T1 - Tension normale 11/7",
    createdAt: "2026-06-01T10:00:00Z"
  }
];

export const DEMO_MEDICAL_RECORDS: Record<string, MedicalRecord> = {
  "patient_fatimetou": {
    id: "med_fatimetou",
    patientId: "patient_fatimetou",
    ddr: "2026-02-10",
    saCalculated: 24,
    gestationalAgeText: "24 Semaines d'Aménorrhée (22 SG)",
    gravida: 2,
    para: 1,
    abortions: 0,
    livingChildren: 1,
    medicalHistory: "Aucune pathologie chronique. HTA gravidique modérée au T3 lors de la 1ère grossesse.",
    surgicalHistory: "Accouchement voie basse en 2023 (Poids bébé: 3.2 kg).",
    gynecoHistory: "Cycles réguliers de 28 jours.",
    allergies: "Pénicilline (Éruptions cutanées)",
    generalNotes: "Patiente très coopérative. Fer et Acide Folique prescrits. Col long et fermé.",
    updatedAt: "2026-07-15T10:00:00Z"
  },
  "patient_aichetou": {
    id: "med_aichetou",
    patientId: "patient_aichetou",
    ddr: "2026-06-01",
    saCalculated: 8,
    gestationalAgeText: "8 SA",
    gravida: 3,
    para: 2,
    abortions: 0,
    livingChildren: 2,
    medicalHistory: "Anémie féroprve intermittente.",
    surgicalHistory: "Césarienne programmée en 2021 (Bassin rétréci).",
    gynecoHistory: "SOPK léger (Syndrome des ovaires polykystiques).",
    allergies: "Aucune connue",
    generalNotes: "A revoir pour bilan complémentaire et échographie de contrôle.",
    updatedAt: "2026-06-20T11:00:00Z"
  }
};

export const DEMO_ULTRASOUNDS: UltrasoundRecord[] = [
  {
    id: "echo_001",
    patientId: "patient_fatimetou",
    patientName: "Fatimetou Mint Sidi",
    appointmentId: "apt_004",
    date: "2026-06-15",
    type: "morphologique_t1",
    sa: 18,
    lccMm: 125,
    bipMm: 42,
    lfMm: 28,
    datMm: 38,
    cardiacActivity: "presente",
    heartRateBpm: 152,
    amnioticFluid: "normal",
    placentaLocation: "Antérieur haut inséré",
    fetalWeightGrams: 230,
    conclusion: "Grossesse mono-fœtale évolutive du 2ème trimestre. Morphologie fœtale normale pour le terme de 18 SA. Biométrie fœtale concordante.",
    doctorNotes: "Mouvements fœtaux actifs visualisés lors de l'examen.",
    createdAt: "2026-06-15T11:30:00Z"
  }
];

export const DEMO_PRESCRIPTIONS: Prescription[] = [
  {
    id: "presc_001",
    patientId: "patient_fatimetou",
    patientName: "Fatimetou Mint Sidi",
    patientAge: 31,
    appointmentId: "apt_004",
    date: "2026-06-15",
    doctorName: "Dr. Mariem Mint Cheikh",
    medications: [
      {
        medicationName: "Foldine 5mg (Acide Folique)",
        dosage: "5 mg",
        frequency: "1 comprimé par jour",
        duration: "30 jours",
        instructions: "A prendre le matin pendant le petit déjeuner"
      },
      {
        medicationName: "Tardyferon B9 (Fer + Acide Folique)",
        dosage: "50 mg / 0.35 mg",
        frequency: "1 comprimé par jour",
        duration: "60 jours",
        instructions: "Eviter la prise simultanée avec du thé ou du café"
      },
      {
        medicationName: "Calcibronat / Calcium Vitamine D3",
        dosage: "500 mg",
        frequency: "1 sachet par jour",
        duration: "30 jours",
        instructions: "Dissoudre dans un grand verre d'eau"
      }
    ],
    generalInstructions: "Se reposer, bien s'hydrater (2 Litres d'eau par jour minimum). Faire le bilan biologique sanguin prescrit avant le prochain rendez-vous.",
    createdAt: "2026-06-15T12:00:00Z"
  }
];
