import React, { useEffect, useState } from 'react';
import { INGREDIENTS } from '../data/ingredients';
import { Recipe } from '../types';
import { Bell, Check, CheckCircle, Clock, Play, RotateCcw, UtensilsCrossed, X } from 'lucide-react';

interface CookingModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onMarkDone?: () => void;
}

export const CookingModal: React.FC<CookingModalProps> = ({
  recipe,
  onClose,
  onMarkDone
}) => {
  const [activeTimers, setActiveTimers] = useState<Record<number, { seconds: number; total: number; isRunning: boolean; isDone: boolean }>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => {
        let changed = false;
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          const id = Number(key);
          const t = next[id];
          if (t.isRunning && t.seconds > 0) {
            changed = true;
            next[id] = { ...t, seconds: t.seconds - 1 };
            if (next[id].seconds === 0) {
              next[id].isRunning = false;
              next[id].isDone = true;
            }
          }
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!recipe) return null;

  const startTimer = (stepIdx: number, minutes: number) => {
    setActiveTimers(prev => ({
      ...prev,
      [stepIdx]: {
        seconds: minutes * 60,
        total: minutes * 60,
        isRunning: true,
        isDone: false
      }
    }));
  };

  const resetTimer = (stepIdx: number) => {
    setActiveTimers(prev => {
      const next = { ...prev };
      delete next[stepIdx];
      return next;
    });
  };

  const toggleTimerPause = (stepIdx: number) => {
    setActiveTimers(prev => {
      if (!prev[stepIdx]) return prev;
      return {
        ...prev,
        [stepIdx]: {
          ...prev[stepIdx],
          isRunning: !prev[stepIdx].isRunning
        }
      };
    });
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Helper to render steps with integrated clickable timers
  const renderStepContent = (stepText: string, stepIdx: number) => {
    const timerRegex = /(\d+(?:[.,]\d+)?)\s*min(?:utes)?/gi;
    const parts = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = timerRegex.exec(stepText)) !== null) {
      const start = match.index;
      const end = timerRegex.lastIndex;
      const minutesStr = match[1].replace(',', '.');
      const minutes = parseFloat(minutesStr);

      parts.push(stepText.slice(lastIndex, start));

      const timer = activeTimers[stepIdx];

      parts.push(
        <span key={`timer-${stepIdx}-${start}`} className="inline-flex items-center gap-1.5 mx-1 my-0.5 align-middle">
          {!timer ? (
            <button
              onClick={() => startTimer(stepIdx, minutes)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              Lancer {minutes} min
            </button>
          ) : timer.isDone ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-[#8BA888] text-white animate-bounce shadow-md">
              <Bell className="w-3.5 h-3.5" />
              🔔 Minuteur terminé !
              <button
                onClick={() => resetTimer(stepIdx)}
                className="ml-1 opacity-80 hover:opacity-100 cursor-pointer"
                title="Réinitialiser"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-[#FDF6EE] text-[#9A5304] border border-[#FAD7A0]">
              <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
              {formatSeconds(timer.seconds)}
              <button
                onClick={() => toggleTimerPause(stepIdx)}
                className="p-0.5 hover:text-black cursor-pointer"
                title={timer.isRunning ? 'Pause' : 'Reprendre'}
              >
                {timer.isRunning ? '⏸️' : <Play className="w-3 h-3 fill-current" />}
              </button>
              <button
                onClick={() => resetTimer(stepIdx)}
                className="p-0.5 hover:text-black cursor-pointer"
                title="Arrêter"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </span>
          )}
        </span>
      );

      lastIndex = end;
    }

    parts.push(stepText.slice(lastIndex));
    return parts;
  };

  const allStepsDone = recipe.steps.length > 0 && recipe.steps.every((_, idx) => checkedSteps[idx]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#433E37]/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] text-[#433E37] border border-[#DCD6CB] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top bar */}
        <div className="p-4 sm:p-5 border-b border-[#E6E1D7] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF6EE] text-[#D97706] flex items-center justify-center border border-[#FAD7A0]">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-[#D97706]">
                Mode Cuisson Pas-à-Pas
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#433E37] leading-tight">
                {recipe.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A39E93] hover:text-[#433E37] hover:bg-[#F4F1EB] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Ingredients checklist */}
          <div className="bg-white rounded-xl border border-[#E6E1D7] p-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7D7569] mb-3 flex items-center justify-between">
              <span>Ingrédients à préparer sur le plan de travail</span>
              <span className="text-[#A39E93] font-mono-code text-[11px]">
                {Object.values(checkedIngredients).filter(Boolean).length} / {recipe.ingredients.length} prêts
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recipe.ingredients.map((ingItem, idx) => {
                const ing = INGREDIENTS[ingItem.id];
                if (!ing) return null;
                const isChecked = !!checkedIngredients[idx];
                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer text-xs transition-colors select-none border ${
                      isChecked
                        ? 'bg-[#EBF2EA] text-[#3D593A] line-through opacity-85 border-[#D1E0CE]'
                        : 'bg-[#FAF8F5] text-[#433E37] border-[#E6E1D7] hover:bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }))}
                      className="rounded border-[#DCD6CB] text-[#8BA888] accent-[#8BA888] focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span className="flex-1 font-medium">{ing.name}</span>
                    <span className="font-mono-code font-bold text-[#7D7569] text-[11px]">
                      {ingItem.qty} {ing.unit}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Cooking steps */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#D97706] flex items-center justify-between">
              <span>Étapes de réalisation</span>
              <span className="text-[#7D7569] font-mono-code text-[11px]">
                {recipe.time}
              </span>
            </h3>

            {recipe.steps.map((step, idx) => {
              const isChecked = !!checkedSteps[idx];
              return (
                <div
                  key={idx}
                  onClick={() => setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }))}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'bg-[#EBF2EA] border-[#D1E0CE] text-[#3D593A]'
                      : 'bg-white border-[#E6E1D7] text-[#433E37] hover:border-[#8BA888]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isChecked ? 'bg-[#8BA888] text-white' : 'bg-[#433E37] text-white'
                      }`}
                    >
                      {isChecked ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div className="flex-1 text-sm sm:text-base leading-relaxed" onClick={e => e.stopPropagation()}>
                      {renderStepContent(step, idx)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E1D7] bg-white flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#433E37] hover:text-black bg-[#F4F1EB] hover:bg-[#EAE5DC] rounded-xl cursor-pointer transition-colors"
          >
            Quitter
          </button>

          {onMarkDone && (
            <button
              onClick={() => {
                onMarkDone();
                onClose();
              }}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#8BA888] hover:bg-[#789675] rounded-xl flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-white" />
              Repas Cuisiné ! (Déduire du frigo)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
