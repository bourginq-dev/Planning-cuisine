import React, { useState } from 'react';
import { ALL_DAYS } from '../data/ingredients';
import { DEFAULT_MEAL_SCHEDULE, MealSchedule, StudentProfile } from '../types';
import {
  CalendarDays,
  Check,
  ChefHat,
  Flame,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Utensils,
  X
} from 'lucide-react';

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
  const [mealSchedule, setMealSchedule] = useState<MealSchedule>(
    profile.mealSchedule ? { ...DEFAULT_MEAL_SCHEDULE, ...profile.mealSchedule } : { ...DEFAULT_MEAL_SCHEDULE }
  );

  if (!isOpen) return null;

  const handleToggleSlot = (day: string, type: 'midi' | 'soir') => {
    setMealSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: !prev[day]?.[type]
      }
    }));
  };

  const setAllMeals = (active: boolean) => {
    const next: MealSchedule = {};
    ALL_DAYS.forEach(d => {
      next[d] = { midi: active, soir: active };
    });
    setMealSchedule(next);
  };

  const setEveningsOnly = () => {
    const next: MealSchedule = {};
    ALL_DAYS.forEach(d => {
      next[d] = { midi: false, soir: true };
    });
    setMealSchedule(next);
  };

  const setDinnersAndWeekend = () => {
    const next: MealSchedule = {};
    ALL_DAYS.forEach(d => {
      const isWeekend = d === 'Samedi' || d === 'Dimanche';
      next[d] = { midi: isWeekend, soir: true };
    });
    setMealSchedule(next);
  };

  const setLunchesOnly = () => {
    const next: MealSchedule = {};
    ALL_DAYS.forEach(d => {
      next[d] = { midi: true, soir: false };
    });
    setMealSchedule(next);
  };

  // Count active meals
  let totalActiveMeals = 0;
  ALL_DAYS.forEach(d => {
    if (mealSchedule[d]?.midi) totalActiveMeals++;
    if (mealSchedule[d]?.soir) totalActiveMeals++;
  });

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
      monthlyBudget,
      mealSchedule
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

          {/* MEAL SCHEDULE SELECTOR */}
          <div className="bg-white p-4 rounded-xl border border-[#E6E1D7] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#433E37] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-[#8BA888]" />
                Repas cuisinés & consommés
              </h4>
              <span className="font-mono-code text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EBF2EA] text-[#3D593A] border border-[#D1E0CE]">
                {totalActiveMeals} / 14 repas
              </span>
            </div>

            <p className="text-[11px] text-[#7D7569] leading-relaxed">
              Cochez les repas que vous mangez chez vous. Les créneaux décochés ne généreront aucun plat ni ingrédient dans votre liste de courses.
            </p>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setAllMeals(true)}
                className="text-[10px] font-bold px-2 py-1 bg-[#FAF8F5] hover:bg-[#F4F1EB] border border-[#DCD6CB] rounded-md text-[#433E37] cursor-pointer transition-colors"
              >
                Tous (14/14)
              </button>
              <button
                type="button"
                onClick={setEveningsOnly}
                className="text-[10px] font-bold px-2 py-1 bg-[#FAF8F5] hover:bg-[#F4F1EB] border border-[#DCD6CB] rounded-md text-[#433E37] cursor-pointer transition-colors"
              >
                Soirs seuls (7/14)
              </button>
              <button
                type="button"
                onClick={setDinnersAndWeekend}
                className="text-[10px] font-bold px-2 py-1 bg-[#FAF8F5] hover:bg-[#F4F1EB] border border-[#DCD6CB] rounded-md text-[#433E37] cursor-pointer transition-colors"
              >
                Soirs + Week-end (9/14)
              </button>
              <button
                type="button"
                onClick={setLunchesOnly}
                className="text-[10px] font-bold px-2 py-1 bg-[#FAF8F5] hover:bg-[#F4F1EB] border border-[#DCD6CB] rounded-md text-[#433E37] cursor-pointer transition-colors"
              >
                Midis seuls (7/14)
              </button>
            </div>

            {/* 7 Days Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {ALL_DAYS.map(day => {
                const midiActive = mealSchedule[day]?.midi ?? true;
                const soirActive = mealSchedule[day]?.soir ?? true;
                const isWeekend = day === 'Samedi' || day === 'Dimanche';

                return (
                  <div
                    key={day}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                      isWeekend ? 'bg-[#FAF8F5] border-[#E6E1D7]' : 'bg-white border-[#EAE5DC]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#433E37] text-xs">{day}</span>
                      {isWeekend && (
                        <span className="text-[9px] text-[#D97706] font-semibold">WE</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Midi Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleSlot(day, 'midi')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                          midiActive
                            ? 'bg-[#EBF2EA] text-[#3D593A] border-[#D1E0CE]'
                            : 'bg-[#F4F1EB] text-[#A39E93] border-dashed border-[#DCD6CB] line-through'
                        }`}
                        title={midiActive ? `Désactiver déjeuner ${day}` : `Activer déjeuner ${day}`}
                      >
                        <Sun className={`w-3 h-3 ${midiActive ? 'text-[#D97706]' : 'text-[#A39E93]'}`} />
                        <span>Midi</span>
                      </button>

                      {/* Soir Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleSlot(day, 'soir')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                          soirActive
                            ? 'bg-[#433E37] text-white border-[#322E28]'
                            : 'bg-[#F4F1EB] text-[#A39E93] border-dashed border-[#DCD6CB] line-through'
                        }`}
                        title={soirActive ? `Désactiver dîner ${day}` : `Activer dîner ${day}`}
                      >
                        <Moon className={`w-3 h-3 ${soirActive ? 'text-[#FAD7A0]' : 'text-[#A39E93]'}`} />
                        <span>Soir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
