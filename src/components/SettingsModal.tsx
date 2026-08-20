import React, { useState } from 'react';
import { ALL_DAYS } from '../data/ingredients';
import { StudentProfile } from '../types';
import { ChefHat, Flame, Settings, Sparkles, Utensils, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  profile: StudentProfile;
  onClose: () => void;
  onSaveProfile: (newProfile: StudentProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSaveProfile
}) => {
  const [name, setName] = useState(profile.name);
  const [plaques, setPlaques] = useState(profile.plaques);
  const [poeles, setPoeles] = useState(profile.poeles);
  const [casseroles, setCasseroles] = useState(profile.casseroles);
  const [four, setFour] = useState(profile.four);
  const [micro, setMicro] = useState(profile.micro);
  const [shoppingDay, setShoppingDay] = useState(profile.shoppingDay || 'Lundi');
  const [monthlyBudget, setMonthlyBudget] = useState(profile.monthlyBudget || 150);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name: name.trim() || 'Étudiant',
      plaques,
      poeles,
      casseroles,
      four,
      micro,
      shoppingDay,
      monthlyBudget
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#433E37]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] border border-[#DCD6CB] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E1D7] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF6EE] text-[#D97706] flex items-center justify-center border border-[#FAD7A0]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#D97706]">
                Configuration Cuisine
              </span>
              <h3 className="text-lg font-bold text-[#433E37] leading-tight">
                Équipement & Paramètres
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A39E93] hover:text-[#433E37] hover:bg-[#F4F1EB] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#433E37] block mb-1">Prénom ou Pseudo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#DCD6CB] rounded-xl p-2.5 text-[#433E37] focus:outline-none focus:border-[#8BA888]"
              required
            />
          </div>

          {/* Kitchen Gear */}
          <div className="bg-white p-4 rounded-xl border border-[#E6E1D7] space-y-3">
            <h4 className="font-bold text-[#433E37] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-[#D97706]" />
              Matériel de cuisson disponible
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-[#7D7569] font-semibold block mb-1">🔥 Plaques</label>
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={plaques}
                  onChange={(e) => setPlaques(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl p-2 font-mono-code font-bold text-[#433E37] text-center focus:outline-none focus:border-[#8BA888]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#7D7569] font-semibold block mb-1">🍳 Poêles</label>
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={poeles}
                  onChange={(e) => setPoeles(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl p-2 font-mono-code font-bold text-[#433E37] text-center focus:outline-none focus:border-[#8BA888]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#7D7569] font-semibold block mb-1">🥘 Casseroles</label>
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={casseroles}
                  onChange={(e) => setCasseroles(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl p-2 font-mono-code font-bold text-[#433E37] text-center focus:outline-none focus:border-[#8BA888]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E6E1D7] bg-[#FAF8F5] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={four}
                  onChange={(e) => setFour(e.target.checked)}
                  className="rounded text-[#8BA888] accent-[#8BA888] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-[#433E37]">Four traditionnel</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E6E1D7] bg-[#FAF8F5] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={micro}
                  onChange={(e) => setMicro(e.target.checked)}
                  className="rounded text-[#8BA888] accent-[#8BA888] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-[#433E37]">Four micro-ondes</span>
              </label>
            </div>
          </div>

          {/* Planning day & Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#433E37] block mb-1">Jour habituel de courses</label>
              <select
                value={shoppingDay}
                onChange={(e) => setShoppingDay(e.target.value)}
                className="w-full bg-white border border-[#DCD6CB] rounded-xl p-2.5 text-[#433E37] font-semibold focus:outline-none focus:border-[#8BA888]"
              >
                {ALL_DAYS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-[#433E37] block mb-1">Budget mensuel cible (€)</label>
              <input
                type="number"
                min="30"
                max="800"
                step="5"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 150)}
                className="w-full bg-white border border-[#DCD6CB] rounded-xl p-2.5 font-mono-code font-bold text-[#433E37] focus:outline-none focus:border-[#8BA888]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#433E37] hover:bg-[#322E28] text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
