import React, { useState, useEffect } from 'react';
import { UserProfile, MedicalRecord, UltrasoundRecord, Prescription } from '../../types';
import { DataService } from '../../services/dataService';
import { calculateSA, formatFrenchDate } from '../../utils/pregnancy';
import { PrescriptionPrintView } from '../common/PrescriptionPrintView';
import { UltrasoundPrintView } from '../common/UltrasoundPrintView';
import { 
  FileText, 
  Sparkles, 
  Baby, 
  Calendar, 
  Printer, 
  Heart, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react';

interface PatientMedicalFileProps {
  currentUser: UserProfile;
}

export const PatientMedicalFile: React.FC<PatientMedicalFileProps> = ({ currentUser }) => {
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [ultrasounds, setUltrasounds] = useState<UltrasoundRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Print view state
  const [selectedPrescriptionForPrint, setSelectedPrescriptionForPrint] = useState<Prescription | null>(null);
  const [selectedUltrasoundForPrint, setSelectedUltrasoundForPrint] = useState<UltrasoundRecord | null>(null);

  useEffect(() => {
    loadMedicalFile();
  }, [currentUser.uid]);

  const loadMedicalFile = async () => {
    setLoading(true);
    try {
      const [record, echos, prescs] = await Promise.all([
        DataService.getMedicalRecord(currentUser.uid),
        DataService.getUltrasounds(currentUser.uid),
        DataService.getPrescriptions(currentUser.uid)
      ]);

      setMedicalRecord(record);
      setUltrasounds(echos);
      setPrescriptions(prescs);
    } catch (e) {
      console.error('Failed to load patient medical file:', e);
    } finally {
      setLoading(false);
    }
  };

  const ddrValue = medicalRecord?.ddr || currentUser.ddr;
  const pregnancyInfo = calculateSA(ddrValue);

  if (selectedPrescriptionForPrint) {
    return (
      <PrescriptionPrintView 
        prescription={selectedPrescriptionForPrint} 
        onBack={() => setSelectedPrescriptionForPrint(null)} 
      />
    );
  }

  if (selectedUltrasoundForPrint) {
    return (
      <UltrasoundPrintView 
        ultrasound={selectedUltrasoundForPrint} 
        onBack={() => setSelectedUltrasoundForPrint(null)} 
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Espace Confidentiel "Mon Dossier"
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Fiche Médicale de {currentUser.displayName}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Groupe Sanguin : <span className="font-bold text-rose-400">{currentUser.bloodGroup || 'O+'}</span> • Tel : {currentUser.phone}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-xs text-right">
            <div className="text-slate-300">Médecin Référent</div>
            <div className="font-bold text-rose-200">Dr. Mariem Mint Cheikh</div>
            <div className="text-[11px] text-slate-400">Tevragh Zeina, Nouakchott</div>
          </div>
        </div>
      </div>

      {/* Pregnancy SA Tracker Card */}
      {pregnancyInfo && (
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
                <Baby className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-rose-950">
                  Suivi de Grossesse & Terme Théorique
                </h3>
                <p className="text-xs text-rose-700">Calcul basé sur la DDR : {formatFrenchDate(ddrValue!)}</p>
              </div>
            </div>

            <span className="bg-rose-200 text-rose-900 text-xs font-extrabold px-3 py-1 rounded-full border border-rose-300">
              {pregnancyInfo.trimester}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/80 p-4 rounded-xl border border-rose-100">
            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase">Âge Gestationnel</div>
              <div className="text-lg font-extrabold text-rose-700">{pregnancyInfo.text}</div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase">Terme Prévisionnel (DPA)</div>
              <div className="text-lg font-extrabold text-slate-900">{pregnancyInfo.dueDate}</div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase">Statut Obstétrique</div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                G{medicalRecord?.gravida || 1} P{medicalRecord?.para || 0} A{medicalRecord?.abortions || 0} EV{medicalRecord?.livingChildren || 0}
              </div>
            </div>
          </div>

          {/* SA Progress Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
              <span>0 SA (Conception)</span>
              <span>12 SA (T1)</span>
              <span>28 SA (T2)</span>
              <span>41 SA (Terme)</span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-gradient-to-r from-rose-400 to-rose-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, (pregnancyInfo.sa / 41) * 100))}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Ultrasounds & Prescriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Ultrasounds List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Comptes-rendus d'Échographies
              </h3>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
              {ultrasounds.length} rapport(s)
            </span>
          </div>

          {ultrasounds.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Aucun compte-rendu d'échographie enregistré pour le moment.
            </div>
          ) : (
            <div className="space-y-3">
              {ultrasounds.map((echo) => (
                <div 
                  key={echo.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-rose-300 bg-slate-50/50 hover:bg-rose-50/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Échographie ({echo.type.toUpperCase()})
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {formatFrenchDate(echo.date)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1">
                    {echo.sa && <div>• Terme : <span className="font-semibold">{echo.sa} SA</span></div>}
                    {echo.lccMm && <div>• LCC : <span className="font-semibold">{echo.lccMm} mm</span> | BIP : <span className="font-semibold">{echo.bipMm || '-'} mm</span> | LF : <span className="font-semibold">{echo.lfMm || '-'} mm</span></div>}
                    {echo.conclusion && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200/80 text-[11px] italic text-slate-800 mt-2">
                        "{echo.conclusion}"
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setSelectedUltrasoundForPrint(echo)}
                      className="text-xs text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1 bg-white px-3 py-1 rounded-lg border border-rose-200 shadow-2xs hover:bg-rose-50 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> Afficher & Imprimer le Rapport
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prescriptions List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Ordonnances Médicales
              </h3>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
              {prescriptions.length} ordonnance(s)
            </span>
          </div>

          {prescriptions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Aucune ordonnance rédigée pour le moment.
            </div>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((presc) => (
                <div 
                  key={presc.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Ordonnance Médicale
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {formatFrenchDate(presc.date)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1">
                    <div className="font-semibold text-emerald-900">
                      {presc.medications.length} Médicament(s) prescrit(s) :
                    </div>
                    <ul className="list-disc list-inside text-[11px] text-slate-600 pl-1 space-y-0.5">
                      {presc.medications.map((m, idx) => (
                        <li key={idx} className="truncate">
                          <span className="font-semibold text-slate-800">{m.medicationName}</span> ({m.dosage}) — {m.frequency}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setSelectedPrescriptionForPrint(presc)}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 bg-white px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs hover:bg-emerald-50 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> Télécharger / Imprimer Ordonnance
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Medical Notes & Antecedents Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-600" /> Antécédents Médicaux & Précautions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-semibold text-slate-700 mb-1">Antécédents Médicaux & Chirurgicaux</div>
            <p className="text-slate-600">
              {medicalRecord?.medicalHistory || 'Aucun antécédent médical majeur signalé.'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-semibold text-slate-700 mb-1">Allergies Renseignées</div>
            <p className="text-slate-600">
              {medicalRecord?.allergies || 'Pas d\'allergie médicamenteuse connue.'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
