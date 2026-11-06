import database from '../data/trainingDatabase.json';

/**
 * PulsePlan Coach Engine
 * Features:
 * - Varied running sessions (30/30, fartlek nature, seuil 3x8, progressif negative split, sortie longue vallonnée)
 * - 3 Swim levels: Débutant (respiration/flottaison), Intermédiaire (catch/CSS), Avancé (seuil gros volume/VO2Max eau libre)
 * - True week-by-week variation (periodization rotation so consecutive weeks have varied session flavors)
 * - Target Race Date periodization (base volume building prior to specific block)
 */

export const DAYS_OF_WEEK = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
];

// Dynamic schedule templates: vary training days across weeks to break robotic weekly repetition
const SCHEDULE_TEMPLATES = {
  3: {
    patternA: [1, 3, 5],            // Mardi, Jeudi, Samedi
    patternB: [0, 2, 5],            // Lundi, Mercredi, Samedi
    patternC: [1, 4, 6]             // Mardi, Vendredi, Dimanche
  },
  4: {
    patternA: [1, 3, 5, 6],         // Mardi, Jeudi, Samedi, Dimanche (classique)
    patternB: [0, 2, 4, 6],         // Lundi, Mercredi, Vendredi, Dimanche (alterné équilibré)
    patternC: [1, 2, 4, 5]          // Mardi, Mercredi, Vendredi, Samedi (bloc week-end allégé)
  },
  5: {
    patternA: [1, 2, 4, 5, 6],      // Mardi, Mercredi, Vendredi, Samedi, Dimanche
    patternB: [0, 1, 3, 4, 6],      // Lundi, Mardi, Jeudi, Vendredi, Dimanche
    patternC: [0, 2, 3, 5, 6]       // Lundi, Mercredi, Jeudi, Samedi, Dimanche
  },
  6: {
    patternA: [0, 1, 2, 3, 5, 6],   // Lundi, Mardi, Mercredi, Jeudi, Samedi, Dimanche
    patternB: [0, 1, 3, 4, 5, 6],   // Lundi, Mardi, Jeudi, Vendredi, Samedi, Dimanche
    patternC: [0, 1, 2, 4, 5, 6]    // Lundi, Mardi, Mercredi, Vendredi, Samedi, Dimanche
  }
};

function getWeekTargetSlots(daysPerWeek, weekNumber) {
  const configs = SCHEDULE_TEMPLATES[daysPerWeek] || SCHEDULE_TEMPLATES[4];
  if (weekNumber % 3 === 1) return configs.patternA;
  if (weekNumber % 3 === 2) return configs.patternB;
  return configs.patternC;
}

const EVENT_DISTANCES_KM = {
  '5k': 5.0,
  '10k': 10.0,
  'semi': 21.0975,
  'marathon': 42.195,
  's': 25.75,
  'm': 51.5,
  '70.3': 113.0,
  'ironman': 226.0,
  'court': 20.0,
  '50k': 50.0,
  'ultra': 105.0
};

export const DEFAULT_TARGET_TIMES = {
  '5k': '00:22:30',
  '10k': '00:45:00',
  'semi': '01:40:00',
  'marathon': '03:30:00',
  's': '01:15:00',
  'm': '02:30:00',
  '70.3': '05:15:00',
  'ironman': '11:30:00',
  'court': '02:00:00',
  '50k': '05:45:00',
  'ultra': '16:00:00'
};

export function getDisciplineMetadata() {
  return database.disciplines;
}

export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 60 + parts[1] + parts[2] / 60;
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

export function calculateRequiredPace(distanceKey, targetTimeStr) {
  const distanceKm = EVENT_DISTANCES_KM[distanceKey];
  const minutes = parseTimeToMinutes(targetTimeStr);
  if (!distanceKm || !minutes) return null;

  const minPerKm = minutes / distanceKm;
  const speedKmh = (distanceKm / (minutes / 60)).toFixed(1);

  const min = Math.floor(minPerKm);
  const sec = Math.round((minPerKm - min) * 60);
  const formattedPace = `${min}'${sec < 10 ? '0' : ''}${sec}" /km`;

  return {
    minPerKm,
    formattedPace,
    speedKmh
  };
}

