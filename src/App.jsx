import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MonthCalendar from './components/MonthCalendar';
import WatchSyncModal from './components/WatchSyncModal';
import GeneratorForm from './components/GeneratorForm';
import ExportPanel from './components/ExportPanel';
import ProfileModal from './components/ProfileModal';
import AuthScreen from './components/AuthScreen';
import TrainingZonesView from './components/TrainingZonesView';
import FitnessFatigueView from './components/FitnessFatigueView';
import RaceNutritionStrategy from './components/RaceNutritionStrategy';
import { useProfile } from './context/ProfileContext';
import { generateTrainingPlan } from './services/planGenerator';
import { checkBackendHealth } from './services/api';
import { Menu, X, Calendar as CalendarIcon, LayoutGrid, Sliders, Wifi, User, Gauge, Utensils, TrendingUp } from 'lucide-react';

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
    return cloudPlan || null;
  });

  // Sync cloud plan if loaded from backend or local storage
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
        {/* Top Header Bar - iOS Notch & Dynamic Island safe */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 pt-[max(0.6rem,env(safe-area-inset-top))] pb-3 sm:py-3.5 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="md:hidden p-2 -ml-1 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 cursor-pointer shadow-2xs flex items-center justify-center shrink-0"
            >
              <Menu className="w-5 h-5 text-slate-800 stroke-[2.2]" />
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-bold text-slate-900 text-[13px] sm:text-xs">
                {activeTab === 'calendar' && 'Calendrier Mensuel'}
                {activeTab === 'dashboard' && 'Vue Semaine & Séances'}
                {activeTab === 'zones' && 'Zones d\'Allures & Watts Cibles'}
                {activeTab === 'fitness' && 'Charge, Forme & Fatigue (CTL/ATL)'}
                {activeTab === 'nutrition' && 'Nutrition Course & Sac de Transition'}
                {activeTab === 'sync' && 'Connecteurs Montres'}
                {activeTab === 'generator' && 'Générateur d\'Entraînement'}
                {activeTab === 'exports' && 'Exports Fichiers'}
                {activeTab === 'profile' && 'Profil Athlète & Métriques'}
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline text-slate-600 font-medium">{currentPlan ? `${currentPlan.disciplineName} (${currentPlan.distanceLabel})` : 'Aucun plan'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs text-slate-600 truncate max-w-[140px] sm:max-w-none">
              <span className="hidden sm:inline">Athlète : </span><strong className="text-slate-900 font-semibold">{profile.name || profile.email}</strong>
            </span>
          </div>
        </header>

        {/* Tab views */}
        <main className="flex-1 p-2 sm:p-6 pb-24 md:pb-6 max-w-7xl w-full mx-auto">
          {activeTab === 'calendar' && (
            <MonthCalendar 
              plan={currentPlan} 
              userProfile={profile} 
              onPlanUpdated={handlePlanUpdated}
              onOpenGenerator={() => setActiveTab('generator')}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard 
              plan={currentPlan} 
              userProfile={profile}
              onPlanUpdated={handlePlanUpdated}
              onOpenExports={() => setActiveTab('exports')}
              onOpenGenerator={() => setActiveTab('generator')}
            />
          )}

          {activeTab === 'zones' && (
            <TrainingZonesView />
          )}

          {activeTab === 'fitness' && (
            <FitnessFatigueView plan={currentPlan} />
          )}

          {activeTab === 'nutrition' && (
            <RaceNutritionStrategy plan={currentPlan} />
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

      {/* iOS Native Bottom Bar with safe area padding */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around py-2 px-1 pb-[max(0.65rem,env(safe-area-inset-bottom))] z-40 shadow-lg">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 min-w-[44px] py-1 text-[9px] font-medium transition-colors cursor-pointer active:scale-95 ${
            activeTab === 'calendar' ? 'text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <CalendarIcon className={`w-4 h-4 ${activeTab === 'calendar' ? 'stroke-[2.5]' : ''}`} />
          <span>Mois</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 min-w-[44px] py-1 text-[9px] font-medium transition-colors cursor-pointer active:scale-95 ${
            activeTab === 'dashboard' ? 'text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutGrid className={`w-4 h-4 ${activeTab === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
          <span>Semaine</span>
        </button>

        <button
          onClick={() => setActiveTab('zones')}
          className={`flex flex-col items-center gap-1 min-w-[44px] py-1 text-[9px] font-medium transition-colors cursor-pointer active:scale-95 ${
            activeTab === 'zones' ? 'text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <Gauge className={`w-4 h-4 ${activeTab === 'zones' ? 'stroke-[2.5]' : ''}`} />
          <span>Zones</span>
        </button>

        <button
          onClick={() => setActiveTab('fitness')}
          className={`flex flex-col items-center gap-1 min-w-[44px] py-1 text-[9px] font-medium transition-colors cursor-pointer active:scale-95 ${
            activeTab === 'fitness' ? 'text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <TrendingUp className={`w-4 h-4 ${activeTab === 'fitness' ? 'stroke-[2.5]' : ''}`} />
          <span>Forme</span>
        </button>

        <button
          onClick={() => setActiveTab('nutrition')}
          className={`flex flex-col items-center gap-1 min-w-[44px] py-1 text-[9px] font-medium transition-colors cursor-pointer active:scale-95 ${
            activeTab === 'nutrition' ? 'text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <Utensils className={`w-4 h-4 ${activeTab === 'nutrition' ? 'stroke-[2.5]' : ''}`} />
          <span>Nutrition</span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`flex flex-col items-center gap-1 min-w-[44px] py-1 text-[9px] font-medium transition-colors cursor-pointer active:scale-95 ${
            activeTab === 'sync' ? 'text-slate-900 font-bold' : 'text-slate-400'
          }`}
        >
          <Wifi className={`w-4 h-4 ${activeTab === 'sync' ? 'stroke-[2.5]' : ''}`} />
          <span>Montre</span>
        </button>
      </div>
    </div>
  );
}
