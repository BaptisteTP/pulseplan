import React, { useState } from 'react';
import { 
  Utensils, 
  CheckSquare, 
  PackageCheck, 
  Droplets, 
  Timer, 
  AlertCircle,
  HelpCircle,
  Flame,
  Plus,
  Trash2
} from 'lucide-react';

export default function RaceNutritionStrategy({ plan }) {
  const disciplineKey = plan?.disciplineKey || 'triathlon';
  const distanceLabel = plan?.distanceLabel || 'Half Ironman 70.3';

  // State for Nutrition Calculator
  const [estimatedHours, setEstimatedHours] = useState(disciplineKey === 'triathlon' ? 5.0 : 3.5);
  const [athleteWeight, setAthleteWeight] = useState(70);
  const [gutTrained, setGutTrained] = useState('trained'); // 'moderate' | 'trained' | 'elite'

  // Carbs target per hour based on training level & duration
  const carbsPerHour = gutTrained === 'elite' ? 90 : gutTrained === 'trained' ? 70 : 50;
  const totalCarbs = Math.round(carbsPerHour * estimatedHours);
  const totalWaterLiters = (estimatedHours * 0.65).toFixed(1);
  const totalSodiumMg = Math.round(estimatedHours * 550);

  // Pre-configured equipment checklists
  const defaultChecklistTriathlon = [
    { id: 't1', text: 'Trifonction propre + ceinture porte-dossard (3 points)', checked: false, cat: 'Tenue' },
    { id: 't2', text: 'Combinaison néoprène (si autorisée) + lunettes avec anti-buée', checked: false, cat: 'Natation' },
    { id: 't3', text: 'Vélo vérifié : pression pneus (entre 4.5 et 6 bar), chaîne propre', checked: false, cat: 'Vélo' },
    { id: 't4', text: 'Casque homologué attaché avant de toucher le vélo en T1', checked: false, cat: 'Vélo' },
    { id: 't5', text: 'Chaussures vélo fixées ou prêtes dans le sac de transition', checked: false, cat: 'Vélo' },
    { id: 't6', text: 'Chaussures de running avec lacets élastiques (gain de temps T2)', checked: false, cat: 'Course' },
    { id: 't7', text: 'Casquette ou visière + lunettes de soleil', checked: false, cat: 'Course' },
    { id: 't8', text: 'Plein de bidons iso (maltodextrine / électrolytes) + gels scotchés sur cadre', checked: false, cat: 'Nutrition' },
    { id: 't9', text: 'Crème anti-frottement (chamois / cou / aisselles)', checked: false, cat: 'Confort' }
  ];

  const defaultChecklistRunning = [
    { id: 'r1', text: 'Dossard et épingles / ceinture porte-dossard', checked: false, cat: 'Officiel' },
    { id: 'r2', text: 'Chaussures de course testées (au moins 50km au compteur)', checked: false, cat: 'Matériel' },
    { id: 'r3', text: 'Chaussettes techniques anti-ampoules', checked: false, cat: 'Matériel' },
    { id: 'r4', text: 'Ceinture ou flasque d\'hydratation 500ml', checked: false, cat: 'Hydratation' },
    { id: 'r5', text: 'Gels énergétiques testés à l\'entraînement (1 toutes les 45 min)', checked: false, cat: 'Nutrition' },
    { id: 'r6', text: 'Montre GPS chargée à 100% avec parcours chargé', checked: false, cat: 'Électronique' }
  ];

  const [checklist, setChecklist] = useState(
    disciplineKey === 'triathlon' ? defaultChecklistTriathlon : defaultChecklistRunning
  );

  const toggleItem = (id) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const checkedCount = checklist.filter(i => i.checked).length;
  const progressPercent = Math.round((checkedCount / checklist.length) * 100);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Utensils className="w-3.5 h-3.5" />
              Jour J & Préparation Compétition
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-2 text-white">
              Stratégie Nutrition, Hydratation & Checklist Course
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Planifiez précisément vos apports en glucides (g/h), sodium et fluides pour éviter le mur énergétique, et validez votre sac de transition avant le départ.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center min-w-[120px]">
            <span className="text-[10px] text-amber-300 uppercase font-bold block">Glucides Cible</span>
            <span className="text-xl font-black text-white">{carbsPerHour} g/h</span>
          </div>
        </div>
      </div>

      {/* 2 Columns: Nutrition on Left, Checklist on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Fueling Plan Calculator */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Calculateur d'Apports de Course
            </h3>
            <span className="text-[11px] text-slate-400">{distanceLabel}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Temps Visé (heures)
              </label>
              <input
                type="number"
                step="0.25"
                min="1"
                max="17"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Poids Athlète (kg)
              </label>
              <input
                type="number"
                step="1"
                min="40"
                max="120"
                value={athleteWeight}
                onChange={(e) => setAthleteWeight(parseFloat(e.target.value) || 70)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Tolérance Estomac
              </label>
              <select
                value={gutTrained}
                onChange={(e) => setGutTrained(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900"
              >
                <option value="moderate">Modérée (50g/h)</option>
                <option value="trained">Entraîné (70g/h)</option>
                <option value="elite">Haute perf (90g/h)</option>
              </select>
            </div>
          </div>

          {/* Result Cards */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">Total Glucides</span>
              <span className="text-base sm:text-lg font-black text-amber-900">{totalCarbs} g</span>
              <span className="text-[9px] text-amber-700 block mt-0.5">≈ {Math.round(totalCarbs / 25)} gels ou doses iso</span>
            </div>

            <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-center">
              <span className="text-[10px] uppercase font-bold text-sky-800 block">Hydratation</span>
              <span className="text-base sm:text-lg font-black text-sky-900">{totalWaterLiters} L</span>
              <span className="text-[9px] text-sky-700 block mt-0.5">≈ 650 ml / heure</span>
            </div>

            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-center">
              <span className="text-[10px] uppercase font-bold text-purple-800 block">Sodium</span>
              <span className="text-base sm:text-lg font-black text-purple-900">{totalSodiumMg} mg</span>
              <span className="text-[9px] text-purple-700 block mt-0.5">Anti-crampes & assimilation</span>
            </div>
          </div>

          {/* Golden Rules of Fueling */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wide">💡 Protocole en course :</div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              • <strong>Toutes les 20-30 min :</strong> 1 prise de boisson iso ou 1/2 gel + 2 gorgées d'eau pure.<br />
              • <strong>Sur le vélo :</strong> profitez de la position assise pour consommer le solide et la majorité des glucides.<br />
              • <strong>Règle d'or :</strong> Ne testez JAMAIS un gel ou une boisson inconnue le jour de la course !
            </p>
          </div>
        </div>

        {/* Right: Race Equipment & Transition Checklist */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                Checklist Sac de Course & Matériel
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {checkedCount} / {checklist.length} ({progressPercent}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden my-3">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {checklist.map((item) => (
                <label 
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-2.5 rounded-lg border flex items-start gap-3 cursor-pointer transition-all text-xs ${
                    item.checked 
                      ? 'bg-emerald-50/50 border-emerald-200 text-slate-500 line-through' 
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">
                      {item.cat}
                    </span>
                    <span className={item.checked ? 'text-slate-400' : 'text-slate-800 font-medium'}>
                      {item.text}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Enregistré automatiquement sur votre session</span>
            <button
              onClick={() => setChecklist(prev => prev.map(i => ({ ...i, checked: false })))}
              className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
