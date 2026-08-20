import React, { useState } from 'react';
import { ALL_DAYS } from '../data/ingredients';
import { StudentProfile } from '../types';
import { ChefHat, Flame, Rocket, Sparkles, Utensils } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: StudentProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [plaques, setPlaques] = useState(2);
  const [poeles, setPoeles] = useState(1);
  const [casseroles, setCasseroles] = useState(1);
  const [four, setFour] = useState(false);
  const [micro, setMicro] = useState(true);
  const [shoppingDay, setShoppingDay] = useState('Lundi');
  const [monthlyBudget, setMonthlyBudget] = useState(140);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      name: name.trim() || 'Chef Étudiant',
      plaques,
      poeles,
      casseroles,
      four,
      micro,
      shoppingDay,
      monthlyBudget
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-stone-50 border-2 border-stone-900 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200 text-amber-950 font-bold text-xs font-mono-code uppercase tracking-wider border border-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            Bienvenue dans ton carnet
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
            Cuisine Étudiante & Budget Malin
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            Configure ton équipement pour que l'application ne te propose que des recettes que tu as le matériel de cuisiner.
          </p>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-stone-800 block mb-1">
              Ton prénom ou pseudo :
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Alex, Sarah, Chef Raph..."
              className="w-full bg-white border border-stone-300 rounded-xl p-3 text-stone-900 text-sm font-semibold focus:outline-none focus:border-amber-500 shadow-2xs"
              required
            />
          </div>

          {/* Cooking Hardware */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-2xs">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-600" />
              Ton matériel dans le studio / coloc :
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-stone-600 font-semibold block mb-1">🔥 Plaques</label>
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={plaques}
                  onChange={(e) => setPlaques(parseInt(e.target.value) || 0)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-mono-code font-bold text-stone-900 text-center text-sm"
                />
              </div>

              <div>
                <label className="text-[11px] text-stone-600 font-semibold block mb-1">🍳 Poêles</label>
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={poeles}
                  onChange={(e) => setPoeles(parseInt(e.target.value) || 0)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-mono-code font-bold text-stone-900 text-center text-sm"
                />
              </div>

              <div>
                <label className="text-[11px] text-stone-600 font-semibold block mb-1">🥘 Casseroles</label>
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={casseroles}
                  onChange={(e) => setCasseroles(parseInt(e.target.value) || 0)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-mono-code font-bold text-stone-900 text-center text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 bg-stone-50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={four}
                  onChange={(e) => setFour(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-stone-800">Four traditionnel</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 bg-stone-50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={micro}
                  onChange={(e) => setMicro(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-stone-800">Micro-ondes</span>
              </label>
            </div>
          </div>

          {/* Planning Day & Target Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-800 block mb-1">
                Jour habituel de courses :
              </label>
              <select
                value={shoppingDay}
                onChange={(e) => setShoppingDay(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-stone-900 font-semibold shadow-2xs"
              >
                {ALL_DAYS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">
                Budget cible (€ / mois) :
              </label>
              <input
                type="number"
                min="30"
                max="800"
                step="5"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 140)}
                className="w-full bg-white border border-stone-300 rounded-xl p-2.5 font-mono-code font-bold text-stone-900 shadow-2xs text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 mt-2"
          >
            <Rocket className="w-4 h-4 text-amber-400" />
            Créer mon Carnet Gourmand
          </button>
        </form>
      </div>
    </div>
  );
};