export function calculateWeeksUntilDate(raceDateStr) {
  if (!raceDateStr) return null;
  const raceDate = new Date(raceDateStr);
  if (isNaN(raceDate.getTime())) return null;

  const now = new Date();
  const diffTime = raceDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.max(4, Math.round(diffDays / 7));
  return weeks;
}

const BASELINE_TEST_WORKOUTS = {
  running: {
    id: 'test_demi_cooper',
    title: 'Test Demi-Cooper 6 min (Calibration VMA)',
    sport: 'running',
    category: 'test',
    priority: 1,
    baseDurationMinutes: 45,
    intensity: 'Allure maximale soutenue 6 min',
    description: 'Test étalon pour déterminer précisément votre VMA actuelle et ajuster toutes les allures de votre préparation.',
    garminImpact: {
      primaryBenefit: "Étalonnage VO2 Max",
      aerobicTE: 3.5,
      anaerobicTE: 3.8,
      epocRange: "Élevé (100-125 ml/kg)",
      muscleAdaptation: "Recrutement neuro-musculaire maximal et débit cardiaque de pointe",
      dominantFuel: "Glycogène pur (90%)"
    },
    steps: [
      { name: 'Échauffement progressif en aisance respiratoire', duration: '20 min', zone: 'Z1-Z2' },
      { name: '3 lignes droites accélérées + 2 min repos', duration: '5 min', zone: 'Z4' },
      { name: 'TEST DEMI-COOPER : 6 minutes à distance maximale', duration: '6 min', zone: 'Test VMA' },
      { name: 'Retour au calme trot très lent & récupération', duration: '14 min', zone: 'Z1' }
    ],
    personalizedPace: 'Notez la distance : Mètres divisés par 100 = votre VMA exacte'
  },
  cycling_power: {
    id: 'test_ftp_20min',
    title: 'Test FTP 20 min (Calibration Capteur de Puissance)',
    sport: 'cycling',
    category: 'test',
    priority: 1,
    baseDurationMinutes: 60,
    intensity: 'Effort maximal régulier 20 min',
    description: 'Test référence avec capteur de puissance. La puissance moyenne sur 20 min x 0.95 définit votre FTP.',
    garminImpact: {
      primaryBenefit: "Étalonnage Puissance FTP",
      aerobicTE: 4.0,
      anaerobicTE: 2.5,
      epocRange: "Très Élevé (120-145 ml/kg)",
      muscleAdaptation: "Seuil de puissance critique neuromusculaire sur 60 minutes",
      dominantFuel: "Glycogène (85%)"
    },
    steps: [
      { name: 'Échauffement progressif 85-90 rpm', duration: '20 min', zone: 'Z1-Z2' },
      { name: 'Déblocage : 3 x (1 min 100% FTP / 1 min souple)', duration: '6 min', zone: 'Z4' },
      { name: 'TEST FTP : 20 min à effort maximal constant', duration: '20 min', zone: 'Test FTP' },
      { name: 'Molinette souple de décrassage', duration: '14 min', zone: 'Z1' }
    ],
    personalizedPace: 'FTP calculée = Puissance moyenne sur 20 min x 0.95'
  },
  cycling_no_power: {
    id: 'test_col_fcm',
    title: 'Test FC Seuil & Fréquence de Pédalage (Sans Capteur de Puissance)',
    sport: 'cycling',
    category: 'test',
    priority: 1,
    baseDurationMinutes: 60,
    intensity: 'Montée rythmée ou plat vent de face (RPE 8/10)',
    description: 'Pour calibrer vos séances vélo sans capteur de puissance : repérage de votre Fréquence Cardiaque au seuil et ressenti d\'effort (RPE) à 90 rpm.',
    garminImpact: {
      primaryBenefit: "Étalonnage FC & Seuil Perçu",
      aerobicTE: 3.8,
      anaerobicTE: 2.0,
      epocRange: "Élevé (90-115 ml/kg)",
      muscleAdaptation: "Repérage des seuils ventilatoires et cardiaques sans puissance",
      dominantFuel: "Glycogène (80%)"
    },
    steps: [
      { name: 'Mise en jambe progressive en moulinant', duration: '20 min', zone: 'Aérobie' },
      { name: 'TEST SANS WATTS : 15 min en côte ou tempo soutenable (parole impossible)', duration: '15 min', zone: 'FC Seuil (88-92% FCM)' },
      { name: 'Contrôle cardiaque : notez votre FC moyenne sur les 10 dernières minutes', duration: '5 min', zone: 'Relevé' },
      { name: 'Retour au calme en petit plateau', duration: '20 min', zone: 'Z1' }
    ],
    personalizedPace: 'Séances vélo guidées à la Fréquence Cardiaque et au RPE (Échelle 1-10)'
  },
  swimming: {
    id: 'test_css_swim',
    title: 'Test Natation CSS (Vitesse Critique 400m + 200m)',
    sport: 'swimming',
    category: 'test',
    priority: 1,
    baseDurationMinutes: 50,
    intensity: 'Chronos 400m et 200m chrono',
    description: 'Calcul de votre allure CSS (Critical Swim Speed) pour calibrer les séries de fractionné natation.',
    garminImpact: {
      primaryBenefit: "Étalonnage Allure CSS",
      aerobicTE: 3.6,
      anaerobicTE: 2.8,
      epocRange: "Élevé (80-105 ml/kg)",
      muscleAdaptation: "Vitesse critique de maintien technique sans perte de glisse",
      dominantFuel: "Glycogène (80%)"
    },
    steps: [
      { name: 'Échauffement 4 nages & crawl souple', duration: '15 min (500m)', zone: 'Z1' },
      { name: 'Test 400m nage libre chrono maximal', duration: '8 min', zone: 'CSS' },
      { name: 'Récupération active souple', duration: '10 min', zone: 'Z1' },
      { name: 'Test 200m nage libre chrono maximal', duration: '5 min', zone: 'CSS' },
      { name: 'Retour au calme dos / brasse', duration: '12 min', zone: 'Z1' }
    ],
    personalizedPace: 'Allure CSS = (Temps 400m - Temps 200m) / 2'
  }
};

