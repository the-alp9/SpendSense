import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Info, 
  HelpCircle,
  PlusCircle,
  Save,
  AlertCircle
} from 'lucide-react';
import { FinancialProfile } from '../../types/finance';
import { calculateEmergencyFundMetrics, formatINR } from '../../utils/calculations';

interface EmergencyFundViewProps {
  profile: FinancialProfile;
  onUpdateProfile: (updated: FinancialProfile) => void;
}

export const EmergencyFundView: React.FC<EmergencyFundViewProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const metrics = calculateEmergencyFundMetrics(profile);

  const [targetMonths, setTargetMonths] = useState<3 | 6 | 9 | 12>(
    profile.emergencyFund.targetMonths || 6
  );
  const [currentBalance, setCurrentBalance] = useState<number>(
    profile.emergencyFund.currentBalance || 0
  );
  const [customEssentials, setCustomEssentials] = useState<number>(
    profile.emergencyFund.customMonthlyEssentials || metrics.monthlyEssentials
  );
  const [addFundsAmount, setAddFundsAmount] = useState<number>(5000);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    const updated: FinancialProfile = {
      ...profile,
      emergencyFund: {
        ...profile.emergencyFund,
        targetMonths,
        currentBalance: Math.max(0, Number(currentBalance)),
        customMonthlyEssentials: Number(customEssentials) > 0 ? Number(customEssentials) : undefined,
      },
    };
    onUpdateProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleQuickAdd = () => {
    const newBal = currentBalance + Number(addFundsAmount);
    setCurrentBalance(newBal);
    const updated: FinancialProfile = {
      ...profile,
      emergencyFund: {
        ...profile.emergencyFund,
        currentBalance: newBal,
      },
    };
    onUpdateProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sky-700">
            Financial Safety Net
          </span>
          <h2 className="text-2xl font-extrabold text-[#14213D] tracking-tight mt-0.5">
            Emergency Fund Planner
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Build liquid reserves to protect against job loss, medical emergencies, or unforeseen repairs.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#18A878] hover:bg-[#158f66] text-white shadow-xs transition-colors self-start sm:self-center"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-center justify-between animate-in fade-in">
          <span>Emergency fund parameters updated successfully!</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
      )}

      {/* Why Emergency Savings Matter Section */}
      <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-5 text-sky-950 flex flex-col md:flex-row gap-5 items-start">
        <div className="p-3 bg-sky-600 text-white rounded-xl shadow-xs flex-shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h3 className="text-base font-bold text-sky-950">Why Emergency Savings Matter</h3>
          <p className="text-xs sm:text-sm text-sky-900/90 leading-relaxed">
            Unlike investments or retirement funds, an emergency fund is <strong>strictly liquid cash</strong> stored in an easily accessible bank account or liquid mutual fund. It ensures you never have to break high-return investments, accumulate credit card debt, or borrow at predatory interest rates when life throws a curveball.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs text-sky-800 font-medium">
            <div>✓ Medical or family emergencies</div>
            <div>✓ Unexpected career or salary disruptions</div>
            <div>✓ Urgent home or vehicle repairs</div>
          </div>
        </div>
      </div>

      {/* Main Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Current Buffer</span>
          <p className="text-xl font-bold font-mono text-[#14213D] mt-1">
            {formatINR(metrics.currentBalance)}
          </p>
          <span className="text-[11px] text-sky-600 font-semibold block mt-0.5">
            Covers {metrics.monthsOfSafetyCurrent} months
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">{targetMonths}-Month Target</span>
          <p className="text-xl font-bold font-mono text-[#14213D] mt-1">
            {formatINR(metrics.targetAmount)}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {formatINR(metrics.monthlyEssentials)}/mo essentials
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Remaining to Save</span>
          <p className="text-xl font-bold font-mono text-[#14213D] mt-1">
            {formatINR(metrics.remainingAmount)}
          </p>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {metrics.progressPercent}% achieved
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Time to Target</span>
          <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {metrics.remainingAmount === 0 ? 'Goal Reached!' : `${metrics.monthsToTarget} Months`}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            At {formatINR(metrics.monthlyContribution)}/month
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#14213D]">Progress to Safety Target</h4>
            <p className="text-xs text-slate-500">
              {formatINR(metrics.currentBalance)} saved of {formatINR(metrics.targetAmount)} total needed
            </p>
          </div>
          <span className="text-base font-extrabold font-mono text-sky-700">
            {metrics.progressPercent}%
          </span>
        </div>

        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
          <div
            className="bg-sky-600 h-full rounded-full transition-all duration-700"
            style={{ width: `${metrics.progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>0 Months (₹0)</span>
          <span>{targetMonths / 2} Months ({formatINR(metrics.targetAmount / 2)})</span>
          <span>{targetMonths} Months ({formatINR(metrics.targetAmount)})</span>
        </div>
      </div>

      {/* Target Configurator & Quick Add */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Settings Box */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <h4 className="text-base font-bold text-[#14213D]">Configure Target</h4>

          {/* Select Target Months */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Select Emergency Cushion Target
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([3, 6, 9, 12] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTargetMonths(m)}
                  className={`py-2 text-xs rounded-xl font-bold border transition-all ${
                    targetMonths === m
                      ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m} Months
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              3 months is the starter benchmark; 6 months is standard; 9-12 months is ideal for freelancers.
            </p>
          </div>

          {/* Monthly Essentials Estimation */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="custom-essentials-input" className="text-xs font-semibold text-slate-700">
                Estimated Monthly Essential Expenses
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {formatINR(Number(customEssentials) || 0)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                ₹
              </span>
              <input
                id="custom-essentials-input"
                type="number"
                min="5000"
                step="1000"
                value={customEssentials || ''}
                onChange={(e) => setCustomEssentials(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#14213D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            {metrics.isProvisional && (
              <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Estimate is provisional based on your 45% essentials allocation.</span>
              </p>
            )}
          </div>

          {/* Current Balance Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="current-balance-input" className="text-xs font-semibold text-slate-700">
                Current Emergency Balance Saved
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {formatINR(Number(currentBalance) || 0)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                ₹
              </span>
              <input
                id="current-balance-input"
                type="number"
                min="0"
                step="1000"
                value={currentBalance || ''}
                onChange={(e) => setCurrentBalance(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#14213D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Deposit & Calculator */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-base font-bold text-[#14213D]">Record Emergency Contribution</h4>
            <p className="text-xs text-slate-500">
              Did you set aside additional funds this week? Record it to immediately update your safety runway.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                Quick Top-Up Amount
              </label>
              <div className="flex gap-2">
                {[2000, 5000, 10000, 20000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddFundsAmount(amt)}
                    className={`flex-1 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                      addFundsAmount === amt
                        ? 'bg-[#14213D] text-white border-[#14213D] font-bold'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    +₹{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleQuickAdd}
                className="w-full py-2.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add {formatINR(addFundsAmount)} to Emergency Balance</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-start gap-2 mt-4">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              SpendSense AI automatically reserves {profile.allocations.emergency}% ({formatINR(metrics.monthlyContribution)}/month) from your monthly income towards this fund.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
