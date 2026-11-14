import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Sparkles, 
  Laptop, 
  Car, 
  GraduationCap, 
  Home, 
  Heart, 
  Briefcase,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FinancialProfile, FinancialGoal } from '../../types/finance';
import { calculateGoalMetrics, calculateCategoryAmounts, formatINR } from '../../utils/calculations';

interface FinancialGoalsViewProps {
  profile: FinancialProfile;
  onUpdateProfile: (updated: FinancialProfile) => void;
  onConsultAI: (prompt: string) => void;
}

export const FinancialGoalsView: React.FC<FinancialGoalsViewProps> = ({
  profile,
  onUpdateProfile,
  onConsultAI,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(50000);
  const [targetDate, setTargetDate] = useState('2027-10');
  const [currentSavings, setCurrentSavings] = useState<number>(0);
  const [category, setCategory] = useState<FinancialGoal['category']>('electronics');

  const amounts = calculateCategoryAmounts(profile.monthlyIncome, profile.allocations);
  const monthlyGoalsAllocation = amounts.goals;

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim() || targetAmount <= 0) return;

    const newGoal: FinancialGoal = {
      id: `goal-${Date.now()}`,
      name: goalName.trim(),
      targetAmount: Math.round(Number(targetAmount)),
      targetDate,
      currentSavings: Math.max(0, Math.round(Number(currentSavings))),
      category,
    };

    onUpdateProfile({
      ...profile,
      goals: [...profile.goals, newGoal],
    });

    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      // ignore
    }

    setGoalName('');
    setTargetAmount(50000);
    setCurrentSavings(0);
    setIsAdding(false);
  };

  const handleDeleteGoal = (goalId: string) => {
    onUpdateProfile({
      ...profile,
      goals: profile.goals.filter((g) => g.id !== goalId),
    });
  };

  const handleAddSavingsToGoal = (goalId: string, delta: number) => {
    const updatedGoals = profile.goals.map((g) => {
      if (g.id === goalId) {
        const nextVal = Math.min(g.targetAmount, g.currentSavings + delta);
        if (nextVal >= g.targetAmount) {
          try {
            confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
          } catch (e) {
            // ignore
          }
        }
        return { ...g, currentSavings: nextVal };
      }
      return g;
    });

    onUpdateProfile({
      ...profile,
      goals: updatedGoals,
    });
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    electronics: <Laptop className="w-4 h-4 text-blue-600" />,
    vehicle: <Car className="w-4 h-4 text-emerald-600" />,
    education: <GraduationCap className="w-4 h-4 text-purple-600" />,
    housing: <Home className="w-4 h-4 text-amber-600" />,
    celebration: <Heart className="w-4 h-4 text-pink-600" />,
    business: <Briefcase className="w-4 h-4 text-indigo-600" />,
    other: <Target className="w-4 h-4 text-slate-600" />,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-700">
            Targeted Savings
          </span>
          <h2 className="text-2xl font-extrabold text-[#14213D] tracking-tight mt-0.5">
            Financial Goals Planner
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Track planned purchases with timeline feasibility and shortfall analysis.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#18A878] hover:bg-[#158f66] text-white shadow-xs transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Goal</span>
        </button>
      </div>

      {/* Allocation Summary Bar */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-950">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 text-white rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-amber-800">
              Active Goals Budget Allocation
            </span>
            <p className="text-base font-bold text-amber-950">
              {formatINR(monthlyGoalsAllocation)} / month{' '}
              <span className="text-xs font-normal text-amber-800">
                ({profile.allocations.goals}% of monthly income)
              </span>
            </p>
          </div>
        </div>

        <div className="text-xs text-amber-800 text-right">
          <span>{profile.goals.length} Goals Registered</span>
          <p className="text-[11px] text-amber-700 mt-0.5">
            ~{formatINR(Math.floor(monthlyGoalsAllocation / Math.max(1, profile.goals.length)))}/mo per goal
          </p>
        </div>
      </div>

      {/* Add Goal Modal / Form */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 bg-[#14213D] text-white flex justify-between items-center">
              <h3 className="text-base font-bold">Add a Financial Goal</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Goal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro, Car Down Payment, Wedding"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#14213D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    value={targetAmount || ''}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#14213D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Target Date (Month)
                  </label>
                  <input
                    type="month"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#14213D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Initial Savings Already Available (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={currentSavings || ''}
                  onChange={(e) => setCurrentSavings(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#14213D] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-[#14213D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="electronics">Electronics & Tech</option>
                  <option value="vehicle">Vehicle / Mobility</option>
                  <option value="education">Higher Education / Upskilling</option>
                  <option value="housing">House Deposit / Relocation</option>
                  <option value="celebration">Wedding / Celebration</option>
                  <option value="business">Business Venture</option>
                  <option value="other">General Goal</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#18A878] hover:bg-[#158f66] text-white shadow-xs"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile.goals.map((goal) => {
          const metrics = calculateGoalMetrics(
            goal,
            monthlyGoalsAllocation,
            profile.goals.length
          );

          return (
            <div
              key={goal.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      {categoryIcons[goal.category] || <Target className="w-4 h-4 text-slate-700" />}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#14213D]">{goal.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Target: {goal.targetDate} ({metrics.diffMonths} months remaining)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-bold font-mono text-amber-700">
                      {metrics.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${metrics.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Saved: {formatINR(goal.currentSavings)}</span>
                    <span>Target: {formatINR(goal.targetAmount)}</span>
                  </div>
                </div>

                {/* Financial Math Breakdown */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">
                      Required / Mo
                    </span>
                    <p className="text-sm font-bold font-mono text-[#14213D] mt-0.5">
                      {formatINR(metrics.requiredMonthlyContribution)}
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">
                      Remaining Need
                    </span>
                    <p className="text-sm font-bold font-mono text-[#14213D] mt-0.5">
                      {formatINR(metrics.remainingAmount)}
                    </p>
                  </div>
                </div>

                {/* Feasibility Indicator */}
                <div className="mt-3">
                  {metrics.isAchievable ? (
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>On track! Achievable with your current {profile.allocations.goals}% goal allocation.</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-amber-50 text-amber-900 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Monthly Shortfall of {formatINR(metrics.shortfall)}</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        Required monthly contribution ({formatINR(metrics.requiredMonthlyContribution)}) exceeds your budget share ({formatINR(metrics.fairShareMonthlyBudget)}).
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAddSavingsToGoal(goal.id, 2000)}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    +₹2,000
                  </button>
                  <button
                    onClick={() => handleAddSavingsToGoal(goal.id, 5000)}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    +₹5,000
                  </button>
                </div>

                <button
                  onClick={() =>
                    onConsultAI(
                      `Can I afford to achieve my goal "${goal.name}" of ${formatINR(goal.targetAmount)} by ${goal.targetDate}?`
                    )
                  }
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze with AI</span>
                </button>
              </div>
            </div>
          );
        })}

        {profile.goals.length === 0 && (
          <div className="col-span-2 bg-white rounded-2xl p-10 border border-dashed border-slate-300 text-center space-y-3">
            <Target className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-[#14213D]">No Goals Added Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add goals like a laptop purchase, vehicle deposit, education, or wedding to calculate exactly how much to save each month.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#14213D] text-white hover:bg-[#1e3056]"
            >
              Add Your First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