export function generateTrainingPlan({
  disciplineKey = 'running',
  distanceKey = 'marathon',
  daysPerWeek = 4,
  targetTime = null,
  raceDate = null,
  swimLevel = 'intermediaire',
  userProfile = {}
}) {
  const disciplineInfo = database.disciplines[disciplineKey];
  const distanceInfo = disciplineInfo?.distances[distanceKey] || { weeks: 12, defaultTSSPerWeek: 350, label: 'Course' };
  
  const standardSpecificWeeks = distanceInfo.weeks || 12;

  let totalWeeks = standardSpecificWeeks;
  let baseBuildingWeeksCount = 0;

  if (raceDate) {
    const calculatedWeeks = calculateWeeksUntilDate(raceDate);
    if (calculatedWeeks && calculatedWeeks >= 4) {
      totalWeeks = calculatedWeeks;
      if (totalWeeks > standardSpecificWeeks) {
        baseBuildingWeeksCount = totalWeeks - standardSpecificWeeks;
      }
    }
  }

  const effectiveTargetTime = targetTime || DEFAULT_TARGET_TIMES[distanceKey] || '03:30:00';
  const targetPaceData = calculateRequiredPace(distanceKey, effectiveTargetTime);

  const library = database.library;
  const hasPower = Boolean(userProfile.hasPowerMeter);
  const effectiveSwimLevel = swimLevel || userProfile.swimLevel || 'intermediaire';

  const weeks = [];

  for (let w = 1; w <= totalWeeks; w++) {
    const isBaselineWeek = (w === 1);
    const isRecoveryWeek = (w % 4 === 0) && w !== totalWeeks && !isBaselineWeek;
    // Dynamic slots per week to prevent robotic repetition on identical days
    const weekTargetSlots = getWeekTargetSlots(daysPerWeek, w);

    let phase = 'Développement Foncier';
    let phaseCategory = 'base';
    let volumeMultiplier = 1.0;

    if (isBaselineWeek) {
      phase = 'Étalonnage & Tests des Bases Athlétiques';
      phaseCategory = 'baseline_test';
      volumeMultiplier = 0.85;
    } else if (baseBuildingWeeksCount > 0 && w <= baseBuildingWeeksCount) {
      phase = `Prise de Volume & Foncier Aérobie (S${w}/${baseBuildingWeeksCount})`;
      phaseCategory = 'base_building';
      volumeMultiplier = 0.90 + ((w - 1) * 0.04);
    } else {
      const specificWeekIndex = w - baseBuildingWeeksCount;
      const weeksUntilRace = totalWeeks - w + 1;

      if (weeksUntilRace <= 2) {
        phase = 'Affûtage Final & Fraîcheur Pré-Course';
        phaseCategory = 'taper';
        volumeMultiplier = 0.65;
      } else if (weeksUntilRace <= 3) {
        phase = 'Début d\'Affûtage & Surcompensation';
        phaseCategory = 'taper';
        volumeMultiplier = 0.80;
      } else if (specificWeekIndex <= Math.round(standardSpecificWeeks * 0.45)) {
        phase = 'Spécifique : Fondation & Économie de Course';
        phaseCategory = 'specific_prep';
        volumeMultiplier = 0.95 + (specificWeekIndex * 0.02);
      } else {
        phase = `Spécifique Allure Cible (${targetPaceData ? targetPaceData.formattedPace : 'Allure Course'})`;
        phaseCategory = 'specific_prep';
        volumeMultiplier = 1.05 + ((specificWeekIndex - Math.round(standardSpecificWeeks * 0.45)) * 0.02);
      }
    }

    if (isRecoveryWeek) {
      phase += ' · Assimilation';
      volumeMultiplier *= 0.75;
    }

    const days = DAYS_OF_WEEK.map((dayName, dayIndex) => {
      const isTrainingDay = weekTargetSlots.includes(dayIndex);
      if (!isTrainingDay) {
        return {
          dayIndex,
          dayName,
          isRest: true,
          workout: null
        };
      }

      const workout = pickWorkoutForSlot({
        disciplineKey,
        dayIndex,
        targetSlots: weekTargetSlots,
        library,
        weekNumber: w,
        phase,
        phaseCategory,
        volumeMultiplier,
        userProfile,
        isBaselineWeek,
        isRecoveryWeek,
        hasPower,
        targetPaceData,
        swimLevel: effectiveSwimLevel
      });

      return {
        dayIndex,
        dayName,
        isRest: false,
        workout
      };
    });

    const activeDays = days.filter(d => !d.isRest && d.workout);
    const totalDuration = activeDays.reduce((acc, d) => acc + (d.workout.durationMinutes || 0), 0);
    const estimatedTSS = Math.round(activeDays.reduce((acc, d) => acc + (d.workout.estimatedTSS || 0), 0));

    weeks.push({
      weekNumber: w,
      phase,
      phaseCategory,
      isBaselineWeek,
      isRecoveryWeek,
      volumeMultiplier: Number(volumeMultiplier.toFixed(2)),
      totalDurationMinutes: totalDuration,
      estimatedTSS,
      days
    });
  }

  return {
    id: `plan_${disciplineKey}_${distanceKey}_${daysPerWeek}d_${Date.now()}`,
    disciplineKey,
    disciplineName: disciplineInfo.name,
    distanceKey,
    distanceLabel: distanceInfo.label,
    daysPerWeek,
    totalWeeks,
    raceDate: raceDate || null,
    baseBuildingWeeksCount,
    standardSpecificWeeks,
    targetTime: effectiveTargetTime,
    targetPaceData,
    hasPowerMeter: hasPower,
    swimLevel: effectiveSwimLevel,
    createdAt: new Date().toISOString(),
    weeks
  };
}

