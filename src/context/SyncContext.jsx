import React, { createContext, useContext, useState, useEffect } from 'react';

const SyncContext = createContext(null);

const STORAGE_KEY = 'pulseplan_connected_devices';

const DEFAULT_DEVICES = {
  garmin: {
    id: 'garmin',
    name: 'Garmin Connect',
    connected: false,
    autoPush: true,
    lastSync: null,
    accountName: null,
    scope: 'Workouts API + Activity Push'
  },
  coros: {
    id: 'coros',
    name: 'COROS Training Hub',
    connected: false,
    autoPush: true,
    lastSync: null,
    accountName: null,
    scope: 'Training Plan API'
  },
  wahoo: {
    id: 'wahoo',
    name: 'Wahoo Cloud API',
    connected: false,
    autoPush: true,
    lastSync: null,
    accountName: null,
    scope: 'Planned Workouts Push'
  },
  strava: {
    id: 'strava',
    name: 'Strava Sync',
    connected: false,
    autoPush: false,
    lastSync: null,
    accountName: null,
    scope: 'Activities Read/Write'
  },
  suunto: {
    id: 'suunto',
    name: 'Suunto Guides API',
    connected: false,
    autoPush: false,
    lastSync: null,
    accountName: null,
    scope: 'Structured Workout Push'
  }
};

export function SyncProvider({ children }) {
  const [devices, setDevices] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_DEVICES;
    } catch {
      return DEFAULT_DEVICES;
    }
  });

  const [syncHistory, setSyncHistory] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
    } catch (e) {
      console.error(e);
    }
  }, [devices]);

  const connectDevice = (deviceId, accountName = 'alex.renard@endurance.io') => {
    setDevices(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        connected: true,
        accountName,
        lastSync: new Date().toISOString()
      }
    }));
  };

  const disconnectDevice = (deviceId) => {
    setDevices(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        connected: false,
        accountName: null,
        lastSync: null
      }
    }));
  };

  const toggleAutoPush = (deviceId) => {
    setDevices(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        autoPush: !prev[deviceId].autoPush
      }
    }));
  };

  // Push training plan directly to watch cloud (Garmin / COROS / Wahoo)
  const pushPlanToConnectedWatches = async (plan) => {
    const connectedList = Object.values(devices).filter(d => d.connected);
    if (connectedList.length === 0) {
      return { success: false, message: 'Aucune montre connectée.' };
    }

    const now = new Date().toISOString();
    const syncedNames = [];

    // Simulate direct OAuth Cloud Push
    for (const dev of connectedList) {
      setDevices(prev => ({
        ...prev,
        [dev.id]: {
          ...prev[dev.id],
          lastSync: now
        }
      }));
      syncedNames.push(dev.name);
    }

    const event = {
      id: Date.now(),
      timestamp: now,
      planTitle: `${plan.disciplineName} - ${plan.distanceLabel}`,
      weeksCount: plan.totalWeeks,
      syncedTo: syncedNames
    };

    setSyncHistory(prev => [event, ...prev.slice(0, 9)]);

    return {
      success: true,
      count: plan.weeks.length,
      syncedTo: syncedNames,
      message: `Toutes les séances ont été injectées directement dans : ${syncedNames.join(', ')}.`
    };
  };

  return (
    <SyncContext.Provider
      value={{
        devices,
        connectDevice,
        disconnectDevice,
        toggleAutoPush,
        pushPlanToConnectedWatches,
        syncHistory
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used inside SyncProvider');
  return ctx;
}
