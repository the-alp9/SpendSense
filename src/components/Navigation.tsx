import React from 'react';
import { 
  LayoutDashboard, 
  PieChart, 
  ShieldAlert, 
  Target, 
  Plane, 
  Sparkles, 
  SlidersHorizontal, 
  Settings,
  X
} from 'lucide-react';

export type TabKey = 
  | 'dashboard' 
  | 'allocation' 
  | 'emergency' 
  | 'goals' 
  | 'travel' 
  | 'ai-agent' 
  | 'what-if' 
  | 'settings';

interface NavigationProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  isDemo?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems: Array<{
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    highlight?: boolean;
    badge?: string;
  }> = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      key: 'allocation',
      label: 'Smart Allocation',
      icon: <PieChart className="w-5 h-5" />,
    },
    {
      key: 'emergency',
      label: 'Emergency Fund',
      icon: <ShieldAlert className="w-5 h-5" />,
    },
    {
      key: 'goals',
      label: 'Financial Goals',
      icon: <Target className="w-5 h-5" />,
    },
    {
      key: 'travel',
      label: 'Travel Fund',
      icon: <Plane className="w-5 h-5" />,
    },
    {
      key: 'ai-agent',
      label: 'AI Financial Agent',
      icon: <Sparkles className="w-5 h-5" />,
      highlight: true,
      badge: 'Core AI',
    },
    {
      key: 'what-if',
      label: 'What If? Simulator',
      icon: <SlidersHorizontal className="w-5 h-5" />,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#14213D] text-slate-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30 shadow-inner">
            ₹
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              SpendSense <span className="text-emerald-400 text-xs px-1.5 py-0.5 rounded font-mono font-medium bg-emerald-500/10 border border-emerald-500/20">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5">
              Smart Money Allocation
            </p>
          </div>
        </div>
        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded text-slate-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Navigation
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                onSelectTab(item.key);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left group ${
                isActive
                  ? item.highlight
                    ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                    : 'bg-white/10 text-white font-semibold'
                  : item.highlight
                  ? 'text-emerald-300 hover:bg-emerald-500/15 hover:text-emerald-200 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`${
                    isActive
                      ? item.highlight
                        ? 'text-white'
                        : 'text-emerald-400'
                      : item.highlight
                      ? 'text-emerald-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Tagline */}
      <div className="p-4 m-3 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-300">
        <p className="font-medium text-white">Your Money. Your Decisions.</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Deterministic planning + AI financial intelligence.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 border-r border-slate-200 flex-shrink-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
