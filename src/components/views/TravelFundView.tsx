import React, { useState } from 'react';
import { 
  Plane, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Save, 
  Compass, 
  PlusCircle,
  MapPin,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FinancialProfile, TravelPlan } from '../../types/finance';
import { 
  calculateTravelMetrics, 
  calculateCategoryAmounts, 
  formatINR 
} from '../../utils/calculations';

interface TravelFundViewProps {
  profile: FinancialProfile;
  onUpdateProfile: (updated: FinancialProfile) => void;
  onConsultAI: (prompt: string) => void;
}

export const TravelFundView: React.FC<TravelFundViewProps> = ({
  profile,
  onUpdateProfile,
  onConsultAI,
}) => {
  const amounts = calculateCategoryAmounts(profile.monthlyIncome, profile.allocations);
  const monthlyTravelBudget = amounts.travel;

  const [destination, setDestination] = useState(profile.travelFund.destination || 'Goa Beach Vacation');
  const [cost, setCost] = useState<number>(profile.travelFund.estimatedCost || 36000);
  const [date, setDate] = useState(profile.travelFund.targetDate || '2027-04');
  const [currentSaved, setCurrentSaved] = useState<number>(profile.travelFund.currentSaved || 0);
  const [savedBanner, setSavedBanner] = useState(false);

  const metrics = calculateTravelMetrics(
    {
      destination,
      estimatedCost: cost,
      targetDate: date,
      currentSaved,
    },
    monthlyTravelBudget
  );

  const handleSave = () => {
    const updated: FinancialProfile = {
      ...profile,
      travelFund: {
        destination: destination.trim(),
        estimatedCost: Math.max(1000, Number(cost)),
        targetDate: date,
        currentSaved: Math.max(0, Number(currentSaved)),
      },
    };
    onUpdateProfile(updated);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleQuickAdd = (delta: number) => {
    const nextSaved = Math.min(cost, currentSaved + delta);
    setCurrentSaved(nextSaved);
    const updated: FinancialProfile = {
      ...profile,
      travelFund: {
        ...profile.travelFund,
        currentSaved: nextSaved,
      },
    };
    onUpdateProfile(updated);
    if (nextSaved >= cost) {
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-purple-700">
            Vacations & Experiences
          </span>
          <h2 className="text-2xl font-extrabold text-[#14213D] tracking-tight mt-0.5">
            Travel Fund Planner
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Plan guilt-free travel funded entirely from your monthly travel allocation without touching savings.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#18A878] hover:bg-[#158f66] text-white shadow-xs transition-colors self-start sm:self-center"
        >
          <Save className="w-4 h-4" />
          <span>Save Travel Plan</span>
        </button>
      </div>

      {savedBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-center justify-between animate-in fade-in">
          <span>Travel destination details updated and synchronized!</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
      )}

      {/* Overview Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Estimated Trip Cost</span>
          <p className="text-xl font-bold font-mono text-[#14213D] mt-1">
            {formatINR(cost)}
          </p>
          <span className="text-[11px] text-purple-600 font-medium block mt-0.5 truncate">
            {destination}
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Currently Accumulated</span>
          <p className="text-xl font-bold font-mono text-[#14213D] mt-1">
            {formatINR(currentSaved)}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
            {metrics.progressPercent}% of target
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Monthly Inflow</span>
          <p className="text-xl font-bold font-mono text-[#14213D] mt-1">
            {formatINR(monthlyTravelBudget)}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {profile.allocations.travel}% of salary
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Timeline Feasibility</span>
          <p className="text-xl font-bold font-mono text-purple-700 mt-1">
            {metrics.diffMonths} Months
          </p>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {metrics.isAchievable ? 'Fully Funded in Time' : `Shortfall of ${formatINR(metrics.shortfall)}`}
          </span>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <h4 className="text-base font-bold text-[#14213D]">{destination}</h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Target date: {date} ({metrics.diffMonths} months away)
            </p>
          </div>
          <span className="text-lg font-extrabold font-mono text-purple-700">
            {metrics.progressPercent}%
          </span>
        </div>

        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-purple-600 h-full rounded-full transition-all duration-700"
            style={{ width: `${metrics.progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>Saved: {formatINR(currentSaved)}</span>
          <span>Required by Date: {formatINR(cost)}</span>
        </div>

        {metrics.isAchievable ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Financially feasible! At {formatINR(monthlyTravelBudget)}/month, you will accumulate <strong>{formatINR(metrics.accumulatedByTargetDate)}</strong> before departure.
              </span>
            </div>
            <button
              onClick={() => onConsultAI(`Can I afford a ₹${cost.toLocaleString('en-IN')} trip to ${destination}?`)}
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verify with AI</span>
            </button>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Shortfall detected: You need {formatINR(metrics.requiredMonthly)}/month to reach {formatINR(cost)} by {date}, but your allocation is {formatINR(monthlyTravelBudget)}/month.
              </span>
            </div>
            <button
              onClick={() => onConsultAI(`How can I afford a ₹${cost.toLocaleString('en-IN')} trip to ${destination} by ${date}?`)}
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1 flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Strategist</span>
            </button>
          </div>
        )}
      </div>

      {/* Target Details Form & Quick Add */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="text-base font-bold text-[#14213D]">Trip Parameters</h4>

          <div>
            <label htmlFor="destination-input" className="text-xs font-semibold text-slate-700 block mb-1">
              Destination / Trip Name
            </label>
            <input
              id="destination-input"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Bali, Japan, Ladakh Roadtrip"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#14213D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="trip-cost-input" className="text-xs font-semibold text-slate-700 block mb-1">
                Estimated Cost (₹)
              </label>
              <input
                id="trip-cost-input"
                type="number"
                min="5000"
                step="1000"
                value={cost || ''}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#14213D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="target-date-input" className="text-xs font-semibold text-slate-700 block mb-1">
                Desired Date (Month)
              </label>
              <input
                id="target-date-input"
                type="month"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#14213D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="current-saved-input" className="text-xs font-semibold text-slate-700 block mb-1">
              Current Travel Fund Balance (₹)
            </label>
            <input
              id="current-saved-input"
              type="number"
              min="0"
              step="500"
              value={currentSaved || ''}
              onChange={(e) => setCurrentSaved(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#14213D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-base font-bold text-[#14213D]">Quick Deposit</h4>
            <p className="text-xs text-slate-500">
              Set aside extra funds from a bonus or gift directly into your travel balance.
            </p>

            <div className="flex gap-2">
              {[2000, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAdd(amt)}
                  className="flex-1 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors"
                >
                  +₹{(amt / 1000).toFixed(0)}k
                </button>
              ))}
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-950 space-y-2">
              <span className="font-bold flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-700" />
                Smart Travel Rule
              </span>
              <p className="text-purple-900/90 leading-relaxed">
                Never take a personal loan or roll over credit card balances for holiday travel. Experiential purchases feel truly rewarding when 100% paid for before stepping on the plane.
              </p>
            </div>
          </div>

          <button
            onClick={() => onConsultAI(`Should I prioritize traveling to ${destination} or boosting my emergency savings?`)}
            className="mt-4 w-full py-2.5 rounded-lg text-xs font-semibold bg-[#14213D] text-white hover:bg-[#1e3056] flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Consult AI Strategist on Travel Priorities</span>
          </button>
        </div>
      </div>
    </div>
  );
};
