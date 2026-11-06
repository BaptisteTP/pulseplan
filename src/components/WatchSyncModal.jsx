import React, { useState } from 'react';
import { useSync } from '../context/SyncContext';
import { 
  Watch, 
  CheckCircle2, 
  RefreshCw, 
  ArrowUpRight, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Wifi, 
  AlertCircle 
} from 'lucide-react';

export default function WatchSyncModal({ plan }) {
  const { 
    devices, 
    connectDevice, 
    disconnectDevice, 
    toggleAutoPush, 
    pushPlanToConnectedWatches, 
    syncHistory 
  } = useSync();

  const [connectingId, setConnectingId] = useState(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleConnect = (deviceId) => {
    setConnectingId(deviceId);
    // Simulate real OAuth authorization popup redirect & handshake
    setTimeout(() => {
      connectDevice(deviceId, 'athlete@garmin.connect');
      setConnectingId(null);
      setStatusMsg({ type: 'success', text: `Connecteur ${devices[deviceId].name} activé avec succès !` });
      setTimeout(() => setStatusMsg(null), 3500);
    }, 1000);
  };

  const handleSyncNow = async () => {
    if (!plan) return;
    setSyncingAll(true);
    setTimeout(async () => {
      const res = await pushPlanToConnectedWatches(plan);
      setSyncingAll(false);
      setStatusMsg({ 
        type: res.success ? 'success' : 'error', 
        text: res.message 
      });
      setTimeout(() => setStatusMsg(null), 4000);
    }, 1200);
  };

  const connectedCount = Object.values(devices).filter(d => d.connected).length;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Header explanation like Nolio / OpenAthlete */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Wifi className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Connecteurs Automatiques & Synchronisation Cloud (Style Nolio)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Une fois connecté via l'API officielle, PulsePlan pousse vos entraînements directement sur votre montre au fil des semaines, sans aucun fichier à manipuler.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncNow}
              disabled={connectedCount === 0 || syncingAll}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
              <span>{syncingAll ? 'Synchronisation en cours...' : 'Envoyer tout le plan vers la montre'}</span>
            </button>
          </div>
        </div>

        {/* Status notification toast */}
        {statusMsg && (
          <div className={`mt-3 p-3 rounded-md text-xs font-medium flex items-center gap-2 ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* How it works info banner */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <div className="flex items-start gap-2">
            <span className="font-bold font-mono text-slate-900 bg-white border border-slate-200 w-5 h-5 rounded flex items-center justify-center shrink-0">1</span>
            <span>Vous autorisez PulsePlan avec votre compte Garmin, Coros ou Wahoo.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold font-mono text-slate-900 bg-white border border-slate-200 w-5 h-5 rounded flex items-center justify-center shrink-0">2</span>
            <span>L'API Cloud planifie vos séances automatiquement sur votre calendrier de montre.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold font-mono text-slate-900 bg-white border border-slate-200 w-5 h-5 rounded flex items-center justify-center shrink-0">3</span>
            <span>Le jour J, allumez votre montre : la séance démarre au bon rythme.</span>
          </div>
        </div>
      </div>

      {/* Connectors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(devices).map((dev) => {
          const isConnecting = connectingId === dev.id;

          return (
            <div
              key={dev.id}
              className={`bg-white border rounded-lg p-5 transition-all shadow-xs flex flex-col justify-between ${
                dev.connected ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs">
                      {dev.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">{dev.name}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">{dev.scope}</span>
                    </div>
                  </div>

                  {dev.connected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Connecté
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400">
                      Déconnecté
                    </span>
                  )}
                </div>

                <div className="py-3 text-xs text-slate-600">
                  {dev.connected ? (
                    <div className="space-y-1">
                      <div className="text-slate-500 font-mono text-[11px]">
                        Compte relié : <span className="text-slate-800 font-semibold">{dev.accountName}</span>
                      </div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        Dernière synchronisation :{' '}
                        <span className="text-slate-700">
                          {dev.lastSync ? new Date(dev.lastSync).toLocaleTimeString('fr-FR') : 'Jamais'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">
                      Synchronise automatiquement les séances de course, vélo et natation directement dans l'application compagnon.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {dev.connected ? (
                  <>
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dev.autoPush}
                        onChange={() => toggleAutoPush(dev.id)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                      />
                      <span>Sync automatique</span>
                    </label>

                    <button
                      onClick={() => disconnectDevice(dev.id)}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Déconnecter
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(dev.id)}
                    disabled={isConnecting}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Connexion OAuth...</span>
                      </>
                    ) : (
                      <>
                        <span>Connecter {dev.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync Log History */}
      {syncHistory.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-mono font-semibold uppercase text-slate-500 mb-2">
            Historique des push récents vers vos appareils
          </div>
          <div className="space-y-1.5">
            {syncHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50 border border-slate-100 rounded font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓ PUSH REUSSI</span>
                  <span className="text-slate-700">{item.planTitle}</span>
                </div>
                <div className="text-slate-400">
                  {item.syncedTo.join(', ')} · {new Date(item.timestamp).toLocaleTimeString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
