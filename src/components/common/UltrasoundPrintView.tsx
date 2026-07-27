import React from 'react';
import { UltrasoundRecord } from '../../types';
import { CABINET_INFO } from '../../data/mockData';
import { formatFrenchDate } from '../../utils/pregnancy';
import { Printer, ArrowLeft, Sparkles, MapPin, PhoneCall } from 'lucide-react';

interface UltrasoundPrintViewProps {
  ultrasound: UltrasoundRecord;
  onBack: () => void;
}

export const UltrasoundPrintView: React.FC<UltrasoundPrintViewProps> = ({
  ultrasound,
  onBack
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Action Bar */}
      <div className="print:hidden flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" /> Imprimer le Rapport d'Échographie
        </button>
      </div>

      {/* Printable Document */}
      <div className="bg-white p-8 sm:p-12 border border-slate-200 shadow-md rounded-2xl space-y-8 print:p-0 print:border-none print:shadow-none font-sans text-slate-900">
        
        {/* Cabinet Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-xl font-bold uppercase tracking-wider text-rose-950">
              {CABINET_INFO.name}
            </h1>
            <p className="text-sm font-semibold text-slate-800">
              {CABINET_INFO.doctorName}
            </p>
            <p className="text-xs text-slate-600 max-w-md leading-relaxed">
              {CABINET_INFO.doctorTitle}
            </p>
          </div>

          <div className="text-right text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-900">Nouakchott, Mauritanie</div>
            <div className="flex items-center justify-end gap-1"><MapPin className="w-3 h-3 text-rose-600" /> {CABINET_INFO.address}</div>
            <div className="flex items-center justify-end gap-1"><PhoneCall className="w-3 h-3 text-emerald-600" /> {CABINET_INFO.phone1}</div>
          </div>
        </div>

        {/* Info Box */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500">Nom de la Patiente :</span>{' '}
            <span className="font-extrabold text-sm text-slate-900">{ultrasound.patientName}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500">Date de l'Examen :</span>{' '}
            <span className="font-bold text-slate-900">{formatFrenchDate(ultrasound.date)}</span>
          </div>
          <div>
            <span className="text-slate-500">Type d'Examen :</span>{' '}
            <span className="font-bold text-rose-800 uppercase">{ultrasound.type}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500">Terme Constaté :</span>{' '}
            <span className="font-extrabold text-slate-900">{ultrasound.sa || '-'} SA</span>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center py-2">
          <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 underline underline-offset-8">
            COMPTE-RENDU D'ÉCHOGRAPHIE
          </h2>
        </div>

        {/* Biometrie Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-rose-900 border-b pb-1">
            1. Données Biométriques & Morphologiques Fœtales
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px]">LCC (Longueur Cranio-Caudale)</span>
              <span className="font-extrabold text-slate-900">{ultrasound.lccMm || '-'} mm</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">BIP (Diamètre Bipariétal)</span>
              <span className="font-extrabold text-slate-900">{ultrasound.bipMm || '-'} mm</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">LF (Longueur Fémorale)</span>
              <span className="font-extrabold text-slate-900">{ultrasound.lfMm || '-'} mm</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DAT (Diam. Abdominal)</span>
              <span className="font-extrabold text-slate-900">{ultrasound.datMm || '-'} mm</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2">
            <div className="p-2.5 bg-slate-50 rounded-lg border">
              <span className="text-slate-500 block text-[10px]">Activité Cardiaque</span>
              <span className="font-bold text-emerald-800 uppercase">{ultrasound.cardiacActivity || 'Présente'} ({ultrasound.heartRateBpm || 150} BPM)</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border">
              <span className="text-slate-500 block text-[10px]">Liquide Amniotique</span>
              <span className="font-bold text-slate-800 capitalize">{ultrasound.amnioticFluid || 'Normal'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border">
              <span className="text-slate-500 block text-[10px]">Placenta</span>
              <span className="font-bold text-slate-800">{ultrasound.placentaLocation || 'Normal'}</span>
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="space-y-2 pt-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-rose-900 border-b pb-1">
            2. Conclusion Médicale
          </h3>
          <p className="text-xs text-slate-800 font-medium leading-relaxed bg-rose-50/50 p-3 rounded-xl border border-rose-100">
            {ultrasound.conclusion}
          </p>
        </div>

        {ultrasound.doctorNotes && (
          <div className="space-y-1 text-xs text-slate-600">
            <span className="font-bold">Remarques :</span> {ultrasound.doctorNotes}
          </div>
        )}

        {/* Signature Box */}
        <div className="pt-12 flex justify-between items-end text-xs">
          <div className="text-[10px] text-slate-400">
            Échographe certifié — {CABINET_INFO.name}
          </div>

          <div className="text-center space-y-8 pr-6">
            <div className="font-bold text-slate-900">Signature & Cachet du Médecin</div>
            <div className="italic text-rose-900 font-bold text-sm pt-4 border-b border-slate-300 w-48 mx-auto">
              {CABINET_INFO.doctorName}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
