import React, { useState } from 'react';
import { exportWorkoutToFitJson } from '../services/exportService';
import { 
  Clock, 
  Zap, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Bike, 
  Footprints, 
  Waves, 
  Mountain,
  Compass,
  Activity,
  ArrowRightLeft
} from 'lucide-react';

export default function WorkoutCard({ 
  dayName, 
  workout, 
  weekNumber, 
  onMoveWorkout, 
  allDays = [], 
  currentDayIndex = 0 
}) {
  const [showSteps, setShowSteps] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!workout) {
    return (
      <div className="min-h-[235px] bg-slate-50 border border-dashed border-slate-200 rounded-xl p-3 flex flex-col justify-between text-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            {dayName}
          </span>
          <span className="text-[10px] text-slate-400">Libre</span>
        </div>
        <div className="text-center text-slate-400 py-6">
          Repos complet
        </div>
        <div className="text-[11px] text-slate-400 ">
          0h00 · 0 TSS
        </div>
      </div>
    );
  }

  const isTest = workout.category === 'test';
  const garmin = workout.garminImpact;

  const getSportBadge = (sport, category) => {
    if (category === 'test') {
      return {
        label: 'Séance Test',
        icon: Compass,
        badge: 'bg-purple-50 text-purple-800 border-purple-200'
      };
    }

    switch (sport) {
      case 'running':
        return {
          label: 'Course',
          icon: Footprints,
          badge: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      case 'cycling':
        return {
          label: 'Vélo',
          icon: Bike,
          badge: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      case 'swimming':
        return {
          label: 'Natation',
          icon: Waves,
          badge: 'bg-sky-50 text-sky-700 border-sky-200'
        };
      case 'trail':
        return {
          label: 'Trail',
          icon: Mountain,
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      default:
        return {
          label: 'Brique',
          icon: Zap,
          badge: 'bg-orange-50 text-orange-800 border-orange-200'
        };
    }
  };

  const sportInfo = getSportBadge(workout.sport, workout.category);
  const SportIcon = sportInfo.icon;

  const handleExport = (e) => {
    e.stopPropagation();
    exportWorkoutToFitJson(workout, dayName, weekNumber);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className={`min-h-[235px] bg-white border transition-all rounded-xl p-3 flex flex-col justify-between text-xs shadow-xs hover:shadow-sm relative ${
      isTest ? 'border-purple-300 ring-1 ring-purple-100 bg-purple-50/10' : 'border-slate-200 hover:border-slate-300'
    }`}>
      <div>
        {/* Header: Day & Sport badge */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
            {dayName}
          </span>

          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${sportInfo.badge}`}>
              <SportIcon className="w-3 h-3" />
              {sportInfo.label}
            </span>

            {/* Quick Move Button for Mobile & Desktop */}
            {onMoveWorkout && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMoveMenu(!showMoveMenu)}
                  title="Déplacer vers un autre jour"
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                </button>

                {showMoveMenu && (
                  <div className="absolute right-0 top-6 z-30 w-36 bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 text-xs animate-in fade-in">
                    <div className="text-[10px] uppercase text-slate-400 font-semibold px-2 py-1">
                      Déplacer vers :
                    </div>
                    {allDays.map((d) => {
                      if (d.dayIndex === currentDayIndex) return null;
                      return (
                        <button
                          key={d.dayIndex}
                          type="button"
                          onClick={() => {
                            onMoveWorkout(d.dayIndex);
                            setShowMoveMenu(false);
                          }}
                          className="w-full text-left px-2 py-1 rounded text-[11px] text-slate-700 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                        >
                          <span>{d.dayName}</span>
                          <span className="text-[9px] text-slate-400">
                            {d.isRest ? 'Repos' : d.workout?.title.substring(0, 6) + '...'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Workout title */}
        <div className="mt-2 font-semibold text-slate-900 text-xs leading-snug">
          {workout.title}
        </div>

        {/* Metrics strip */}
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {workout.durationMinutes} min
          </span>
          <span>·</span>
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Zap className="w-3 h-3 text-amber-500" />
            {workout.estimatedTSS} TSS
          </span>
        </div>

        {/* Garmin Physiological Impact Badge */}
        {garmin && (
          <div className="mt-2 p-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Activity className="w-3 h-3 text-sky-600" />
                {garmin.primaryBenefit}
              </span>
              <span className="text-slate-600">
                TE {garmin.aerobicTE} / {garmin.anaerobicTE}
              </span>
            </div>
          </div>
        )}

        {/* Personalized target / coach banner */}
        {workout.personalizedPace && (
          <div className={`mt-2 px-2 py-1 border rounded text-[11px] leading-tight ${
            isTest 
              ? 'bg-purple-50 border-purple-200 text-purple-900' 
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            {workout.personalizedPace}
          </div>
        )}

        {/* Description summary */}
        <p className="mt-2 text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
          {workout.description}
        </p>

        {/* Collapsible Steps list & Muscle adaptation */}
        {showSteps && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-2">
            {garmin?.muscleAdaptation && (
              <div className="p-1.5 bg-sky-50/50 border border-sky-100 rounded text-[10px] text-sky-900 leading-tight">
                <strong>Adaptation corporelle :</strong> {garmin.muscleAdaptation}
              </div>
            )}

            {workout.steps && (
              <div className="space-y-1">
                <div className="text-[10px] uppercase text-slate-400">Protocole :</div>
                {workout.steps.map((st, i) => (
                  <div key={i} className="flex justify-between items-start text-[10px] py-0.5 px-1 bg-slate-50 rounded border border-slate-100 ">
                    <span className="text-slate-700 pr-1">{st.name}</span>
                    <span className="text-slate-500 whitespace-nowrap">{st.duration}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer"
        >
          {showSteps ? (
            <>Masquer <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>Impact & Protocole <ChevronDown className="w-3 h-3" /></>
          )}
        </button>

        <button
          onClick={handleExport}
          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Download className="w-2.5 h-2.5 text-slate-500" />
          <span>{downloaded ? 'Prêt' : '.FIT'}</span>
        </button>
      </div>
    </div>
  );
}
