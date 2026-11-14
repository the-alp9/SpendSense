export type CategoryKey = 
  | 'essentials' 
  | 'emergency' 
  | 'savings' 
  | 'travel' 
  | 'goals' 
  | 'lifestyle';

export interface CategoryAllocation {
  key: CategoryKey;
  label: string;
  description: string;
  percentage: number;
  color: string;
  lightColor: string;
  iconName: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string; // YYYY-MM
  currentSavings: number;
  category: 'electronics' | 'vehicle' | 'education' | 'housing' | 'celebration' | 'business' | 'other';
}

export interface TravelPlan {
  destination: string;
  estimatedCost: number;
  targetDate: string; // YYYY-MM
  currentSaved: number;
}

export interface EmergencyFundProfile {
  targetMonths: 3 | 6 | 9 | 12;
  currentBalance: number;
  customMonthlyEssentials?: number;
}

export type DecisionVerdict = 
  | 'Good Financial Decision'
  | 'Affordable, But Consider Waiting'
  | 'Risky Financial Decision'
  | 'Not Financially Advisable Right Now';

export type DecisionVerdictTone = 'positive' | 'moderate' | 'warning' | 'danger';

export interface AlternativeScenario {
  title: string;
  description: string;
  financialDiff: string;
  recommendation: string;
}

export interface DecisionReport {
  id: string;
  timestamp: string;
  question: string;
  category: 'car' | 'gadget' | 'apartment' | 'travel' | 'loan' | 'savings' | 'general';
  verdict: DecisionVerdict;
  verdictTone: DecisionVerdictTone;
  financialOverview: {
    monthlyIncome: number;
    disposableIncome: number;
    existingCommitments: number;
    currentSavingsAllocation: number;
    emergencyFundCoverMonths: number;
  };
  estimatedImpact: {
    upfrontCost: number;
    monthlyCommitment: number;
    totalInterestPaid?: number;
    totalOwnershipCost: number;
    savingsRateChange: string;
    emiToIncomeRatio?: number;
    timeToRecoverMonths?: number;
  };
  benefits: {
    practical: string[];
    financial: string[];
  };
  risks: string[];
  alternatives: AlternativeScenario[];
  finalRecommendation: string;
  actionPlan: string[];
  assumptions: string[];
}

export interface FinancialProfile {
  monthlyIncome: number;
  allocations: Record<CategoryKey, number>;
  monthlyRent?: number;
  existingEMI?: number;
  emergencyFund: EmergencyFundProfile;
  travelFund: TravelPlan;
  goals: FinancialGoal[];
  savedReports: DecisionReport[];
  isDemo?: boolean;
}

export interface WhatIfScenarioState {
  incomeDeltaPercent: number; // e.g. +20%
  extraSavingsMonthly: number; // e.g. +5000
  rentDeltaMonthly: number; // e.g. +5000
  pauseTravelSixMonths: boolean;
  newEmiAmount: number; // e.g. 15000
  newEmiTenureMonths: number; // e.g. 36
  oneTimeSplurge: number; // e.g. 20000
}

export interface AllocationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: string;
  proposedAllocations: Record<CategoryKey, number>;
}
