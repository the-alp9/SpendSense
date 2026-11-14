import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Check, Sparkles, AlertCircle } from 'lucide-react';
import { FinancialProfile } from '../types/finance';
import { formatINR } from '../utils/calculations';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: FinancialProfile;
  onSaveProfile: (updated: FinancialProfile) => void;
  isOnboarding?: boolean;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  isOnboarding = false,
}) => {
  const [income, setIncome] = useState<number>(currentProfile.monthlyIncome || 60000);
  const [rent, setRent] = useState<number>(currentProfile.monthlyRent || 0);
  const [existingEMI, setExistingEMI] = useState<number>(currentProfile.existingEMI || 0);
  const [emergencyBalance, setEmergencyBalance] = useState<number>(
    currentProfile.emergencyFund.currentBalance || 0
  );
  const [emergencyTargetMonths, setEmergencyTargetMonths] = useState<3 | 6 | 9 | 12>(
    currentProfile.emergencyFund.targetMonths || 6
  );
  const [showAdvanced, setShowAdvanced] = useState<boolean>(!isOnboarding);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!income || income <= 0) return;

    const updated: FinancialProfile = {
      ...currentProfile,
      monthlyIncome: Math.round(Number(income)),
      monthlyRent: rent > 0 ? Math.round(Number(rent)) : 0,
      existingEMI: existingEMI > 0 ? Math.round(Number(existingEMI)) : 0,
      emergencyFund: {
        ...currentProfile.emergencyFund,
        currentBalance: Math.max(0, Math.round(Number(emergencyBalance))),
        targetMonths: emergencyTargetMonths,
        customMonthlyEssentials: rent > 0 ? Math.round(Number(rent) * 1.5) : undefined,
      },
      isDemo: false,
    };

    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-[#14213D] text-white relative flex-shrink-0">
          {!isOnboarding && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            SpendSense Engine
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {isOnboarding ? "Let's make your money work smarter." : 'Customise Financial Profile'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {isOnboarding
              ? "Tell us your monthly income. We'll help you create a financial plan that works for your lifestyle and goals."
              : 'Update your income, rent, and commitments. SpendSense will instantly recalibrate your allocation.'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Required Income */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="income-input" className="text-sm font-semibold text-[#14213D]">
                Monthly Income (in INR) <span className="text-emerald-600">*</span>
              </label>
              <span className="text-xs text-slate-500 font-mono">
                {formatINR(Number(income) || 0)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                ₹
              </span>
              <input
                id="income-input"
                type="number"
                min="5000"
                step="1000"
                required
                value={income || ''}
                onChange={(e) => setIncome(Number(e.target.value))}
                placeholder="e.g. 60000"
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-[#14213D] font-mono text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Your take-home monthly salary or recurring net earnings after taxes.
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-2">
            {[40000, 60000, 100000, 150000, 250000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setIncome(preset)}
                className={`text-xs px-2.5 py-1 rounded-md font-mono transition-colors ${
                  income === preset
                    ? 'bg-[#14213D] text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ₹{(preset / 1000).toFixed(0)}k
              </button>
            ))}
          </div>

          {/* Advanced toggle */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 py-1"
            >
              <span>Optional Personalisation (Rent, Debt, Emergency)</span>
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showAdvanced && (
              <div className="space-y-4 pt-3 mt-2 animate-in fade-in">
                {/* Monthly Rent */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="rent-input" className="text-xs font-semibold text-slate-700">
                      Monthly Rent / Housing
                    </label>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatINR(Number(rent) || 0)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      ₹
                    </span>
                    <input
                      id="rent-input"
                      type="number"
                      min="0"
                      step="500"
                      value={rent || ''}
                      onChange={(e) => setRent(Number(e.target.value))}
                      placeholder="e.g. 15000 (Optional)"
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#14213D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>

                {/* Existing EMI */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="emi-input" className="text-xs font-semibold text-slate-700">
                      Existing Monthly Debt / EMI Commitments
                    </label>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatINR(Number(existingEMI) || 0)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      ₹
                    </span>
                    <input
                      id="emi-input"
                      type="number"
                      min="0"
                      step="500"
                      value={existingEMI || ''}
                      onChange={(e) => setExistingEMI(Number(e.target.value))}
                      placeholder="e.g. 5000 (Optional)"
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#14213D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>

                {/* Current Emergency Fund Balance */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="emergency-input" className="text-xs font-semibold text-slate-700">
                      Current Emergency Fund Balance
                    </label>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatINR(Number(emergencyBalance) || 0)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      ₹
                    </span>
                    <input
                      id="emergency-input"
                      type="number"
                      min="0"
                      step="1000"
                      value={emergencyBalance || ''}
                      onChange={(e) => setEmergencyBalance(Number(e.target.value))}
                      placeholder="e.g. 30000 (Optional)"
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#14213D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>

                {/* Emergency Target Months */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Emergency Cushion Target (Months of Essentials)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {([3, 6, 9, 12] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setEmergencyTargetMonths(m)}
                        className={`py-1.5 text-xs rounded-lg font-medium border text-center transition-all ${
                          emergencyTargetMonths === m
                            ? 'bg-[#18A878] text-white border-[#18A878] font-bold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {m} Months
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              SpendSense AI will never ask for your bank login, credentials, or bank statements. You remain in complete control.
            </span>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            {!isOnboarding && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!income || income <= 0}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#18A878] hover:bg-[#158f66] text-white shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isOnboarding ? 'Generate Financial Plan' : 'Save & Recalculate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
