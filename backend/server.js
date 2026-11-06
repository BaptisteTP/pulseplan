import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Multi-user Database (in-memory, keyed by user email)
const usersDb = new Map();

// Helper to get or create an athlete profile
function getOrCreateUser(email, name = '') {
  const normalizedEmail = email.trim().toLowerCase();
  if (!usersDb.has(normalizedEmail)) {
    usersDb.set(normalizedEmail, {
      id: 'usr_' + Date.now(),
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0],
      profile: {
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        level: 'Intermédiaire',
        hasPowerMeter: false,
        vma: '',
        ftp: '',
        fcMax: '',
        fcRepos: '',
        weeklyHoursLimit: '10',
        currentDiscipline: 'running',
        currentDistance: 'marathon',
        targetTime: '',
        raceDate: '',
        daysPerWeek: 4
      },
      devices: {
        garmin: { id: 'garmin', name: 'Garmin Connect', connected: false, accountName: null, lastSync: null },
        coros: { id: 'coros', name: 'COROS Training Hub', connected: false, accountName: null, lastSync: null },
        wahoo: { id: 'wahoo', name: 'Wahoo Cloud API', connected: false, accountName: null, lastSync: null }
      },
      currentPlan: null
    });
  }
  return usersDb.get(normalizedEmail);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.5.0',
    service: 'PulsePlan Backend API',
    totalUsers: usersDb.size,
    timestamp: new Date().toISOString()
  });
});

// Privacy policy
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/privacy.html'));
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }

  const user = getOrCreateUser(email, name);
  if (name && name.trim() !== '') {
    user.name = name;
    user.profile.name = name;
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      token: 'jwt_' + Buffer.from(user.email).toString('base64')
    },
    profile: user.profile,
    currentPlan: user.currentPlan,
    devices: user.devices
  });
});

// Profile endpoints (scoped by authenticated user email in query or header)
app.get('/api/profile', (req, res) => {
  const email = req.query.email || req.headers['x-user-email'];
  if (!email) {
    return res.status(400).json({ error: 'Email utilisateur manquant' });
  }
  const user = getOrCreateUser(email);
  res.json(user.profile);
});

app.post('/api/profile', (req, res) => {
  const email = req.body.email || req.query.email || req.headers['x-user-email'];
  if (!email) {
    return res.status(400).json({ error: 'Email utilisateur manquant' });
  }
  const user = getOrCreateUser(email);
  user.profile = { ...user.profile, ...req.body };
  if (req.body.name) {
    user.name = req.body.name;
  }
  res.json({ success: true, profile: user.profile });
});

// Plan persistence per user
app.get('/api/plan', (req, res) => {
  const email = req.query.email || req.headers['x-user-email'];
  if (!email) return res.status(400).json({ error: 'Email requis' });
  const user = getOrCreateUser(email);
  res.json({ plan: user.currentPlan });
});

app.post('/api/plan', (req, res) => {
  const { email, plan } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });
  const user = getOrCreateUser(email);
  user.currentPlan = plan;
  res.json({ success: true, message: 'Plan sauvegardé dans le cloud' });
});

// Devices / Watch sync endpoints (scoped to user)
app.get('/api/devices', (req, res) => {
  const email = req.query.email || req.headers['x-user-email'];
  if (!email) return res.json({});
  const user = getOrCreateUser(email);
  res.json(user.devices);
});

app.post('/api/devices/:id/connect', (req, res) => {
  const { id } = req.params;
  const { email, accountName } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  const user = getOrCreateUser(email);
  if (user.devices[id]) {
    user.devices[id].connected = true;
    user.devices[id].accountName = accountName || email;
    user.devices[id].lastSync = new Date().toISOString();
  }
  res.json({ success: true, device: user.devices[id] });
});

app.post('/api/devices/:id/disconnect', (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  const user = getOrCreateUser(email);
  if (user.devices[id]) {
    user.devices[id].connected = false;
    user.devices[id].accountName = null;
    user.devices[id].lastSync = null;
  }
  res.json({ success: true, device: user.devices[id] });
});

// Direct Watch Push
app.post('/api/sync/push-plan', (req, res) => {
  const { email, plan } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  const user = getOrCreateUser(email);
  const activeDeviceNames = Object.values(user.devices)
    .filter(d => d.connected)
    .map(d => d.name);

  if (activeDeviceNames.length === 0) {
    return res.status(400).json({ success: false, message: 'Aucun appareil connecté sur ce compte.' });
  }

  const now = new Date().toISOString();
  Object.keys(user.devices).forEach(k => {
    if (user.devices[k].connected) {
      user.devices[k].lastSync = now;
    }
  });

  res.json({
    success: true,
    message: `Plan synchronisé avec succès vers ${activeDeviceNames.join(', ')}`,
    syncedDevices: activeDeviceNames,
    timestamp: now
  });
});

app.listen(PORT, () => {
  console.log(`[PulsePlan Backend] Multi-user API running on http://localhost:${PORT}`);
});
