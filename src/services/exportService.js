/**
 * PulsePlan Export Service
 * Multi-format workout exporter:
 * - Garmin / FIT compatible structured workout payload
 * - Wahoo / Coros / Suunto / Polar JSON & MRC/ERG formats
 * - iCalendar (.ics) for calendar sync
 * - Clean Printable HTML/PDF report
 */

export function exportWorkoutToFitJson(workout, dayName = 'Jour', weekNumber = 1) {
  // Generates Garmin FIT-compatible structured step definitions
  const stepsPayload = (workout.steps || []).map((step, index) => {
    return {
      step_index: index + 1,
      name: step.name,
      duration_desc: step.duration,
      intensity_target: step.zone || 'OPEN',
      target_type: workout.sport === 'cycling' ? 'POWER_ZONE' : 'HEART_RATE_ZONE'
    };
  });

  const fitStructure = {
    file_id: {
      type: 'workout',
      manufacturer: 'Garmin/PulsePlan',
      time_created: new Date().toISOString()
    },
    workout_summary: {
      workout_name: `PulsePlan_W${weekNumber}_${workout.title.replace(/\s+/g, '_')}`,
      sport: workout.sport?.toUpperCase(),
      sub_sport: 'GENERIC',
      estimated_duration_minutes: workout.durationMinutes,
      estimated_tss: workout.estimatedTSS,
      intensity_description: workout.intensity,
      personalized_target: workout.personalizedPace || null
    },
    steps: stepsPayload
  };

  const blob = new Blob([JSON.stringify(fitStructure, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `${fitStructure.workout_summary.workout_name}.fit.json`);
  return fitStructure;
}

export function exportCompatiblePlatform(workout, platform = 'coros') {
  const content = {
    platform: platform.toUpperCase(),
    app: 'PulsePlan v1.0',
    exported_at: new Date().toISOString(),
    workout: {
      title: workout.title,
      sport: workout.sport,
      total_duration_minutes: workout.durationMinutes,
      category: workout.category,
      intervals: (workout.steps || []).map(s => ({
        label: s.name,
        duration: s.duration,
        target_zone: s.zone
      }))
    }
  };

  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `pulseplan_${platform}_${workout.id}.json`);
}

export function exportWeekToICal(week, planMeta = {}) {
  const now = new Date();
  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PulsePlan Endurance//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  week.days.forEach((day, idx) => {
    if (!day.isRest && day.workout) {
      // Calculate fake target date starting next Monday
      const eventDate = new Date(now);
      eventDate.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7) + ((week.weekNumber - 1) * 7) + day.dayIndex);
      const dateStr = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      const durationH = Math.floor(day.workout.durationMinutes / 60);
      const durationM = day.workout.durationMinutes % 60;
      const durationStr = `PT${durationH > 0 ? durationH + 'H' : ''}${durationM}M`;

      icsLines.push('BEGIN:VEVENT');
      icsLines.push(`UID:pulseplan_${week.weekNumber}_${day.dayIndex}_${Date.now()}@pulseplan.app`);
      icsLines.push(`DTSTAMP:${dateStr}`);
      icsLines.push(`DTSTART:${dateStr}`);
      icsLines.push(`DURATION:${durationStr}`);
      icsLines.push(`SUMMARY:[PulsePlan] ${day.workout.title}`);
      icsLines.push(`DESCRIPTION:Discipline: ${planMeta.disciplineName || ''}\\nIntensité: ${day.workout.intensity}\\n${day.workout.description}`);
      icsLines.push('STATUS:CONFIRMED');
      icsLines.push('END:VEVENT');
    }
  });

  icsLines.push('END:VCALENDAR');
  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  triggerDownload(blob, `PulsePlan_Semaine_${week.weekNumber}.ics`);
}

export function exportPlanToPrintable(plan, userProfile) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>PulsePlan - ${plan.disciplineName} (${plan.distanceLabel})</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; padding: 24px; line-height: 1.4; }
        .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        h1 { margin: 0; font-size: 22px; color: #0f172a; }
        .meta { font-size: 13px; color: #64748b; }
        .profile-box { background: #f1f5f9; padding: 10px 14px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; }
        .week-card { border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 18px; page-break-inside: avoid; }
        .week-header { background: #e2e8f0; padding: 8px 12px; font-weight: bold; font-size: 14px; display: flex; justify-content: space-between; }
        .day-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .day-table th, .day-table td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: left; }
        .day-table th { background: #f8fafc; color: #475569; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .badge-rest { background: #f1f5f9; color: #64748b; }
        .badge-workout { background: #e0f2fe; color: #0369a1; }
        @media print {
          button { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>PulsePlan &bull; Programme d'Entraînement</h1>
          <div class="meta">${plan.disciplineName} &mdash; ${plan.distanceLabel} (${plan.totalWeeks} semaines &bull; ${plan.daysPerWeek} séances/semaine)</div>
        </div>
        <button onclick="window.print()" style="padding: 8px 16px; background:#0284c7; color:#fff; border:none; border-radius:4px; cursor:pointer;">Imprimer / Enregistrer en PDF</button>
      </div>

      <div class="profile-box">
        <strong>Profil Athlète :</strong> ${userProfile?.name || 'Athlète'} &bull;
        VMA: ${userProfile?.vma || '--'} km/h &bull;
        FTP: ${userProfile?.ftp || '--'} W &bull;
        FC Max: ${userProfile?.fcMax || '--'} bpm &bull;
        Créé le: ${new Date(plan.createdAt).toLocaleDateString('fr-FR')}
      </div>

      ${plan.weeks.map(week => `
        <div class="week-card">
          <div class="week-header">
            <span>Semaine ${week.weekNumber} &mdash; ${week.phase}</span>
            <span>Volume: ${Math.round(week.totalDurationMinutes / 60)}h${week.totalDurationMinutes % 60} &bull; TSS estimé: ~${week.estimatedTSS}</span>
          </div>
          <table class="day-table">
            <thead>
              <tr>
                <th style="width: 15%;">Jour</th>
                <th style="width: 30%;">Séance</th>
                <th style="width: 15%;">Durée</th>
                <th style="width: 40%;">Détails & Cibles</th>
              </tr>
            </thead>
            <tbody>
              ${week.days.map(d => {
                if (d.isRest) {
                  return `
                    <tr>
                      <td><strong>${d.dayName}</strong></td>
                      <td colspan="3"><span class="badge badge-rest">Repos / Récupération active</span></td>
                    </tr>
                  `;
                }
                return `
                  <tr>
                    <td><strong>${d.dayName}</strong></td>
                    <td><strong>${d.workout.title}</strong><br><small style="color:#64748b;">${d.workout.sport.toUpperCase()} &bull; ${d.workout.intensity}</small></td>
                    <td>${d.workout.durationMinutes} min (~${d.workout.estimatedTSS} TSS)</td>
                    <td>${d.workout.personalizedPace ? `<strong>${d.workout.personalizedPace}</strong><br>` : ''}${d.workout.description}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
