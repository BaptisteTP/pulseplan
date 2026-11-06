import React, { useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { getRunningZones, getCyclingPowerZones } from '../services/physiologyService';
import { 
  Zap, 
  Activity, 
  Heart, 
  Gauge, 
  SlidersHorizontal, 
  Info, 
  HelpCircle,
  Footprints,
  Bike,
  Sparkles
} from 'lucide-react';

export default function TrainingZonesView() {
  const { profile, updateProfile } = useProfile();
  const [activeTab, setActiveTab] = useState('running');

  const [vma, setVma] = useState(profile.vma || '15.0');
  const [fcMax, setFcMax] = useState(profile.fcMax || '185');
  const [fcRepos, setFcRepos] = useState(profile.fcRepos || '50');
  const [ftp, setFtp] = useState(profile.ftp || '230');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const runningZones = getRunningZones(vma, fcMax, fcRepos);
  const cyclingZones = getCyclingPowerZones(ftp);

  const handleSaveToProfile = (e) => {
    e.preventDefault();
    updateProfile({
      vma: vma,
      fcMax: fcMax,
      fcRepos: fcRepos,
      ftp: ftp
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-sky-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Moteur Physiologique & Cibles
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-2 text-white">
              Zones d'Allures, Watts & Cardio Cibles
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Ces plages calibrées calculent exactement les allures au kilomètre et les watts cibles pour chacune de vos séances d'endurance fondamentale, seuil et fractionné.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('running')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'running'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white/10 hover:bg-white/15 text-slate-300'
              }`}
            >
              <Footprints className="w-4 h-4" />
              Course (VMA)
            </button>
            <button
              onClick={() => setActiveTab('cycling')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'cycling'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white/10 hover:bg-white/15 text-slate-300'
              }`}
            >
              <Bike className="w-4 h-4" />
              Vélo (FTP)
            </button>
          </div>
        </div>
      </div>

      {/* Input Repères Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <form onSubmit={handleSaveToProfile} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                VMA (km/h)
              </label>
              <input
                type="number"
                step="0.1"
                min="9"
                max="25"
                value={vma}
                onChange={(e) => setVma(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white transition-colors"
                placeholder="15.0"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                FTP Vélo (Watts)
              </label>
              <input
                type="number"
                step="5"
                min="100"
                max="500"
                value={ftp}
                onChange={(e) => setFtp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white transition-colors"
                placeholder="230"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                FC Max (BPM)
              </label>
              <input
                type="number"
                step="1"
                min="140"
                max="220"
                value={fcMax}
                onChange={(e) => setFcMax(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white transition-colors"
                placeholder="185"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                FC Repos (BPM)
              </label>
              <input
                type="number"
                step="1"
                min="35"
                max="90"
                value={fcRepos}
                onChange={(e) => setFcRepos(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white transition-colors"
                placeholder="50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              {savedSuccess ? '✓ Enregistré au profil !' : 'Actualiser mes zones'}
            </button>
          </div>
        </form>
      </div>

      {/* Zones Table Display */}
      {activeTab === 'running' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <h3 className="font-bold text-slate-900 text-sm">Zones d'Allure Course à Pied (Basées sur {vma} km/h)</h3>
            </div>
            <span className="text-[11px] text-slate-400">Échelle 5 Zones Aérobies</span>
          </div>

          <div className="divide-y divide-slate-100">
            {runningZones.map((z) => (
              <div key={z.zone} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold border ${z.color}`}>
                    {z.zone}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{z.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{z.target}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Allure Cible</span>
                    <span className="font-extrabold text-slate-900 text-sm">{z.paceRange}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4 text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Vitesse</span>
                    <span className="font-bold text-slate-700">{z.speedRange}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4 text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cardio Cible</span>
                    <span className="font-bold text-rose-600">{z.hrRange}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="font-bold text-slate-900 text-sm">Zones de Puissance Vélo Coggan (Basées sur FTP {ftp} W)</h3>
            </div>
            <span className="text-[11px] text-slate-400">Échelle Coggan 6 Zones</span>
          </div>

          <div className="divide-y divide-slate-100">
            {cyclingZones.map((z) => (
              <div key={z.zone} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold border ${z.color}`}>
                    {z.zone}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{z.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{z.target}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Puissance Cible</span>
                    <span className="font-extrabold text-amber-600 text-sm sm:text-base">{z.watts}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4 text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">% FTP</span>
                    <span className="font-bold text-slate-700">{z.percent}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
