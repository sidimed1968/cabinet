import React from 'react';
import { UserProfile } from '../types';
import { CABINET_INFO } from '../data/mockData';
import { 
  Calendar, 
  User, 
  Stethoscope, 
  LogOut, 
  Bell, 
  ShieldAlert, 
  ChevronDown,
  PhoneCall,
  MapPin,
  Clock,
  HeartPulse
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenQuickSwitch: () => void;
  onOpenReminders: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onOpenQuickSwitch,
  onOpenReminders,
  unreadCount = 0
}) => {
  const isDoctor = currentUser?.role === 'doctor';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top emergency bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-slate-300 overflow-x-auto">
            <span className="flex items-center gap-1 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {CABINET_INFO.address}
            </span>
            <span className="hidden md:flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {CABINET_INFO.workingHours}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href={`tel:${CABINET_INFO.phone1.replace(/\s+/g, '')}`} 
              className="flex items-center gap-1.5 text-emerald-400 font-semibold hover:underline"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Urgences : {CABINET_INFO.phone1}
            </a>
            
            <button
              onClick={onOpenQuickSwitch}
              className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-emerald-600/50 flex items-center gap-1 transition-colors"
              title="Changer de profil de démonstration"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Profil Demo
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Cabinet Logo & Title */}
          <div 
            onClick={() => setActiveTab(isDoctor ? 'doctor_dashboard' : 'patient_dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Cabinet Gynécologique
              </h1>
              <p className="text-xs text-rose-700 font-medium">
                {CABINET_INFO.doctorName} — Nouakchott
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {isDoctor ? (
              <>
                <button
                  onClick={() => setActiveTab('doctor_dashboard')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'doctor_dashboard'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tableau de Bord
                </button>
                <button
                  onClick={() => setActiveTab('doctor_agenda')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'doctor_agenda'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Agenda & Créneaux
                </button>
                <button
                  onClick={() => setActiveTab('doctor_patients')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'doctor_patients'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dossiers Patientes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('patient_dashboard')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'patient_dashboard'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Accueil
                </button>
                <button
                  onClick={() => setActiveTab('patient_booking')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'patient_booking'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Prendre Rendez-vous
                </button>
                <button
                  onClick={() => setActiveTab('patient_records')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'patient_records'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mon Dossier Médical
                </button>
              </>
            )}
          </nav>

          {/* Right Action Menu & User Profile */}
          <div className="flex items-center gap-2">
            {/* Reminders Button */}
            <button
              onClick={onOpenReminders}
              className="relative p-2 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Rappels de rendez-vous"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900">
                    {currentUser.displayName}
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize flex items-center justify-end gap-1">
                    {isDoctor ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <Stethoscope className="w-3 h-3" /> Médecin
                      </span>
                    ) : (
                      <span className="text-rose-700 font-medium">
                        Patiente
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Se Connecter
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around mt-3 pt-3 border-t border-slate-100 text-xs font-medium">
          {isDoctor ? (
            <>
              <button
                onClick={() => setActiveTab('doctor_dashboard')}
                className={`py-1 px-2 border-b-2 ${activeTab === 'doctor_dashboard' ? 'border-rose-600 text-rose-600 font-semibold' : 'border-transparent text-slate-600'}`}
              >
                Tableau de Bord
              </button>
              <button
                onClick={() => setActiveTab('doctor_agenda')}
                className={`py-1 px-2 border-b-2 ${activeTab === 'doctor_agenda' ? 'border-rose-600 text-rose-600 font-semibold' : 'border-transparent text-slate-600'}`}
              >
                Agenda
              </button>
              <button
                onClick={() => setActiveTab('doctor_patients')}
                className={`py-1 px-2 border-b-2 ${activeTab === 'doctor_patients' ? 'border-rose-600 text-rose-600 font-semibold' : 'border-transparent text-slate-600'}`}
              >
                Patientes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('patient_dashboard')}
                className={`py-1 px-2 border-b-2 ${activeTab === 'patient_dashboard' ? 'border-rose-600 text-rose-600 font-semibold' : 'border-transparent text-slate-600'}`}
              >
                Accueil
              </button>
              <button
                onClick={() => setActiveTab('patient_booking')}
                className={`py-1 px-2 border-b-2 ${activeTab === 'patient_booking' ? 'border-rose-600 text-rose-600 font-semibold' : 'border-transparent text-slate-600'}`}
              >
                Prendre RDV
              </button>
              <button
                onClick={() => setActiveTab('patient_records')}
                className={`py-1 px-2 border-b-2 ${activeTab === 'patient_records' ? 'border-rose-600 text-rose-600 font-semibold' : 'border-transparent text-slate-600'}`}
              >
                Mon Dossier
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
