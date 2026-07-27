import React, { useState, useEffect } from 'react';
import { UserProfile, Appointment, ScheduleBlock } from '../../types';
import { DataService } from '../../services/dataService';
import { translateAppointmentType, getAppointmentBadgeColor, formatFrenchDate } from '../../utils/pregnancy';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Stethoscope, 
  FileText, 
  Sparkles,
  Ban,
  PhoneCall,
  Search
} from 'lucide-react';

interface DoctorDashboardProps {
  currentUser: UserProfile;
  onNavigate: (tab: string) => void;
  onSelectPatientForRecord?: (patientId: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  currentUser,
  onNavigate,
  onSelectPatientForRecord
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected date filter (default today)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>(todayStr);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apts, blocks] = await Promise.all([
        DataService.getAppointments(),
        DataService.getScheduleBlocks()
      ]);
      setAppointments(apts);
      setScheduleBlocks(blocks);
    } catch (e) {
      console.error('Error loading doctor data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (aptId: string, newStatus: Appointment['status']) => {
    await DataService.updateAppointmentStatus(aptId, newStatus);
    await loadData();
  };

  // Filter today's appointments
  const filteredAppointments = appointments.filter(a => a.date === selectedDateFilter);
  const confirmedTodayCount = appointments.filter(a => a.date === todayStr && a.status === 'confirmed').length;
  const completedTodayCount = appointments.filter(a => a.date === todayStr && a.status === 'completed').length;
  const totalPatientCount = new Set(appointments.map(a => a.patientId)).size;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-slate-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-600/30 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 text-emerald-200">
              <Stethoscope className="w-3.5 h-3.5" /> Tableau de Bord Médecin & Secrétariat
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Espace Praticien — {currentUser.displayName}
            </h2>
            <p className="text-xs text-emerald-100 mt-1">
              Gestion de l'agenda, fiches de consultation, échographies & ordonnances prénatales.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('doctor_agenda')}
              className="bg-white text-emerald-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-emerald-700" />
              Gérer l'Agenda & Urgences
            </button>
            <button
              onClick={() => onNavigate('doctor_patients')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Dossiers Patientes
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs font-medium uppercase">RDV Aujourd'hui</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{confirmedTodayCount}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Confirmés</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs font-medium uppercase">Consultations Honorées</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{completedTodayCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Aujourd'hui</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs font-medium uppercase">Patientes Suivies</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{totalPatientCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Dossiers actifs</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs font-medium uppercase">Date Sélectionnée</div>
          <div className="text-sm font-bold text-slate-900 mt-2 truncate">
            {formatFrenchDate(selectedDateFilter)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Programme du jour</div>
        </div>

      </div>

      {/* Today's Agenda Table & Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              Programme des Consultations ({filteredAppointments.length})
            </h3>
            <p className="text-xs text-slate-500">
              Mettez à jour le statut des patientes au fur et à mesure de la journée.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 shrink-0">Changer de date :</label>
            <input
              type="date"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Aucun rendez-vous planifié pour la date du {selectedDateFilter}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Heure</th>
                  <th className="py-2.5 px-3">Patiente</th>
                  <th className="py-2.5 px-3">Téléphone</th>
                  <th className="py-2.5 px-3">Motif</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3 text-right">Actions Médicales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments
                  .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                  .map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md">
                          {apt.timeSlot}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (onSelectPatientForRecord) onSelectPatientForRecord(apt.patientId);
                            onNavigate('doctor_patients');
                          }}
                          className="hover:text-emerald-700 hover:underline text-left cursor-pointer"
                        >
                          {apt.patientName}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <a href={`tel:${apt.patientPhone.replace(/\s+/g, '')}`} className="flex items-center gap-1 hover:text-emerald-700">
                          <PhoneCall className="w-3 h-3 text-emerald-600" />
                          {apt.patientPhone}
                        </a>
                      </td>

                      <td className="py-3 px-3 text-slate-700">
                        <span className="font-medium">{translateAppointmentType(apt.type)}</span>
                        {apt.notes && (
                          <div className="text-[10px] text-slate-400 italic truncate max-w-xs">
                            {apt.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getAppointmentBadgeColor(apt.status)}`}>
                          {apt.status === 'confirmed' && 'Confirmé'}
                          {apt.status === 'completed' && 'Terminé'}
                          {apt.status === 'cancelled' && 'Annulé'}
                          {apt.status === 'rescheduled' && 'Reporté'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(apt.id, 'completed')}
                              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-2.5 py-1 rounded-lg font-bold transition-colors text-[11px] border border-emerald-200"
                              title="Marquer comme consulté"
                            >
                              Terminer
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (onSelectPatientForRecord) onSelectPatientForRecord(apt.patientId);
                              onNavigate('doctor_patients');
                            }}
                            className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2.5 py-1 rounded-lg font-semibold transition-colors text-[11px]"
                          >
                            Ouvrir Fiche
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
