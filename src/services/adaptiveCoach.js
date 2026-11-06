import { DAYS_OF_WEEK } from './planGenerator';

/**
 * PulsePlan Adaptive Coach Service
 * Evaluates athlete feedback at the end of a week:
 * - status: 'nominal' (tout s'est bien passé comme prévu)
 * - status: 'fatigued' (trop de fatigue / courbatures excessives / FC trop haute)
 * - status: 'too_easy' (trop facile / en avance sur la forme)
 * - status: 'missed' (séances sautées / manque de temps)
 * 
 * Automatically recalibrates the next week:
 * - adjusts volume multipliers
 * - scales target paces or power
 * - converts high-intensity sessions to active aerobic recovery if overloaded
 */

export function evaluateAndAdaptNextWeek({ currentPlan, weekNumber, feedback }) {
  if (!currentPlan || !currentPlan.weeks) return currentPlan;

  const nextWeekIndex = currentPlan.weeks.findIndex(w => w.weekNumber === weekNumber + 1);
  if (nextWeekIndex === -1) {
    // Last week of plan, no next week to adapt
    return currentPlan;
  }

  // Deep clone of plan to keep immutability
  const updatedPlan = JSON.parse(JSON.stringify(currentPlan));
  const targetWeek = updatedPlan.weeks[nextWeekIndex];

  let adaptationLog = null;

  // 1. Nominal: All good, no need to touch the planned progression
  if (feedback.status === 'nominal') {
    adaptationLog = {
      evaluatedWeek: weekNumber,
      adaptedWeek: targetWeek.weekNumber,
      decision: 'Maintien de la progression planifiée',
      detail: 'Sensations normales et charge assimilée avec succès. Aucune modification nécessaire pour la semaine suivante.',
      severity: 'nominal',
      date: new Date().toISOString()
    };
    targetWeek.adaptation = adaptationLog;
    return updatedPlan;
  }

  // 2. Overload / Excess Fatigue
  if (feedback.status === 'fatigued') {
    const volumeReduction = 0.85; // -15% volume
    targetWeek.phase = `Adaptée (Allégement fatigue : -15% volume)`;
    targetWeek.volumeMultiplier = Number((targetWeek.volumeMultiplier * volumeReduction).toFixed(2));

    targetWeek.days.forEach(day => {
      if (day.workout) {
        day.workout.durationMinutes = Math.round((day.workout.durationMinutes * volumeReduction) / 5) * 5;
        day.workout.estimatedTSS = Math.round(day.workout.estimatedTSS * volumeReduction);

        // Convert intense interval to smooth aerobic work if severe fatigue
        if (day.workout.category === 'interval') {
          day.workout.title = `${day.workout.title} (Allégée Z2 / Tempo doux)`;
          day.workout.intensity = 'Z2 Aérobie régénérante (allégement coach)';
          day.workout.personalizedPace = 'Consigne adaptative : Restez sous 75% FCM pour récupérer';
        }
      }
    });

    // Recompute total duration & TSS
    targetWeek.totalDurationMinutes = targetWeek.days.reduce((acc, d) => acc + (d.workout?.durationMinutes || 0), 0);
    targetWeek.estimatedTSS = targetWeek.days.reduce((acc, d) => acc + (d.workout?.estimatedTSS || 0), 0);

    adaptationLog = {
      evaluatedWeek: weekNumber,
      adaptedWeek: targetWeek.weekNumber,
      decision: 'Allégement préventif de charge (-15% volume & intensités atténuées)',
      detail: 'Signal de fatigue résiduelle pris en compte : volume réduit et fractionné converti en aérobie pour éviter le surentraînement.',
      severity: 'warning',
      date: new Date().toISOString()
    };
  }

  // 3. Too Easy / Athlete is ahead of form
  if (feedback.status === 'too_easy') {
    const volumeBoost = 1.08; // +8%
    targetWeek.phase = `Adaptée (Dynamisation forme en hausse : +8%)`;
    targetWeek.volumeMultiplier = Number((targetWeek.volumeMultiplier * volumeBoost).toFixed(2));

    targetWeek.days.forEach(day => {
      if (day.workout) {
        day.workout.durationMinutes = Math.round((day.workout.durationMinutes * volumeBoost) / 5) * 5;
        day.workout.estimatedTSS = Math.round(day.workout.estimatedTSS * volumeBoost);
      }
    });

    targetWeek.totalDurationMinutes = targetWeek.days.reduce((acc, d) => acc + (d.workout?.durationMinutes || 0), 0);
    targetWeek.estimatedTSS = targetWeek.days.reduce((acc, d) => acc + (d.workout?.estimatedTSS || 0), 0);

    adaptationLog = {
      evaluatedWeek: weekNumber,
      adaptedWeek: targetWeek.weekNumber,
      decision: 'Légère consolidation de charge (+8% volume)',
      detail: 'Forme athlétique supérieure aux prévisions : volume et répétitions légèrement augmentés.',
      severity: 'success',
      date: new Date().toISOString()
    };
  }

  // 4. Missed Sessions / Time constraints
  if (feedback.status === 'missed') {
    targetWeek.phase = `Adaptée (Rattrapage progressif sans surcharger)`;
    targetWeek.days.forEach(day => {
      if (day.workout && day.workout.category === 'long') {
        day.workout.description += ' (Séance clé prioritaire maintenue suite aux séances manquées de la semaine passée).';
      }
    });

    adaptationLog = {
      evaluatedWeek: weekNumber,
      adaptedWeek: targetWeek.weekNumber,
      decision: 'Maintien équilibré & priorisation des séances clés',
      detail: 'Pas de doublement de séance pour ne pas créer de blessure. La sortie clé est sanctuarisée.',
      severity: 'info',
      date: new Date().toISOString()
    };
  }

  targetWeek.adaptation = adaptationLog;
  return updatedPlan;
}
