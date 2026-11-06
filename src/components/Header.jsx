import React from 'react';
import { Calendar as CalendarIcon, Sliders, Download, User, LayoutGrid, Wifi } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, currentPlan }) {
  const navItems = [
    { id: 'calendar', label: 'Calendrier Mensuel', icon: CalendarIcon },
    { id: 'dashboard', label: 'Vue Semaine & Détails', icon: LayoutGrid },
    { id: 'sync', label: 'Connecteur Montre (Direct Sync)', icon: Wifi, badge: 'Nolio' },
    { id: 'generator', label: 'Générateur de Plan', icon: Sliders },
    { id: 'exports', label: 'Export Fichiers (.FIT, .ICS)', icon: Download },
    { id: 'profile', label: 'Zones & Profil', icon: User }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-sm tracking-tighter">
              PP
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm tracking-tight">PulsePlan</span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                OpenAthlete
              </span>
            </div>
            
            {currentPlan && (
              <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{currentPlan.disciplineName}</span>
                <span>·</span>
                <span>{currentPlan.distanceLabel}</span>
                <span>·</span>
                <span className="">{currentPlan.daysPerWeek}j/sem</span>
              </div>
            )}
          </div>

          {/* Navigation - OpenAthlete / Shadcn Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-0.5 px-1 py-0.2 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
