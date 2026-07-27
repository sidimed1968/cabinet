import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { DEMO_USERS, CABINET_INFO } from './data/mockData';
import { DataService } from './services/dataService';
import { Header } from './components/Header';
import { AuthModal } from './components/common/AuthModal';
import { ReminderNotification } from './components/common/ReminderNotification';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { BookingCalendar } from './components/patient/BookingCalendar';
import { PatientMedicalFile } from './components/patient/PatientMedicalFile';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { AgendaView } from './components/doctor/AgendaView';
import { PatientList } from './components/doctor/PatientList';
import { 
  Heart, 
  MapPin, 
  PhoneCall, 
  Clock, 
  Mail, 
  ShieldCheck, 
  Stethoscope, 
  CheckCircle2, 
  User 
} from 'lucide-react';

export default function App() {
  // Current user state (defaults to Fatimetou Mint Sidi for immediate interactive preview)
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]);
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('patient_dashboard');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);

  // Selected patient for doctor view
  const [selectedPatientForDoctorRecord, setSelectedPatientForDoctorRecord] = useState<string | undefined>(undefined);

  // Appointments for notifications
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    DataService.getAppointments().then(setAppointments).catch(console.error);
  }, [activeTab]);

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'doctor') {
      setActiveTab('doctor_dashboard');
    } else {
      setActiveTab('patient_dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(DEMO_USERS[0]); // Reset to default patient Fatimetou
    setActiveTab('patient_dashboard');
  };

  const isDoctor = currentUser.role === 'doctor';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-rose-100 selection:text-rose-900">
      
      {/* Header Bar */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenQuickSwitch={() => setIsAuthModalOpen(true)}
        onOpenReminders={() => setIsReminderModalOpen(true)}
        unreadCount={appointments.filter(a => a.status === 'confirmed').length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* PATIENT VIEWS */}
        {!isDoctor && (
          <>
            {activeTab === 'patient_dashboard' && (
              <PatientDashboard
                currentUser={currentUser}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'patient_booking' && (
              <BookingCalendar
                currentUser={currentUser}
                onBookingSuccess={() => setActiveTab('patient_dashboard')}
              />
            )}

            {activeTab === 'patient_records' && (
              <PatientMedicalFile
                currentUser={currentUser}
              />
            )}
          </>
        )}

        {/* DOCTOR / ADMIN VIEWS */}
        {isDoctor && (
          <>
            {activeTab === 'doctor_dashboard' && (
              <DoctorDashboard
                currentUser={currentUser}
                onNavigate={setActiveTab}
                onSelectPatientForRecord={(pid) => setSelectedPatientForDoctorRecord(pid)}
              />
            )}

            {activeTab === 'doctor_agenda' && (
              <AgendaView
                currentUser={currentUser}
              />
            )}

            {activeTab === 'doctor_patients' && (
              <PatientList
                currentUser={currentUser}
                initialSelectedPatientId={selectedPatientForDoctorRecord}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Cabinet Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Heart className="w-4 h-4 text-rose-500 fill-current" />
                {CABINET_INFO.name}
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {CABINET_INFO.doctorTitle} — {CABINET_INFO.doctorDiploma}
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                Ancienne Chef de Clinique • Membre de la Société Mauritanienne de Gynécologie-Obstétrique
              </div>
            </div>

            {/* Address & Hours */}
            <div className="space-y-2">
              <div className="text-white font-bold text-xs uppercase tracking-wider">
                Adresse & Horaires
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{CABINET_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{CABINET_INFO.workingHours}</span>
              </div>
            </div>

            {/* Contact & Emergency */}
            <div className="space-y-2">
              <div className="text-white font-bold text-xs uppercase tracking-wider">
                Ligne Directe & Urgences
              </div>
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <PhoneCall className="w-4 h-4 text-rose-500" />
                {CABINET_INFO.phone1}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-4 h-4 text-slate-400" />
                {CABINET_INFO.phone2}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-slate-400" />
                {CABINET_INFO.email}
              </div>
            </div>

          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <div>
              © 2026 {CABINET_INFO.name} — Nouakchott, Mauritanie. Tous droits réservés.
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Conforme au secret médical & Données Firebase Sécurisées</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSelectUser={handleSelectUser}
      />

      <ReminderNotification
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        currentUser={currentUser}
        appointments={appointments}
      />

    </div>
  );
}
