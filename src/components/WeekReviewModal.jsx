import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Activity, 
  ChevronRight,
  ThumbsUp
} from 'lucide-react';
import { evaluateAndAdaptNextWeek } from '../services/adaptiveCoach';

export default function WeekReviewModal({ week, plan, onPlanUpdated, onClose }) {
  const [selectedStatus, setSelectedStatus] = useState('nominal');
  const [comments, setComments] = useState('');
  const [adaptedNotice, setAdaptedNotice] = useState(null);

  const nextWeekNumber = week.weekNumber + 1;
  const hasNextWeek = plan.weeks.some(w => w.weekNumber === nextWeekNumber);

  const options = [
    {
      id: 'nominal',
      title: 'Tout s\'est déroulé normalement',
      desc: 'Séances bien assimilées, forme stable, récupération normale.',
      icon: ThumbsUp,
      color: 'border-slate-300 bg-white text-slate-800'
    },
    {
      id: 'fatigued',
      title: 'Fatigue excessive / Courbatures anormales',
      desc: 'Difficulté à terminer les séances, cardio anormalement haut ou jambes lourdes.',
      icon: AlertTriangle,
      color: 'border-amber-200 bg-amber-50/50 text-amber-900'
    },
    {
      id: 'too_easy',
      title: 'Séances trop faciles / En avance sur la forme',
      desc: 'Aisance respiratoire totale, cardio bas, sensation de facilité.',
      icon: Sparkles,
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
    },
    {
      id: 'missed',
      title: 'Séances sautées (manque de temps / imprévus)',
      desc: 'Une ou plusieurs séances n\'ont pas pu être effectuées.',
      icon: Clock,
      color: 'border-sky-200 bg-sky-50/50 text-sky-900'
    }
  ];

  const handleApplyReview = () => {
    const updatedPlan = evaluateAndAdaptNextWeek({
      currentPlan: plan,
      weekNumber: week.weekNumber,
      feedback: {
        status: selectedStatus,
        comments
      }
    });

    onPlanUpdated(updatedPlan);

    const nextWeek = updatedPlan.weeks.find(w => w.weekNumber === nextWeekNumber);
    setAdaptedNotice(nextWeek?.adaptation);

    setTimeout(() => {
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-100">
        <div className="pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wide">
            <span>Bilan Coach Fin de Semaine</span>
            <span>·</span>
            <span>Semaine {week.weekNumber}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Comment avez-vous vécu cette semaine d'entraînement ?
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Si tout s'est passé normalement, le plan poursuit son cours. Si vous signalez de la fatigue ou une facilité anormale, la Semaine {nextWeekNumber} sera automatiquement rééquilibrée.
          </p>
        </div>

        {adaptedNotice ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-900">{adaptedNotice.decision}</div>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              {adaptedNotice.detail}
            </p>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              {options.map((opt) => {
                const isSelected = selectedStatus === opt.id;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedStatus(opt.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : opt.color + ' hover:border-slate-400'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                    <div>
                      <div className="font-semibold text-xs">{opt.title}</div>
                      <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional comment */}
            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">
                Note facultative pour le coach :
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Ex: Légère douleur au tendon d'Achille, ou très bonne aisance sur la sortie longue..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-mono"
                rows="2"
              ></textarea>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleApplyReview}
                disabled={!hasNextWeek}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Valider le bilan et ajuster la Semaine {nextWeekNumber}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
