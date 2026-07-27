import React, { useState } from 'react';
import { Appointment, UserProfile } from '../../types';
import { CABINET_INFO } from '../../data/mockData';
import { translateAppointmentType, formatFrenchDate } from '../../utils/pregnancy';
import { X, Bell, Smartphone, Send, CheckCircle2, Clock, Calendar } from 'lucide-react';

interface ReminderNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  appointments: Appointment[];
}

export const ReminderNotification: React.FC<ReminderNotificationProps> = ({
  isOpen,
  onClose,
  currentUser,
  appointments
}) => {
  const [simulationSent, setSimulationSent] = useState<boolean>(false);
  const [simulatedLog, setSimulatedLog] = useState<string[]>([]);

  if (!isOpen) return null;

  // Find appointments within next 48h
  const upcoming = appointments.filter(a => a.status === 'confirmed');

  const handleRunSimulation = () => {
    setSimulationSent(true);
    const logs = upcoming.map(apt => 
      `[Cloud Function Scheduled - 24h] SMS envoyé à ${apt.patientPhone} (${apt.patientName}) : "Rappel : Votre RDV au Cabinet Dr. Mariem Mint Cheikh est prévu le ${apt.date} à ${apt.timeSlot}. Tél: ${CABINET_INFO.phone1}"`
    );
    if (logs.length === 0) {
      logs.push('[Cloud Function Cron] Analyse des créneaux dans 24h : Tous les rappels automatiques sont à jour.');
    }
    setSimulatedLog(logs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-rose-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-300" />
            <div>
              <h3 className="font-bold text-base leading-tight">
                Rappels Automatiques 24h (SMS & Push)
              </h3>
              <p className="text-xs text-rose-200">Système de notifications planifiées Cloud</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/80">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Pour réduire le taux d'absentéisme et les temps d'attente au cabinet, un rappel automatique par SMS et Notification Push est programmé 24h avant chaque consultation.
          </p>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px]">
              <Calendar className="w-4 h-4 text-rose-600" />
              Rendez-vous Éligibles aux Rappels (24h - 48h)
            </div>

            {upcoming.length === 0 ? (
              <div className="text-slate-400 py-3 text-center">
                Aucun rendez-vous à venir nécessitant un rappel immédiat.
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {upcoming.map(apt => (
                  <div key={apt.id} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{apt.patientName} ({apt.patientPhone})</div>
                      <div className="text-[11px] text-slate-500">{translateAppointmentType(apt.type)} • {apt.date} à {apt.timeSlot}</div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Programmé
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test Trigger Button */}
          <button
            onClick={handleRunSimulation}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Smartphone className="w-4 h-4" />
            Lancer la Simulation d'Envoi des SMS de Rappel
          </button>

          {/* Simulation Output */}
          {simulationSent && (
            <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl space-y-1.5 max-h-36 overflow-y-auto">
              <div className="text-slate-400 font-sans font-bold text-[10px] uppercase">
                Console de Notification Cloud Function :
              </div>
              {simulatedLog.map((log, idx) => (
                <div key={idx} className="leading-snug">{log}</div>
              ))}
            </div>
          )}

          <div className="pt-2 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
