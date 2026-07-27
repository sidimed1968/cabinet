import React, { useState, useEffect } from 'react';
import { UserProfile, MedicalRecord, UltrasoundRecord, Prescription } from '../../types';
import { DataService } from '../../services/dataService';
import { DEMO_USERS } from '../../data/mockData';
import { calculateSA, formatFrenchDate } from '../../utils/pregnancy';
import { UltrasoundModal } from './UltrasoundModal';
import { PrescriptionModal } from './PrescriptionModal';
import { PrescriptionPrintView } from '../common/PrescriptionPrintView';
import { UltrasoundPrintView } from '../common/UltrasoundPrintView';
import { 
  Users, 
  Search, 
  FileText, 
  Sparkles, 
  Baby, 
  PhoneCall, 
  Calendar, 
  Heart, 
  Edit3, 
  Plus, 
  Printer, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface PatientListProps {
  currentUser: UserProfile;
  initialSelectedPatientId?: string;
}

export const PatientList: React.FC<PatientListProps> = ({
  currentUser,
  initialSelectedPatientId
}) => {
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);

  // Patient detailed record data
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [ultrasounds, setUltrasounds] = useState<UltrasoundRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingRecord, setLoadingRecord] = useState<boolean>(false);

  // Edit medical record form
  const [isEditingMedicalRecord, setIsEditingMedicalRecord] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<{
    ddr: string;
    gravida: number;
    para: number;
    abortions: number;
    livingChildren: number;
    medicalHistory: string;
    surgicalHistory: string;
    gynecoHistory: string;
    allergies: string;
    generalNotes: string;
  }>({
    ddr: '',
    gravida: 1,
    para: 0,
    abortions: 0,
    livingChildren: 0,
    medicalHistory: '',
    surgicalHistory: '',
    gynecoHistory: '',
    allergies: '',
    generalNotes: ''
  });

  // Modal controls
  const [isUltrasoundModalOpen, setIsUltrasoundModalOpen] = useState<boolean>(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState<boolean>(false);

  // Print controls
  const [selectedPrescriptionForPrint, setSelectedPrescriptionForPrint] = useState<Prescription | null>(null);
  const [selectedUltrasoundForPrint, setSelectedUltrasoundForPrint] = useState<UltrasoundRecord | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (patients.length > 0) {
      if (initialSelectedPatientId) {
        const found = patients.find(p => p.uid === initialSelectedPatientId);
        if (found) selectPatient(found);
      } else if (!selectedPatient) {
        selectPatient(patients[0]);
      }
    }
  }, [patients, initialSelectedPatientId]);

  const loadPatients = async () => {
    // Collect patients from DEMO_USERS and appointments
    const apts = await DataService.getAppointments();
    const aptPatients: UserProfile[] = apts.map(a => ({
      uid: a.patientId,
      email: a.patientEmail || `${a.patientId}@gmail.com`,
      displayName: a.patientName,
      phone: a.patientPhone,
      role: 'patient',
      createdAt: a.createdAt
    }));

    const allPatients = [...DEMO_USERS.filter(u => u.role === 'patient'), ...aptPatients];
    // De-duplicate by UID
    const unique = Array.from(new Map(allPatients.map(p => [p.uid, p])).values());
    setPatients(unique);
  };

  const selectPatient = async (patient: UserProfile) => {
    setSelectedPatient(patient);
    setLoadingRecord(true);
    setIsEditingMedicalRecord(false);

    try {
      const [record, echos, prescs] = await Promise.all([
        DataService.getMedicalRecord(patient.uid),
        DataService.getUltrasounds(patient.uid),
        DataService.getPrescriptions(patient.uid)
      ]);

      setMedicalRecord(record);
      setUltrasounds(echos);
      setPrescriptions(prescs);

      setEditForm({
        ddr: record?.ddr || patient.ddr || '',
        gravida: record?.gravida || 1,
        para: record?.para || 0,
        abortions: record?.abortions || 0,
        livingChildren: record?.livingChildren || 0,
        medicalHistory: record?.medicalHistory || '',
        surgicalHistory: record?.surgicalHistory || '',
        gynecoHistory: record?.gynecoHistory || '',
        allergies: record?.allergies || '',
        generalNotes: record?.generalNotes || ''
      });
    } catch (e) {
      console.error('Failed to load patient detail:', e);
    } finally {
      setLoadingRecord(false);
    }
  };

  const handleSaveMedicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const saved = await DataService.saveMedicalRecord({
      id: medicalRecord?.id,
      patientId: selectedPatient.uid,
      ddr: editForm.ddr,
      gravida: editForm.gravida,
      para: editForm.para,
      abortions: editForm.abortions,
      livingChildren: editForm.livingChildren,
      medicalHistory: editForm.medicalHistory,
      surgicalHistory: editForm.surgicalHistory,
      gynecoHistory: editForm.gynecoHistory,
      allergies: editForm.allergies,
      generalNotes: editForm.generalNotes
    });

    setMedicalRecord(saved);
    setIsEditingMedicalRecord(false);
  };

  const filteredPatients = patients.filter(p => 
    p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  const pregnancyInfo = calculateSA(medicalRecord?.ddr || selectedPatient?.ddr);

  if (selectedPrescriptionForPrint) {
    return <PrescriptionPrintView prescription={selectedPrescriptionForPrint} onBack={() => setSelectedPrescriptionForPrint(null)} />;
  }

  if (selectedUltrasoundForPrint) {
    return <UltrasoundPrintView ultrasound={selectedUltrasoundForPrint} onBack={() => setSelectedUltrasoundForPrint(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Répertoire & Fiches Médicales Patientes
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Recherche Patientes ({patients.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Accédez aux antécédents gynéco-obstétriques, comptes-rendus d'échographie et ordonnances.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom ou tél..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left: Patient List Sidepanel */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3 h-fit max-h-[75vh] overflow-y-auto">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b">
            Patientes Enregistrées
          </div>

          <div className="space-y-1.5">
            {filteredPatients.map((p) => {
              const isSelected = selectedPatient?.uid === p.uid;
              return (
                <div
                  key={p.uid}
                  onClick={() => selectPatient(p)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400'
                      : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {p.displayName}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <PhoneCall className="w-3 h-3 text-emerald-600" />
                      {p.phone}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-300'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Patient Medical Dossier */}
        <div className="md:col-span-8 space-y-6">
          {selectedPatient ? (
            <>
              {/* Patient Profile Card */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-xs relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                      Fiche Patiente # {selectedPatient.uid}
                    </div>
                    <h3 className="text-xl font-extrabold">{selectedPatient.displayName}</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Tél : {selectedPatient.phone} • Email : {selectedPatient.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsUltrasoundModalOpen(true)}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-4 h-4" /> Nouv. Échographie
                    </button>
                    <button
                      onClick={() => setIsPrescriptionModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <FileText className="w-4 h-4" /> Rédiger Ordonnance
                    </button>
                  </div>
                </div>
              </div>

              {/* Pregnancy SA Tracker Banner if DDR exists */}
              {pregnancyInfo && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between text-xs text-rose-950">
                  <div className="flex items-center gap-2">
                    <Baby className="w-5 h-5 text-rose-600" />
                    <div>
                      <span className="font-bold">Terme Actuel : {pregnancyInfo.text}</span> ({pregnancyInfo.trimester})
                      <div className="text-[11px] text-rose-700">Date Prévue d'Accouchement (DPA) : {pregnancyInfo.dueDate}</div>
                    </div>
                  </div>
                  <span className="bg-rose-200 font-extrabold px-3 py-1 rounded-full text-[11px] text-rose-900">
                    DDR: {medicalRecord?.ddr}
                  </span>
                </div>
              )}

              {/* Obstetrical & Medical History Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-600" />
                    Profil Gynéco-Obstétrique & Antécédents
                  </h4>

                  <button
                    onClick={() => setIsEditingMedicalRecord(!isEditingMedicalRecord)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditingMedicalRecord ? 'Fermer l\'Éditeur' : 'Modifier Fiche'}
                  </button>
                </div>

                {isEditingMedicalRecord ? (
                  <form onSubmit={handleSaveMedicalRecord} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <div>
                        <label className="block text-slate-600 font-medium mb-0.5">Gravida (G)</label>
                        <input
                          type="number"
                          value={editForm.gravida}
                          onChange={(e) => setEditForm({ ...editForm, gravida: Number(e.target.value) })}
                          className="w-full p-2 border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-0.5">Para (P)</label>
                        <input
                          type="number"
                          value={editForm.para}
                          onChange={(e) => setEditForm({ ...editForm, para: Number(e.target.value) })}
                          className="w-full p-2 border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-0.5">Avortement (A)</label>
                        <input
                          type="number"
                          value={editForm.abortions}
                          onChange={(e) => setEditForm({ ...editForm, abortions: Number(e.target.value) })}
                          className="w-full p-2 border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-0.5">Vivants (EV)</label>
                        <input
                          type="number"
                          value={editForm.livingChildren}
                          onChange={(e) => setEditForm({ ...editForm, livingChildren: Number(e.target.value) })}
                          className="w-full p-2 border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-0.5">DDR (YYYY-MM-DD)</label>
                        <input
                          type="date"
                          value={editForm.ddr}
                          onChange={(e) => setEditForm({ ...editForm, ddr: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-0.5">Antécédents Médicaux & Chirugicaux</label>
                      <input
                        type="text"
                        value={editForm.medicalHistory}
                        onChange={(e) => setEditForm({ ...editForm, medicalHistory: e.target.value })}
                        placeholder="ex: HTA, Césarienne en 2021..."
                        className="w-full p-2 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-0.5">Allergies Renseignées</label>
                      <input
                        type="text"
                        value={editForm.allergies}
                        onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                        placeholder="ex: Pénicilline"
                        className="w-full p-2 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 font-bold bg-emerald-700 text-white rounded-xl text-xs"
                      >
                        Enregistrer la Fiche
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Score Obstétrique</div>
                      <div className="text-base font-black text-slate-900 mt-1">
                        G{medicalRecord?.gravida || 1} P{medicalRecord?.para || 0} A{medicalRecord?.abortions || 0} EV{medicalRecord?.livingChildren || 0}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Antécédents</div>
                      <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
                        {medicalRecord?.medicalHistory || 'Aucun majeur'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Allergies</div>
                      <div className="text-xs font-semibold text-rose-700 mt-1 truncate">
                        {medicalRecord?.allergies || 'Aucune connue'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ultrasounds & Prescriptions Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Ultrasounds */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-rose-600" /> Échographies ({ultrasounds.length})
                    </h5>
                  </div>

                  {ultrasounds.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">Aucune échographie</div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {ultrasounds.map((echo) => (
                        <div key={echo.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>Échographie {echo.type}</span>
                            <span className="text-[10px] text-slate-500">{formatFrenchDate(echo.date)}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 italic truncate">"{echo.conclusion}"</div>
                          <button
                            onClick={() => setSelectedUltrasoundForPrint(echo)}
                            className="text-[10px] font-bold text-rose-700 hover:underline flex items-center gap-1 pt-1"
                          >
                            <Printer className="w-3 h-3" /> Imprimer Rapport
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prescriptions */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" /> Ordonnances ({prescriptions.length})
                    </h5>
                  </div>

                  {prescriptions.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">Aucune ordonnance</div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {prescriptions.map((presc) => (
                        <div key={presc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>Ordonnance ({presc.medications.length} méd.)</span>
                            <span className="text-[10px] text-slate-500">{formatFrenchDate(presc.date)}</span>
                          </div>
                          <button
                            onClick={() => setSelectedPrescriptionForPrint(presc)}
                            className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1 pt-1"
                          >
                            <Printer className="w-3 h-3" /> Imprimer Ordonnance
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Sélectionnez une patiente dans la liste pour afficher sa fiche médicale complète.
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      {selectedPatient && (
        <>
          <UltrasoundModal
            isOpen={isUltrasoundModalOpen}
            patientId={selectedPatient.uid}
            patientName={selectedPatient.displayName}
            onClose={() => setIsUltrasoundModalOpen(false)}
            onSaved={() => selectPatient(selectedPatient)}
          />

          <PrescriptionModal
            isOpen={isPrescriptionModalOpen}
            patientId={selectedPatient.uid}
            patientName={selectedPatient.displayName}
            onClose={() => setIsPrescriptionModalOpen(false)}
            onSaved={() => selectPatient(selectedPatient)}
          />
        </>
      )}

    </div>
  );
};
