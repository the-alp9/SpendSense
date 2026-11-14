import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  ArrowRight, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { FinancialProfile, WhatIfScenarioState } from '../../types/finance';
import { calculateWhatIf, calculateCategoryAmounts, formatINR } from '../../utils/calculations';

interface WhatIfViewProps {
  profile: FinancialProfile;
  onConsultAI: (prompt: string) => void;
}

export const WhatIfView: React.FC<WhatIfViewProps> = ({ profile, onConsultAI }) => {
  const [scenario, setScenario] = useState<WhatIfScenarioState>({
    incomeDeltaPercent: 20, // default +20% salary increase test
    extraSavingsMonthly: 0,
    rentDeltaMonthly: 0,
    pauseTravelSixMonths: false,
    newEmiAmount: 0,
    newEmiTenureMonths: 36,
    oneTimeSplurge: 0,
  });

  const results = calculateWhatIf(profile, scenario);

  const handleReset = () => {
    setScenario({
      incomeDeltaPercent: 0,
      extraSavingsMonthly: 0,
      rentDeltaMonthly: 0,
      pauseTravelSixMonths: false,
      newEmiAmount: 0,
      newEmiTenureMonths: 36,
      oneTimeSplurge: 0,
    });
  };

  const presets = [
    {
      title: 'Salary Increases by 20%',
      apply: () => setScenario((s) => ({ ...s, incomeDeltaPercent: 20 })),
    },
    {
      title: 'Save ₹5,000 Extra / Month',
      apply: () => setScenario((s) => ({ ...s, extraSavingsMonthly: 5000 })),
    },
    {
      title: 'Rent Increases by ₹5,000',
      apply: () => setScenario((s) => ({ ...s, rentDeltaMonthly: 5000 })),
    },
    {
      title: 'Pause Travel for 6 Months',
      apply: () => setScenario((s) => ({ ...s, pauseTravelSixMonths: !s.pauseTravelSixMonths })),
    },
    {
      title: 'Add ₹15,000 Car EMI',
      apply: () => setScenario((s) => ({ ...s, newEmiAmount: 15000, newEmiTenureMonths: 60 })),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-700">
            Financial Twin
          </span>
          <h2 className="text-2xl font-extrabold text-[#14213D] tracking-tight mt-0.5">
            "What If?" Financial Simulator
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Simulate salary changes, rent hikes, or new commitments before committing in the real world.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Simulation</span>
        </button>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-1">Quick Scenarios:</span>
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={p.apply}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-900 transition-all cursor-pointer shadow-2xs"
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Side-by-Side Comparison: Current vs Simulated */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current State */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-700">Current Financial Position</h3>
            <span className="text-xs font-mono font-medium text-slate-500">Baseline</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm py-1 border-b border-slate-50">
              <span className="text-slate-600">Monthly Inflow:</span>
              <span className="font-bold font-mono text-[#14213D]">{formatINR(results.currentIncome)}</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b border-slate-50">
              <span className="text-slate-600">Monthly Savings (Core + Emergency):</span>
              <span className="font-bold font-mono text-emerald-700">{formatINR(results.currentMonthlySavings)}</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b border-slate-50">
              <span className="text-slate-600">Fixed Commitments (Rent + EMI):</span>
              <span className="font-bold font-mono text-slate-800">{formatINR(results.currentCommitments)}</span>
            </div>

            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-600">Net Unencumbered Surplus:</span>
              <span className="font-bold font-mono text-slate-900">{formatINR(results.currentSurplus)}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500">
            <span>Projected 12-Month Total Accumulation: </span>
            <strong className="text-slate-900 font-mono">{formatINR(results.currentMonthlySavings * 12)}</strong>
          </div>
        </div>

        {/* Simulated State */}
        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500/30 shadow-xs space-y-4 relative overflow-hidden">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-[#14213D]">Simulated Position</h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700">Active "What-If"</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm py-1 border-b border-slate-50">
              <span className="text-slate-600">Simulated Monthly Income:</span>
              <span className="font-bold font-mono text-[#14213D]">
                {formatINR(results.simIncome)}
                {results.incomeDiff !== 0 && (
                  <span className={`text-xs ml-1 font-sans ${results.incomeDiff > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    ({results.incomeDiff > 0 ? '+' : ''}{formatINR(results.incomeDiff)})
                  </span>
                )}
              </span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b border-slate-50">
              <span className="text-slate-600">Simulated Monthly Savings:</span>
              <span className="font-bold font-mono text-emerald-700">
                {formatINR(results.simMonthlySavings)}
                {results.monthlySavingsDiff !== 0 && (
                  <span className={`text-xs ml-1 font-sans ${results.monthlySavingsDiff > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    ({results.monthlySavingsDiff > 0 ? '+' : ''}{formatINR(results.monthlySavingsDiff)}/mo)
                  </span>
                )}
              </span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b border-slate-50">
              <span className="text-slate-600">Simulated Commitments:</span>
              <span className="font-bold font-mono text-slate-800">
                {formatINR(results.simCommitments)}
              </span>
            </div>

            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-600">Simulated Net Surplus:</span>
              <span className="font-bold font-mono text-slate-900">
                {formatINR(results.simSurplus)}
              </span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl text-xs text-emerald-950 space-y-1">
            <div className="flex justify-between">
              <span>Annual Savings Net Impact:</span>
              <strong className="font-mono text-sm font-bold text-emerald-700">
                {results.annualSavingsDiff >= 0 ? '+' : ''}{formatINR(results.annualSavingsDiff)}
              </strong>
            </div>
            <p className="text-[11px] text-emerald-800/80">
              {results.annualSavingsDiff >= 0
                ? 'Accelerates financial independence and emergency readiness.'
                : 'Reduces long-term wealth compounding cushion.'}
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Control Sliders */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <h4 className="text-base font-bold text-[#14213D]">Adjust Scenario Variables</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Salary Adjustment */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Income Delta (% Change)</span>
              <span className="font-mono text-emerald-700">{scenario.incomeDeltaPercent > 0 ? '+' : ''}{scenario.incomeDeltaPercent}%</span>
            </div>
            <input
              type="range"
              min="-40"
              max="100"
              step="5"
              value={scenario.incomeDeltaPercent}
              onChange={(e) => setScenario({ ...scenario, incomeDeltaPercent: Number(e.target.value) })}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#14213D]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>-40% Pay Cut</span>
              <span>No Change (0%)</span>
              <span>+100% (2x Promotion)</span>
            </div>
          </div>

          {/* Extra Savings */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Extra Monthly Savings Dedicated</span>
              <span className="font-mono text-emerald-700">+{formatINR(scenario.extraSavingsMonthly)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="30000"
              step="1000"
              value={scenario.extraSavingsMonthly}
              onChange={(e) => setScenario({ ...scenario, extraSavingsMonthly: Number(e.target.value) })}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#14213D]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹0</span>
              <span>₹15,000</span>
              <span>₹30,000/mo</span>
            </div>
          </div>

          {/* Rent Delta */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Rent Increase / Decrease (₹)</span>
              <span className="font-mono text-slate-900">{scenario.rentDeltaMonthly > 0 ? '+' : ''}{formatINR(scenario.rentDeltaMonthly)}</span>
            </div>
            <input
              type="range"
              min="-10000"
              max="30000"
              step="1000"
              value={scenario.rentDeltaMonthly}
              onChange={(e) => setScenario({ ...scenario, rentDeltaMonthly: Number(e.target.value) })}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#14213D]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>-₹10,000 (Cheaper)</span>
              <span>₹0</span>
              <span>+₹30,000 (Luxury Flat)</span>
            </div>
          </div>

          {/* New EMI Obligation */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>New Loan / EMI Commitment (₹)</span>
              <span className="font-mono text-slate-900">{formatINR(scenario.newEmiAmount)}/mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="30000"
              step="1000"
              value={scenario.newEmiAmount}
              onChange={(e) => setScenario({ ...scenario, newEmiAmount: Number(e.target.value) })}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#14213D]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹0</span>
              <span>₹15,000</span>
              <span>₹30,000/mo</span>
            </div>
          </div>
        </div>

        {/* Travel Pause Toggle */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              id="pause-travel-toggle"
              type="checkbox"
              checked={scenario.pauseTravelSixMonths}
              onChange={(e) => setScenario({ ...scenario, pauseTravelSixMonths: e.target.checked })}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <label htmlFor="pause-travel-toggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
              What if I pause traveling for 6 months and redirect that money into savings?
            </label>
          </div>

          <button
            onClick={() => onConsultAI(`What happens if I pause travel and increase my savings by ₹5,000?`)}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult AI on This Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
