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

export async function loginUserApi(email, password, name) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend login unavailable, fallback local');
  }
  return null;
}

export async function fetchAthleteProfile(email) {
  if (!email) return null;
  try {
    const res = await fetch(`${API_BASE}/profile?email=${encodeURIComponent(email)}`, {
      headers: { 'x-user-email': email },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend unavailable, using local fallback');
  }
  return null;
}

export async function saveAthleteProfile(profile, email) {
  const targetEmail = email || profile?.email;
  if (!targetEmail) return null;
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-email': targetEmail
      },
      body: JSON.stringify({ ...profile, email: targetEmail }),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend unavailable, local store used');
  }
  return null;
}

export async function savePlanToBackend(email, plan) {
  if (!email) return null;
  try {
    const res = await fetch(`${API_BASE}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, plan }),
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend plan save failed');
  }
  return null;
}

export async function fetchPlanFromBackend(email) {
  if (!email) return null;
  try {
    const res = await fetch(`${API_BASE}/plan?email=${encodeURIComponent(email)}`, {
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      return data.plan;
    }
  } catch (e) {
    console.warn('Backend plan fetch failed');
  }
  return null;
}

export async function pushPlanToWatchApi(email, plan) {
  try {
    const res = await fetch(`${API_BASE}/sync/push-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, plan }),
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend sync failed, using client simulation');
  }
  return null;
}
