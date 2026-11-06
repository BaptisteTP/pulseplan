import React, { useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export default function AuthScreen() {
  const { login } = useProfile();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez renseigner tous les champs.');
      return;
    }

    login(email, password, isRegister ? name : undefined);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans antialiased relative overflow-hidden">
      {/* Background Hero Accent Photo */}
      <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1920&q=80" 
          alt="Endurance background" 
          className="w-full h-full object-cover grayscale"
        />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-900 text-white mb-4 shadow-md ring-1 ring-white/20">
          <Activity className="w-7 h-7 text-sky-400 stroke-[2.2]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          PulsePlan
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
          L'ingénierie d'entraînement d'endurance pour athlètes exigeants
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 cursor-pointer transition-colors ${
                !isRegister
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 cursor-pointer transition-colors ${
                isRegister
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Créer un compte
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nom & Prénom
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Alexandre Renard"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-500 "
                  required={isRegister}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Adresse email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@endurance.io"
                  className="w-full text-xs p-2.5 pl-8 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-500 "
                  required
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 pl-8 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-500 "
                  required
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>{isRegister ? 'Commencer la préparation' : 'Accéder à mes plans'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Données privées & chiffrées
            </span>
            <span className="">PWA iPhone Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
