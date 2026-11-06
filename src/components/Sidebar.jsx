import React from 'react';
import { 
  Calendar as CalendarIcon, 
  LayoutGrid, 
  Wifi, 
  Sliders, 
  Download, 
  User, 
  Activity, 
  ChevronRight,
  Server,
  LogOut,
  Gauge,
  TrendingUp,
  Utensils
} from 'lucide-react';
import { useSync } from '../context/SyncContext';
import { useProfile } from '../context/ProfileContext';

export default function Sidebar({ activeTab, setActiveTab, currentPlan, backendStatus, onCloseMobile }) {
  const { devices } = useSync();
  const { user, logout } = useProfile();
  const connectedCount = Object.values(devices).filter(d => d.connected).length;

  const navItems = [
    { 
      id: 'calendar', 
      label: 'Calendrier Mensuel', 
      icon: CalendarIcon,
      desc: 'Vue globale mois par mois'
    },
    { 
      id: 'dashboard', 
      label: 'Vue Semaine & Séances', 
      icon: LayoutGrid,
      desc: 'Microcycles & détails jours'
    },
    { 
      id: 'zones', 
      label: 'Zones Allures & Watts', 
      icon: Gauge,
      badge: 'Z1 à Z5',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      desc: 'VMA, FC Max, FTP Vélo'
    },
    { 
      id: 'fitness', 
      label: 'Charge & Forme (CTL)', 
      icon: TrendingUp,
      desc: 'Fatigue & Pic de forme'
    },
    { 
      id: 'nutrition', 
      label: 'Nutrition & Checklist', 
      icon: Utensils,
      desc: 'Apports g/h & Jour J'
    },
    { 
      id: 'sync', 
      label: 'Connecteurs Montres', 
      icon: Wifi, 
      badge: connectedCount > 0 ? `${connectedCount} relié(s)` : 'Direct Push',
      badgeColor: connectedCount > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200',
      desc: 'Garmin, Coros, Wahoo'
    },
    { 
      id: 'generator', 
      label: 'Générateur de Plan', 
      icon: Sliders,
      desc: 'Volumes & Périodisation'
    },
    { 
      id: 'exports', 
      label: 'Export Fichiers', 
      icon: Download,
      desc: '.FIT, .ICS & PDF'
    },
    { 
      id: 'profile', 
      label: 'Profil & Métriques', 
      icon: User,
      desc: 'Compte & Préférences'
    }
  ];

  const handleSelectTab = (id) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-900 text-white shadow-sm ring-1 ring-white/20">
              <Activity className="w-5 h-5 text-sky-400 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-[15px] tracking-tight block leading-none">PulsePlan</span>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">Endurance Engine</span>
            </div>
          </div>
          
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            Pro
          </span>
        </div>

        {/* Current Plan Summary Card */}
        {currentPlan && (
          <div className="m-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-0.5">
              Plan en cours
            </span>
            <div className="font-semibold text-slate-900 text-xs truncate">
              {currentPlan.disciplineName} · {currentPlan.distanceLabel}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
              <span>{currentPlan.totalWeeks} sem</span>
              <span>·</span>
              <span>{currentPlan.daysPerWeek}j/sem</span>
            </div>
          </div>
        )}

        {/* Vertical Navigation Links */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs font-medium'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-medium block leading-tight">{item.label}</span>
                    <span className={`text-[10px] block ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                      {item.desc}
                    </span>
                  </div>
                </div>

                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] border ${
                    isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Session & Backend Status */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
        {user && (
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
            <div className="truncate">
              <div className="text-[10px] text-slate-400 ">Connecté en tant que</div>
              <div className="text-slate-800 font-semibold truncate text-xs">{user.email}</div>
            </div>
            <button
              onClick={logout}
              title="Déconnexion"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span>API Backend :</span>
          </div>
          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${
            backendStatus === 'online'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            {backendStatus === 'online' ? 'Port 3001' : 'Local Mock'}
          </span>
        </div>
      </div>
    </aside>
  );
}
