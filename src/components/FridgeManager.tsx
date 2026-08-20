import React, { useState } from 'react';
import { CATEGORY_ORDER, INGREDIENTS } from '../data/ingredients';
import { Ingredient } from '../types';
import { Lightbulb, Minus, Package, Plus, Refrigerator, Search, Sparkles, Trash2 } from 'lucide-react';

interface FridgeManagerProps {
  fridge: Record<string, number>;
  onAddFridgeItem: (id: string, qty: number) => void;
  onRemoveFridgeItem: (id: string) => void;
  onOpenAntiGaspi: () => void;
}

export const FridgeManager: React.FC<FridgeManagerProps> = ({
  fridge,
  onAddFridgeItem,
  onRemoveFridgeItem,
  onOpenAntiGaspi
}) => {
  const [selectedId, setSelectedId] = useState<string>('oeuf');
  const [inputQty, setInputQty] = useState<number>(2);
  const [searchFilter, setSearchFilter] = useState('');

  const fridgeItemIds = Object.keys(fridge).filter(id => (fridge[id] || 0) > 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId && inputQty > 0) {
      onAddFridgeItem(selectedId, inputQty);
    }
  };

  const allIngredientsList = Object.values(INGREDIENTS).sort((a, b) => a.name.localeCompare(b.name));

  const filteredIngredients = searchFilter.trim()
    ? allIngredientsList.filter(ing => ing.name.toLowerCase().includes(searchFilter.toLowerCase()))
    : allIngredientsList;

  const currentSelectedIng = INGREDIENTS[selectedId] || allIngredientsList[0];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-6">
      {/* Header with Anti-Gaspi Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E6E1D7]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EBF2EA] text-[#3D593A] border border-[#D1E0CE]">
              <Refrigerator className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-[#433E37] text-lg">
              Mon Frigo & Placard Actuel
            </h3>
          </div>
          <p className="text-xs text-[#7D7569] mt-1">
            Les ingrédients enregistrés ici sont automatiquement déduits de votre ticket de courses et utilisés par le module anti-gaspillage.
          </p>
        </div>

        <button
          onClick={onOpenAntiGaspi}
          className="px-4 py-2.5 bg-[#8BA888] hover:bg-[#799976] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-transform active:scale-95 shrink-0 cursor-pointer"
        >
          <Lightbulb className="w-4 h-4" />
          <span>💡 Que cuisiner avec mes restes ?</span>
        </button>
      </div>

      {/* Add new ingredient to fridge */}
      <div className="bg-[#F4F1EB] p-4 rounded-xl border border-[#E6E1D7] space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#433E37]">
          Ajouter un ingrédient en stock
        </h4>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6">
            <label className="text-[11px] font-semibold text-[#7D7569] block mb-1">
              Choisir l'ingrédient
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-[#E6E1D7] rounded-lg p-2.5 text-[#433E37] focus:outline-none focus:border-[#8BA888] cursor-pointer"
            >
              {allIngredientsList.map(ing => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.unit}) — {ing.cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="text-[11px] font-semibold text-[#7D7569] block mb-1">
              Quantité ({currentSelectedIng?.unit})
            </label>
            <input
              type="number"
              min="0.1"
              step="any"
              value={inputQty}
              onChange={(e) => setInputQty(parseFloat(e.target.value) || 1)}
              className="w-full text-xs font-bold font-mono-code bg-white border border-[#E6E1D7] rounded-lg p-2.5 text-[#433E37] focus:outline-none focus:border-[#8BA888]"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#433E37] hover:bg-[#322E28] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter au stock
            </button>
          </div>
        </form>
      </div>

      {/* Current Fridge Items List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#7D7569] flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-[#A39E93]" />
            Stocks actuellement disponibles ({fridgeItemIds.length})
          </h4>
          {fridgeItemIds.length > 0 && (
            <span className="text-[11px] text-[#3D593A] font-bold bg-[#EBF2EA] px-2 py-0.5 rounded border border-[#D1E0CE]">
              Déduit de la liste de courses
            </span>
          )}
        </div>

        {fridgeItemIds.length === 0 ? (
          <div className="text-center py-8 bg-[#F4F1EB] rounded-xl border border-dashed border-[#E6E1D7] text-[#A39E93] space-y-1 text-xs">
            <p className="font-semibold text-[#433E37]">Votre frigo est actuellement déclaré vide.</p>
            <p>Ajoutez les ingrédients que vous avez déjà chez vous pour éviter de les racheter en double.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {fridgeItemIds.map(id => {
              const ing = INGREDIENTS[id];
              const qty = Math.round((fridge[id] || 0) * 10) / 10;
              if (!ing) return null;

              return (
                <div
                  key={id}
                  className="p-3 bg-[#F4F1EB] rounded-xl border border-[#E6E1D7] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-[#433E37] block truncate">{ing.name}</span>
                    <span className="text-[10px] text-[#A39E93]">{ing.cat}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono-code font-bold text-[#433E37] bg-white px-2 py-1 rounded border border-[#E6E1D7] text-[11px]">
                      {qty} {ing.unit}
                    </span>

                    <button
                      onClick={() => onRemoveFridgeItem(id)}
                      className="p-1 text-[#A39E93] hover:text-[#B84A39] hover:bg-[#FDF2F0] rounded transition-colors cursor-pointer"
                      title="Retirer du stock"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
