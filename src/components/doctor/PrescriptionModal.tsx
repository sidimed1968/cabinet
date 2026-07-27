import React, { useState } from 'react';
import { PrescriptionItem } from '../../types';
import { DataService } from '../../services/dataService';
import { CABINET_INFO } from '../../data/mockData';
import { X, FileText, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface PrescriptionModalProps {
  isOpen: boolean;
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSaved: () => void;
}

const COMMON_MEDS = [
  { name: 'Foldine 5mg (Acide Folique)', dosage: '5 mg', frequency: '1 cp/jour', duration: '30 jours', instructions: 'Pendant le petit déjeuner' },
  { name: 'Tardyferon B9 (Fer + Acide Folique)', dosage: '50 mg', frequency: '1 cp/jour', duration: '60 jours', instructions: 'A prendre avec un jus d\'agrume (pas de thé/café)' },
  { name: 'Spasfon (Phloroglucinol)', dosage: '80 mg', frequency: '1 à 2 cp 3x/jour', duration: '5 jours', instructions: 'En cas de douleurs ou contractions pelviennes' },
  { name: 'Utrogestan (Progestérone 200mg)', dosage: '200 mg', frequency: '1 capsule le soir au coucher', duration: '30 jours', instructions: 'Voie orale ou vaginale selon prescription' },
  { name: 'Cacit Vitamin D3 (Calcium 500mg)', dosage: '500 mg / 400 UI', frequency: '1 sachet par jour', duration: '30 jours', instructions: 'A dissoudre dans l\'eau' },
  { name: 'Augmentin (Amoxicilline + Ac. Clavulanique)', dosage: '1 g', frequency: '1 cp 2x/jour', duration: '7 jours', instructions: 'Au milieu des repas' }
];

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  patientId,
  patientName,
  onClose,
  onSaved
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayStr);
  const [medications, setMedications] = useState<PrescriptionItem[]>([
    {
      medicationName: 'Foldine 5mg (Acide Folique)',
      dosage: '5 mg',
      frequency: '1 comprimé par jour',
      duration: '30 jours',
      instructions: 'Pendant le petit déjeuner'
    }
  ]);
  const [generalInstructions, setGeneralInstructions] = useState<string>(
    'Bien s\'hydrater (2 Litres d\'eau/jour minimum). Se reposer et éviter les efforts physiques intenses.'
  );
  const [saving, setSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      { medicationName: '', dosage: '', frequency: '1 cp/jour', duration: '7 jours', instructions: '' }
    ]);
  };

  const handleQuickAdd = (med: typeof COMMON_MEDS[0]) => {
    setMedications([
      ...medications,
      {
        medicationName: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions
      }
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, idx) => idx !== index));
  };

  const handleMedChange = (index: number, field: keyof PrescriptionItem, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (medications.length === 0) return;

    setSaving(true);
    try {
      await DataService.savePrescription({
        patientId,
        patientName,
        date,
        doctorName: CABINET_INFO.doctorName,
        medications: medications.filter(m => m.medicationName.trim().length > 0),
        generalInstructions: generalInstructions.trim()
      });
      onSaved();
      onClose();
    } catch (e) {
      console.error('Failed to save prescription:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base leading-tight">
                Rédiger une Ordonnance Médicale
              </h3>
              <p className="text-xs text-emerald-200">Patiente : {patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/80">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          
          <div className="flex items-center justify-between">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date de l'ordonnance</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div className="text-right text-[11px] text-slate-500">
              <div className="font-bold text-slate-900">{CABINET_INFO.doctorName}</div>
              <div>{CABINET_INFO.name}</div>
            </div>
          </div>

          {/* Quick Select Common Meds */}
          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
            <div className="font-bold text-emerald-950 mb-2 text-[11px]">
              Ajout Rapide Médicaments Courants :
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_MEDS.map((m, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleQuickAdd(m)}
                  className="bg-white hover:bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-300 font-semibold text-[10px] transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-emerald-700" /> {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Medications List Form */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Liste des Médicaments Prescrits ({medications.length})
              </label>

              <button
                type="button"
                onClick={handleAddMedication}
                className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter une Ligne
              </button>
            </div>

            {medications.map((med, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-6">
                    <label className="block text-slate-500 mb-0.5 text-[10px]">Médicament & Forme</label>
                    <input
                      type="text"
                      required
                      value={med.medicationName}
                      onChange={(e) => handleMedChange(index, 'medicationName', e.target.value)}
                      placeholder="ex: Tardyferon B9"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-slate-500 mb-0.5 text-[10px]">Dosage</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                      placeholder="ex: 50mg"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-slate-500 mb-0.5 text-[10px]">Durée</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => handleMedChange(index, 'duration', e.target.value)}
                      placeholder="ex: 30 jours"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-6">
                    <label className="block text-slate-500 mb-0.5 text-[10px]">Posologie / Fréquence</label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                      placeholder="ex: 1 cp par jour le matin"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-slate-500 mb-0.5 text-[10px]">Consignes de prise</label>
                    <input
                      type="text"
                      value={med.instructions || ''}
                      onChange={(e) => handleMedChange(index, 'instructions', e.target.value)}
                      placeholder="ex: Pendant le repas avec de l'eau"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(index)}
                      className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded-lg"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Recommandations Générales</label>
            <textarea
              rows={2}
              value={generalInstructions}
              onChange={(e) => setGeneralInstructions(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || medications.length === 0}
              className="px-5 py-2 font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer l\'Ordonnance'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
