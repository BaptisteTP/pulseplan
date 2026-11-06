const API_BASE = import.meta.env.VITE_API_URL || 'https://pulseplan-api.onrender.com/api';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return { online: true, data };
    }
    return { online: false };
  } catch (e) {
    return { online: false };
  }
}

export async function fetchAthleteProfile() {
  try {
    const res = await fetch(`${API_BASE}/profile`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend unavailable, using local fallback');
  }
  return null;
}

export async function saveAthleteProfile(profile) {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend unavailable, local store used');
  }
  return null;
}

export async function pushPlanToWatchApi(plan) {
  try {
    const res = await fetch(`${API_BASE}/sync/push-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend sync failed, using client simulation');
  }
  return null;
}
