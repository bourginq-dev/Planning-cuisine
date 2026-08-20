import React, { useState } from 'react';
import { CATEGORY_ORDER, STORE_PROFILES } from '../data/ingredients';
import { ReceiptCalculationResult, Recipe, StoreProfile } from '../types';
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChefHat,
  Copy,
  DollarSign,
  Download,
  Edit3,
  Info,
  PackageCheck,
  Plus,
  Receipt,
  RotateCcw,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  X
} from 'lucide-react';

interface ShoppingListProps {
  receipt: ReceiptCalculationResult;
  currentStoreId: string;
  extraItems: string[];
  notes: string;
  extraShoppingRecipes?: Recipe[];
  actualPaidAmount?: number | null;
  onSelectStore: (storeId: string) => void;
  onAddExtraItem: (text: string) => void;
  onRemoveExtraItem: (idx: number) => void;
  onUpdateNotes: (text: string) => void;
  onUpdateActualPaidAmount?: (val: number | null) => void;
  onRemoveShoppingRecipe?: (recipeId: string) => void;
  onClearShoppingRecipes?: () => void;
  onNavigateToRecipes?: () => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  receipt,
  currentStoreId,
  extraItems,
  notes,
  extraShoppingRecipes = [],
  actualPaidAmount = null,
  onSelectStore,
  onAddExtraItem,
  onRemoveExtraItem,
  onUpdateNotes,
  onUpdateActualPaidAmount,
  onRemoveShoppingRecipe,
  onClearShoppingRecipes,
  onNavigateToRecipes
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [newExtraInput, setNewExtraInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEditingPaid, setIsEditingPaid] = useState(false);
  const [paidInput, setPaidInput] = useState(actualPaidAmount ? actualPaidAmount.toString() : '');

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddExtra = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExtraInput.trim()) {
      onAddExtraItem(newExtraInput.trim());
      setNewExtraInput('');
    }
  };

  const handleSavePaidAmount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateActualPaidAmount) return;
    const parsed = parseFloat(paidInput.replace(',', '.'));
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateActualPaidAmount(Math.round(parsed * 100) / 100);
      setIsEditingPaid(false);
    } else if (paidInput.trim() === '') {
      onUpdateActualPaidAmount(null);
      setIsEditingPaid(false);
    }
  };

  const handleResetPaidAmount = () => {
    if (onUpdateActualPaidAmount) {
      onUpdateActualPaidAmount(null);
      setPaidInput('');
      setIsEditingPaid(false);
    }
  };

  const copyToClipboard = async () => {
    const lines = ['📋 LISTE DE COURSES ÉTUDIANTE'];
    lines.push(`🏪 Magasin : ${STORE_PROFILES[currentStoreId]?.name || 'Standard'}`);
    if (extraShoppingRecipes.length > 0) {
      lines.push(`📚 Recettes incluses : ${extraShoppingRecipes.map(r => r.name).join(', ')}`);
    }
    lines.push('');

    CATEGORY_ORDER.forEach(cat => {
      const items = receipt.byCat[cat];
      if (!items || items.length === 0) return;
      lines.push(`--- ${cat.toUpperCase()} ---`);
      items.forEach(i => {
        const parts = [];
        if (i.bulkPacks > 0) parts.push(`${i.bulkPacks}x grand format (${i.bulkSize} ${i.unit})`);
        if (i.packs > 0) parts.push(`${i.packs}x (${i.packSize} ${i.unit})`);
        const qLabel = parts.length ? parts.join(' + ') : `1x (${i.packSize} ${i.unit})`;
        lines.push(`• ${i.name} : ${qLabel} — ${i.cost.toFixed(2).replace('.', ',')}€`);
      });
      lines.push('');
    });

    lines.push(`TOTAL ESTIMÉ : ${receipt.grandTotal.toFixed(2).replace('.', ',')} € (Approximation indicative)`);
    if (actualPaidAmount !== null && actualPaidAmount !== undefined) {
      lines.push(`TOTAL RÉELLEMENT PAYÉ EN CAISSE : ${actualPaidAmount.toFixed(2).replace('.', ',')} €`);
    }
    if (receipt.bulkSavings > 0) {
      lines.push(`(dont -${receipt.bulkSavings.toFixed(2).replace('.', ',')} € grâce aux formats éco)`);
    }

    if (extraItems.length > 0) {
      lines.push('');
      lines.push('--- AJOUTS PERSONNELS ---');
      extraItems.forEach(ex => lines.push(`• ${ex}`));
    }

    if (notes.trim()) {
      lines.push('');
      lines.push(`Notes : ${notes.trim()}`);
    }

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const currentStore = STORE_PROFILES[currentStoreId] || STORE_PROFILES.standard;
  const delta = actualPaidAmount !== null && actualPaidAmount !== undefined
    ? Math.round((actualPaidAmount - receipt.grandTotal) * 100) / 100
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Grocery Receipt */}
      <div className="lg:col-span-7 space-y-4">
        {/* Store selector card */}
        <div className="bg-white p-4 rounded-xl border border-[#E6E1D7] shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#8BA888]" />
            <span className="text-xs font-bold text-[#433E37]">Enseigne choisie :</span>
          </div>

          <div className="flex-1 max-w-xs">
            <select
              value={currentStoreId}
              onChange={(e) => onSelectStore(e.target.value)}
              className="w-full text-xs font-bold bg-[#F4F1EB] border border-[#E6E1D7] rounded-lg p-2 text-[#433E37] focus:outline-none focus:border-[#8BA888] cursor-pointer"
            >
              {Object.values(STORE_PROFILES).map(sp => (
                <option key={sp.id} value={sp.id}>
                  {sp.name} ({sp.badge})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Extra Recipes Banner */}
        {extraShoppingRecipes.length > 0 && (
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#DCD6CB] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-[#8BA888]" />
                <h4 className="font-bold text-xs text-[#433E37] uppercase tracking-wider">
                  Ingrédients ajoutés depuis le Livre de Recettes ({extraShoppingRecipes.length})
                </h4>
              </div>
              {onClearShoppingRecipes && (
                <button
                  onClick={onClearShoppingRecipes}
                  className="text-[11px] font-bold text-[#B84A39] hover:underline cursor-pointer"
                >
                  Tout retirer
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {extraShoppingRecipes.map(recipe => (
                <div
                  key={recipe.id}
                  className="bg-white px-2.5 py-1 rounded-xl border border-[#E6E1D7] flex items-center gap-2 text-xs shadow-2xs"
                >
                  <span className="font-bold text-[#433E37]">{recipe.name}</span>
                  <span className="text-[10px] text-[#A39E93]">({recipe.ingredients.length} ingr.)</span>
                  {onRemoveShoppingRecipe && (
                    <button
                      onClick={() => onRemoveShoppingRecipe(recipe.id)}
                      className="text-[#A39E93] hover:text-[#B84A39] p-0.5 rounded cursor-pointer"
                      title="Retirer cette recette du ticket de courses"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Realistic Receipt Design */}
        <div className="bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl shadow-lg overflow-hidden relative font-mono-code text-xs text-[#433E37]">
          {/* Receipt Top header */}
          <div className="p-6 pb-4 bg-white text-center border-b border-dashed border-[#DCD6CB] space-y-1">
            <span className="text-[10px] tracking-widest text-[#A39E93] font-bold uppercase block">
              *** TICKET DE COURSES AUTOMATIQUE ***
            </span>
            <h3 className="text-xl font-bold text-[#433E37] tracking-tight">
              LE CARNET DU GOURMAND
            </h3>
            <p className="text-[11px] text-[#7D7569]">
              Planning semaine {extraShoppingRecipes.length > 0 ? `+ ${extraShoppingRecipes.length} recette(s) sélectionnée(s)` : ''} · {currentStore.name}
            </p>
            <div className="text-[10px] text-[#A39E93] pt-1">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Receipt items categorized */}
          <div className="p-6 space-y-5 bg-[#FAF8F5]">
            {receipt.grandTotal === 0 ? (
              <div className="text-center py-8 text-[#7D7569] space-y-2">
                <PackageCheck className="w-8 h-8 mx-auto text-[#8BA888]" />
                <p className="font-bold text-[#433E37]">Ton frigo et tes placards sont pleins !</p>
                <p className="text-[11px] text-[#A39E93]">Aucun ingrédient supplémentaire n'est nécessaire pour cette semaine.</p>
              </div>
            ) : (
              CATEGORY_ORDER.map(cat => {
                const items = receipt.byCat[cat];
                if (!items || items.length === 0) return null;

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="text-[11px] font-bold text-[#3D593A] uppercase tracking-wider border-b border-[#E6E1D7] pb-1 flex items-center justify-between">
                      <span>{cat}</span>
                      <span className="text-[#A39E93] text-[10px]">{items.length} article(s)</span>
                    </div>

                    <div className="divide-y divide-[#EAE5DC]">
                      {items.map(item => {
                        const isChecked = !!checkedItems[item.id];
                        const parts = [];
                        if (item.bulkPacks > 0) parts.push(`${item.bulkPacks}× grand fmt (${item.bulkSize} ${item.unit})`);
                        if (item.packs > 0) parts.push(`${item.packs}× (${item.packSize} ${item.unit})`);
                        const qLabel = parts.length ? parts.join(' + ') : `1× (${item.packSize} ${item.unit})`;

                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleCheck(item.id)}
                            className={`py-2 px-1 flex items-center justify-between gap-3 cursor-pointer select-none rounded hover:bg-[#F4F1EB] transition-colors ${
                              isChecked ? 'line-through text-[#A39E93] opacity-60' : 'text-[#433E37]'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded border-[#C2BBAF] text-[#8BA888] focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-[#8BA888]"
                              />
                              <div className="truncate">
                                <span className="font-medium">{item.name}</span>
                                {item.bulkPacks > 0 && (
                                  <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#EBF2EA] text-[#3D593A] uppercase tracking-tighter border border-[#D1E0CE]">
                                    🏷️ Éco vrac
                                  </span>
                                )}
                              </div>
                            </div>

                            <span className="text-[11px] text-[#7D7569] whitespace-nowrap">
                              {qLabel}
                            </span>

                            <span className="font-bold text-[#433E37] whitespace-nowrap">
                              {item.cost.toFixed(2).replace('.', ',')} €
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}

            {/* Total section with Estimation indicator & Actual Paid Override */}
            <div className="pt-4 border-t-2 border-dashed border-[#C2BBAF] space-y-3">
              {/* Estimated Total */}
              <div className="flex items-center justify-between text-base font-bold text-[#433E37]">
                <div className="flex items-center gap-1.5">
                  <span>TOTAL ESTIMÉ</span>
                  <span className="text-[10px] font-normal text-[#7D7569] bg-[#E6E1D7] px-1.5 py-0.5 rounded">
                    Approximation
                  </span>
                </div>
                <span className="bg-[#8BA888] text-white px-3 py-1 rounded shadow-2xs">
                  ≈ {receipt.grandTotal.toFixed(2).replace('.', ',')} €
                </span>
              </div>

              {/* Actual Paid Amount Real Receipt Row */}
              <div className="bg-[#F4F1EB] p-3 rounded-xl border border-[#DCD6CB] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#433E37]">
                    <Receipt className="w-4 h-4 text-[#8BA888]" />
                    <span>Montant réel payé en caisse :</span>
                  </div>

                  {actualPaidAmount !== null && actualPaidAmount !== undefined && !isEditingPaid ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#3D593A] bg-white px-2.5 py-0.5 rounded-lg border border-[#D1E0CE] shadow-2xs">
                        {actualPaidAmount.toFixed(2).replace('.', ',')} €
                      </span>
                      <button
                        onClick={() => {
                          setPaidInput(actualPaidAmount.toString());
                          setIsEditingPaid(true);
                        }}
                        className="text-[#7D7569] hover:text-[#433E37] p-1 rounded hover:bg-white cursor-pointer"
                        title="Modifier le montant payé"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleResetPaidAmount}
                        className="text-[#B84A39] hover:text-[#8C3426] p-1 rounded hover:bg-white cursor-pointer"
                        title="Réinitialiser à l'estimation"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : !isEditingPaid ? (
                    <button
                      onClick={() => setIsEditingPaid(true)}
                      className="text-xs font-bold text-[#3D593A] hover:text-[#283C26] bg-[#EBF2EA] hover:bg-[#D1E0CE] px-2.5 py-1 rounded-lg border border-[#D1E0CE] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Saisir mon ticket réel
                    </button>
                  ) : null}
                </div>

                {isEditingPaid && (
                  <form onSubmit={handleSavePaidAmount} className="flex items-center gap-2 pt-1">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={paidInput}
                        onChange={(e) => setPaidInput(e.target.value)}
                        placeholder={`Ex: ${receipt.grandTotal.toFixed(2)}`}
                        className="w-full text-xs font-bold bg-white border border-[#8BA888] rounded-lg py-1.5 pl-3 pr-7 text-[#433E37] focus:outline-none"
                        autoFocus
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7D7569]">
                        €
                      </span>
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#8BA888] hover:bg-[#72916F] text-white font-bold text-xs rounded-lg cursor-pointer shadow-2xs"
                    >
                      Valider
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingPaid(false)}
                      className="px-2.5 py-1.5 bg-white hover:bg-[#EAE5DC] text-[#7D7569] font-medium text-xs rounded-lg border border-[#DCD6CB] cursor-pointer"
                    >
                      Annuler
                    </button>
                  </form>
                )}

                {delta !== null && (
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E6E1D7]">
                    <span className="text-[#7D7569]">Écart vs estimation :</span>
                    {delta < 0 ? (
                      <span className="font-bold text-[#3D593A] flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        -{Math.abs(delta).toFixed(2).replace('.', ',')} € (Plus économe que prévu !)
                      </span>
                    ) : delta > 0 ? (
                      <span className="font-bold text-[#D97706] flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{delta.toFixed(2).replace('.', ',')} € par rapport à l'estimation
                      </span>
                    ) : (
                      <span className="font-bold text-[#3D593A] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Conforme à l'euro près
                      </span>
                    )}
                  </div>
                )}
              </div>

              {receipt.bulkSavings > 0 && (
                <div className="flex items-center justify-between text-[11px] text-[#3D593A] font-bold bg-[#EBF2EA] p-2 rounded border border-[#D1E0CE]">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Gain formats économiques :
                  </span>
                  <span>-{receipt.bulkSavings.toFixed(2).replace('.', ',')} €</span>
                </div>
              )}

              <p className="text-[10px] text-[#A39E93] text-center italic pt-1 leading-relaxed">
                💡 *Le total affiché est une approximation indicative calculée selon les prix moyens du magasin. Tu peux renseigner le montant réel payé en caisse pour ajuster ton suivi de budget.
              </p>
            </div>
          </div>

          {/* Perforated torn bottom edge */}
          <div className="torn-edge" />
        </div>

        {/* Copy action */}
        <button
          onClick={copyToClipboard}
          className="w-full py-3 px-4 bg-[#433E37] hover:bg-[#322E28] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98 text-xs sm:text-sm cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#8BA888]" />
              <span>Liste copiée dans le presse-papiers !</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copier la liste pour les courses (SMS / WhatsApp)</span>
            </>
          )}
        </button>
      </div>

      {/* Right Column: Personal Extras & Quick Notes */}
      <div className="lg:col-span-5 space-y-5">
        {/* Quick link to Recipe Book */}
        {onNavigateToRecipes && (
          <div
            onClick={onNavigateToRecipes}
            className="bg-white p-4 rounded-2xl border border-[#E6E1D7] hover:border-[#8BA888] shadow-xs cursor-pointer flex items-center justify-between gap-3 group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF2EA] text-[#3D593A] flex items-center justify-center group-hover:scale-105 transition-transform">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#433E37]">Livre de Recettes Étudiant</h4>
                <p className="text-[11px] text-[#7D7569]">Parcourir et ajouter d'autres recettes à la liste</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#8BA888] group-hover:translate-x-0.5 transition-transform">
              Explorer →
            </span>
          </div>
        )}

        {/* Extras card */}
        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-[#433E37] text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#D97706]" />
              Ajouts Personnels Hors Recettes
            </h4>
            <span className="text-xs text-[#A39E93]">{extraItems.length} article(s)</span>
          </div>

          <form onSubmit={handleAddExtra} className="flex gap-2">
            <input
              type="text"
              value={newExtraInput}
              onChange={(e) => setNewExtraInput(e.target.value)}
              placeholder="Ex: dentifrice, éponges, café, chocolat..."
              className="flex-1 text-xs bg-[#F4F1EB] border border-[#E6E1D7] rounded-lg p-2.5 text-[#433E37] placeholder-[#A39E93] focus:outline-none focus:border-[#8BA888]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#433E37] hover:bg-[#322E28] text-white font-bold text-xs rounded-lg shrink-0 cursor-pointer"
            >
              Ajouter
            </button>
          </form>

          {extraItems.length === 0 ? (
            <p className="text-xs text-[#A39E93] italic text-center py-3">
              Aucun ajout personnel pour le moment.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {extraItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#F4F1EB] border border-[#E6E1D7] text-xs"
                >
                  <span className="font-medium text-[#433E37]">{item}</span>
                  <button
                    onClick={() => onRemoveExtraItem(idx)}
                    className="text-[#B84A39] hover:text-[#8C3426] font-bold px-1.5 py-0.5 rounded hover:bg-[#FDF2F0] cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes & Reminders */}
        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-3">
          <h4 className="font-bold text-[#433E37] text-sm flex items-center gap-2">
            <span>🖊️</span>
            Notes & Mémos de Courses
          </h4>
          <textarea
            value={notes}
            onChange={(e) => onUpdateNotes(e.target.value)}
            placeholder="Ex : Ne pas oublier les sacs cabas, vérifier la date de péremption des yaourts, passer au rayon anti-gaspillage à 18h..."
            className="w-full h-32 text-xs p-3 bg-[#F4F1EB] border border-[#E6E1D7] rounded-xl text-[#433E37] placeholder-[#A39E93] focus:outline-none focus:border-[#8BA888] resize-none font-mono-code leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
