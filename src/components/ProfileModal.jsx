import React, { useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { User, Check, Heart, Zap, Clock } from 'lucide-react';

export default function ProfileModal() {
  const { profile, updateProfile } = useProfile();
  const [formData, setFormData] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-semibold text-slate-900">
                Zones & Profil Physiologique de l'Athlète
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Métriques de référence pour l'individualisation des intensités (VMA, FTP, FC Max).
            </p>
          </div>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
              <Check className="w-3 h-3" />
              Enregistré
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5 text-xs">
          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-mono text-xs mb-1">Nom / Pseudonyme</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-mono text-xs mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          {/* Physiological values */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-slate-600 font-mono font-semibold uppercase text-[11px] mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Valeurs de référence (Seuils & Puissance)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">VMA (km/h)</label>
                <input
                  type="number"
                  step="0.1"
                  name="vma"
                  value={formData.vma}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Course à pied</span>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">FTP (Watts)</label>
                <input
                  type="number"
                  step="1"
                  name="ftp"
                  value={formData.ftp}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Puissance cycliste 60m</span>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">FC Max (bpm)</label>
                <input
                  type="number"
                  step="1"
                  name="fcMax"
                  value={formData.fcMax}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Cardio maximal</span>
              </div>
            </div>
          </div>

          {/* Time availability */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-slate-600 font-mono font-semibold uppercase text-[11px] mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Disponibilités & Expérience</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Temps maximum disponible par semaine</label>
                <select
                  name="weeklyHoursLimit"
                  value={formData.weeklyHoursLimit}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-500"
                >
                  <option value="6">6h / semaine</option>
                  <option value="8">8h / semaine</option>
                  <option value="10">10h / semaine (Standard Marathon / 70.3)</option>
                  <option value="14">14h / semaine (Ironman / Ultra)</option>
                  <option value="18">18h / semaine</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Niveau d'expérience</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-500"
                >
                  <option value="Débutant structuré">Débutant structuré</option>
                  <option value="Intermédiaire">Intermédiaire (objectif chrono)</option>
                  <option value="Avancé">Avancé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Sauvegarder les données athlète
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
