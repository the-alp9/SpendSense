import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  Target, 
  Car, 
  Smartphone, 
  Building, 
  Plane, 
  Coins, 
  Bookmark, 
  Share2, 
  History, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { FinancialProfile, DecisionReport, DecisionVerdict, DecisionVerdictTone } from '../../types/finance';
import { 
  runDeterministicDecisionAnalysis, 
  calculateCategoryAmounts, 
  calculateEmergencyFundMetrics, 
  formatINR 
} from '../../utils/calculations';

interface AIAgentViewProps {
  profile: FinancialProfile;
  onUpdateProfile: (updated: FinancialProfile) => void;
  initialPrompt?: string;
}

export const AIAgentView: React.FC<AIAgentViewProps> = ({
  profile,
  onUpdateProfile,
  initialPrompt,
}) => {
  const [query, setQuery] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<DecisionReport | null>(
    profile.savedReports && profile.savedReports.length > 0 ? profile.savedReports[0] : null
  );
  const [activeTab, setActiveTab] = useState<'decision' | 'history'>('decision');
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  // Optional manual parameter overrides
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const [customItemCost, setCustomItemCost] = useState<number | undefined>(undefined);
  const [customDownPayment, setCustomDownPayment] = useState<number | undefined>(undefined);
  const [customLoanRate, setCustomLoanRate] = useState<number | undefined>(undefined);
  const [customTenure, setCustomTenure] = useState<number | undefined>(undefined);

  const starterPrompts = [
    { text: 'Should I buy a car worth ₹8 lakh?', icon: <Car className="w-4 h-4 text-emerald-600" /> },
    { text: 'Can I afford a new phone for ₹80,000?', icon: <Smartphone className="w-4 h-4 text-blue-600" /> },
    { text: 'Should I move to an apartment with ₹22,000 rent?', icon: <Building className="w-4 h-4 text-amber-600" /> },
    { text: 'Can I afford a ₹50,000 vacation?', icon: <Plane className="w-4 h-4 text-purple-600" /> },
    { text: 'Should I take a personal loan of ₹2,00,000?', icon: <Coins className="w-4 h-4 text-rose-600" /> },
    { text: 'How much will I save in one year?', icon: <TrendingUp className="w-4 h-4 text-teal-600" /> },
  ];

  useEffect(() => {
    if (initialPrompt && initialPrompt !== query) {
      setQuery(initialPrompt);
      handleAnalyze(initialPrompt);
    }
  }, [initialPrompt]);

  const handleAnalyze = async (userQuery?: string) => {
    const queryToRun = (userQuery || query).trim();
    if (!queryToRun) return;

    setLoading(true);
    const parameters = {
      itemCost: customItemCost,
      downPayment: customDownPayment,
      loanRate: customLoanRate,
      loanTenureMonths: customTenure,
    };

    try {
      // First attempt backend call with Gemini integration
      const res = await fetch('/api/ai/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToRun,
          profile,
          parameters,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          saveAndDisplayReport(data.report);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend call failed, using client deterministic engine fallback', e);
    }

    // Client-side deterministic calculation engine fallback
    const fallbackReport = runDeterministicDecisionAnalysis(profile, queryToRun, parameters);
    saveAndDisplayReport(fallbackReport);
    setLoading(false);
  };

  const saveAndDisplayReport = (report: DecisionReport) => {
    setCurrentReport(report);
    // Add to saved reports if not already existing
    const existingIndex = profile.savedReports.findIndex((r) => r.id === report.id);
    let updatedReports = [...profile.savedReports];
    if (existingIndex >= 0) {
      updatedReports[existingIndex] = report;
    } else {
      updatedReports = [report, ...updatedReports].slice(0, 15);
    }
    onUpdateProfile({
      ...profile,
      savedReports: updatedReports,
    });
  };

  const amounts = calculateCategoryAmounts(profile.monthlyIncome, profile.allocations);
  const emergencyMetrics = calculateEmergencyFundMetrics(profile);

  const getVerdictBadge = (verdict: DecisionVerdict, tone: DecisionVerdictTone) => {
    switch (tone) {
      case 'positive':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-100/90 text-emerald-900 border border-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{verdict}</span>
          </div>
        );
      case 'moderate':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-100/90 text-amber-900 border border-amber-300 font-bold text-sm">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>{verdict}</span>
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-100/90 text-amber-900 border border-amber-300 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>{verdict}</span>
          </div>
        );
      case 'danger':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-100/90 text-red-900 border border-red-300 font-bold text-sm">
            <AlertOctagon className="w-5 h-5 text-red-600" />
            <span>{verdict}</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-[#14213D] via-[#1b2b4f] to-[#14213D] rounded-2xl p-6 text-white border border-slate-700/60 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Core Differentiator
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              SpendSense AI Financial Agent
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed">
              "Hi! I'm your SpendSense AI Financial Agent. Before you make an important financial decision, talk to me. I'll help you understand the costs, benefits, risks and long-term impact on your finances."
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
            <button
              onClick={() => setShowProfileDrawer(!showProfileDrawer)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 transition-all flex items-center gap-1.5"
            >
              <span>Financial Context ({formatINR(profile.monthlyIncome)})</span>
              {showProfileDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setActiveTab(activeTab === 'decision' ? 'history' : 'decision')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 transition-all flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              <span>Saved Reports ({profile.savedReports.length})</span>
            </button>
          </div>
        </div>

        {/* Collapsible Profile Context Drawer */}
        {showProfileDrawer && (
          <div className="mt-5 pt-4 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs animate-in fade-in">
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Take-Home</span>
              <span className="font-bold font-mono text-emerald-400 mt-0.5 block">{formatINR(profile.monthlyIncome)}</span>
            </div>
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Essentials ({profile.allocations.essentials}%)</span>
              <span className="font-bold font-mono text-slate-200 mt-0.5 block">{formatINR(amounts.essentials)}</span>
            </div>
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Savings ({profile.allocations.savings}%)</span>
              <span className="font-bold font-mono text-slate-200 mt-0.5 block">{formatINR(amounts.savings)}</span>
            </div>
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Emergency Saved</span>
              <span className="font-bold font-mono text-sky-400 mt-0.5 block">{formatINR(emergencyMetrics.currentBalance)} ({emergencyMetrics.monthsOfSafetyCurrent} mo)</span>
            </div>
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Rent Commitment</span>
              <span className="font-bold font-mono text-slate-200 mt-0.5 block">{formatINR(profile.monthlyRent || 0)}</span>
            </div>
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Existing EMI</span>
              <span className="font-bold font-mono text-slate-200 mt-0.5 block">{formatINR(profile.existingEMI || 0)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Query Input Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="agent-query-input" className="text-sm font-bold text-[#14213D] flex items-center justify-between">
            <span>What financial decision are you considering?</span>
            <button
              onClick={() => setShowAdvancedParams(!showAdvancedParams)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvancedParams ? 'Hide Details' : 'Specify Details (Down payment, Tenure, Rate)'}</span>
            </button>
          </label>

          <div className="relative">
            <input
              id="agent-query-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="e.g. Should I buy a car worth ₹8 lakh? Or can I afford an international vacation?"
              className="w-full pl-4 pr-32 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm sm:text-base text-[#14213D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all shadow-inner"
            />
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#18A878] hover:bg-[#158f66] text-white shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Evaluate</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Optional Custom Parameter Overrides */}
        {showAdvancedParams && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in">
            <div>
              <label htmlFor="custom-cost-input" className="font-semibold text-slate-700 block mb-1">Item Cost (₹)</label>
              <input
                id="custom-cost-input"
                type="number"
                placeholder="e.g. 800000"
                value={customItemCost || ''}
                onChange={(e) => setCustomItemCost(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-xs"
              />
            </div>
            <div>
              <label htmlFor="custom-dp-input" className="font-semibold text-slate-700 block mb-1">Down Payment (₹)</label>
              <input
                id="custom-dp-input"
                type="number"
                placeholder="e.g. 160000"
                value={customDownPayment || ''}
                onChange={(e) => setCustomDownPayment(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-xs"
              />
            </div>
            <div>
              <label htmlFor="custom-rate-input" className="font-semibold text-slate-700 block mb-1">Loan Interest (%)</label>
              <input
                id="custom-rate-input"
                type="number"
                step="0.1"
                placeholder="e.g. 9.5"
                value={customLoanRate || ''}
                onChange={(e) => setCustomLoanRate(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-xs"
              />
            </div>
            <div>
              <label htmlFor="custom-tenure-input" className="font-semibold text-slate-700 block mb-1">Tenure (Months)</label>
              <input
                id="custom-tenure-input"
                type="number"
                placeholder="e.g. 60"
                value={customTenure || ''}
                onChange={(e) => setCustomTenure(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* Clickable Starter Prompts */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-600 block">
            Suggested real-life decision scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            {starterPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(p.text);
                  handleAnalyze(p.text);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-slate-700 hover:text-emerald-900 transition-all cursor-pointer"
              >
                {p.icon}
                <span>{p.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History view or Current Report */}
      {activeTab === 'history' ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-[#14213D]">Saved Decision Reports</h3>
            <button
              onClick={() => setActiveTab('decision')}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Back to Active Decision
            </button>
          </div>

          {profile.savedReports.length > 0 ? (
            <div className="space-y-3">
              {profile.savedReports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => {
                    setCurrentReport(rep);
                    setActiveTab('decision');
                  }}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-sm font-bold text-[#14213D]">{rep.question}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(rep.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>{getVerdictBadge(rep.verdict, rep.verdictTone)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No saved reports yet.</p>
          )}
        </div>
      ) : currentReport ? (
        /* STRUCTURED AI DECISION REPORT (8 SECTIONS per prompt specification) */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-in fade-in">
          {/* Top Report Header & Verdict */}
          <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                SpendSense AI Decision Report
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                "{currentReport.question}"
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated against personal income of {formatINR(currentReport.financialOverview.monthlyIncome)}/mo
              </p>
            </div>

            <div className="flex-shrink-0">
              {getVerdictBadge(currentReport.verdict, currentReport.verdictTone)}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8 divide-y divide-slate-100">
            {/* 1. Your Question & Restatement */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                1. Your Question
              </h4>
              <p className="text-base font-semibold text-[#14213D]">
                Evaluating feasibility, opportunity cost, cash flow impact, and risk for:
              </p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2 font-medium">
                "{currentReport.question}"
              </p>
            </div>

            {/* 2. Financial Overview */}
            <div className="pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                2. Financial Overview Used
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Monthly Take-Home</span>
                  <span className="font-bold font-mono text-slate-900 text-sm mt-0.5 block">
                    {formatINR(currentReport.financialOverview.monthlyIncome)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Fixed Commitments</span>
                  <span className="font-bold font-mono text-slate-900 text-sm mt-0.5 block">
                    {formatINR(currentReport.financialOverview.existingCommitments)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Core Savings / Mo</span>
                  <span className="font-bold font-mono text-[#18A878] text-sm mt-0.5 block">
                    {formatINR(currentReport.financialOverview.currentSavingsAllocation)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Emergency Cushion</span>
                  <span className="font-bold font-mono text-sky-700 text-sm mt-0.5 block">
                    {currentReport.financialOverview.emergencyFundCoverMonths} Months Cover
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Estimated Financial Impact */}
            <div className="pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                3. Estimated Financial Impact
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-medium text-slate-600 block">Upfront Cash Outflow</span>
                  <span className="text-xl font-bold font-mono text-[#14213D] mt-1 block">
                    {formatINR(currentReport.estimatedImpact.upfrontCost)}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Down payment or initial capital
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-medium text-slate-600 block">Monthly Financial Commitment</span>
                  <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">
                    {formatINR(currentReport.estimatedImpact.monthlyCommitment)}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {currentReport.estimatedImpact.emiToIncomeRatio
                      ? `${currentReport.estimatedImpact.emiToIncomeRatio}% of monthly income`
                      : 'Monthly outlay'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-medium text-slate-600 block">Total Ownership Cost</span>
                  <span className="text-xl font-bold font-mono text-[#14213D] mt-1 block">
                    {formatINR(currentReport.estimatedImpact.totalOwnershipCost)}
                  </span>
                  {currentReport.estimatedImpact.totalInterestPaid ? (
                    <span className="text-[11px] text-amber-600 block mt-0.5">
                      Includes {formatINR(currentReport.estimatedImpact.totalInterestPaid)} loan interest
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Full acquisition & upkeep
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 mt-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{currentReport.estimatedImpact.savingsRateChange}</span>
              </div>
            </div>

            {/* 4. Benefits */}
            <div className="pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                4. Benefits Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <h5 className="text-xs font-bold uppercase text-emerald-900 tracking-wider mb-2">
                    Practical & Quality of Life Benefits
                  </h5>
                  <ul className="space-y-1.5 text-xs text-emerald-950">
                    {currentReport.benefits.practical.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h5 className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                    Financial Value & Longevity
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-800">
                    {currentReport.benefits.financial.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-slate-600 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 5. Risks */}
            <div className="pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                5. Financial Risks & Trade-Offs
              </h4>
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                {currentReport.risks.map((risk, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{risk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Alternative Scenarios */}
            <div className="pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                6. Alternative Scenarios Comparison
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentReport.alternatives.map((alt, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h5 className="text-sm font-bold text-[#14213D]">{alt.title}</h5>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {alt.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-700 font-mono">
                        {alt.financialDiff}
                      </span>
                      <span className="text-[11px] text-slate-400">{alt.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Final AI Recommendation */}
            <div className="pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                7. Final AI Recommendation
              </h4>
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#14213D] text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Verdict: {currentReport.verdict}
                  </span>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-slate-100">
                  {currentReport.finalRecommendation}
                </p>
              </div>
            </div>

            {/* 8. Suggested Action Plan */}
            <div className="pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                8. Suggested Action Plan
              </h4>
              <div className="space-y-2.5">
                {currentReport.actionPlan.map((step, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm text-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assumptions & Educational Disclaimer */}
            <div className="pt-6 text-xs text-slate-500 space-y-1">
              <span className="font-semibold block text-slate-600">Calculated Assumptions:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500">
                {currentReport.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
              <p className="text-[10px] text-slate-400 pt-2">
                Disclaimer: SpendSense AI is an educational financial decision-support tool. Calculations are deterministic and rule-based. This does not constitute certified investment advice or securities recommendation.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