function pickWorkoutForSlot({
  disciplineKey,
  dayIndex,
  targetSlots,
  library,
  weekNumber,
  phase,
  phaseCategory,
  volumeMultiplier,
  userProfile,
  isBaselineWeek,
  isRecoveryWeek,
  hasPower,
  targetPaceData,
  swimLevel
}) {
  let template;

  if (isBaselineWeek) {
    if (dayIndex === targetSlots[0]) {
      if (disciplineKey === 'running' || disciplineKey === 'trail') {
        template = BASELINE_TEST_WORKOUTS.running;
      } else if (disciplineKey === 'triathlon') {
        template = hasPower ? BASELINE_TEST_WORKOUTS.cycling_power : BASELINE_TEST_WORKOUTS.cycling_no_power;
      }
    } else if (dayIndex === targetSlots[1] && disciplineKey === 'triathlon') {
      template = BASELINE_TEST_WORKOUTS.running;
    } else if (dayIndex === targetSlots[targetSlots.length - 1]) {
      template = library.running.find(w => w.id === 'run_ef_base');
    } else {
      template = library.running.find(w => w.id === 'run_recup') || library.running[0];
    }
  }

  // Running selection: Dynamic rotation based on weekNumber, recovery weeks, and taper
  if (!template && disciplineKey === 'running') {
    const isWeekendLong = (dayIndex === 5 || dayIndex === 6 || dayIndex === targetSlots[targetSlots.length - 1]);
    
    // TAPER (Affûtage dans les 2 dernières semaines)
    if (phaseCategory === 'taper') {
      if (isWeekendLong) {
        template = library.running.find(w => w.id === 'run_taper_allure_rappel') || library.running.find(w => w.id === 'run_recup');
      } else if (dayIndex === targetSlots[0]) {
        template = library.running.find(w => w.id === 'run_taper_reactivation') || library.running.find(w => w.id === 'run_recup');
      } else {
        template = library.running.find(w => w.id === 'run_recup');
      }
    } 
    // RECOVERY WEEK (Semaine d'assimilation / décharge - ex: Semaines 4, 8, 12)
    else if (isRecoveryWeek) {
      if (isWeekendLong) {
        // En semaine de décharge, la sortie longue est raccourcie en simple endurance Z2
        template = library.running.find(w => w.id === 'run_ef_base');
      } else if (dayIndex === targetSlots[0]) {
        template = library.running.find(w => w.id === 'run_recup');
      } else {
        template = library.running.find(w => w.id === 'run_ef_base');
      }
    } 
    // NORMAL & SPECIFIC WEEKS
    else {
      if (isWeekendLong) {
        // Alternate between flat specific long run, undulating hill long run, and aerobic base
        if (weekNumber % 3 === 1) {
          template = library.running.find(w => w.id === 'run_long_run');
        } else if (weekNumber % 3 === 2) {
          template = library.running.find(w => w.id === 'run_long_ondulante') || library.running.find(w => w.id === 'run_long_run');
        } else {
          template = library.running.find(w => w.id === 'run_ef_base');
        }
      } else if (dayIndex === targetSlots[0]) {
        // Quality Slot 1: Alternate 30/30 VO2Max, Fartlek and VMA longue
        if (weekNumber % 3 === 1) {
          template = library.running.find(w => w.id === 'run_vma_short');
        } else if (weekNumber % 3 === 2) {
          template = library.running.find(w => w.id === 'run_fartlek_nature');
        } else {
          template = library.running.find(w => w.id === 'run_vma_longue') || library.running.find(w => w.id === 'run_vma_short');
        }
      } else if (dayIndex === targetSlots[1] && targetSlots.length >= 4) {
        // Quality Slot 2 (Threshold / Tempo): Alternate Seuil blocs vs Progressif negative split
        template = (weekNumber % 2 === 0)
          ? (library.running.find(w => w.id === 'run_tempo_progressif') || library.running.find(w => w.id === 'run_tempo_seuil'))
          : library.running.find(w => w.id === 'run_tempo_seuil');
      } else {
        // Aerobic endurance / recovery
        template = library.running.find(w => w.id === 'run_ef_base');
      }
    }
  }

  // Triathlon selection: swimming according to level + bike variation + bricks + taper/recovery
  if (!template && disciplineKey === 'triathlon') {
    const swimPool = library.swimming[swimLevel] || library.swimming['intermediaire'];
    const swimSlotsCount = swimPool.length;

    // Dynamically alternate which discipline gets the primary weekend or midweek slots based on weekNumber
    const weekendPrimaryDay = targetSlots[targetSlots.length - 2] ?? 5;
    const weekendSecondaryDay = targetSlots[targetSlots.length - 1] ?? 6;
    const midweekQualityDay = targetSlots[0];
    const midweekAerobicDay = targetSlots[1] ?? targetSlots[0];

    if (phaseCategory === 'taper') {
      if (dayIndex === weekendPrimaryDay) {
        template = library.cycling.find(w => w.id === 'bike_taper_reactivation') || library.cycling.find(w => w.id === 'bike_recup');
      } else if (dayIndex === weekendSecondaryDay) {
        template = library.running.find(w => w.id === 'run_taper_reactivation') || library.running.find(w => w.id === 'run_recup');
      } else if (dayIndex === midweekQualityDay) {
        template = swimPool[0];
      } else {
        template = library.cycling.find(w => w.id === 'bike_recup') || library.running.find(w => w.id === 'run_recup');
      }
    } else if (isRecoveryWeek) {
      if (dayIndex === weekendPrimaryDay) {
        template = library.cycling.find(w => w.id === 'bike_recup') || library.cycling.find(w => w.id === 'bike_z2_endurance');
      } else if (dayIndex === weekendSecondaryDay) {
        template = library.running.find(w => w.id === 'run_recup') || library.running.find(w => w.id === 'run_ef_base');
      } else if (dayIndex === midweekQualityDay) {
        template = swimPool[0]; // Technique / aisance douce
      } else {
        template = library.cycling.find(w => w.id === 'bike_z2_endurance');
      }
    } else {
      // Rotate sport distribution depending on odd/even weeks
      const isBikePrimaryWeekend = (weekNumber % 2 === 1);

      if (dayIndex === weekendPrimaryDay) {
        if (isBikePrimaryWeekend) {
          // Weekend Ride
          if (weekNumber % 3 === 1) {
            template = library.cycling.find(w => w.id === 'bike_long_endurance');
          } else if (weekNumber % 3 === 2) {
            template = library.cycling.find(w => w.id === 'bike_long_tempo_tri') || library.cycling.find(w => w.id === 'bike_long_endurance');
          } else {
            template = library.cycling.find(w => w.id === 'bike_force_velocite') || library.cycling.find(w => w.id === 'bike_long_endurance');
          }
        } else {
          // Weekend Long Run
          template = (weekNumber % 2 === 0)
            ? (library.running.find(w => w.id === 'run_long_ondulante') || library.running.find(w => w.id === 'run_long_run'))
            : library.running.find(w => w.id === 'run_long_run');
        }
      } else if (dayIndex === weekendSecondaryDay) {
        if (isBikePrimaryWeekend) {
          // In specific prep: alternate brick transition or running
          if (phase.includes('Spécifique') && library.brick?.length && (weekNumber % 2 === 1)) {
            template = (weekNumber % 4 === 1)
              ? library.brick[0]
              : (library.brick[1] || library.brick[0]);
          } else {
            template = library.running.find(w => w.id === 'run_long_run') || library.running[0];
          }
        } else {
          // Alternate with endurance bike or SweetSpot ride
          template = (weekNumber % 3 === 0)
            ? library.cycling.find(w => w.id === 'bike_sweetspot')
            : library.cycling.find(w => w.id === 'bike_z2_endurance');
        }
      } else if (dayIndex === midweekQualityDay) {
        // Rotate swimming session through all available variations
        template = swimPool[(weekNumber - 1) % swimSlotsCount] || swimPool[0];
      } else if (dayIndex === midweekAerobicDay && targetSlots.length >= 4) {
        // Midweek cycling or running speedwork alternated
        if (weekNumber % 4 === 1) {
          template = library.cycling.find(w => w.id === 'bike_sweetspot');
        } else if (weekNumber % 4 === 2) {
          template = library.cycling.find(w => w.id === 'bike_pma_vo2') || library.cycling.find(w => w.id === 'bike_sweetspot');
        } else if (weekNumber % 4 === 3) {
          template = library.cycling.find(w => w.id === 'bike_seuil_over_under') || library.cycling.find(w => w.id === 'bike_sweetspot');
        } else {
          template = library.running.find(w => w.id === 'run_fartlek_nature') || library.running.find(w => w.id === 'run_vma_short');
        }
      } else {
        // Additional slots: aerobic running or cycling
        template = (weekNumber % 2 === 0)
          ? library.running.find(w => w.id === 'run_ef_base')
          : (library.cycling.find(w => w.id === 'bike_z2_endurance') || library.running.find(w => w.id === 'run_ef_base'));
      }
    }
  }

  // Trail selection: Rotate through trail-specific workouts + recovery & taper handling
  if (!template && disciplineKey === 'trail') {
    const isWeekendLong = (dayIndex === 5 || dayIndex === 6 || dayIndex === targetSlots[targetSlots.length - 1]);
    
    if (phaseCategory === 'taper') {
      if (isWeekendLong) {
        template = library.running.find(w => w.id === 'run_taper_reactivation') || library.running.find(w => w.id === 'run_recup');
      } else {
        template = library.running.find(w => w.id === 'run_recup');
      }
    } else if (isRecoveryWeek) {
      if (isWeekendLong) {
        template = library.running.find(w => w.id === 'run_ef_base');
      } else {
        template = library.running.find(w => w.id === 'run_recup');
      }
    } else {
      if (isWeekendLong) {
        // Long run weekend: Alternate D+ cumulated and technical downhill / eccentric loading
        template = (weekNumber % 2 === 0)
          ? (library.trail.find(w => w.id === 'trail_descente_technique') || library.trail.find(w => w.id === 'trail_long_dplus'))
          : library.trail.find(w => w.id === 'trail_long_dplus');
      } else if (dayIndex === targetSlots[0]) {
        // Quality Slot 1: Rotate Short PMA hills, Long Threshold climbs (3x10'), and Single Track surges
        if (weekNumber % 3 === 1) {
          template = library.trail.find(w => w.id === 'trail_cote_pma');
        } else if (weekNumber % 3 === 2) {
          template = library.trail.find(w => w.id === 'trail_cote_longue_seuil') || library.trail.find(w => w.id === 'trail_cote_pma');
        } else {
          template = library.trail.find(w => w.id === 'trail_tempo_single') || library.trail.find(w => w.id === 'trail_cote_pma');
        }
      } else {
        // Quality Slot 2 / Aerobic base: Alternate Single track tempo, fartlek nature, and aerobic running
        if (weekNumber % 3 === 1) {
          template = library.trail.find(w => w.id === 'trail_tempo_single') || library.trail.find(w => w.id === 'trail_cote_pma');
        } else if (weekNumber % 3 === 2) {
          template = library.running.find(w => w.id === 'run_fartlek_nature') || library.running[0];
        } else {
          template = library.running.find(w => w.id === 'run_ef_base') || library.running[0];
        }
      }
    }
  }

  if (!template) {
    template = library.running[0];
  }

  const adjustedDuration = Math.round((template.baseDurationMinutes * volumeMultiplier) / 5) * 5;
  const estimatedTSS = Math.round(adjustedDuration * getIntensityFactor(template.category));

  const personalizedPace = computeCoachGuidance({
    workout: template,
    profile: userProfile,
    targetPaceData,
    hasPower,
    phaseCategory
  });

  return {
    ...template,
    instanceId: `${template.id}_${Math.random().toString(36).substring(2, 7)}`,
    durationMinutes: adjustedDuration,
    estimatedTSS,
    personalizedPace,
    garminImpact: template.garminImpact || null
  };
}

