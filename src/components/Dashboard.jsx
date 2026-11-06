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
  Sparkles
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
    <div className="space-y-4">
      {/* Top Summary Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-lg tracking-tight">
              {plan.disciplineName} &mdash; {plan.distanceLabel}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Actif
            </span>
          </div>

          <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 font-semibold text-slate-900">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              Objectif : {plan.targetTime}
            </span>
            {plan.targetPaceData && (
              <>
                <span>·</span>
                <span className="font-mono text-slate-700 font-medium">
                  Allure spécifique : {plan.targetPaceData.formattedPace} ({plan.targetPaceData.speedKmh} km/h)
                </span>
              </>
            )}
            <span>·</span>
            <span>{plan.daysPerWeek} séances/sem</span>
            <span>·</span>
            <span className="font-mono text-slate-500">
              Vélo : {plan.hasPowerMeter ? 'Capteur Watts' : 'Ressenti RPE & FC'}
            </span>
          </div>
        </div>

        {/* Aggregate KPI counters */}
        <div className="flex items-center gap-6 text-xs">
          <div className="text-right sm:text-left">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">Volume Total</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums">{totalHours}h</div>
          </div>
          <div className="border-l border-slate-200 pl-6 text-right sm:text-left">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">Charge TSS</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums">{totalTSS}</div>
          </div>
          <div className="border-l border-slate-200 pl-6 text-right sm:text-left">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">Semaines</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums">{plan.totalWeeks}</div>
          </div>
          <div className="border-l border-slate-200 pl-4 hidden sm:block">
            <button
              onClick={() => exportPlanToPrintable(plan, userProfile)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimer / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Week Navigation Controls & Adaptive Coach Action */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-md shadow-2xs border border-slate-200 overflow-hidden">
            <button
              onClick={() => currentWeekIndex > 0 && setCurrentWeekIndex(currentWeekIndex - 1)}
              disabled={currentWeekIndex === 0}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium border-r border-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Précédente</span>
            </button>
            <button
              onClick={() => currentWeekIndex < plan.weeks.length - 1 && setCurrentWeekIndex(currentWeekIndex + 1)}
              disabled={currentWeekIndex === plan.weeks.length - 1}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <span className="hidden sm:inline">Suivante</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900">
              Semaine {currentWeek.weekNumber} sur {plan.totalWeeks}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-600 font-medium">
              {currentWeek.phase}
            </span>
            {currentWeek.isBaselineWeek && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-800 border border-purple-200 font-semibold flex items-center gap-1">
                <Compass className="w-3 h-3" />
                Tests
              </span>
            )}
            {currentWeek.isRecoveryWeek && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                Assimilation
              </span>
            )}
          </div>
        </div>

        {/* Adaptive Bilan Button */}
        <div className="flex items-center gap-2">
          {currentWeekIndex < plan.weeks.length - 1 && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Bilan Coach Fin de S{currentWeek.weekNumber}</span>
            </button>
          )}

          <button
            onClick={() => exportWeekToICal(currentWeek, plan)}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-md text-xs font-mono flex items-center gap-1 cursor-pointer"
          >
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>.ics</span>
          </button>
        </div>
      </div>

      {/* Adaptive Notice Banner if Week was Adapted */}
      {currentWeek.adaptation && (
        <div className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
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
              Adaptation Coach appliquée : {currentWeek.adaptation.decision}
            </div>
            <div className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
              {currentWeek.adaptation.detail}
            </div>
          </div>
        </div>
      )}

      {/* 7 Days Workout Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
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
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span>Périodisation du cycle complet ({plan.totalWeeks} semaines)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Bilan de fin de semaine disponible à chaque microcycle</span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-1.5">
          {plan.weeks.map((w, idx) => {
            const isSelected = idx === currentWeekIndex;
            return (
              <button
                key={w.weekNumber}
                onClick={() => setCurrentWeekIndex(idx)}
                className={`py-2 px-1 rounded border text-center font-mono text-[11px] transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-2xs font-bold'
                    : w.isBaselineWeek
                    ? 'border-purple-300 bg-purple-50 text-purple-900 hover:border-purple-400 font-semibold'
                    : w.adaptation
                    ? 'border-sky-300 bg-sky-50 text-sky-900'
                    : w.isRecoveryWeek
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
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
