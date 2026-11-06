import React, { useState } from 'react';
import { 
  exportWorkoutToFitJson, 
  exportCompatiblePlatform, 
  exportWeekToICal, 
  exportPlanToPrintable 
} from '../services/exportService';
import { Download, Calendar, FileText, Check, Info } from 'lucide-react';

export default function ExportPanel({ plan, userProfile }) {
  const [selectedFormat, setSelectedFormat] = useState('garmin');
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [notice, setNotice] = useState('');

  if (!plan) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Veuillez générer un plan au préalable.
      </div>
    );
  }

  const currentWeek = plan.weeks[selectedWeekIndex] || plan.weeks[0];
  const activeWorkouts = currentWeek.days.filter(d => !d.isRest && d.workout);

  const notify = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const platforms = [
    { id: 'garmin', name: 'Garmin (.FIT structuré)', ext: '.fit.json', desc: 'Garmin Edge / Forerunner / Fenix' },
    { id: 'wahoo', name: 'Wahoo ELEMNT (MRC/JSON)', ext: '.json', desc: 'Compteurs Elemnt Bolt & Roam' },
    { id: 'coros', name: 'COROS Training Hub', ext: '.json', desc: 'Pace, Apex, Vertix' },
    { id: 'suunto', name: 'Suunto App / Guides', ext: '.json', desc: 'Suunto Race & Vertical' },
    { id: 'polar', name: 'Polar Flow', ext: '.json', desc: 'Vantage, Grit X, Pacer' }
  ];

  const handleExportWeek = () => {
    activeWorkouts.forEach((d) => {
      if (selectedFormat === 'garmin') {
        exportWorkoutToFitJson(d.workout, d.dayName, currentWeek.weekNumber);
      } else {
        exportCompatiblePlatform(d.workout, selectedFormat);
      }
    });
    notify(`${activeWorkouts.length} séances exportées au format ${selectedFormat.toUpperCase()}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-4">
      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Export des entraînements structurés
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fichiers d'intervalles cibles compatibles avec l'ensemble des montres GPS et plateformes d'endurance.
            </p>
          </div>
          {notice && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <Check className="w-3 h-3" />
              {notice}
            </span>
          )}
        </div>

        {/* Global actions bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              exportWeekToICal(currentWeek, plan);
              notify('Fichier .ics téléchargé pour votre calendrier');
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Calendrier (.ics) Semaine {currentWeek.weekNumber}</span>
          </button>

          <button
            onClick={() => exportPlanToPrintable(plan, userProfile)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Feuille d'entraînement complète (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Export Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Platform Selector */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
            Terminal / Marque
          </div>
          <div className="space-y-1.5">
            {platforms.map(p => {
              const isSelected = selectedFormat === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedFormat(p.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer border ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-2xs font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>{p.name}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {p.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workouts list for selected week */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 ">Semaine :</span>
              <select
                value={selectedWeekIndex}
                onChange={(e) => setSelectedWeekIndex(Number(e.target.value))}
                className="bg-white border border-slate-200 text-xs text-slate-800 px-2.5 py-1 rounded focus:outline-none focus:border-slate-400"
              >
                {plan.weeks.map((w, i) => (
                  <option key={w.weekNumber} value={i}>
                    S{w.weekNumber} ({w.phase})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportWeek}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Exporter la semaine</span>
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {activeWorkouts.map((dayItem) => {
              const workout = dayItem.workout;
              return (
                <div
                  key={workout.instanceId || workout.id}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 uppercase text-[10px] font-semibold">{dayItem.dayName}</span>
                      <span className="font-medium text-slate-900">{workout.title}</span>
                      <span className="text-[10px] text-slate-500 ">({workout.durationMinutes} min)</span>
                    </div>
                    {workout.personalizedPace && (
                      <div className="text-[10px] text-emerald-700 mt-0.5">
                        {workout.personalizedPace}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (selectedFormat === 'garmin') {
                        exportWorkoutToFitJson(workout, dayItem.dayName, currentWeek.weekNumber);
                      } else {
                        exportCompatiblePlatform(workout, selectedFormat);
                      }
                      notify(`Séance exportée`);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-xs text-slate-700 transition-colors cursor-pointer"
                  >
                    Export
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Notice */}
          <div className="mt-4 p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Les fichiers <code>.fit.json</code> et <code>.json</code> sont normalisés pour être synchronisés sans fil ou via le dossier <code>/Garmin/NewFiles</code> de votre montre GPS.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
