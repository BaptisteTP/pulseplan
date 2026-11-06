import React, { useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { 
  getDisciplineMetadata, 
  generateTrainingPlan, 
  DEFAULT_TARGET_TIMES, 
  calculateRequiredPace,
  calculateWeeksUntilDate 
} from '../services/planGenerator';
import { 
  Sliders, 
  Check, 
  ArrowRight, 
  Target, 
  Zap, 
  Clock, 
  Calendar,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export default function GeneratorForm({ onPlanGenerated }) {
  const { profile, updateProfile } = useProfile();
  const disciplines = getDisciplineMetadata();

  const [selectedDiscipline, setSelectedDiscipline] = useState(profile.currentDiscipline || 'running');
  const [selectedDistance, setSelectedDistance] = useState(profile.currentDistance || 'marathon');
  const [daysPerWeek, setDaysPerWeek] = useState(profile.daysPerWeek || 4);
  const [hasPowerMeter, setHasPowerMeter] = useState(profile.hasPowerMeter || false);
  const [targetTime, setTargetTime] = useState(profile.targetTime || '');
  const [raceDate, setRaceDate] = useState(profile.raceDate || '');

  const availableDistances = disciplines[selectedDiscipline]?.distances || {};
  const standardSpecificWeeks = availableDistances[selectedDistance]?.weeks || 12;

  // Calculate timeline
  const weeksUntilRace = raceDate ? calculateWeeksUntilDate(raceDate) : null;
  const hasExtraVolumePhase = weeksUntilRace && weeksUntilRace > standardSpecificWeeks;
  const extraVolumeWeeks = hasExtraVolumePhase ? weeksUntilRace - standardSpecificWeeks : 0;

  const handleDisciplineChange = (key) => {
    setSelectedDiscipline(key);
    const firstDistance = Object.keys(disciplines[key].distances)[0];
    setSelectedDistance(firstDistance);
  };

  const handleDistanceChange = (distKey) => {
    setSelectedDistance(distKey);
  };

  const defaultDistanceTime = DEFAULT_TARGET_TIMES[selectedDistance] || '03:30:00';
  const effectiveTargetForCalculation = targetTime.trim() !== '' ? targetTime : defaultDistanceTime;
  const pacePreview = calculateRequiredPace(selectedDistance, effectiveTargetForCalculation);

  const handleGenerate = (e) => {
    e.preventDefault();
    const finalTargetTime = targetTime.trim() !== '' ? targetTime : defaultDistanceTime;

    updateProfile({
      currentDiscipline: selectedDiscipline,
      currentDistance: selectedDistance,
      daysPerWeek,
      hasPowerMeter,
      targetTime: finalTargetTime,
      raceDate: raceDate || null
    });

    const newPlan = generateTrainingPlan({
      disciplineKey: selectedDiscipline,
      distanceKey: selectedDistance,
      daysPerWeek,
      targetTime: finalTargetTime,
      raceDate: raceDate || null,
      userProfile: {
        ...profile,
        hasPowerMeter
      }
    });

    onPlanGenerated(newPlan);
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <div className="pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-800" />
            <h2 className="text-base font-bold text-slate-900">
              Générateur d'Entraînement Coaché (Périodisation & Date de Course)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Indiquez la date de votre objectif. Le coach calculera le temps disponible : <strong>prise de volume aérobie</strong> en amont pour bâtir le moteur, puis bascule automatique dans le <strong>bloc de préparation spécifique</strong>.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Step 1: Discipline */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              1. Discipline Sportive
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {Object.entries(disciplines).map(([key, disc]) => {
                const isSelected = selectedDiscipline === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleDisciplineChange(key)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{disc.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className={`text-[11px] mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {key === 'running' && 'Sur route (5k, 10k, Semi, Marathon)'}
                      {key === 'triathlon' && 'Natation, Vélo, Course & Enchaînements'}
                      {key === 'trail' && 'Nature, Sentiers & Dénivelé'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Distance */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              2. Format de l'Épreuve
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {Object.entries(availableDistances).map(([distKey, distData]) => {
                const isSelected = selectedDistance === distKey;
                return (
                  <button
                    key={distKey}
                    type="button"
                    onClick={() => handleDistanceChange(distKey)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-medium text-xs">{distData.label}</div>
                    <div className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      Bloc spécifique : {distData.weeks} semaines
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Race Date & Periodization Preview */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>3. Date de la Compétition / Course Cible</span>
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                Bloc spécifique requis : {standardSpecificWeeks} semaines
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <input
                  type="date"
                  value={raceDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRaceDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-700"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Laissez vide pour générer directement le bloc spécifique de {standardSpecificWeeks} semaines.
                </p>
              </div>

              {weeksUntilRace ? (
                <div className="p-3 bg-white border border-slate-200 rounded-md text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Délai total avant course :</span>
                    <strong className="text-slate-900">{weeksUntilRace} semaines</strong>
                  </div>
                  
                  {hasExtraVolumePhase ? (
                    <div className="text-[11px] text-emerald-700 leading-tight pt-1 border-t border-slate-100">
                      ✓ <strong>{extraVolumeWeeks} semaines de Prise de Volume</strong> en amont, puis bascule automatique dans les <strong>{standardSpecificWeeks} semaines de prépa spécifique</strong>.
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-700 leading-tight pt-1 border-t border-slate-100">
                      ⚡ Préparation condensée : bascule immédiate dans le bloc spécifique ({weeksUntilRace} sem).
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-mono italic">
                  Sélectionnez une date pour décomposer automatiquement la prise de volume foncier avant le bloc spécifique.
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Target Time & Coach Pace Calculation */}
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>4. Chrono Visé sur votre Projet (Temps Cible)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-[11px] text-slate-500 font-mono mb-1">
                  Format HH:MM:SS
                </label>
                <input
                  type="text"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-700"
                  placeholder={`Ex: ${defaultDistanceTime}`}
                />
              </div>

              {pacePreview && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">
                    Allure Requise {targetTime.trim() === '' ? '(Aperçu indicatif)' : 'calculée'}
                  </div>
                  <div className="text-slate-900 font-bold text-sm mt-0.5">
                    {pacePreview.formattedPace} ({pacePreview.speedKmh} km/h)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {targetTime.trim() === '' ? `Entrez votre chrono ou laissez vide pour viser ~${defaultDistanceTime}` : 'Vos séances spécifiques seront calibrées exactement sur cette allure.'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 5: Cycling Power Meter option */}
          {(selectedDiscipline === 'triathlon' || selectedDiscipline === 'running') && (
            <div className="p-4 bg-white border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Capteur de Puissance Vélo (Watts)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Avez-vous un capteur de puissance sur votre vélo ?
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHasPowerMeter(false)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border cursor-pointer ${
                      !hasPowerMeter
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Non (FC & Ressenti RPE)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasPowerMeter(true)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border cursor-pointer ${
                      hasPowerMeter
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Oui (Watts & FTP)
                  </button>
                </div>
              </div>

              {!hasPowerMeter ? (
                <div className="mt-2.5 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
                  ✓ <strong>Séances vélo guidées au RPE & Cardio :</strong> Pas de watts requis.
                </div>
              ) : (
                <div className="mt-2.5 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
                  ✓ <strong>Mode Puissance actif :</strong> Intervalles Sweet Spot et watts cibles.
                </div>
              )}
            </div>
          )}

          {/* Step 6: Sessions per week */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              5. Fréquence Hebdomadaire
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 4, 5, 6].map((num) => {
                const isSelected = daysPerWeek === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDaysPerWeek(num)}
                    className={`py-2 px-3 rounded-lg border text-center font-mono text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {num} séances / sem
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-mono">
              Athlète : <strong>{profile.name || 'Athlète'}</strong> · Objectif : <span className="font-bold text-slate-900">{targetTime || `~${defaultDistanceTime}`}</span>
              {raceDate && <span className="ml-2 text-sky-700 font-semibold">({new Date(raceDate).toLocaleDateString('fr-FR')})</span>}
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Générer le plan périodisé</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
