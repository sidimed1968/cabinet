import React, { useState, useEffect } from 'react';
import { UserProfile, Appointment } from '../../types';
import { DataService } from '../../services/dataService';
import { translateAppointmentType, getAppointmentBadgeColor, formatFrenchDate } from '../../utils/pregnancy';
import { CABINET_INFO } from '../../data/mockData';
import { 
  Calendar, 
  Clock, 
  PlusCircle, 
  FileText, 
  Sparkles, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  Heart
} from 'lucide-react';

interface PatientDashboardProps {
  currentUser: UserProfile;
  onNavigate: (tab: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  currentUser,
  onNavigate
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAppointments();
  }, [currentUser.uid]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const list = await DataService.getPatientAppointments(currentUser.uid);
      setAppointments(list);
    } catch (e) {
      console.error('Failed to load appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (aptId: string) => {
    if (confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) {
      await DataService.updateAppointmentStatus(aptId, 'cancelled');
      await loadAppointments();
    }
  };

  // Find next upcoming appointment
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments
    .filter(a => a.status === 'confirmed' && a.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot));

  const nextAppointment = upcomingAppointments[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
              <Heart className="w-3 h-3 fill-current" /> Bienvenue sur votre Portail
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Bonjour, {currentUser.displayName}
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 mt-1 max-w-xl">
              Gérez vos rendez-vous, consultez vos comptes-rendus d'échographie et téléchargez vos ordonnances en toute confidentialité.
            </p>
          </div>

          <button
            onClick={() => onNavigate('patient_booking')}
            className="bg-white text-rose-900 hover:bg-rose-50 font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-rose-600" />
            Nouveau Rendez-vous
          </button>
        </div>
      </div>

      {/* Next Appointment Card Highlight */}
      {nextAppointment ? (
        <div className="bg-white border-2 border-rose-400 rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
            Prochain RDV Confirmé
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {translateAppointmentType(nextAppointment.type)}
                  </h3>
                  <p className="text-xs text-rose-700 font-medium">
                    {CABINET_INFO.doctorName}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 pt-1">
                <span className="flex items-center gap-1 font-bold bg-slate-100 px-3 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-rose-600" />
                  {formatFrenchDate(nextAppointment.date)}
                </span>
                <span className="flex items-center gap-1 font-bold bg-slate-100 px-3 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  {nextAppointment.timeSlot}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Tevragh Zeina, Nouakchott
                </span>
              </div>

              {nextAppointment.notes && (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                  Note : {nextAppointment.notes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCancelAppointment(nextAppointment.id)}
                className="text-xs text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-lg border border-rose-200 transition-colors font-medium"
              >
                Annuler RDV
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">Aucun rendez-vous à venir</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Sélectionnez une date et une heure disponible sur le calendrier interactif pour planifier votre consultation.
          </p>
          <button
            onClick={() => onNavigate('patient_booking')}
            className="mt-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Réserver mon Créneau
          </button>
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div 
          onClick={() => onNavigate('patient_booking')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl w-fit group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mt-3 group-hover:text-rose-700 transition-colors flex items-center justify-between">
            Prendre RDV
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-700" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Consultez les créneaux libres en temps réel
          </p>
        </div>

        <div 
          onClick={() => onNavigate('patient_records')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mt-3 group-hover:text-rose-700 transition-colors flex items-center justify-between">
            Comptes-rendus Échographies
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-700" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Visualisez vos résultats d'examens T1/T2/T3
          </p>
        </div>

        <div 
          onClick={() => onNavigate('patient_records')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mt-3 group-hover:text-rose-700 transition-colors flex items-center justify-between">
            Ordonnances Médicales
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-700" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Téléchargez vos prescriptions officielles
          </p>
        </div>

      </div>

      {/* Appointment History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" /> Historique de mes Rendez-vous
          </h3>
          <span className="text-xs text-slate-500">
            {appointments.length} enregistrement(s)
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Aucun historique de rendez-vous disponible.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((apt) => (
              <div key={apt.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">
                    {translateAppointmentType(apt.type)}
                  </div>
                  <div className="text-slate-500 flex items-center gap-2">
                    <span>{formatFrenchDate(apt.date)} à {apt.timeSlot}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getAppointmentBadgeColor(apt.status)}`}>
                    {apt.status === 'confirmed' && 'Confirmé'}
                    {apt.status === 'completed' && 'Honoré / Terminé'}
                    {apt.status === 'cancelled' && 'Annulé'}
                    {apt.status === 'rescheduled' && 'Reporté'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
