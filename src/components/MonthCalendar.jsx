import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Zap, 
  X, 
  Download,
  Footprints,
  Bike,
  Waves,
  Mountain,
  Activity,
  Compass,
  ArrowRightLeft,
  GripVertical
} from 'lucide-react';
import { exportWorkoutToFitJson } from '../services/exportService';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const WEEKDAY_NAMES_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const WEEKDAY_NAMES_LONG = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function MonthCalendar({ plan, userProfile, onPlanUpdated, onOpenGenerator }) {
  if (!plan || !plan.weeks || plan.weeks.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 text-center max-w-lg mx-auto shadow-xs my-6">
        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-700 mb-3">
          <CalendarIcon className="w-6 h-6 text-slate-500" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Aucun programme actif</h3>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Votre compte est prêt mais vous n'avez pas encore configuré votre premier cycle d'entraînement.
        </p>
        {onOpenGenerator && (
          <button
            onClick={onOpenGenerator}
            className="mt-4 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs active:scale-95"
          >
            Créer mon premier programme
          </button>
        )}
      </div>
    );
  }

  const startDate = new Date();
  const dayOffset = (1 + 7 - startDate.getDay()) % 7;
  const planStart = new Date(startDate);
  planStart.setDate(startDate.getDate() + (dayOffset === 0 ? 0 : dayOffset));
  planStart.setHours(0, 0, 0, 0);

  const workoutDateMap = {};
  if (plan && plan.weeks) {
    plan.weeks.forEach((week) => {
      week.days.forEach((dayItem) => {
        const sessionDate = new Date(planStart);
        const dayDifference = ((week.weekNumber - 1) * 7) + dayItem.dayIndex;
        sessionDate.setDate(planStart.getDate() + dayDifference);
        
        const dateKey = formatDateKey(sessionDate);
        workoutDateMap[dateKey] = {
          date: sessionDate,
          weekNumber: week.weekNumber,
          weekIndex: week.weekNumber - 1,
          phase: week.phase,
          isRecoveryWeek: week.isRecoveryWeek,
          dayItem
        };
      });
    });
  }

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(planStart));
  const [selectedSessionModal, setSelectedSessionModal] = useState(null);
  const [showMovePicker, setShowMovePicker] = useState(false);
  
  // Drag & drop state for Month Calendar
  const [draggedCellKey, setDraggedCellKey] = useState(null);
  const [dragOverCellKey, setDragOverCellKey] = useState(null);
  const [moveNotice, setMoveNotice] = useState(null);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleTodayMonth = () => {
    setCurrentMonthDate(new Date(planStart));
  };

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  let firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarCells = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
    calendarCells.push({
      date: prevDate,
      isCurrentMonth: false,
      dateKey: formatDateKey(prevDate)
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dDate = new Date(year, month, d);
    calendarCells.push({
      date: dDate,
      isCurrentMonth: true,
      dateKey: formatDateKey(dDate)
    });
  }

  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let n = 1; n <= remainingCells; n++) {
    const nextDate = new Date(year, month + 1, n);
    calendarCells.push({
      date: nextDate,
      isCurrentMonth: false,
      dateKey: formatDateKey(nextDate)
    });
  }

  const getSportBadge = (sport, category) => {
    if (category === 'test') {
      return {
        icon: Compass,
        label: 'Test',
        chip: 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100',
        dot: 'bg-purple-600'
      };
    }

    switch (sport) {
      case 'running':
        return {
          icon: Footprints,
          label: 'Course',
          chip: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
          dot: 'bg-rose-500'
        };
      case 'cycling':
        return {
          icon: Bike,
          label: 'Vélo',
          chip: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
          dot: 'bg-amber-500'
        };
      case 'swimming':
        return {
          icon: Waves,
          label: 'Natation',
          chip: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
          dot: 'bg-sky-500'
        };
      case 'trail':
        return {
          icon: Mountain,
          label: 'Trail',
          chip: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
          dot: 'bg-emerald-500'
        };
      default:
        return {
          icon: Zap,
          label: 'Brique',
          chip: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100',
          dot: 'bg-orange-500'
        };
    }
  };

  let monthWorkoutsCount = 0;
  let monthTotalDuration = 0;
  let monthTotalTSS = 0;

  calendarCells.forEach(cell => {
    if (cell.isCurrentMonth && workoutDateMap[cell.dateKey]) {
      const w = workoutDateMap[cell.dateKey].dayItem.workout;
      if (w) {
        monthWorkoutsCount += 1;
        monthTotalDuration += (w.durationMinutes || 0);
        monthTotalTSS += (w.estimatedTSS || 0);
      }
    }
  });

  // Swap / Move workout between two dates/cells across the plan
  const swapWorkoutBetweenEntries = (sourceEntry, targetEntry) => {
    if (!sourceEntry || !targetEntry) return;

    const updatedPlan = JSON.parse(JSON.stringify(plan));
    const sourceWeek = updatedPlan.weeks[sourceEntry.weekIndex];
    const targetWeek = updatedPlan.weeks[targetEntry.weekIndex];
    if (!sourceWeek || !targetWeek) return;

    const sourceDay = sourceWeek.days[sourceEntry.dayItem.dayIndex];
    const targetDay = targetWeek.days[targetEntry.dayItem.dayIndex];

    const tempWorkout = sourceDay.workout;
    const tempIsRest = sourceDay.isRest;

    sourceDay.workout = targetDay.workout;
    sourceDay.isRest = targetDay.isRest;

    targetDay.workout = tempWorkout;
    targetDay.isRest = tempIsRest;

    // Recalculate weeks totals
    sourceWeek.totalDurationMinutes = sourceWeek.days.reduce((acc, d) => acc + (d.workout?.durationMinutes || 0), 0);
    sourceWeek.estimatedTSS = sourceWeek.days.reduce((acc, d) => acc + (d.workout?.estimatedTSS || 0), 0);

    if (sourceWeek !== targetWeek) {
      targetWeek.totalDurationMinutes = targetWeek.days.reduce((acc, d) => acc + (d.workout?.durationMinutes || 0), 0);
      targetWeek.estimatedTSS = targetWeek.days.reduce((acc, d) => acc + (d.workout?.estimatedTSS || 0), 0);
    }

    if (typeof onPlanUpdated === 'function') {
      onPlanUpdated(updatedPlan);
    }

    const sDateStr = sourceEntry.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    const tDateStr = targetEntry.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    setMoveNotice(`Séance déplacée du ${sDateStr} vers le ${tDateStr}`);
    setTimeout(() => setMoveNotice(null), 3500);
  };

  // Move workout within the week from the calendar modal
  const handleMoveSessionToDay = (targetDayIndex) => {
    if (!selectedSessionModal) return;

    const sourceEntry = selectedSessionModal;
    const targetDate = new Date(sourceEntry.date);
    targetDate.setDate(sourceEntry.date.getDate() + (targetDayIndex - sourceEntry.dayItem.dayIndex));

    const targetEntry = {
      weekIndex: sourceEntry.weekIndex,
      weekNumber: sourceEntry.weekNumber,
      dayItem: { dayIndex: targetDayIndex },
      date: targetDate
    };

    swapWorkoutBetweenEntries(sourceEntry, targetEntry);
    setShowMovePicker(false);
    setSelectedSessionModal(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e, dateKey) => {
    const entry = workoutDateMap[dateKey];
    if (!entry || !entry.dayItem.workout) return;
    setDraggedCellKey(dateKey);
    e.dataTransfer.setData('text/plain', dateKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, dateKey) => {
    e.preventDefault();
    if (workoutDateMap[dateKey]) {
      e.dataTransfer.dropEffect = 'move';
      if (dragOverCellKey !== dateKey) {
        setDragOverCellKey(dateKey);
      }
    }
  };

  const handleDragLeave = (dateKey) => {
    if (dragOverCellKey === dateKey) {
      setDragOverCellKey(null);
    }
  };

  const handleDrop = (e, targetDateKey) => {
    e.preventDefault();
    setDragOverCellKey(null);
    const sourceDateKey = draggedCellKey || e.dataTransfer.getData('text/plain');

    if (!sourceDateKey || sourceDateKey === targetDateKey) {
      setDraggedCellKey(null);
      return;
    }

    const sourceEntry = workoutDateMap[sourceDateKey];
    const targetEntry = workoutDateMap[targetDateKey];

    if (sourceEntry && targetEntry) {
      swapWorkoutBetweenEntries(sourceEntry, targetEntry);
    }

    setDraggedCellKey(null);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Toast Notice when session is moved */}
      {moveNotice && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs py-2.5 px-4 rounded-xl shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>{moveNotice}</span>
        </div>
      )}

      {/* Month Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <button
              onClick={handlePrevMonth}
              className="p-2 sm:p-1.5 bg-white hover:bg-slate-50 text-slate-700 border-r border-slate-200 active:bg-slate-100"
              title="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleTodayMonth}
              className="px-3 py-2 sm:py-1.5 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 active:bg-slate-100"
            >
              Aujourd'hui
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 sm:p-1.5 bg-white hover:bg-slate-50 text-slate-700 border-l border-slate-200 active:bg-slate-100"
              title="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {MONTH_NAMES[month]} {year}
          </h2>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 text-xs border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
          <div>
            <span className="text-slate-400 uppercase text-[9px] font-semibold block">Séances</span>
            <span className="text-slate-900 font-bold text-xs sm:text-sm">{monthWorkoutsCount}</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 uppercase text-[9px] font-semibold block">Volume</span>
            <span className="text-slate-900 font-bold text-xs sm:text-sm">{Math.floor(monthTotalDuration / 60)}h{monthTotalDuration % 60}m</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 uppercase text-[9px] font-semibold block">TSS</span>
            <span className="text-slate-900 font-bold text-xs sm:text-sm">{monthTotalTSS}</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2 text-[11px] sm:text-xs font-semibold text-slate-600">
          {WEEKDAY_NAMES_LONG.map((name, i) => (
            <div key={name} className={i >= 5 ? 'text-slate-900 font-bold' : ''}>
              <span className="sm:hidden">{WEEKDAY_NAMES_SHORT[i]}</span>
              <span className="hidden sm:inline">{name}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
          {calendarCells.map((cell) => {
            const planEntry = workoutDateMap[cell.dateKey];
            const workout = planEntry?.dayItem?.workout;
            const isToday = isSameDay(cell.date, new Date());
            const isDraggingThis = draggedCellKey === cell.dateKey;
            const isDragOverThis = dragOverCellKey === cell.dateKey;

            return (
              <div
                key={cell.dateKey}
                onDragOver={(e) => handleDragOver(e, cell.dateKey)}
                onDragLeave={() => handleDragLeave(cell.dateKey)}
                onDrop={(e) => handleDrop(e, cell.dateKey)}
                className={`min-h-[80px] sm:min-h-[120px] p-1 sm:p-1.5 flex flex-col justify-between transition-all ${
                  cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50 text-slate-300'
                } ${isToday ? 'ring-2 ring-inset ring-slate-900 bg-slate-50/60' : ''} ${
                  isDragOverThis ? 'bg-sky-50 ring-2 ring-inset ring-sky-500 scale-[0.99]' : ''
                } ${isDraggingThis ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] sm:text-xs font-semibold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center ${
                      isToday
                        ? 'bg-slate-900 text-white font-bold'
                        : cell.isCurrentMonth
                        ? 'text-slate-700'
                        : 'text-slate-300'
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>

                  {planEntry && planEntry.dayItem.dayIndex === 0 && (
                    <span className="hidden sm:inline-block text-[9px] font-semibold px-1 bg-slate-100 text-slate-500 rounded border border-slate-200">
                      S{planEntry.weekNumber}
                    </span>
                  )}
                </div>

                <div className="my-0.5 sm:my-1 flex-1">
                  {workout ? (
                    (() => {
                      const sportBadge = getSportBadge(workout.sport, workout.category);
                      const garmin = workout.garminImpact;
                      return (
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, cell.dateKey)}
                          className="group relative cursor-grab active:cursor-grabbing"
                        >
                          <button
                            onClick={() => {
                              setSelectedSessionModal({ ...planEntry, workout });
                              setShowMovePicker(false);
                            }}
                            className={`w-full text-left p-1 sm:p-1.5 rounded border transition-all text-xs active:scale-95 ${sportBadge.chip}`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1 font-semibold text-[10px] sm:text-[11px] leading-tight line-clamp-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${sportBadge.dot} shrink-0`}></span>
                                <span className="truncate">{workout.title}</span>
                              </div>
                              <GripVertical className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block shrink-0" />
                            </div>
                            
                            <div className="mt-0.5 sm:mt-1 flex items-center justify-between text-[10px] opacity-90 font-medium">
                              <span>{workout.durationMinutes} min</span>
                              {garmin ? (
                                <span className="hidden sm:inline-block text-[9px] font-semibold bg-white/70 px-1 rounded border border-black/5">
                                  TE {garmin.aerobicTE}
                                </span>
                              ) : null}
                            </div>
                          </button>
                        </div>
                      );
                    })()
                  ) : planEntry && !planEntry.dayItem.isRest ? null : planEntry ? (
                    <div className="text-[9px] sm:text-[10px] text-slate-400 text-center py-1 sm:py-2 select-none">
                      Repos
                    </div>
                  ) : null}
                </div>

                <div className="h-0.5"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Details Modal with Move Option */}
      {selectedSessionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedSessionModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide">
                <span>Semaine {selectedSessionModal.weekNumber}</span>
                <span>·</span>
                <span>{selectedSessionModal.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 pr-6">
              {selectedSessionModal.workout.title}
            </h3>

            {/* Quick Move Trigger inside Modal */}
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 flex items-center gap-1.5 font-semibold">
                  <ArrowRightLeft className="w-4 h-4 text-sky-600" />
                  <span>Déplacer cette séance</span>
                </span>

                <button
                  type="button"
                  onClick={() => setShowMovePicker(!showMovePicker)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 transition-colors shadow-2xs active:bg-slate-200"
                >
                  {showMovePicker ? 'Annuler' : 'Changer de jour'}
                </button>
              </div>

              {/* Day Picker with large touch targets for mobile */}
              {showMovePicker && plan.weeks[selectedSessionModal.weekIndex] && (
                <div className="pt-2 border-t border-slate-200/80 animate-in fade-in">
                  <div className="text-[11px] text-slate-500 font-medium mb-1.5">
                    Sélectionnez le jour de destination dans la Semaine {selectedSessionModal.weekNumber} :
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {plan.weeks[selectedSessionModal.weekIndex].days.map((d) => {
                      const isCurrentDay = d.dayIndex === selectedSessionModal.dayItem.dayIndex;
                      return (
                        <button
                          key={d.dayIndex}
                          type="button"
                          disabled={isCurrentDay}
                          onClick={() => handleMoveSessionToDay(d.dayIndex)}
                          className={`p-2.5 rounded-lg border text-left text-xs transition-all active:scale-95 ${
                            isCurrentDay
                              ? 'opacity-40 bg-slate-200 border-slate-300 text-slate-500 cursor-not-allowed'
                              : 'bg-white hover:bg-sky-50 hover:border-sky-300 border-slate-200 text-slate-900 font-semibold shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{d.dayName}</span>
                            {isCurrentDay && <span className="text-[9px] uppercase text-slate-400">Actuel</span>}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                            {d.isRest ? '🌿 Repos' : `⚡ ${d.workout?.title.substring(0, 10)}...`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Metrics ribbon */}
            <div className="mt-3 flex items-center gap-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs ">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedSessionModal.workout.durationMinutes} min</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>~{selectedSessionModal.workout.estimatedTSS} TSS</span>
              </div>
              <span>·</span>
              <span className="uppercase text-[11px] font-semibold text-slate-600">
                {selectedSessionModal.workout.sport}
              </span>
            </div>

            {/* Garmin Impact Box */}
            {selectedSessionModal.workout.garminImpact && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Activity className="w-3.5 h-3.5 text-sky-600" />
                    <span>Bénéfice : {selectedSessionModal.workout.garminImpact.primaryBenefit}</span>
                  </div>
                  <div className="text-[11px] text-slate-700">
                    EPOC : {selectedSessionModal.workout.garminImpact.epocRange}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs ">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase">Training Effect Aérobie</div>
                    <div className="text-sm font-bold text-sky-700 mt-0.5">
                      {selectedSessionModal.workout.garminImpact.aerobicTE} / 5.0
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase">Training Effect Anaérobie</div>
                    <div className="text-sm font-bold text-amber-700 mt-0.5">
                      {selectedSessionModal.workout.garminImpact.anaerobicTE} / 5.0
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-700 pt-1 space-y-1">
                  <div>
                    <strong className="text-slate-900">Impact corporel :</strong>{' '}
                    {selectedSessionModal.workout.garminImpact.muscleAdaptation}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    <strong>Carburant :</strong> {selectedSessionModal.workout.garminImpact.dominantFuel}
                  </div>
                </div>
              </div>
            )}

            {/* Target Guidance */}
            {selectedSessionModal.workout.personalizedPace && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                <strong>Cible :</strong> {selectedSessionModal.workout.personalizedPace}
              </div>
            )}

            {/* Description */}
            <div className="mt-3 text-xs text-slate-600 leading-relaxed">
              {selectedSessionModal.workout.description}
            </div>

            {/* Workout Structure Steps */}
            {selectedSessionModal.workout.steps && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-900 mb-2">
                  Protocole détaillé :
                </div>
                <div className="space-y-1.5">
                  {selectedSessionModal.workout.steps.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-1.5 px-2 bg-slate-50 rounded border border-slate-200 "
                    >
                      <span className="text-slate-800 text-[11px]">{st.name}</span>
                      <span className="text-slate-500 font-semibold text-[11px]">{st.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedSessionModal(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Fermer
              </button>

              <button
                onClick={() => {
                  exportWorkoutToFitJson(
                    selectedSessionModal.workout,
                    selectedSessionModal.dayItem.dayName,
                    selectedSessionModal.weekNumber
                  );
                }}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger .FIT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
