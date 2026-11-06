/**
 * Physiology Calculation Service
 * Calculates accurate training zones:
 * - Running pace zones based on VMA (km/h) & Heart Rate (FC Max)
 * - Cycling power zones based on FTP (Watts) (Coggan 7 zones)
 * - Swimming pace zones based on CSS (Critical Swim Speed) or user levels
 * - Fitness & Fatigue (Banister TRIMP / CTL / ATL / TSB model)
 */

// Helper to convert speed in km/h to pace string "M:SS /km"
export function speedToPace(speedKmh) {
  if (!speedKmh || speedKmh <= 0) return '--:--';
  const paceMinutes = 60 / speedKmh;
  const mins = Math.floor(paceMinutes);
  const secs = Math.round((paceMinutes - mins) * 60);
  const formattedSecs = secs === 60 ? '00' : secs < 10 ? `0${secs}` : `${secs}`;
  const formattedMins = secs === 60 ? mins + 1 : mins;
  return `${formattedMins}:${formattedSecs} /km`;
}

// Helper to convert pace string to 100m swim pace "M:SS /100m"
export function swimPaceToString(secondsPer100m) {
  if (!secondsPer100m || secondsPer100m <= 0) return '--:--';
  const mins = Math.floor(secondsPer100m / 60);
  const secs = Math.round(secondsPer100m % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs} /100m`;
}

/**
 * Calculate Running Pace & Heart Rate Zones
 * @param {number|string} vma - VMA in km/h (e.g. 15.5)
 * @param {number|string} fcMax - Max Heart Rate (e.g. 185)
 * @param {number|string} fcRepos - Resting Heart Rate (optional, e.g. 50)
 */
export function getRunningZones(vma, fcMax, fcRepos = 50) {
  const v = parseFloat(vma) || 14.0;
  const hrMax = parseFloat(fcMax) || 185;
  const hrRest = parseFloat(fcRepos) || 50;
  const hrReserve = hrMax - hrRest;

  // Standard physiological percentages of VMA & Karvonen / %HRmax
  return [
    {
      zone: 'Z1',
      name: 'Récupération Active',
      target: 'Récupération musculaire, élimination lactique',
      vmaPercent: '< 65%',
      speedRange: `< ${(v * 0.65).toFixed(1)} km/h`,
      paceRange: `> ${speedToPace(v * 0.65)}`,
      hrRange: `${Math.round(hrRest + hrReserve * 0.55)}-${Math.round(hrRest + hrReserve * 0.65)} bpm`,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      zone: 'Z2',
      name: 'Endurance Fondamentale (Aérobie)',
      target: 'Lipolyse, mitochondries, base du foncier',
      vmaPercent: '65% - 75%',
      speedRange: `${(v * 0.65).toFixed(1)} - ${(v * 0.75).toFixed(1)} km/h`,
      paceRange: `${speedToPace(v * 0.75)} - ${speedToPace(v * 0.65)}`,
      hrRange: `${Math.round(hrRest + hrReserve * 0.65)}-${Math.round(hrRest + hrReserve * 0.75)} bpm`,
      color: 'text-sky-700 bg-sky-50 border-sky-200'
    },
    {
      zone: 'Z3',
      name: 'Tempo / Allure Marathon',
      target: 'Glycogène, rythme de croisière marathon',
      vmaPercent: '75% - 85%',
      speedRange: `${(v * 0.75).toFixed(1)} - ${(v * 0.85).toFixed(1)} km/h`,
      paceRange: `${speedToPace(v * 0.85)} - ${speedToPace(v * 0.75)}`,
      hrRange: `${Math.round(hrRest + hrReserve * 0.75)}-${Math.round(hrRest + hrReserve * 0.84)} bpm`,
      color: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    {
      zone: 'Z4',
      name: 'Seuil Lactique / Semi & 10km',
      target: 'Capacité à recycler le lactate à haute intensité',
      vmaPercent: '85% - 92%',
      speedRange: `${(v * 0.85).toFixed(1)} - ${(v * 0.92).toFixed(1)} km/h`,
      paceRange: `${speedToPace(v * 0.92)} - ${speedToPace(v * 0.85)}`,
      hrRange: `${Math.round(hrRest + hrReserve * 0.84)}-${Math.round(hrRest + hrReserve * 0.92)} bpm`,
      color: 'text-orange-700 bg-orange-50 border-orange-200'
    },
    {
      zone: 'Z5',
      name: 'VMA / Puissance Aérobie Maximale',
      target: 'VO2 Max, fractionné court (30/30, 200m-400m)',
      vmaPercent: '95% - 105%',
      speedRange: `${(v * 0.95).toFixed(1)} - ${(v * 1.05).toFixed(1)} km/h`,
      paceRange: `${speedToPace(v * 1.05)} - ${speedToPace(v * 0.95)}`,
      hrRange: `> ${Math.round(hrRest + hrReserve * 0.92)} bpm (ou FC Max)`,
      color: 'text-rose-700 bg-rose-50 border-rose-200'
    }
  ];
}

/**
 * Calculate Cycling Power Zones (Coggan Power Model)
 * @param {number|string} ftp - FTP in Watts (e.g. 240)
 */
export function getCyclingPowerZones(ftp) {
  const f = parseFloat(ftp) || 220;

  return [
    {
      zone: 'Z1',
      name: 'Récupération Active',
      target: 'Tourner les jambes après course',
      percent: '< 55% FTP',
      watts: `< ${Math.round(f * 0.55)} W`,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      zone: 'Z2',
      name: 'Endurance Foncier',
      target: 'Sorties longues vélo, base aérobie',
      percent: '55% - 75% FTP',
      watts: `${Math.round(f * 0.55)} - ${Math.round(f * 0.75)} W`,
      color: 'text-sky-700 bg-sky-50 border-sky-200'
    },
    {
      zone: 'Z3',
      name: 'Tempo Aérobie',
      target: 'Allure vélo Ironman & 70.3',
      percent: '76% - 90% FTP',
      watts: `${Math.round(f * 0.76)} - ${Math.round(f * 0.90)} W`,
      color: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    {
      zone: 'Z4',
      name: 'Sweet Spot & Seuil FTP',
      target: 'Augmentation de la puissance critique 60 min',
      percent: '91% - 105% FTP',
      watts: `${Math.round(f * 0.91)} - ${Math.round(f * 1.05)} W`,
      color: 'text-orange-700 bg-orange-50 border-orange-200'
    },
    {
      zone: 'Z5',
      name: 'PMA / VO2 Max',
      target: 'Intervalles 3 à 5 minutes en côte ou plat',
      percent: '106% - 120% FTP',
      watts: `${Math.round(f * 1.06)} - ${Math.round(f * 1.20)} W`,
      color: 'text-rose-700 bg-rose-50 border-rose-200'
    },
    {
      zone: 'Z6',
      name: 'Capacité Anaérobie',
      target: 'Efforts violents 30s à 2 min',
      percent: '121% - 150% FTP',
      watts: `> ${Math.round(f * 1.21)} W`,
      color: 'text-purple-700 bg-purple-50 border-purple-200'
    }
  ];
}

/**
 * Calculate Banister Fitness & Fatigue Impulse model (CTL, ATL, TSB)
 * CTL (Chronic Training Load / Fitness) = 42-day rolling exp average
 * ATL (Acute Training Load / Fatigue) = 7-day rolling exp average
 * TSB (Training Stress Balance / Forme) = CTL - ATL
 */
export function calculateFitnessFatigue(weeks = []) {
  if (!weeks || weeks.length === 0) return [];

  let currentCTL = 45; // baseline fitness initial
  let currentATL = 40; // baseline fatigue initial

  const timeDecayCTL = 2 / (42 + 1);
  const timeDecayATL = 2 / (7 + 1);

  const series = [];

  weeks.forEach((w) => {
    const weeklyTSS = w.totalTSS || 300;
    const dailyAverageTSS = weeklyTSS / 7;

    for (let day = 0; day < 7; day++) {
      currentCTL = currentCTL + (dailyAverageTSS - currentCTL) * timeDecayCTL;
      currentATL = currentATL + (dailyAverageTSS - currentATL) * timeDecayATL;
    }

    const tsb = Math.round(currentCTL - currentATL);

    series.push({
      weekNumber: w.weekNumber,
      phaseCategory: w.phaseCategory,
      phaseName: w.phase,
      weeklyTSS,
      ctl: Math.round(currentCTL),
      atl: Math.round(currentATL),
      tsb: tsb,
      statusLabel: tsb > 10 ? 'Très Frais (Affûté)' : tsb >= -10 ? 'Zone Optimale de Forme' : tsb >= -25 ? 'Fatigue Productive' : 'Risque Surentraînement'
    });
  });

  return series;
}
