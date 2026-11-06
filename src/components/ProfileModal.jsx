import React, { useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { User, Activity, Zap, Heart, Clock, CheckCircle } from 'lucide-react';

export default function ProfileModal() {
  const { profile, updateProfile } = useProfile();
  const [formData, setFormData] = useState({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Profil Athlète & Métriques Physiologiques</h2>
            <p className="text-xs text-slate-500 mt-1">
              Renseignez vos repères personnels pour calibrer automatiquement les allures, puissances cibles et zones cardiaques.
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <User className="w-6 h-6" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Nom complet
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 font-mono transition-colors"
                placeholder="Ex: Alexandre Renard"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Email / Identifiant
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 font-mono transition-colors"
                placeholder="exemple@endurance.io"
              />
            </div>
          </div>

          {/* Physiological Metrics */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Repères d'Intensité (Course & Vélo)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  VMA (Course)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="25"
                    name="vma"
                    value={formData.vma || ''}
                    onChange={handleChange}
                    placeholder="Ex: 16.0"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 font-mono"
                  />
                  <span className="absolute right-3 top-2 text-[11px] text-slate-400">km/h</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Calibre les 30/30, tempo et sorties Z2</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  FTP (Vélo / Puissance)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="5"
                    min="100"
                    max="500"
                    name="ftp"
                    value={formData.ftp || ''}
                    onChange={handleChange}
                    placeholder="Ex: 250"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 font-mono"
                  />
                  <span className="absolute right-3 top-2 text-[11px] text-slate-400">Watts</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Puissance au seuil 60 min (facultatif si sans capteur)</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  FC Max (Cardio)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="140"
                    max="220"
                    name="fcMax"
                    value={formData.fcMax || ''}
                    onChange={handleChange}
                    placeholder="Ex: 185"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 font-mono"
                  />
                  <span className="absolute right-3 top-2 text-[11px] text-slate-400">bpm</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Fréquence cardiaque maximale</p>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              Volume & Contraintes de Temps
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Volume hebdomadaire maximal visé
                </label>
                <select
                  name="weeklyHoursLimit"
                  value={formData.weeklyHoursLimit}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-mono"
                >
                  <option value="6">Jusqu'à 6 heures / semaine</option>
                  <option value="8">Jusqu'à 8 heures / semaine</option>
                  <option value="10">Jusqu'à 10 heures / semaine (Recommandé M / 70.3)</option>
                  <option value="14">Jusqu'à 14 heures / semaine (Ironman / Ultra)</option>
                  <option value="18">15+ heures / semaine</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Niveau d'expérience endurance
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-mono"
                >
                  <option value="Débutant structuré">Débutant structuré (1-2 ans de pratique)</option>
                  <option value="Intermédiaire">Intermédiaire (pratique régulière, objectifs chronos)</option>
                  <option value="Avancé">Avancé (plusieurs marathons / Half / Ultra bouclés)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              Données enregistrées en local et sur votre compte cloud.
            </span>
            <div className="flex items-center gap-3">
              {savedSuccess && (
                <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Enregistré
                </span>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Mettre à jour le profil
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
