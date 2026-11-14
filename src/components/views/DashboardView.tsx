import React from 'react';
import { 
  TrendingUp, 
  ShieldAlert, 
  Target, 
  Plane, 
  Wallet, 
  Sparkles, 
  ArrowUpRight, 
  ChevronRight,
  Info,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { FinancialProfile, CategoryKey } from '../../types/finance';
import { 
  CATEGORY_DEFINITIONS, 
  calculateCategoryAmounts, 
  calculateAnnualSavings, 
  calculateEmergencyFundMetrics, 
  calculateGoalMetrics, 
  calculateTravelMetrics, 
  formatINR 
} from '../../utils/calculations';
import { DoughnutChart } from '../DoughnutChart';

interface DashboardViewProps {
  profile: FinancialProfile;
  onNavigate: (tab: any) => void;
  onOpenEditModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  onNavigate,
  onOpenEditModal,
}) => {
  const amounts = calculateCategoryAmounts(profile.monthlyIncome, profile.allocations);
  const annualSavings = calculateAnnualSavings(amounts.savings);
  const emergencyMetrics = calculateEmergencyFundMetrics(profile);
  const travelMetrics = calculateTravelMetrics(profile.travelFund, amounts.travel);

  // Overview metric cards configuration
  const overviewCards = [
    {
      title: 'Monthly Income',
      amount: profile.monthlyIncome,
      subtext: 'Net Take-Home',
      icon: <Wallet className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100',
      action: onOpenEditModal,
      actionLabel: 'Edit',
    },
    {
      title: 'Essentials Allocation',
      amount: amounts.essentials,
      subtext: `${profile.allocations.essentials}% (Rent, bills, food)`,
      icon: <TrendingUp className="w-5 h-5 text-slate-700" />,
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      action: () => onNavigate('allocation'),
      actionLabel: 'Tune',
    },
    {
      title: 'Monthly Savings',
      amount: amounts.savings,
      subtext: `${profile.allocations.savings}% for long-term wealth`,
      icon: <TrendingUp className="w-5 h-5 text-[#18A878]" />,
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-200/60',
      action: () => onNavigate('allocation'),
      actionLabel: 'Details',
    },
    {
      title: 'Emergency Fund',
      amount: amounts.emergency,
      subtext: `${profile.allocations.emergency}% monthly contribution`,
      icon: <ShieldAlert className="w-5 h-5 text-sky-600" />,
      bg: 'bg-sky-50/60',
      border: 'border-sky-100',
      action: () => onNavigate('emergency'),
      actionLabel: 'Buffer',
    },
    {
      title: 'Travel Fund',
      amount: amounts.travel,
      subtext: `${profile.allocations.travel}% for vacations`,
      icon: <Plane className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50/60',
      border: 'border-purple-100',
      action: () => onNavigate('travel'),
      actionLabel: 'Explore',
    },
    {
      title: 'Financial Goals',
      amount: amounts.goals,
      subtext: `${profile.allocations.goals}% for active targets`,
      icon: <Target className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50/60',
      border: 'border-amber-100',
      action: () => onNavigate('goals'),
      actionLabel: 'Goals',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-700">
            Welcome to SpendSense AI
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight mt-0.5">
            Good morning! Here's your financial overview.
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Income allocated deterministically. AI strategist ready for every purchase decision.
          </p>
        </div>

        <button
          onClick={() => onNavigate('ai-agent')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#14213D] hover:bg-[#1f3056] text-white shadow-xs transition-all cursor-pointer flex-shrink-0"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Ask Your AI Financial Agent</span>
        </button>
      </div>

      {/* 6 Financial Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {overviewCards.map((card, i) => (
          <div
            key={i}
            className={`rounded-xl p-4 border ${card.border} ${card.bg} transition-all hover:shadow-xs flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-white/80 border border-slate-200/60 shadow-2xs">
                {card.icon}
              </span>
              <button
                onClick={card.action}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {card.actionLabel}
              </button>
            </div>
            <div className="mt-3">
              <p className="text-[11px] font-medium text-slate-600 truncate">{card.title}</p>
              <p className="text-lg sm:text-xl font-bold text-[#14213D] font-mono tracking-tight mt-0.5">
                {formatINR(card.amount)}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">{card.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Visualisations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Doughnut Chart & Breakdown */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#14213D]">Monthly Income Allocation</h3>
              <p className="text-xs text-slate-500">
                Deterministic distribution totalling exactly 100%
              </p>
            </div>
            <button
              onClick={() => onNavigate('allocation')}
              className="text-xs font-semibold text-[#18A878] hover:underline flex items-center gap-1"
            >
              <span>Edit Percentages</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-4">
            <div className="md:col-span-6 flex justify-center">
              <DoughnutChart
                allocations={profile.allocations}
                amounts={amounts}
                totalIncome={profile.monthlyIncome}
                onSelectCategory={() => onNavigate('allocation')}
              />
            </div>

            <div className="md:col-span-6 space-y-2.5">
              {(Object.keys(profile.allocations) as CategoryKey[]).map((key) => {
                const def = CATEGORY_DEFINITIONS[key];
                const pct = profile.allocations[key];
                const rupee = amounts[key];
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: def.color }}
                      />
                      <div>
                        <p className="text-xs font-semibold text-[#14213D]">{def.label}</p>
                        <p className="text-[10px] text-slate-400">{pct}% share</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-800">
                      {formatINR(rupee)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Monthly Inflow: {formatINR(profile.monthlyIncome)}</span>
            <span className="font-semibold text-emerald-600">Balance: 100% Fully Assigned</span>
          </div>
        </div>

        {/* Annual Savings & Future Projections */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#18A878]" />
                <h3 className="text-base font-bold text-[#14213D]">Annual Savings Projections</h3>
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-400">
                {profile.allocations.savings}% rate
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-medium text-emerald-900">Next 12 Months (1 Year)</span>
                  <span className="text-xl font-bold font-mono text-emerald-700">
                    {formatINR(annualSavings.oneYear)}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800/80 mt-1">
                  At ₹{amounts.savings.toLocaleString('en-IN')}/month with zero withdrawals.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-medium text-slate-600 block">3 Years Outlook</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                    {formatINR(annualSavings.threeYears)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Principal savings</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-medium text-slate-600 block">5 Years Outlook</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                    {formatINR(annualSavings.fiveYears)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Without market return</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-600">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-500" />
            <span>
              Projections are calculated deterministically using your current contributions and income. They are educational estimates, not guaranteed outcomes.
            </span>
          </div>
        </div>
      </div>

      {/* Progress Trackers: Emergency Fund, Financial Goals, Travel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Emergency Fund Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-sky-600" />
                <h4 className="text-sm font-bold text-[#14213D]">Emergency Fund</h4>
              </div>
              <span className="text-xs font-bold text-sky-700 font-mono">
                {emergencyMetrics.progressPercent}%
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-sky-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${emergencyMetrics.progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-xs mt-3 text-slate-600">
              <span>Saved: <strong>{formatINR(emergencyMetrics.currentBalance)}</strong></span>
              <span>Target: <strong>{formatINR(emergencyMetrics.targetAmount)}</strong></span>
            </div>

            <p className="text-xs text-slate-500 mt-2.5">
              Covers <strong>{emergencyMetrics.monthsOfSafetyCurrent}</strong> months of essentials. 
              {emergencyMetrics.monthsToTarget < 999 && (
                <span> ~{emergencyMetrics.monthsToTarget} months to reach {profile.emergencyFund.targetMonths}-month safety buffer.</span>
              )}
            </p>
          </div>

          <button
            onClick={() => onNavigate('emergency')}
            className="mt-4 w-full py-2 rounded-lg text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors text-center"
          >
            Manage Emergency Fund
          </button>
        </div>

        {/* Travel Fund Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-bold text-[#14213D] truncate">
                  {profile.travelFund.destination || 'Vacation Fund'}
                </h4>
              </div>
              <span className="text-xs font-bold text-purple-700 font-mono">
                {travelMetrics.progressPercent}%
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${travelMetrics.progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-xs mt-3 text-slate-600">
              <span>Saved: <strong>{formatINR(profile.travelFund.currentSaved)}</strong></span>
              <span>Cost: <strong>{formatINR(profile.travelFund.estimatedCost)}</strong></span>
            </div>

            <p className="text-xs text-slate-500 mt-2.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Target: {profile.travelFund.targetDate} ({travelMetrics.diffMonths} months away)
            </p>
          </div>

          <button
            onClick={() => onNavigate('travel')}
            className="mt-4 w-full py-2 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors text-center"
          >
            Review Travel Plan
          </button>
        </div>

        {/* Active Financial Goals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-[#14213D]">Active Goals ({profile.goals.length})</h4>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {formatINR(amounts.goals)}/mo allocated
              </span>
            </div>

            {profile.goals.length > 0 ? (
              <div className="space-y-3 mt-1">
                {profile.goals.slice(0, 2).map((goal) => {
                  const pct = Math.min(100, Math.round((goal.currentSavings / goal.targetAmount) * 100));
                  return (
                    <div key={goal.id} className="text-xs">
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span className="truncate">{goal.name}</span>
                        <span className="font-mono">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">No goals added yet.</p>
            )}
          </div>

          <button
            onClick={() => onNavigate('goals')}
            className="mt-4 w-full py-2 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors text-center"
          >
            View All Goals
          </button>
        </div>
      </div>

      {/* AI Insight Section (Grounded & Actionable) */}
      <div className="bg-gradient-to-r from-[#14213D] to-[#1e3059] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Live AI Financial Insights
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">
              Strategic Observation for {formatINR(profile.monthlyIncome)} Income
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              "You're allocating {profile.allocations.savings}% of your monthly income towards savings. At this rate, you could accumulate <strong>{formatINR(annualSavings.oneYear)}</strong> over the next 12 months, assuming your income and contributions remain unchanged."
            </p>
            <p className="text-xs text-slate-300">
              "Your travel fund receives {formatINR(amounts.travel)} per month. You could accumulate <strong>{formatINR(amounts.travel * 6)}</strong> in six months."
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <button
              onClick={() => onNavigate('ai-agent')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#18A878] hover:bg-[#158f66] text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Consult AI Agent</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
