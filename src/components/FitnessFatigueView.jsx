import React, { useMemo } from 'react';
import { calculateFitnessFatigue } from '../services/physiologyService';
import { 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Sparkles,
  Info
} from 'lucide-react';

export default function FitnessFatigueView({ plan }) {
  if (!plan || !plan.weeks || plan.weeks.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
        Aucun plan d'entraînement actif. Veuillez d'abord générer un plan pour visualiser la charge et la courbe de forme.
      </div>
    );
  }

  const series = useMemo(() => {
    return calculateFitnessFatigue(plan.weeks);
  }, [plan]);

  const latest = series[series.length - 1] || {};
  const currentWeekEst = series[Math.min(3, series.length - 1)] || {};

  // Find max values for dynamic bar scale
  const maxLoad = Math.max(...series.map(s => Math.max(s.ctl, s.atl, 70)));

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <TrendingUp className="w-3.5 h-3.5" />
              Modèle Banister TRIMP · Performance Predictor
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-2 text-white">
              Courbe de Charge, Forme & Fatigue (CTL / ATL / TSB)
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Visualisez l'impact de chaque microcycle : accumulation du volume, assimilation lors des semaines de décharge et montée de la fraîcheur (TSB) jusqu'au jour de la compétition.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center min-w-[90px]">
              <span className="text-[10px] text-indigo-300 uppercase font-bold block">Fitness (CTL)</span>
              <span className="text-lg font-black text-white">{latest.ctl}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center min-w-[90px]">
              <span className="text-[10px] text-amber-300 uppercase font-bold block">Fraîcheur (TSB)</span>
              <span className={`text-lg font-black ${latest.tsb >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {latest.tsb > 0 ? `+${latest.tsb}` : latest.tsb}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory Indicators Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            Fitness / CTL (42 jours)
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            Votre niveau de condition aérobie accumulé. Il grimpe progressivement pendant les phases de volume et d'intensité.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            Fatigue / ATL (7 jours)
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            La fatigue immédiate générée par les séances récentes. Elle chute rapidement pendant vos semaines de décharge.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Fraîcheur / TSB (Forme = CTL - ATL)
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            Le ratio de pic de performance. Doit être positif (+5 à +20) le jour de votre course grâce à l'affûtage.
          </p>
        </div>
      </div>

      {/* Interactive Cycle Timeline Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Évolution de la charge semaine par semaine
          </h3>
          <span className="text-[11px] text-slate-400">Total : {series.length} semaines modélisées</span>
        </div>

        <div className="space-y-2.5 min-w-[500px]">
          {series.map((s) => {
            const ctlPercent = Math.min(100, Math.round((s.ctl / maxLoad) * 100));
            const atlPercent = Math.min(100, Math.round((s.atl / maxLoad) * 100));

            return (
              <div 
                key={s.weekNumber} 
                className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 w-8">S{s.weekNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      s.phaseCategory === 'taper' 
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : s.phaseCategory === 'recovery'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : s.phaseCategory === 'specific_prep'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : s.phaseCategory === 'base_building'
                        ? 'bg-sky-100 text-sky-800 border-sky-300'
                        : 'bg-purple-100 text-purple-800 border-purple-300'
                    }`}>
                      {s.phaseName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-slate-500">TSS: <strong className="text-slate-800">{s.weeklyTSS}</strong></span>
                    <span className="text-indigo-600 font-semibold">CTL: {s.ctl}</span>
                    <span className="text-rose-600 font-semibold">ATL: {s.atl}</span>
                    <span className={`font-extrabold px-1.5 py-0.5 rounded text-[10px] ${
                      s.tsb >= 5 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : s.tsb >= -15 
                        ? 'bg-sky-100 text-sky-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      TSB: {s.tsb > 0 ? `+${s.tsb}` : s.tsb}
                    </span>
                  </div>
                </div>

                {/* Comparative Double Load Bars */}
                <div className="space-y-1">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-indigo-600 rounded-full transition-all duration-500" 
                      style={{ width: `${ctlPercent}%` }}
                      title={`Fitness CTL: ${s.ctl}`}
                    ></div>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-rose-400 rounded-full transition-all duration-500" 
                      style={{ width: `${atlPercent}%` }}
                      title={`Fatigue ATL: ${s.atl}`}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
