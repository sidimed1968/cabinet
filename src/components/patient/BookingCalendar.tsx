import React, { useState, useEffect } from 'react';
import { UserProfile, AppointmentType, Appointment, ScheduleBlock } from '../../types';
import { CABINET_INFO } from '../../data/mockData';
import { DataService } from '../../services/dataService';
import { translateAppointmentType } from '../../utils/pregnancy';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Stethoscope, 
  Baby, 
  Sparkles,
  ShieldCheck,
  User,
  Phone,
  FileText
} from 'lucide-react';

interface BookingCalendarProps {
  currentUser: UserProfile;
  onBookingSuccess: () => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  currentUser,
  onBookingSuccess
}) => {
  // Today formatted as YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Tomorrow by default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const [selectedType, setSelectedType] = useState<AppointmentType>('suivi_grossesse');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>(currentUser.phone || '');

  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<{ success: boolean; message: string; appointment?: Appointment } | null>(null);

  // Load schedule data
  useEffect(() => {
    loadSchedule();
  }, [selectedDate]);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const [apts, blocks] = await Promise.all([
        DataService.getAppointments(),
        DataService.getScheduleBlocks()
      ]);
      setExistingAppointments(apts);
      setScheduleBlocks(blocks);
    } catch (e) {
      console.error('Failed to load schedule:', e);
    } finally {
      setLoading(false);
    }
  };

  // Check if a date is Sunday (Closed) or full day off
  const isDateBlocked = (dateStr: string) => {
    const d = new Date(dateStr);
    if (d.getDay() === 0) return { blocked: true, reason: 'Cabinet fermé le dimanche' };
    
    const block = scheduleBlocks.find(b => b.date === dateStr);
    if (block?.isFullDayOff) return { blocked: true, reason: block.reason || 'Journée indisponible (Urgence / Bloc)' };

    return { blocked: false };
  };

  // Get status of each time slot on selectedDate
  const getSlotStatus = (slot: string) => {
    // 1. Check if occupied by existing active appointment
    const isOccupied = existingAppointments.some(
      a => a.date === selectedDate && 
           a.timeSlot === slot && 
           a.status !== 'cancelled'
    );
    if (isOccupied) return 'occupied';

    // 2. Check if blocked by doctor schedule
    const block = scheduleBlocks.find(b => b.date === selectedDate);
    if (block?.blockedSlots.includes(slot)) return 'blocked';

    return 'available';
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setLoading(true);
    setBookingResult(null);

    const result = await DataService.bookAppointment({
      patientId: currentUser.uid,
      patientName: currentUser.displayName,
      patientPhone: patientPhone || currentUser.phone || '+222 45 00 00 00',
      patientEmail: currentUser.email,
      doctorId: 'doctor_mariem',
      doctorName: CABINET_INFO.doctorName,
      date: selectedDate,
      timeSlot: selectedSlot,
      type: selectedType,
      notes: notes.trim()
    });

    setLoading(false);
    setBookingResult(result);

    if (result.success) {
      // Refresh schedule
      await loadSchedule();
    }
  };

  const dateBlockInfo = isDateBlocked(selectedDate);

  const SERVICE_TYPES: { type: AppointmentType; label: string; desc: string; icon: any }[] = [
    {
      type: 'suivi_grossesse',
      label: 'Suivi de Grossesse & Bilan Prénatal',
      desc: 'Consultation mensuelle, mesure de la hauteur utérine & tension',
      icon: Baby
    },
    {
      type: 'echo_obstetrique',
      label: 'Échographie Obstétrique (Datation / Morpho)',
      desc: 'Échographie T1, T2 ou T3 avec mesures de biométrie fœtale',
      icon: Sparkles
    },
    {
      type: 'consultation_gyn',
      label: 'Consultation Gynécologique Générale',
      desc: 'Dépistage, bilan, frottis, douleurs pelviennes, frottis',
      icon: Stethoscope
    },
    {
      type: 'echo_pelvienne',
      label: 'Échographie Pelvienne & Gynécologique',
      desc: 'Exploration utéro-ovarienne (Kystes, fibromes, bilan)',
      icon: ShieldCheck
    },
    {
      type: 'planning_familial',
      label: 'Planning Familial & Contraception',
      desc: 'Pose/Retrait stérilet, implant, conseils contraception',
      icon: FileText
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title Card */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <CalendarIcon className="w-3.5 h-3.5" /> Prise de Rendez-vous en Ligne
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold">
              Réservation Garantie en Temps Réel
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 mt-1">
              Choississez votre motif de consultation et votre créneau horaire sans attente.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-xs shrink-0">
            <div className="font-semibold text-amber-200">Anti-Doublon Instantané</div>
            <div className="text-[11px] text-rose-100 mt-0.5">Transactions sécurisées Firebase</div>
          </div>
        </div>
      </div>

      {/* Booking Result Banner */}
      {bookingResult && (
        <div className={`p-5 rounded-2xl border transition-all ${
          bookingResult.success 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-start gap-3">
            {bookingResult.success ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="font-bold text-sm">
                {bookingResult.success ? 'Rendez-vous Confirmé !' : 'Créneau Indisponible'}
              </h3>
              <p className="text-xs mt-1 leading-relaxed">{bookingResult.message}</p>
              
              {bookingResult.success && (
                <div className="mt-3 pt-3 border-t border-emerald-200/80 flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={onBookingSuccess}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Voir Mes Rendez-vous
                  </button>
                  <button
                    onClick={() => {
                      setBookingResult(null);
                      setSelectedSlot('');
                    }}
                    className="bg-white text-emerald-800 border border-emerald-300 font-semibold px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Réserver un autre créneau
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Booking Form */}
      <form onSubmit={handleBooking} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Step 1: Select Type & Date (Left side) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Service Type Selection */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              1. Motif de Consultation
            </label>
            
            <div className="space-y-2">
              {SERVICE_TYPES.map((service) => {
                const Icon = service.icon;
                const isSelected = selectedType === service.type;
                return (
                  <div
                    key={service.type}
                    onClick={() => setSelectedType(service.type)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/60 ring-1 ring-rose-500 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold ${isSelected ? 'text-rose-950' : 'text-slate-900'}`}>
                        {service.label}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {service.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              2. Date du Rendez-vous
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot('');
                }}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <span className="text-xs text-slate-500 font-medium shrink-0">
                {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>

            {dateBlockInfo.blocked && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{dateBlockInfo.reason}</span>
              </div>
            )}
          </div>

          {/* Patient Details & Notes */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Vos Coordonnées & Précisions
            </label>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Numéro de Téléphone pour Rappel SMS
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+222 46 XX XX XX"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Remarques ou symptômes particuliers (Optionnel)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ex: Suivi 24 SA, besoin d'ordonnance bilan sanguin, douleurs..."
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Time Slots & Confirmation (Right side) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  4. Créneaux Horaires Disponibles
                </label>
                <span className="text-[10px] text-slate-500">
                  {selectedDate}
                </span>
              </div>

              {/* Slots Legend */}
              <div className="flex items-center gap-3 text-[10px] text-slate-600 mb-4 pb-2 border-b border-slate-100">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Libre
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-200"></span> Occupé
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span> Indisponible
                </span>
              </div>

              {dateBlockInfo.blocked ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Aucun créneau disponible pour cette date.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                  {CABINET_INFO.timeSlots.map((slot) => {
                    const status = getSlotStatus(slot);
                    const isSelected = selectedSlot === slot;

                    if (status === 'occupied') {
                      return (
                        <div
                          key={slot}
                          className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium text-center border border-slate-200 cursor-not-allowed line-through"
                        >
                          {slot} (Pris)
                        </div>
                      );
                    }

                    if (status === 'blocked') {
                      return (
                        <div
                          key={slot}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 text-slate-400 text-xs font-medium text-center border border-slate-200 cursor-not-allowed"
                        >
                          {slot} (Bloqué)
                        </div>
                      );
                    }

                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm scale-102'
                            : 'bg-emerald-50/50 text-emerald-900 border-emerald-200 hover:bg-emerald-100/70 hover:border-emerald-300'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
              {selectedSlot ? (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                  <div className="font-bold text-rose-900">Résumé de votre choix :</div>
                  <div className="text-slate-700 mt-1 font-medium">
                    • {translateAppointmentType(selectedType)}
                  </div>
                  <div className="text-slate-700 font-medium">
                    • Date : <span className="font-bold">{selectedDate}</span> à <span className="font-bold text-rose-700">{selectedSlot}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-slate-500 font-medium py-1">
                  Sélectionnez un créneau horaire pour continuer.
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedSlot || loading || dateBlockInfo.blocked}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                  selectedSlot && !loading && !dateBlockInfo.blocked
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span>Validation Firestore en cours...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmer la Réservation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
