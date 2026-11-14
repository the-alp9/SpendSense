import React, { useState } from 'react';
import { 
  Check, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  Sliders, 
  Info, 
  ArrowRight,
  TrendingUp,
  Shield,
  Briefcase
} from 'lucide-react';
import { FinancialProfile, CategoryKey, AllocationSuggestion } from '../../types/finance';
import { 
  CATEGORY_DEFINITIONS, 
  calculateCategoryAmounts, 
  calculateTotalPercentage, 
  rebalanceAllocations, 
  generateIntelligentSuggestions, 
  formatINR 
} from '../../utils/calculations';
import { DoughnutChart } from '../DoughnutChart';

interface SmartAllocationViewProps {
  profile: FinancialProfile;
  onUpdateProfile: (updated: FinancialProfile) => void;
  onOpenEditModal: () => void;
}

export const SmartAllocationView: React.FC<SmartAllocationViewProps> = ({
  profile,
  onUpdateProfile,
  onOpenEditModal,
}) => {
  const [allocations, setAllocations] = useState<Record<CategoryKey, number>>({
    ...profile.allocations,
  });
  const [autoRebalance, setAutoRebalance] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const totalPercentage = calculateTotalPercentage(allocations);
  const isTotal100 = totalPercentage === 100;
  const amounts = calculateCategoryAmounts(profile.monthlyIncome, allocations);
  const suggestions = generateIntelligentSuggestions({ ...profile, allocations });

  const handleSliderChange = (key: CategoryKey, newVal: number) => {
    setSavedSuccess(false);
    if (autoRebalance) {
      const rebalanced = rebalanceAllocations(allocations, key, newVal);
      setAllocations(rebalanced);
    } else {
      setAllocations({
        ...allocations,
        [key]: Math.max(0, Math.min(100, Math.round(newVal))),
      });
    }
  };

  const handleResetDefault = () => {
    const defaultAllocations: Record<CategoryKey, number> = {
      essentials: 45,
      emergency: 10,
      savings: 20,
      travel: 10,
      goals: 5,
      lifestyle: 10,
    };
    setAllocations(defaultAllocations);
    onUpdateProfile({
      ...profile,
      allocations: defaultAllocations,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleApplySuggestion = (suggestion: AllocationSuggestion) => {
    setAllocations(suggestion.proposedAllocations);
    onUpdateProfile({
      ...profile,
      allocations: suggestion.proposedAllocations,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveChanges = () => {
    if (!isTotal100) return;
    onUpdateProfile({
      ...profile,
      allocations,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAutoBalanceNow = () => {
    // Distribute shortfall or excess across non-essentials proportionally
    const currentSum = calculateTotalPercentage(allocations);
    if (currentSum === 100) return;

    const keys = Object.keys(allocations) as CategoryKey[];
    const diff = 100 - currentSum;
    
    // adjust lifestyle or savings
    const targetKey: CategoryKey = diff > 0 ? 'savings' : 'lifestyle';
    setAllocations({
      ...allocations,
      [targetKey]: Math.max(0, allocations[targetKey] + diff),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-700">
            Deterministic Engine
          </span>
          <h2 className="text-2xl font-extrabold text-[#14213D] tracking-tight mt-0.5">
            Smart Income Allocation
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Divide your {formatINR(profile.monthlyIncome)} monthly salary into balanced, realistic financial categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset to Default (45/10/20/10/5/10)</span>
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={!isTotal100}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#18A878] hover:bg-[#158f66] text-white shadow-xs transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Save Allocation</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-center justify-between animate-in fade-in">
          <span>Allocation changes saved and active across your dashboard & AI Agent!</span>
          <Check className="w-4 h-4 text-emerald-600" />
        </div>
      )}

      {/* Warning banner if allocations != 100% */}
      {!isTotal100 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">
                Total allocation is {totalPercentage}% (Must equal exactly 100%)
              </p>
              <p className="text-xs text-amber-800">
                {totalPercentage < 100
                  ? `You have unassigned income of ${100 - totalPercentage}% (${formatINR((profile.monthlyIncome * (100 - totalPercentage)) / 100)}).`
                  : `You have over-allocated by ${totalPercentage - 100}% (${formatINR((profile.monthlyIncome * (totalPercentage - 100)) / 100)}).`}
              </p>
            </div>
          </div>
          <button
            onClick={handleAutoBalanceNow}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0"
          >
            Auto-Balance to 100%
          </button>
        </div>
      )}

      {/* Intelligent Suggestions Banner (If Any) */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 to-[#14213D] text-white rounded-2xl p-5 border border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              AI Allocation Recommendation
            </span>
          </div>
          <div className="space-y-3">
            {suggestions.map((sug) => (
              <div
                key={sug.id}
                className="bg-white/10 rounded-xl p-3.5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{sug.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{sug.description}</p>
                  <p className="text-[11px] text-emerald-300 font-mono mt-1">{sug.impact}</p>
                </div>
                <button
                  onClick={() => handleApplySuggestion(sug)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  <span>Apply Suggestion</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Allocation Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Chart Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#14213D]">Live Allocation Balance</h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time visualization of your monthly rupee split
            </p>

            <div className="py-4">
              <DoughnutChart
                allocations={allocations}
                amounts={amounts}
                totalIncome={profile.monthlyIncome}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Total Monthly Income:</span>
              <span className="font-bold font-mono text-[#14213D]">{formatINR(profile.monthlyIncome)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Percentage:</span>
              <span className={`font-bold font-mono ${isTotal100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {totalPercentage}% / 100%
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="auto-rebalance-toggle"
                type="checkbox"
                checked={autoRebalance}
                onChange={(e) => setAutoRebalance(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="auto-rebalance-toggle" className="text-[11px] text-slate-600 cursor-pointer">
                Auto-rebalance remaining categories when slider moves
              </label>
            </div>
          </div>
        </div>

        {/* Sliders and Category Cards */}
        <div className="lg:col-span-7 space-y-3.5">
          {(Object.keys(allocations) as CategoryKey[]).map((key) => {
            const def = CATEGORY_DEFINITIONS[key];
            const pct = allocations[key] || 0;
            const rupee = amounts[key] || 0;

            return (
              <div
                key={key}
                className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: def.color }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#14213D]">{def.label}</h4>
                      <p className="text-[11px] text-slate-500">{def.description}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold font-mono text-[#14213D]">
                      {formatINR(rupee)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 block">
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Slider bar */}
                <div className="flex items-center gap-3 mt-3">
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="1"
                    value={pct}
                    onChange={(e) => handleSliderChange(key, Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#14213D]"
                  />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={pct}
                      onChange={(e) => handleSliderChange(key, Number(e.target.value))}
                      className="w-14 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center font-mono text-xs font-bold text-[#14213D] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
