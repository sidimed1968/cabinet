import React from 'react';
import { Prescription } from '../../types';
import { CABINET_INFO } from '../../data/mockData';
import { formatFrenchDate } from '../../utils/pregnancy';
import { Printer, ArrowLeft, Heart, PhoneCall, MapPin } from 'lucide-react';

interface PrescriptionPrintViewProps {
  prescription: Prescription;
  onBack: () => void;
}

export const PrescriptionPrintView: React.FC<PrescriptionPrintViewProps> = ({
  prescription,
  onBack
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Action Bar (hidden when printing) */}
      <div className="print:hidden flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" /> Imprimer / Imprimer en PDF
        </button>
      </div>

      {/* Printable Prescription Document */}
      <div className="bg-white p-8 sm:p-12 border border-slate-200 shadow-md rounded-2xl space-y-8 print:p-0 print:border-none print:shadow-none font-serif text-slate-900">
        
        {/* Cabinet Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-xl font-bold uppercase tracking-wider font-sans text-rose-950">
              {CABINET_INFO.name}
            </h1>
            <p className="text-sm font-semibold font-sans text-slate-800">
              {CABINET_INFO.doctorName}
            </p>
            <p className="text-xs text-slate-600 font-sans max-w-md leading-relaxed">
              {CABINET_INFO.doctorTitle}
            </p>
            <p className="text-[11px] text-slate-500 font-sans italic">
              {CABINET_INFO.doctorDiploma}
            </p>
          </div>

          <div className="text-right font-sans text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-900">Nouakchott, République Islamique de Mauritanie</div>
            <div className="flex items-center justify-end gap-1"><MapPin className="w-3 h-3 text-rose-600" /> {CABINET_INFO.address}</div>
            <div className="flex items-center justify-end gap-1"><PhoneCall className="w-3 h-3 text-emerald-600" /> {CABINET_INFO.phone1}</div>
          </div>
        </div>

        {/* Date & Patient info */}
        <div className="flex justify-between items-center font-sans text-xs border-b border-slate-100 pb-4">
          <div>
            <span className="text-slate-500">Nom de la Patiente :</span>{' '}
            <span className="font-extrabold text-sm text-slate-900">{prescription.patientName}</span>
          </div>
          <div>
            <span className="text-slate-500">Date :</span>{' '}
            <span className="font-bold text-slate-900">{formatFrenchDate(prescription.date)}</span>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center py-2">
          <h2 className="text-xl font-black font-sans uppercase tracking-widest text-slate-900 underline underline-offset-8">
            ORDONNANCE
          </h2>
        </div>

        {/* Medications List */}
        <div className="space-y-6 min-h-64 py-4 font-sans">
          {prescription.medications.map((med, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-sm text-slate-900">
                  {idx + 1}. {med.medicationName} <span className="text-slate-600 font-normal">({med.dosage})</span>
                </span>
                <span className="text-xs text-slate-500 font-semibold">{med.duration}</span>
              </div>
              <div className="text-xs text-slate-800 pl-4 font-medium">
                • Posologie : {med.frequency}
              </div>
              {med.instructions && (
                <div className="text-[11px] text-slate-600 pl-4 italic">
                  Note : {med.instructions}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* General Instructions */}
        {prescription.generalInstructions && (
          <div className="border-t border-slate-200 pt-4 font-sans text-xs text-slate-700">
            <span className="font-bold">Consignes particulières :</span> {prescription.generalInstructions}
          </div>
        )}

        {/* Signature Box */}
        <div className="pt-12 flex justify-between items-end font-sans text-xs">
          <div className="text-[10px] text-slate-400">
            Document édité par le système informatique du Cabinet Gynécologique — Nouakchott
          </div>

          <div className="text-center space-y-8 pr-6">
            <div className="font-bold text-slate-900">Cachet & Signature du Médecin</div>
            <div className="font-serif italic text-rose-900 font-bold text-sm pt-4 border-b border-slate-300 w-48 mx-auto">
              {CABINET_INFO.doctorName}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
