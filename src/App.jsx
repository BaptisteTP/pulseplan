import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MonthCalendar from './components/MonthCalendar';
import WatchSyncModal from './components/WatchSyncModal';
import GeneratorForm from './components/GeneratorForm';
import ExportPanel from './components/ExportPanel';
import ProfileModal from './components/ProfileModal';
import AuthScreen from './components/AuthScreen';
import { useProfile } from './context/ProfileContext';
import { generateTrainingPlan } from './services/planGenerator';
import { checkBackendHealth } from './services/api';
import { Menu, X, Calendar as CalendarIcon, LayoutGrid, Sliders, Wifi, User } from 'lucide-react';

export default function App() {
  const { profile, isAuthenticated, cloudPlan, saveUserPlan } = useProfile();
  const [activeTab, setActiveTab] = useState('calendar');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      const res = await checkBackendHealth();
      if (isMounted) {
        setBackendStatus(res.online ? 'online' : 'offline');
      }
    };
    check();
    const interval = setInterval(check, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const [currentPlan, setCurrentPlan] = useState(() => {
    return generateTrainingPlan({
      disciplineKey: profile.currentDiscipline || 'running',
      distanceKey: profile.currentDistance || 'marathon',
      daysPerWeek: profile.daysPerWeek || 4,
      targetTime: profile.targetTime || '',
      raceDate: profile.raceDate || '',
      userProfile: profile
    });
  });

  // Sync cloud plan if loaded from backend
  useEffect(() => {
    if (cloudPlan) {
      setCurrentPlan(cloudPlan);
    }
  }, [cloudPlan]);

  const handlePlanGenerated = (newPlan) => {
    setCurrentPlan(newPlan);
    saveUserPlan(newPlan);
    setActiveTab('calendar');
  };

  const handlePlanUpdated = (updatedPlan) => {
    setCurrentPlan(updatedPlan);
    saveUserPlan(updatedPlan);
  };

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased">
      {/* Desktop Left Sidebar */}
      <div className="hidden md:flex">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          currentPlan={currentPlan}
          backendStatus={backendStatus}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative z-10 w-64 bg-white shadow-xl flex flex-col h-full">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              currentPlan={currentPlan}
              backendStatus={backendStatus}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen pb-16 md:pb-0">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="font-semibold text-slate-800">
                {activeTab === 'calendar' && 'Calendrier Mensuel'}
                {activeTab === 'dashboard' && 'Vue Semaine & Adaptation'}
                {activeTab === 'sync' && 'Connecteurs Montres'}
                {activeTab === 'generator' && 'Générateur d\'Entraînement'}
                {activeTab === 'exports' && 'Exports Fichiers'}
                {activeTab === 'profile' && 'Profil Athlète & Zones'}
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">{currentPlan ? `${currentPlan.disciplineName} (${currentPlan.distanceLabel})` : 'Plan actif'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-mono hidden sm:inline">
              Athlète : <strong className="text-slate-900">{profile.name || profile.email}</strong>
            </span>
          </div>
        </header>

        {/* Tab views */}
        <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'calendar' && (
            <MonthCalendar 
              plan={currentPlan} 
              userProfile={profile} 
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard 
              plan={currentPlan} 
              userProfile={profile}
              onPlanUpdated={handlePlanUpdated}
              onOpenExports={() => setActiveTab('exports')}
            />
          )}

          {activeTab === 'sync' && (
            <WatchSyncModal 
              plan={currentPlan} 
            />
          )}

          {activeTab === 'generator' && (
            <GeneratorForm onPlanGenerated={handlePlanGenerated} />
          )}

          {activeTab === 'exports' && (
            <ExportPanel 
              plan={currentPlan} 
              userProfile={profile} 
            />
          )}

          {activeTab === 'profile' && (
            <ProfileModal />
          )}
        </main>
      </div>

      {/* iOS Native Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around py-2 px-1 z-30 shadow-lg">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'calendar' ? 'text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Mois</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'dashboard' ? 'text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Semaine</span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'sync' ? 'text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>Montre</span>
        </button>

        <button
          onClick={() => setActiveTab('generator')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'generator' ? 'text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Générateur</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'profile' ? 'text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profil</span>
        </button>
      </div>
    </div>
  );
}
