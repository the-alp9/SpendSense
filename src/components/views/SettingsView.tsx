import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  RotateCcw, 
  Download, 
  Upload, 
  ShieldCheck, 
  AlertCircle, 
  Edit3, 
  CheckCircle2, 
  FileText
} from 'lucide-react';
import { FinancialProfile } from '../../types/finance';
import { formatINR } from '../../utils/calculations';

interface SettingsViewProps {
  profile: FinancialProfile;
  onUpdateProfile: (updated: FinancialProfile) => void;
  onResetDemo: () => void;
  onOpenEditModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onResetDemo,
  onOpenEditModal,
}) => {
  const [copied, setCopied] = useState(false);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `spendsense_financial_profile_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.monthlyIncome && parsed.allocations) {
          onUpdateProfile(parsed);
          alert('Profile successfully imported!');
        } else {
          alert('Invalid profile JSON structure.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            Preferences & Control
          </span>
          <h2 className="text-2xl font-extrabold text-[#14213D] tracking-tight mt-0.5">
            Settings & Data Management
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Manage your local financial profile, export backup, and review safety disclosures.
          </p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-[#14213D]">Active Profile Parameters</h3>
          <button
            onClick={onOpenEditModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#18A878] hover:bg-[#158f66] text-white transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Monthly Income</span>
            <span className="font-bold font-mono text-[#14213D] text-sm mt-0.5 block">
              {formatINR(profile.monthlyIncome)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Monthly Rent</span>
            <span className="font-bold font-mono text-slate-800 text-sm mt-0.5 block">
              {formatINR(profile.monthlyRent || 0)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Existing Debt / EMI</span>
            <span className="font-bold font-mono text-slate-800 text-sm mt-0.5 block">
              {formatINR(profile.existingEMI || 0)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Emergency Target</span>
            <span className="font-bold font-mono text-sky-700 text-sm mt-0.5 block">
              {profile.emergencyFund.targetMonths} Months
            </span>
          </div>
        </div>
      </div>

      {/* Backup & Demo Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Persistence & Export */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#14213D]">Local Backup & Portability</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All your financial allocations, goals, and saved AI reports remain stored privately in your browser. You can export a JSON backup or import one anytime.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleExportJSON}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export Profile (JSON)</span>
            </button>

            <label className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Import Profile (JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Demo Data Reset */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#14213D]">Sample Demo Reset</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Reset all categories, income (₹60,000), sample goals (Work Laptop, Electric Scooter), and travel plan back to the clean starting template.
          </p>

          <button
            onClick={onResetDemo}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-300" />
            <span>Reset to Official Demo Profile (₹60,000)</span>
          </button>
        </div>
      </div>

      {/* Financial Safety & Integrity Guarantee */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>SpendSense AI Financial Safety & Accuracy Guarantee</span>
        </div>
        <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <p>
            1. <strong>Deterministic Core:</strong> All rupee computations, percentages, loan EMI amortisations, and progress metrics are executed by a deterministic calculation engine. The AI does not fabricate interest rates or arbitrary math.
          </p>
          <p>
            2. <strong>Zero Bank Scraping:</strong> SpendSense AI never requests bank credentials, net-banking passwords, or transaction PDF uploads. You only provide monthly numbers voluntarily.
          </p>
          <p>
            3. <strong>Educational Decision Support:</strong> SpendSense AI provides educational financial frameworks (e.g. 50/30/20, sinking funds, debt-to-income caps) to help you think through purchases. It does not sell financial products or make stock market buy/sell calls.
          </p>
        </div>
      </div>
    </div>
  );
};
