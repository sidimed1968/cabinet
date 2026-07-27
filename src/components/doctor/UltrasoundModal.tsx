import React, { useState } from 'react';
import { UltrasoundRecord, UltrasoundType } from '../../types';
import { DataService } from '../../services/dataService';
import { X, Sparkles, CheckCircle2, HeartPulse, FileText } from 'lucide-react';

interface UltrasoundModalProps {
  isOpen: boolean;
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSaved: () => void;
}

export const UltrasoundModal: React.FC<UltrasoundModalProps> = ({
  isOpen,
  patientId,
  patientName,
  onClose,
  onSaved
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayStr);
  const [type, setType] = useState<UltrasoundType>('morphologique_t2');
  const [sa, setSa] = useState<number>(22);
  const [lccMm, setLccMm] = useState<number>(145);
  const [bipMm, setBipMm] = useState<number>(54);
  const [lfMm, setLfMm] = useState<number>(38);
  const [datMm, setDatMm] = useState<number>(50);
  const [cardiacActivity, setCardiacActivity] = useState<'presente' | 'absente' | 'non_evaluee'>('presente');
  const [heartRateBpm, setHeartRateBpm] = useState<number>(150);
  const [amnioticFluid, setAmnioticFluid] = useState<'normal' | 'oligo' | 'poly' | 'non_evalue'>('normal');
  const [placentaLocation, setPlacentaLocation] = useState<string>('Antérieur haut inséré');
  const [fetalWeightGrams, setFetalWeightGrams] = useState<number>(480);
  const [conclusion, setConclusion] = useState<string>('Grossesse mono-fœtale évolutive. Morphologie fœtale sans anomalie décelable ce jour. Biométrie en accord avec le terme.');
  const [doctorNotes, setDoctorNotes] = useState<string>('Mouvements fœtaux actifs visualisés. A revoir au T3 pour contrôle de croissance.');
  const [saving, setSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await DataService.saveUltrasound({
        patientId,
        patientName,
        date,
        type,
        sa,
        lccMm,
        bipMm,
        lfMm,
        datMm,
        cardiacActivity,
        heartRateBpm,
        amnioticFluid,
        placentaLocation,
        fetalWeightGrams,
        conclusion: conclusion.trim(),
        doctorNotes: doctorNotes.trim()
      });
      onSaved();
      onClose();
    } catch (e) {
      console.error('Failed to save ultrasound:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-300" />
            <div>
              <h3 className="font-bold text-base leading-tight">
                Nouveau Compte-rendu d'Échographie
              </h3>
              <p className="text-xs text-rose-200">Patiente : {patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/80">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date de l'examen</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Type d'Échographie</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as UltrasoundType)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="datation">Échographie de Datation (T1)</option>
                <option value="morphologique_t1">Morphologique T1 (12-14 SA)</option>
                <option value="morphologique_t2">Morphologique T2 (20-24 SA)</option>
                <option value="morphologique_t3">Morphologique T3 (30-34 SA)</option>
                <option value="pelvienne">Échographie Pelvienne Gynécologique</option>
                <option value="suivi_croissance">Suivi de Croissance & Doppler</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Terme Constaté (SA)</label>
              <input
                type="number"
                required
                min={4}
                max={42}
                value={sa}
                onChange={(e) => setSa(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
          </div>

          {/* Biométrie Fœtale Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] text-rose-700">
              <HeartPulse className="w-4 h-4" /> Mesures & Biométrie Fœtale
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 mb-0.5">LCC (mm)</label>
                <input
                  type="number"
                  value={lccMm}
                  onChange={(e) => setLccMm(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5">BIP (mm)</label>
                <input
                  type="number"
                  value={bipMm}
                  onChange={(e) => setBipMm(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5">LF (mm)</label>
                <input
                  type="number"
                  value={lfMm}
                  onChange={(e) => setLfMm(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5">DAT (mm)</label>
                <input
                  type="number"
                  value={datMm}
                  onChange={(e) => setDatMm(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-slate-600 mb-0.5">Activité Cardiaque</label>
                <select
                  value={cardiacActivity}
                  onChange={(e) => setCardiacActivity(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                >
                  <option value="presente">Présente & Régulière</option>
                  <option value="absente">Absente</option>
                  <option value="non_evaluee">Non Évaluée</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5">Rythme Cardiaque (BPM)</label>
                <input
                  type="number"
                  value={heartRateBpm}
                  onChange={(e) => setHeartRateBpm(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5">Poids Fœtal Estimé (g)</label>
                <input
                  type="number"
                  value={fetalWeightGrams}
                  onChange={(e) => setFetalWeightGrams(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-slate-600 mb-0.5">Liquide Amniotique</label>
                <select
                  value={amnioticFluid}
                  onChange={(e) => setAmnioticFluid(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                >
                  <option value="normal">Abondance Normale</option>
                  <option value="oligo">Oligohydramnios</option>
                  <option value="poly">Hydramnios / Polyhydramnios</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5">Localisation du Placenta</label>
                <input
                  type="text"
                  value={placentaLocation}
                  onChange={(e) => setPlacentaLocation(e.target.value)}
                  placeholder="ex: Antérieur haut inséré"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Conclusion */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Conclusion Médicale</label>
            <textarea
              rows={3}
              required
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Remarques / Recommandations</label>
            <input
              type="text"
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-xl font-medium"
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
              disabled={saving}
              className="px-5 py-2 font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer le Compte-rendu'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
