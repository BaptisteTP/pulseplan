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
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

export default function Dashboard({ plan, userProfile, onPlanUpdated, onOpenExports, onOpenGenerator }) {
  if (!plan || !plan.weeks || plan.weeks.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 text-center max-w-lg mx-auto shadow-xs my-6">
        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-700 mb-3">
          <Calendar className="w-6 h-6 text-slate-500" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Aucun programme actif</h3>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Pour visualiser vos séances à la semaine et ajuster votre charge, configurez d'abord un cycle.
        </p>
        {onOpenGenerator && (
          <button
            onClick={onOpenGenerator}
            className="mt-4 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs active:scale-95"
          >
            Configurer un programme
          </button>
        )}
      </div>
    );
  }

  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [draggedDayIndex, setDraggedDayIndex] = useState(null);
  const [moveNotice, setMoveNotice] = useState(null);

  const currentWeek = plan.weeks[currentWeekIndex] || plan.weeks[0];

  const totalHours = Math.round(plan.weeks.reduce((acc, w) => acc + w.totalDurationMinutes, 0) / 60);
  const totalTSS = plan.weeks.reduce((acc, w) => acc + w.estimatedTSS, 0);

  // Drag and Drop handlers within the current week
  const handleDragStart = (e, dayIndex) => {
    setDraggedDayIndex(dayIndex);
    e.dataTransfer.setData('text/plain', dayIndex);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetDayIndex) => {
    e.preventDefault();
    const sourceIndex = draggedDayIndex !== null ? draggedDayIndex : Number(e.dataTransfer.getData('text/plain'));
    
    if (sourceIndex === targetDayIndex || isNaN(sourceIndex)) {
      setDraggedDayIndex(null);
      return;
    }

    swapOrMoveDays(sourceIndex, targetDayIndex);
    setDraggedDayIndex(null);
  };

  const swapOrMoveDays = (sourceDayIndex, targetDayIndex) => {
    const updatedPlan = JSON.parse(JSON.stringify(plan));
    const weekToUpdate = updatedPlan.weeks[currentWeekIndex];

    const sourceDay = weekToUpdate.days[sourceDayIndex];
    const targetDay = weekToUpdate.days[targetDayIndex];

    // Swap workouts and rest status between days
    const tempWorkout = sourceDay.workout;
    const tempIsRest = sourceDay.isRest;

    sourceDay.workout = targetDay.workout;
    sourceDay.isRest = targetDay.isRest;

    targetDay.workout = tempWorkout;
    targetDay.isRest = tempIsRest;

    // Recalculate week totals
    weekToUpdate.totalDurationMinutes = weekToUpdate.days.reduce((acc, d) => acc + (d.workout?.durationMinutes || 0), 0);
    weekToUpdate.estimatedTSS = weekToUpdate.days.reduce((acc, d) => acc + (d.workout?.estimatedTSS || 0), 0);

    onPlanUpdated(updatedPlan);

    const sourceName = sourceDay.dayName;
    const targetName = targetDay.dayName;
    setMoveNotice(`Séance déplacée de ${sourceName} vers ${targetName}`);
    setTimeout(() => setMoveNotice(null), 3000);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Summary Card */}
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
                    Allure : {plan.targetPaceData.formattedPace} ({plan.targetPaceData.speedKmh} km/h)
                  </span>
                </>
              )}
            </div>
          </div>

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

      {/* Week Navigation Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center justify-between sm:justify-start gap-2">
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

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {currentWeekIndex < plan.weeks.length - 1 && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="flex-1 sm:flex-none justify-center py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Bilan S{currentWeek.weekNumber}</span>
            </button>
          )}

          <button
            onClick={() => exportWeekToICal(currentWeek, plan)}
            className="p-2 sm:px-2.5 sm:py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-mono flex items-center gap-1"
            title="Exporter vers agenda"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">.ics</span>
          </button>
        </div>
      </div>

      {/* Move notification toast */}
      {moveNotice && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{moveNotice}</span>
        </div>
      )}

      {/* Hint for moving sessions */}
      <div className="px-1 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
        <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
        <span>Glissez-déposez une carte de séance sur un autre jour pour la déplacer ou utilisez le menu de déplacement.</span>
      </div>

      {/* 7 Days Workout Cards - Drag & Drop enabled */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2.5 sm:gap-3">
        {currentWeek.days.map((dayItem) => {
          const isDraggingThis = draggedDayIndex === dayItem.dayIndex;

          return (
            <div
              key={dayItem.dayIndex}
              draggable={!dayItem.isRest && Boolean(dayItem.workout)}
              onDragStart={(e) => handleDragStart(e, dayItem.dayIndex)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dayItem.dayIndex)}
              className={`transition-all rounded-xl ${
                isDraggingThis ? 'opacity-40 scale-98' : ''
              }`}
            >
              <WorkoutCard
                dayName={dayItem.dayName}
                workout={dayItem.workout}
                weekNumber={currentWeek.weekNumber}
                onMoveWorkout={(targetDayIndex) => swapOrMoveDays(dayItem.dayIndex, targetDayIndex)}
                allDays={currentWeek.days}
                currentDayIndex={dayItem.dayIndex}
              />
            </div>
          );
        })}
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