function getIntensityFactor(category) {
  switch (category) {
    case 'test': return 1.4;
    case 'recovery': return 0.65;
    case 'endurance': return 0.85;
    case 'technique': return 0.80;
    case 'tempo': return 1.10;
    case 'interval': return 1.30;
    case 'brick': return 1.05;
    case 'long': return 0.95;
    default: return 0.9;
  }
}

function computeCoachGuidance({ workout, profile, targetPaceData, hasPower, phaseCategory }) {
  if (workout.category === 'test') {
    return workout.personalizedPace;
  }

  if (phaseCategory === 'base_building') {
    if (workout.sport === 'running' && workout.category === 'long') {
      return 'Foncier de base : Allure Z2 stable, construction du réservoir aérobie avant le bloc spécifique';
    }
  }

  if (workout.sport === 'running') {
    if (workout.category === 'tempo' && targetPaceData) {
      return `Allure Objectif : ${targetPaceData.formattedPace} (${targetPaceData.speedKmh} km/h pour viser ${profile.targetTime || 'votre chrono'})`;
    }

    if (profile.vma) {
      const vma = parseFloat(profile.vma);
      if (workout.category === 'interval') {
        const paceMinKm = (60 / (vma * 1.0)).toFixed(2);
        return `VMA 100%: ~${formatPace(paceMinKm)} /km (VMA: ${vma} km/h)`;
      }
      if (workout.category === 'endurance') {
        const paceMinKm = (60 / (vma * 0.68)).toFixed(2);
        return `Aérobie Z2: ~${formatPace(paceMinKm)} /km (65-70% VMA)`;
      }
    }
  }

  if (workout.sport === 'cycling') {
    if (hasPower && profile.ftp) {
      const ftp = parseInt(profile.ftp, 10);
      if (workout.category === 'interval') {
        return `Sweet Spot : ${Math.round(ftp * 0.88)}W - ${Math.round(ftp * 0.93)}W (FTP: ${ftp}W)`;
      }
      return `Z2 Aérobie : ${Math.round(ftp * 0.60)}W - ${Math.round(ftp * 0.72)}W`;
    } else {
      if (workout.category === 'interval') {
        return `Guidage sans capteur : RPE 7-8/10 (Essoufflement marqué, cadence 90 rpm, FC Seuil)`;
      }
      return `Guidage sans capteur : RPE 4-5/10 (Aisance totale, parole facile, cadence 90-95 rpm)`;
    }
  }

  if (profile.fcMax) {
    const fcm = parseInt(profile.fcMax, 10);
    if (workout.category === 'endurance') {
      return `Plafond Z2 : < ${Math.round(fcm * 0.75)} bpm (FC Max: ${fcm})`;
    }
  }

  return null;
}

function formatPace(decimalPace) {
  const min = Math.floor(decimalPace);
  const sec = Math.round((decimalPace - min) * 60);
  return `${min}'${sec < 10 ? '0' : ''}${sec}"`;
}
