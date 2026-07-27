import React, { useState, useEffect } from 'react';
import { UserProfile, Appointment, ScheduleBlock } from '../../types';
import { DataService } from '../../services/dataService';
import { CABINET_INFO } from '../../data/mockData';
import { translateAppointmentType, getAppointmentBadgeColor, formatFrenchDate } from '../../utils/pregnancy';
import { 
  Calendar, 
  Clock, 
  Ban, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  User
} from 'lucide-react';

interface AgendaViewProps {
  currentUser: UserProfile;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ currentUser }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Block Modal state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState<boolean>(false);
  const [blockSlotsSelected, setBlockSlotsSelected] = useState<string[]>([]);
  const [isFullDayOff, setIsFullDayOff] = useState<boolean>(false);
  const [blockReason, setBlockReason] = useState<string>('Urgence médicale / Bloc opératoire');

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
      console.error('Error loading agenda data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (aptId: string, status: Appointment['status']) => {
    await DataService.updateAppointmentStatus(aptId, status);
    await loadData();
  };

  const handleBlockSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataService.blockTimeSlots(selectedDate, blockSlotsSelected, isFullDayOff, blockReason);
    setIsBlockModalOpen(false);
    setBlockSlotsSelected([]);
    await loadData();
  };

  const toggleSlotSelection = (slot: string) => {
    if (blockSlotsSelected.includes(slot)) {
      setBlockSlotsSelected(blockSlotsSelected.filter(s => s !== slot));
    } else {
      setBlockSlotsSelected([...blockSlotsSelected, slot]);
    }
  };

  const currentBlock = scheduleBlocks.find(b => b.date === selectedDate);
  const dayAppointments = appointments.filter(a => a.date === selectedDate);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> Planning & Contrôle des Créneaux
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Agenda du {formatFrenchDate(selectedDate)}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez les rendez-vous pris par les patientes et verrouillez les plages d'urgence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />

          <button
            onClick={() => setIsBlockModalOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Ban className="w-4 h-4" />
            Bloquer des Créneaux / Urgence
          </button>
        </div>
      </div>

      {/* Block Warning Banner if full day off */}
      {currentBlock?.isFullDayOff && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Journée entière verrouillée :</span> {currentBlock.reason}
            </div>
          </div>
          <button
            onClick={async () => {
              await DataService.blockTimeSlots(selectedDate, [], false, "");
              await loadData();
            }}
            className="text-[11px] font-bold text-amber-900 underline hover:text-amber-950"
          >
            Débloquer cette journée
          </button>
        </div>
      )}

      {/* Slots Grid & Appointments Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Déroulé des Créneaux Horaires (08:30 - 17:00)</span>
          <span className="text-xs font-normal text-slate-500">
            {dayAppointments.length} RDV aujourd'hui
          </span>
        </h3>

        <div className="space-y-2">
          {CABINET_INFO.timeSlots.map((slot) => {
            const appointment = dayAppointments.find(a => a.timeSlot === slot && a.status !== 'cancelled');
            const isBlockedByDoctor = currentBlock?.blockedSlots.includes(slot) || currentBlock?.isFullDayOff;

            return (
              <div 
                key={slot}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  appointment 
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isBlockedByDoctor
                    ? 'bg-rose-50/60 border-rose-200'
                    : 'bg-slate-50/50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-xs bg-slate-900 text-white px-2.5 py-1 rounded-lg shrink-0">
                    {slot}
                  </span>

                  {appointment ? (
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{appointment.patientName}</span>
                        <span className="text-slate-500 font-normal">({appointment.patientPhone})</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getAppointmentBadgeColor(appointment.status)}`}>
                          {translateAppointmentType(appointment.type)}
                        </span>
                      </div>
                      {appointment.notes && (
                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                          "{appointment.notes}"
                        </div>
                      )}
                    </div>
                  ) : isBlockedByDoctor ? (
                    <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <Ban className="w-3.5 h-3.5" /> Plage horaire bloquée par le médecin ({currentBlock?.reason || 'Urgence'})
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 font-medium">
                      Créneau Libre — Disponible pour prise de RDV en ligne
                    </div>
                  )}
                </div>

                {/* Slot Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {appointment ? (
                    <div className="flex items-center gap-1.5">
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg transition-colors"
                        >
                          Valider Consultation
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        className="text-[11px] font-semibold bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 px-3 py-1 rounded-lg transition-colors"
                      >
                        Annuler RDV
                      </button>
                    </div>
                  ) : isBlockedByDoctor ? (
                    <button
                      onClick={async () => {
                        const newBlocked = (currentBlock?.blockedSlots || []).filter(s => s !== slot);
                        await DataService.blockTimeSlots(selectedDate, newBlocked, false, currentBlock?.reason);
                        await loadData();
                      }}
                      className="text-[11px] font-bold text-rose-700 bg-white border border-rose-200 px-3 py-1 rounded-lg hover:bg-rose-50"
                    >
                      Débloquer
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        const newBlocked = [...(currentBlock?.blockedSlots || []), slot];
                        await DataService.blockTimeSlots(selectedDate, newBlocked, false, "Réservé / Urgence");
                        await loadData();
                      }}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1 rounded-lg hover:bg-slate-100"
                    >
                      Bloquer ce créneau
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* BLOCK SLOTS MODAL */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="bg-rose-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Ban className="w-5 h-5" /> Blocage de Créneaux — {selectedDate}
              </div>
              <button onClick={() => setIsBlockModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBlockSlots} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motif du blocage / Indisponibilité
                </label>
                <input
                  type="text"
                  required
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="ex: Garde Hôpital, Bloc opératoire d'urgence..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fullDayOff"
                  checked={isFullDayOff}
                  onChange={(e) => setIsFullDayOff(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
                <label htmlFor="fullDayOff" className="text-xs font-bold text-slate-800">
                  Bloquer TOUTE la journée
                </label>
              </div>

              {!isFullDayOff && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Sélectionnez les créneaux spécifiques à bloquer :
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                    {CABINET_INFO.timeSlots.map((slot) => {
                      const isSelected = blockSlotsSelected.includes(slot);
                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => toggleSlotSelection(slot)}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
                >
                  Enregistrer les Indisponibilités
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
