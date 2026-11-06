import React, { useState } from 'react';
import WorkoutCard from './WorkoutCard';
import WeekReviewModal from './WeekReviewModal';
import { exportWeekToICal, exportPlanToPrintable } from '../services/exportService';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Zap, 
  FileText, 
  Target, 
  Download, 
  BarChart3,
  Compass,
  Gauge,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers
} from 'lucide-react';

export default function Dashboard({ plan, userProfile, onPlanUpdated, onOpenExports }) {
  if (!plan || !plan.weeks || plan.weeks.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        Aucun plan actif. Accédez à l'onglet "Générateur" pour créer un programme.
      </div>
    );
  }

  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const currentWeek = plan.weeks[currentWeekIndex] || plan.weeks[0];

  const totalHours = Math.round(plan.weeks.reduce((acc, w) => acc + w.totalDurationMinutes, 0) / 60);
  const totalTSS = plan.weeks.reduce((acc, w) => acc + w.estimatedTSS, 0);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Summary Card - Mobile optimized */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                {plan.disciplineName} &mdash; {plan.distanceLabel}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Actif
              </span>
            </div>

            <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1 font-semibold text-slate-900">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                Objectif : {plan.targetTime}
              </span>
              {plan.raceDate && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono text-sky-800 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-sky-600" />
                    {new Date(plan.raceDate).toLocaleDateString('fr-FR')}
                  </span>
                </>
              )}
              {plan.targetPaceData && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono text-slate-700 font-medium">
                    {plan.targetPaceData.formattedPace} ({plan.targetPaceData.speedKmh} km/h)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Aggregate KPI counters */}
          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 pt-2.5 sm:pt-0">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Volume</div>
              <div className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">{totalHours}h</div>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <div className="text-[10px] font-mono text-slate-400 uppercase">TSS</div>
              <div className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">{totalTSS}</div>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Semaines</div>
              <div className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">{plan.totalWeeks}</div>
            </div>
          </div>
        </div>

        {plan.baseBuildingWeeksCount > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex flex-wrap items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
              {plan.baseBuildingWeeksCount} sem Volume
            </span>
            <span>+</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
              {plan.standardSpecificWeeks} sem Spécifique
            </span>
          </div>
        )}
      </div>

      {/* Week Navigation Controls - Large touch targets */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          {/* Touch-friendly previous / next buttons */}
          <div className="inline-flex rounded-lg shadow-2xs border border-slate-200 overflow-hidden">
            <button
              onClick={() => currentWeekIndex > 0 && setCurrentWeekIndex(currentWeekIndex - 1)}
              disabled={currentWeekIndex === 0}
              className="p-2 sm:px-3 sm:py-1.5 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium border-r border-slate-200 flex items-center gap-1 active:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Précédente</span>
            </button>
            <button
              onClick={() => currentWeekIndex < plan.weeks.length - 1 && setCurrentWeekIndex(currentWeekIndex + 1)}
              disabled={currentWeekIndex === plan.weeks.length - 1}
              className="p-2 sm:px-3 sm:py-1.5 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-1 active:bg-slate-100"
            >
              <span className="hidden sm:inline">Suivante</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-right sm:text-left">
            <div className="font-bold text-sm text-slate-900 leading-tight">
              Semaine {currentWeek.weekNumber} / {plan.totalWeeks}
            </div>
            <div className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
              {currentWeek.phase}
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {currentWeekIndex < plan.weeks.length - 1 && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="flex-1 sm:flex-none justify-center py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Bilan S{currentWeek.weekNumber}</span>
            </button>
          )}

          <button
            onClick={() => exportWeekToICal(currentWeek, plan)}
            className="p-2 sm:px-2.5 sm:py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-mono flex items-center gap-1"
            title="Exporter vers agenda iPhone"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">.ics</span>
          </button>
        </div>
      </div>

      {/* Adaptive Notice Banner if Week was Adapted */}
      {currentWeek.adaptation && (
        <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
          currentWeek.adaptation.severity === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : currentWeek.adaptation.severity === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          {currentWeek.adaptation.severity === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          ) : currentWeek.adaptation.severity === 'success' ? (
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold">
              {currentWeek.adaptation.decision}
            </div>
            <div className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
              {currentWeek.adaptation.detail}
            </div>
          </div>
        </div>
      )}

      {/* 7 Days Workout Cards - Grid on desktop, vertical clear list on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2.5 sm:gap-3">
        {currentWeek.days.map((dayItem) => (
          <WorkoutCard
            key={dayItem.dayIndex}
            dayName={dayItem.dayName}
            workout={dayItem.workout}
            weekNumber={currentWeek.weekNumber}
          />
        ))}
      </div>

      {/* Macro Progression Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Progression du cycle ({plan.totalWeeks} sem)</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Touchez une semaine pour la voir
          </span>
        </div>

        <div className="flex sm:grid sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-1.5 min-w-[320px] pb-1">
          {plan.weeks.map((w, idx) => {
            const isSelected = idx === currentWeekIndex;
            return (
              <button
                key={w.weekNumber}
                onClick={() => setCurrentWeekIndex(idx)}
                className={`py-2 px-2.5 sm:px-1 rounded-lg border text-center font-mono text-[11px] shrink-0 sm:shrink min-w-[50px] sm:min-w-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs font-bold'
                    : w.isBaselineWeek
                    ? 'border-purple-300 bg-purple-50 text-purple-900 font-semibold'
                    : w.phaseCategory === 'base_building'
                    ? 'border-sky-300 bg-sky-50 text-sky-800'
                    : w.phaseCategory === 'taper'
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : w.isRecoveryWeek
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>S{w.weekNumber}</div>
                <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {w.isBaselineWeek ? 'TEST' : `${Math.round(w.totalDurationMinutes / 60)}h`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <WeekReviewModal
          week={currentWeek}
          plan={plan}
          onPlanUpdated={onPlanUpdated}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
}
