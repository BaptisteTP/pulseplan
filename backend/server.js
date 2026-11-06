import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory data store (can be plugged to PostgreSQL / SQLite via Prisma)
let athleteProfile = {
  name: 'Alexandre Renard',
  email: 'alex.renard@endurance.io',
  level: 'Intermédiaire',
  vma: '16.5',
  ftp: '265',
  fcMax: '188',
  fcRepos: '48',
  weeklyHoursLimit: '10',
  currentDiscipline: 'triathlon',
  currentDistance: '70.3',
  daysPerWeek: 4
};

let connectedDevices = {
  garmin: { id: 'garmin', name: 'Garmin Connect', connected: true, accountName: 'alex.renard@garmin.com', lastSync: new Date().toISOString() },
  coros: { id: 'coros', name: 'COROS Training Hub', connected: false, accountName: null, lastSync: null },
  wahoo: { id: 'wahoo', name: 'Wahoo Cloud API', connected: false, accountName: null, lastSync: null }
};

let activePlans = [];

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    service: 'PulsePlan Backend API',
    timestamp: new Date().toISOString()
  });
});

// Profile endpoints
app.get('/api/profile', (req, res) => {
  res.json(athleteProfile);
});

app.post('/api/profile', (req, res) => {
  athleteProfile = { ...athleteProfile, ...req.body };
  res.json({ success: true, profile: athleteProfile });
});

// Devices / Watch sync endpoints
app.get('/api/devices', (req, res) => {
  res.json(connectedDevices);
});

app.post('/api/devices/:id/connect', (req, res) => {
  const { id } = req.params;
  const { accountName } = req.body;
  if (connectedDevices[id]) {
    connectedDevices[id].connected = true;
    connectedDevices[id].accountName = accountName || 'athlete@cloud.com';
    connectedDevices[id].lastSync = new Date().toISOString();
  }
  res.json({ success: true, device: connectedDevices[id] });
});

app.post('/api/devices/:id/disconnect', (req, res) => {
  const { id } = req.params;
  if (connectedDevices[id]) {
    connectedDevices[id].connected = false;
    connectedDevices[id].accountName = null;
    connectedDevices[id].lastSync = null;
  }
  res.json({ success: true, device: connectedDevices[id] });
});

// Direct Watch Push webhook simulation
app.post('/api/sync/push-plan', (req, res) => {
  const { plan } = req.body;
  const activeDeviceNames = Object.values(connectedDevices)
    .filter(d => d.connected)
    .map(d => d.name);

  if (activeDeviceNames.length === 0) {
    return res.status(400).json({ success: false, message: 'Aucun appareil connecté.' });
  }

  // Update last sync on all connected devices
  const now = new Date().toISOString();
  Object.keys(connectedDevices).forEach(k => {
    if (connectedDevices[k].connected) {
      connectedDevices[k].lastSync = now;
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
  console.log(`[PulsePlan Backend] API server running on http://localhost:${PORT}`);
});
