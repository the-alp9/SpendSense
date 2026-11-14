import React from 'react';
import { Menu, Edit3, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { FinancialProfile } from '../types/finance';
import { formatINR } from '../utils/calculations';

interface HeaderProps {
  profile: FinancialProfile;
  onOpenMobileNav: () => void;
  onOpenEditModal: () => void;
  onNavigateToAI: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenMobileNav,
  onOpenEditModal,
  onNavigateToAI,
  onResetDemo,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left side: Hamburger & Title info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileNav}
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-600 hidden sm:inline">
              Monthly Income
            </span>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <span className="text-sm sm:text-base font-bold text-[#14213D] font-mono">
                {formatINR(profile.monthlyIncome)}
              </span>
              <button
                onClick={onOpenEditModal}
                className="text-slate-400 hover:text-emerald-600 p-0.5 rounded transition-colors"
                title="Edit monthly income"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {profile.isDemo && (
            <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Sample Demo Profile
            </div>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {profile.isDemo ? (
            <button
              onClick={onResetDemo}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Reset sample data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          ) : (
            <button
              onClick={onResetDemo}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <span>Load Demo Data</span>
            </button>
          )}

          <button
            onClick={onOpenEditModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Personalise</span>
            <span className="sm:hidden">Edit</span>
          </button>

          <button
            onClick={onNavigateToAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#18A878] hover:bg-[#158f66] text-white shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI Agent</span>
            <span className="sm:hidden">Ask AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
