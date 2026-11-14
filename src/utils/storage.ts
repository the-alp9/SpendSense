import { FinancialProfile, DecisionReport } from '../types/finance';
import { runDeterministicDecisionAnalysis } from './calculations';

export const DEMO_PROFILE: FinancialProfile = {
  monthlyIncome: 60000,
  allocations: {
    essentials: 45,
    emergency: 10,
    savings: 20,
    travel: 10,
    goals: 5,
    lifestyle: 10,
  },
  monthlyRent: 14000,
  existingEMI: 0,
  emergencyFund: {
    targetMonths: 6,
    currentBalance: 30000,
    customMonthlyEssentials: 27000,
  },
  travelFund: {
    destination: 'Goa Coastal Retreat',
    estimatedCost: 36000,
    targetDate: '2027-04',
    currentSaved: 12000,
  },
  goals: [
    {
      id: 'goal-laptop',
      name: 'Work Laptop Upgrade',
      targetAmount: 45000,
      targetDate: '2027-08',
      currentSavings: 15000,
      category: 'electronics',
    },
    {
      id: 'goal-vehicle-deposit',
      name: 'Electric Scooter Down Payment',
      targetAmount: 30000,
      targetDate: '2027-12',
      currentSavings: 6000,
      category: 'vehicle',
    },
  ],
  savedReports: [],
  isDemo: true,
};

// Seed an initial demo decision report so user immediately sees how it works!
const initialDemoReport: DecisionReport = runDeterministicDecisionAnalysis(
  DEMO_PROFILE,
  'Should I buy a car worth ₹8 lakh?',
  {
    itemCost: 800000,
    downPayment: 160000,
    loanRate: 9.5,
    loanTenureMonths: 60,
    monthlyRunningCost: 6500,
  }
);
DEMO_PROFILE.savedReports = [initialDemoReport];

const STORAGE_KEY = 'spendsense_profile_v1';

export function loadFinancialProfile(): FinancialProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEMO_PROFILE };
    }
    const parsed = JSON.parse(raw);
    // Ensure all keys exist
    return {
      ...DEMO_PROFILE,
      ...parsed,
      allocations: {
        ...DEMO_PROFILE.allocations,
        ...(parsed.allocations || {}),
      },
      emergencyFund: {
        ...DEMO_PROFILE.emergencyFund,
        ...(parsed.emergencyFund || {}),
      },
      travelFund: {
        ...DEMO_PROFILE.travelFund,
        ...(parsed.travelFund || {}),
      },
    };
  } catch (e) {
    console.error('Failed to load profile from storage', e);
    return { ...DEMO_PROFILE };
  }
}

export function saveFinancialProfile(profile: FinancialProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to storage', e);
  }
}

export function resetToDemoProfile(): FinancialProfile {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
  return { ...DEMO_PROFILE };
}
