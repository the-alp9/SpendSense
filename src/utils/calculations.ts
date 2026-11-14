import { 
  CategoryKey, 
  CategoryAllocation, 
  FinancialProfile, 
  FinancialGoal, 
  TravelPlan,
  EmergencyFundProfile,
  DecisionReport,
  AllocationSuggestion,
  WhatIfScenarioState
} from '../types/finance';

export const CATEGORY_DEFINITIONS: Record<CategoryKey, { label: string; description: string; defaultPercentage: number; color: string; lightColor: string }> = {
  essentials: {
    label: 'Essentials',
    description: 'Rent, groceries, utilities, bills, and fixed living costs',
    defaultPercentage: 45,
    color: '#14213D',
    lightColor: '#e2e8f0',
  },
  emergency: {
    label: 'Emergency Fund',
    description: 'Liquid cash buffer for unexpected emergencies or health crises',
    defaultPercentage: 10,
    color: '#0284c7',
    lightColor: '#e0f2fe',
  },
  savings: {
    label: 'Savings',
    description: 'Long-term wealth building, mutual funds, PPF, and investments',
    defaultPercentage: 20,
    color: '#18A878',
    lightColor: '#d1fae5',
  },
  travel: {
    label: 'Travel Fund',
    description: 'Dedicated fund for vacations, trips, and experiences',
    defaultPercentage: 10,
    color: '#8b5cf6',
    lightColor: '#ede9fe',
  },
  goals: {
    label: 'Financial Goals',
    description: 'Targeted savings for electronics, vehicle, wedding, or home',
    defaultPercentage: 5,
    color: '#f59e0b',
    lightColor: '#fef3c7',
  },
  lifestyle: {
    label: 'Lifestyle',
    description: 'Dining out, entertainment, shopping, subscriptions, and fun',
    defaultPercentage: 10,
    color: '#ec4899',
    lightColor: '#fce7f3',
  },
};

/**
 * Formats a number to Indian Rupee representation (e.g. ₹60,000, ₹8,00,000, ₹1.44 Lakh)
 */
export function formatINR(amount: number, showLakhAbbreviation = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  const isNegative = amount < 0;
  const absAmount = Math.round(Math.abs(amount));

  if (showLakhAbbreviation) {
    if (absAmount >= 10000000) {
      return `${isNegative ? '-' : ''}₹${(absAmount / 10000000).toFixed(2)} Cr`;
    }
    if (absAmount >= 100000) {
      return `${isNegative ? '-' : ''}₹${(absAmount / 100000).toFixed(2)} Lakh`;
    }
  }

  // Standard Indian comma grouping: last 3 digits, then groups of 2 digits
  const numStr = absAmount.toString();
  let result = '';
  if (numStr.length <= 3) {
    result = numStr;
  } else {
    const lastThree = numStr.substring(numStr.length - 3);
    const rest = numStr.substring(0, numStr.length - 3);
    const withCommas = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${withCommas},${lastThree}`;
  }

  return `${isNegative ? '-' : ''}₹${result}`;
}

/**
 * Calculates Rupee amount for each category based on income and percentage
 */
export function calculateCategoryAmounts(
  monthlyIncome: number,
  allocations: Record<CategoryKey, number>
): Record<CategoryKey, number> {
  const result: Record<CategoryKey, number> = {} as Record<CategoryKey, number>;
  for (const [key, pct] of Object.entries(allocations) as [CategoryKey, number][]) {
    result[key] = Math.round((monthlyIncome * pct) / 100);
  }
  return result;
}

/**
 * Calculates total allocated percentage
 */
export function calculateTotalPercentage(allocations: Record<CategoryKey, number>): number {
  return Object.values(allocations).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
}

/**
 * Rebalances percentages to add up to exactly 100% proportionally or adjusts target category
 */
export function rebalanceAllocations(
  currentAllocations: Record<CategoryKey, number>,
  adjustedKey: CategoryKey,
  newPercentage: number
): Record<CategoryKey, number> {
  const clampedVal = Math.max(0, Math.min(100, Math.round(newPercentage)));
  const updated = { ...currentAllocations, [adjustedKey]: clampedVal };
  
  const otherKeys = (Object.keys(currentAllocations) as CategoryKey[]).filter(k => k !== adjustedKey);
  const remainingTotal = 100 - clampedVal;
  const currentOtherSum = otherKeys.reduce((acc, k) => acc + currentAllocations[k], 0);

  if (currentOtherSum === 0) {
    const equalShare = Math.floor(remainingTotal / otherKeys.length);
    let rem = remainingTotal - equalShare * otherKeys.length;
    otherKeys.forEach((k, idx) => {
      updated[k] = equalShare + (idx === 0 ? rem : 0);
    });
    return updated;
  }

  let distributedSum = 0;
  otherKeys.forEach((k, index) => {
    if (index === otherKeys.length - 1) {
      updated[k] = Math.max(0, remainingTotal - distributedSum);
    } else {
      const share = Math.round((currentAllocations[k] / currentOtherSum) * remainingTotal);
      updated[k] = Math.max(0, share);
      distributedSum += updated[k];
    }
  });

  return updated;
}

/**
 * Annual savings projections (1 year, 3 years, 5 years)
 */
export function calculateAnnualSavings(monthlySavings: number) {
  return {
    oneYear: monthlySavings * 12,
    threeYears: monthlySavings * 36,
    fiveYears: monthlySavings * 60,
  };
}

/**
 * Emergency fund calculations
 */
export function calculateEmergencyFundMetrics(
  profile: FinancialProfile
) {
  const monthlyEssentials = profile.emergencyFund.customMonthlyEssentials ?? 
    Math.round((profile.monthlyIncome * (profile.allocations.essentials || 45)) / 100);
  
  const targetAmount = monthlyEssentials * profile.emergencyFund.targetMonths;
  const currentBalance = profile.emergencyFund.currentBalance || 0;
  const remainingAmount = Math.max(0, targetAmount - currentBalance);
  
  const monthlyContribution = Math.round((profile.monthlyIncome * (profile.allocations.emergency || 10)) / 100);
  
  const monthsToTarget = monthlyContribution > 0 ? Math.ceil(remainingAmount / monthlyContribution) : Infinity;
  const progressPercent = targetAmount > 0 ? Math.min(100, Math.round((currentBalance / targetAmount) * 100)) : 100;
  const monthsOfSafetyCurrent = monthlyEssentials > 0 ? (currentBalance / monthlyEssentials).toFixed(1) : '0';

  return {
    monthlyEssentials,
    targetAmount,
    currentBalance,
    remainingAmount,
    monthlyContribution,
    monthsToTarget,
    progressPercent,
    monthsOfSafetyCurrent,
    isProvisional: !profile.emergencyFund.customMonthlyEssentials,
  };
}

/**
 * Goal calculation
 */
export function calculateGoalMetrics(
  goal: FinancialGoal,
  monthlyGoalsAllocationTotal: number,
  allGoalsCount: number = 1
) {
  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentSavings);
  
  // Calculate months remaining until target date
  const now = new Date();
  const [targetYear, targetMonth] = goal.targetDate.split('-').map(Number);
  const targetDateObj = new Date(targetYear, (targetMonth || 1) - 1, 1);
  const diffTime = targetDateObj.getTime() - now.getTime();
  const diffMonths = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.4375)));
  
  const requiredMonthlyContribution = Math.ceil(remainingAmount / diffMonths);
  const fairShareMonthlyBudget = Math.floor(monthlyGoalsAllocationTotal / Math.max(1, allGoalsCount));
  
  const isAchievable = requiredMonthlyContribution <= fairShareMonthlyBudget;
  const shortfall = Math.max(0, requiredMonthlyContribution - fairShareMonthlyBudget);
  const progressPercent = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentSavings / goal.targetAmount) * 100)) : 100;

  return {
    remainingAmount,
    diffMonths,
    requiredMonthlyContribution,
    fairShareMonthlyBudget,
    isAchievable,
    shortfall,
    progressPercent,
  };
}

/**
 * Travel Fund metrics
 */
export function calculateTravelMetrics(
  travel: TravelPlan,
  monthlyTravelAllocation: number
) {
  const remainingCost = Math.max(0, travel.estimatedCost - travel.currentSaved);
  
  const now = new Date();
  const [targetYear, targetMonth] = travel.targetDate.split('-').map(Number);
  const targetDateObj = new Date(targetYear, (targetMonth || 1) - 1, 1);
  const diffTime = targetDateObj.getTime() - now.getTime();
  const diffMonths = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.4375)));

  const requiredMonthly = Math.ceil(remainingCost / diffMonths);
  const monthsAtCurrentRate = monthlyTravelAllocation > 0 ? Math.ceil(remainingCost / monthlyTravelAllocation) : Infinity;
  const accumulatedByTargetDate = travel.currentSaved + (monthlyTravelAllocation * diffMonths);
  const isAchievable = accumulatedByTargetDate >= travel.estimatedCost;
  const progressPercent = travel.estimatedCost > 0 ? Math.min(100, Math.round((travel.currentSaved / travel.estimatedCost) * 100)) : 100;

  return {
    remainingCost,
    diffMonths,
    requiredMonthly,
    monthsAtCurrentRate,
    accumulatedByTargetDate,
    isAchievable,
    shortfall: Math.max(0, travel.estimatedCost - accumulatedByTargetDate),
    progressPercent,
  };
}

/**
 * Standard Loan EMI Calculation using the exact financial amortisation formula
 * E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateLoanEMI(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number
) {
  if (principal <= 0 || tenureMonths <= 0) {
    return { emi: 0, totalInterest: 0, totalPayment: 0 };
  }
  if (annualRatePercent === 0) {
    const emi = Math.round(principal / tenureMonths);
    return { emi, totalInterest: 0, totalPayment: principal };
  }

  const monthlyRate = annualRatePercent / 12 / 100;
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
  const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
  const emi = Math.round(numerator / denominator);
  const totalPayment = emi * tenureMonths;
  const totalInterest = Math.max(0, totalPayment - principal);

  return {
    emi,
    totalInterest,
    totalPayment,
  };
}

/**
 * Generates intelligent suggestions for income allocation
 */
export function generateIntelligentSuggestions(profile: FinancialProfile): AllocationSuggestion[] {
  const suggestions: AllocationSuggestion[] = [];
  const income = profile.monthlyIncome;
  const amounts = calculateCategoryAmounts(income, profile.allocations);

  // 1. Rent / Essentials Check
  if (profile.monthlyRent && profile.monthlyRent > amounts.essentials * 0.7) {
    const suggestedEssentialsPct = Math.min(60, Math.ceil(((profile.monthlyRent * 1.35) / income) * 100));
    if (suggestedEssentialsPct > profile.allocations.essentials) {
      const delta = suggestedEssentialsPct - profile.allocations.essentials;
      suggestions.push({
        id: 'rent-essentials',
        title: 'Rent Takes High Share of Essentials',
        description: `Your rent is ${formatINR(profile.monthlyRent)}, which takes up over 70% of your current Essentials budget (${formatINR(amounts.essentials)}). To prevent monthly budget deficit, we suggest increasing Essentials.`,
        impact: `Increases Essentials from ${profile.allocations.essentials}% to ${suggestedEssentialsPct}% by reducing Lifestyle and Travel.`,
        proposedAllocations: {
          ...profile.allocations,
          essentials: suggestedEssentialsPct,
          lifestyle: Math.max(5, profile.allocations.lifestyle - Math.ceil(delta / 2)),
          travel: Math.max(5, profile.allocations.travel - Math.floor(delta / 2)),
        },
      });
    }
  }

  // 2. Emergency Fund Check
  const emMetrics = calculateEmergencyFundMetrics(profile);
  if (emMetrics.currentBalance < emMetrics.targetAmount * 0.3 && profile.allocations.emergency < 15) {
    suggestions.push({
      id: 'boost-emergency',
      title: 'Prioritise Emergency Buffer',
      description: `Your current emergency balance covers only ${emMetrics.monthsOfSafetyCurrent} months of essentials. Building at least 3-6 months will protect you from unexpected events.`,
      impact: 'Increases Emergency Fund allocation to 15% (₹' + formatINR((income * 15) / 100) + '/mo) to reach target faster.',
      proposedAllocations: {
        ...profile.allocations,
        emergency: 15,
        lifestyle: Math.max(5, profile.allocations.lifestyle - 3),
        travel: Math.max(5, profile.allocations.travel - 2),
      },
    });
  }

  // 3. High Existing EMI check
  if (profile.existingEMI && profile.existingEMI > income * 0.25) {
    suggestions.push({
      id: 'high-emi-cautious',
      title: 'Existing Debt Load Alert',
      description: `Existing monthly EMI (${formatINR(profile.existingEMI)}) is ${Math.round((profile.existingEMI / income) * 100)}% of your income. Maintaining higher liquidity and disciplined lifestyle spending will reduce debt stress.`,
      impact: 'Trims discretionary lifestyle spending and bolsters liquid savings.',
      proposedAllocations: {
        ...profile.allocations,
        lifestyle: Math.max(5, profile.allocations.lifestyle - 5),
        savings: profile.allocations.savings + 5,
      },
    });
  }

  return suggestions;
}

/**
 * Evaluates What-If scenarios
 */
export function calculateWhatIf(profile: FinancialProfile, scenario: WhatIfScenarioState) {
  const currentIncome = profile.monthlyIncome;
  const simIncome = Math.round(currentIncome * (1 + scenario.incomeDeltaPercent / 100));
  
  const currentAmounts = calculateCategoryAmounts(currentIncome, profile.allocations);
  const simAmounts = calculateCategoryAmounts(simIncome, profile.allocations);

  // Adjustments
  const currentMonthlySavings = currentAmounts.savings + currentAmounts.emergency;
  let simMonthlySavings = simAmounts.savings + simAmounts.emergency + scenario.extraSavingsMonthly;

  if (scenario.pauseTravelSixMonths) {
    simMonthlySavings += simAmounts.travel; // redirected travel into savings
  }

  const rentDelta = scenario.rentDeltaMonthly;
  const newEmi = scenario.newEmiAmount;

  // Net monthly disposable surplus after commitments
  const currentCommitments = (profile.monthlyRent || 0) + (profile.existingEMI || 0);
  const simCommitments = currentCommitments + rentDelta + newEmi;

  const currentSurplus = currentIncome - (currentAmounts.essentials + currentCommitments);
  const simSurplus = simIncome - (simAmounts.essentials + simCommitments) - scenario.extraSavingsMonthly;

  const monthlySavingsDiff = simMonthlySavings - currentMonthlySavings;
  const annualSavingsDiff = monthlySavingsDiff * 12 - (scenario.oneTimeSplurge || 0);

  return {
    currentIncome,
    simIncome,
    incomeDiff: simIncome - currentIncome,
    currentMonthlySavings,
    simMonthlySavings,
    monthlySavingsDiff,
    annualSavingsDiff,
    currentCommitments,
    simCommitments,
    currentSurplus,
    simSurplus,
    surplusDiff: simSurplus - currentSurplus,
    newEmiRatio: simIncome > 0 ? ((newEmi / simIncome) * 100).toFixed(1) : '0',
  };
}

/**
 * Deterministic Decision Engine for AI Decision Agent
 * Evaluates car purchases, personal loans, apartments, gadgets, trips, etc.
 */
export function runDeterministicDecisionAnalysis(
  profile: FinancialProfile,
  query: string,
  parameters?: {
    itemCost?: number;
    downPayment?: number;
    loanRate?: number;
    loanTenureMonths?: number;
    monthlyRunningCost?: number;
    monthlyRentNew?: number;
  }
): DecisionReport {
  const lower = query.toLowerCase();
  const income = profile.monthlyIncome;
  const amounts = calculateCategoryAmounts(income, profile.allocations);
  const totalCommitments = (profile.monthlyRent || 0) + (profile.existingEMI || 0);
  const emergencyMetrics = calculateEmergencyFundMetrics(profile);
  const currentLiquidSavings = profile.emergencyFund.currentBalance + amounts.savings;

  const id = `report_${Date.now()}`;
  const timestamp = new Date().toISOString();

  // 1. CAR PURCHASE ANALYSIS
  if (lower.includes('car') || lower.includes('vehicle')) {
    const carPrice = parameters?.itemCost || 800000; // Default ₹8 Lakh
    const downPayment = parameters?.downPayment !== undefined ? parameters.downPayment : Math.round(carPrice * 0.2); // 20%
    const loanPrincipal = Math.max(0, carPrice - downPayment);
    const loanRate = parameters?.loanRate || 9.5; // 9.5% auto loan
    const tenureMonths = parameters?.loanTenureMonths || 60; // 5 years
    const runningCost = parameters?.monthlyRunningCost || 7000; // Fuel + insurance + maintenance

    const loanDetails = calculateLoanEMI(loanPrincipal, loanRate, tenureMonths);
    const totalMonthlyCarCost = loanDetails.emi + runningCost;
    const emiToIncomeRatio = (loanDetails.emi / income) * 100;
    const totalCarCostRatio = (totalMonthlyCarCost / income) * 100;
    const totalOwnershipCost = downPayment + loanDetails.totalPayment + (runningCost * tenureMonths);

    // Assess verdict
    let verdict: DecisionReport['verdict'] = 'Affordable, But Consider Waiting';
    let tone: DecisionReport['verdictTone'] = 'moderate';

    if (totalCarCostRatio > 35 || emiToIncomeRatio > 25 || downPayment > currentLiquidSavings * 0.7) {
      verdict = 'Not Financially Advisable Right Now';
      tone = 'danger';
    } else if (totalCarCostRatio > 25 || emiToIncomeRatio > 18 || emergencyMetrics.currentBalance < emergencyMetrics.targetAmount * 0.5) {
      verdict = 'Risky Financial Decision';
      tone = 'warning';
    } else if (totalCarCostRatio <= 20 && emiToIncomeRatio <= 15 && downPayment <= currentLiquidSavings * 0.5) {
      verdict = 'Good Financial Decision';
      tone = 'positive';
    }

    return {
      id,
      timestamp,
      question: query,
      category: 'car',
      verdict,
      verdictTone: tone,
      financialOverview: {
        monthlyIncome: income,
        disposableIncome: income - totalCommitments - amounts.essentials,
        existingCommitments: totalCommitments,
        currentSavingsAllocation: amounts.savings,
        emergencyFundCoverMonths: Number(emergencyMetrics.monthsOfSafetyCurrent),
      },
      estimatedImpact: {
        upfrontCost: downPayment,
        monthlyCommitment: totalMonthlyCarCost,
        totalInterestPaid: loanDetails.totalInterest,
        totalOwnershipCost,
        savingsRateChange: `Monthly commitment of ${formatINR(totalMonthlyCarCost)} will consume ${(totalCarCostRatio).toFixed(1)}% of your monthly income.`,
        emiToIncomeRatio: Math.round(emiToIncomeRatio),
        timeToRecoverMonths: Math.ceil(downPayment / Math.max(1, amounts.savings)),
      },
      benefits: {
        practical: [
          'Direct personal mobility, comfort, and convenience for family and commute.',
          'Saves daily commuting hassle and eliminates reliance on cab aggregators during peak hours.',
        ],
        financial: [
          'Builds a physical asset with resale residual value (though depreciating at ~15-20% annually).',
          'Fixed EMI predictability compared to fluctuating ride-hailing surge rates.',
        ],
      },
      risks: [
        `Down payment of ${formatINR(downPayment)} utilizes a substantial portion of your current liquid funds, reducing your safety cushion.`,
        `Ongoing monthly outflow of ${formatINR(totalMonthlyCarCost)} (${formatINR(loanDetails.emi)} EMI + ${formatINR(runningCost)} fuel/maintenance/insurance) is a multi-year non-negotiable obligation.`,
        `Total interest paid over ${tenureMonths} months will be ${formatINR(loanDetails.totalInterest)}, which is dead financing cost.`,
        'Cars depreciate rapidly in the first 3 years, so this is a lifestyle utility purchase, not a wealth generator.',
      ],
      alternatives: [
        {
          title: 'Wait 6-9 Months & Save for 35% Down Payment',
          description: `Save an additional ₹1,00,000 to increase down payment to ₹2,60,000. This lowers EMI to approx ₹11,200/mo and saves ~₹45,000 in interest.`,
          financialDiff: 'Saves ~₹45,000 interest & cuts monthly stress by ₹3,500/mo',
          recommendation: 'Recommended if your emergency fund is currently below 6 months.',
        },
        {
          title: 'Choose a Certified Pre-Owned Car (₹4.5 - ₹5 Lakh)',
          description: 'A reliable 2-3 year pre-owned hatchback will cut total loan requirement in half, keeping EMI under ₹6,500/mo.',
          financialDiff: 'Saves ₹3,20,000+ in total ownership cost',
          recommendation: 'Smartest financial option to enjoy personal mobility with minimal wealth drag.',
        },
      ],
      finalRecommendation: verdict === 'Not Financially Advisable Right Now'
        ? `Buying a ${formatINR(carPrice)} car right now places high strain on your ${formatINR(income)} monthly income, as car costs would take up ${totalCarCostRatio.toFixed(1)}% of your earnings. We strongly advise postponing until your income increases or choosing a pre-owned vehicle under ₹4.5 Lakh.`
        : verdict === 'Risky Financial Decision'
        ? `You can physically afford the loan payments, but with ongoing fuel and maintenance, it absorbs ${totalCarCostRatio.toFixed(1)}% of your income and reduces your savings rate significantly. Consider increasing your down payment first.`
        : `At your current financial position, a car purchase is manageable if you keep the total loan EMI within ${formatINR(loanDetails.emi)} and preserve at least 3-6 months of emergency reserves.`,
      actionPlan: [
        `1. Preserve at least ${formatINR(emergencyMetrics.targetAmount)} in your emergency fund untouched before paying any down payment.`,
        `2. Get pre-approved loan quotes from multiple PSU and private banks to secure rates below ${loanRate}%.`,
        `3. Test-drive the monthly commitment: transfer ${formatINR(totalMonthlyCarCost)} to a separate savings pot for 2 consecutive months to verify cash flow comfort.`,
        `4. Ensure comprehensive zero-depreciation insurance is factored into the first-year outlay.`,
      ],
      assumptions: [
        `Car ex-showroom/on-road: ${formatINR(carPrice)}`,
        `Down payment: ${formatINR(downPayment)} (20%)`,
        `Bank loan interest rate: ${loanRate}% p.a. over ${tenureMonths} months`,
        `Monthly fuel, insurance & upkeep: ${formatINR(runningCost)}/month`,
      ],
    };
  }

  // 2. GADGET / PHONE / ELECTRONICS (e.g. ₹15,000 to ₹1,50,000)
  if (lower.includes('phone') || lower.includes('iphone') || lower.includes('laptop') || lower.includes('purchase') || lower.includes('buy') || lower.includes('15,000') || lower.includes('15000')) {
    // Extract amount from query if present
    const match = query.match(/(\d+[\d,]*)/);
    let itemPrice = 80000;
    if (match) {
      const parsed = parseInt(match[1].replace(/,/g, ''), 10);
      if (parsed > 1000 && parsed < 500000) itemPrice = parsed;
    }
    if (parameters?.itemCost) itemPrice = parameters.itemCost;

    const lifestyleAndSavings = amounts.lifestyle + amounts.goals;
    const isAffordableDirectly = itemPrice <= currentLiquidSavings && itemPrice <= income * 1.5;
    const monthsToSaveWithGoals = Math.ceil(itemPrice / Math.max(1, amounts.goals + amounts.lifestyle * 0.5));

    let verdict: DecisionReport['verdict'] = 'Affordable, But Consider Waiting';
    let tone: DecisionReport['verdictTone'] = 'moderate';

    if (itemPrice > income * 2 || (itemPrice > currentLiquidSavings && itemPrice > income * 0.8)) {
      verdict = 'Not Financially Advisable Right Now';
      tone = 'danger';
    } else if (itemPrice > income * 0.75) {
      verdict = 'Risky Financial Decision';
      tone = 'warning';
    } else if (itemPrice <= lifestyleAndSavings * 2) {
      verdict = 'Good Financial Decision';
      tone = 'positive';
    }

    const noCostEmi6Mo = Math.round(itemPrice / 6);

    return {
      id,
      timestamp,
      question: query,
      category: 'gadget',
      verdict,
      verdictTone: tone,
      financialOverview: {
        monthlyIncome: income,
        disposableIncome: income - totalCommitments - amounts.essentials,
        existingCommitments: totalCommitments,
        currentSavingsAllocation: amounts.savings,
        emergencyFundCoverMonths: Number(emergencyMetrics.monthsOfSafetyCurrent),
      },
      estimatedImpact: {
        upfrontCost: itemPrice,
        monthlyCommitment: noCostEmi6Mo,
        totalOwnershipCost: itemPrice,
        savingsRateChange: `If paid upfront, it utilizes ${((itemPrice / income) * 100).toFixed(0)}% of one month's salary. If split over 6 months, it takes ${formatINR(noCostEmi6Mo)}/mo.`,
        emiToIncomeRatio: Math.round((noCostEmi6Mo / income) * 100),
        timeToRecoverMonths: monthsToSaveWithGoals,
      },
      benefits: {
        practical: [
          'Upgraded productivity, superior camera, reliable software support, or work capability.',
          'High resale value or longevity if used for 3 to 4 years.',
        ],
        financial: [
          'No long-term recurring liabilities if bought outright or on zero-interest tenure.',
          'Depreciating asset, but enables daily professional utility.',
        ],
      },
      risks: [
        'Diverts capital that could otherwise compound in your goal or investment allocations.',
        'Electronics lose ~30-40% value within the very first 12 months.',
        'Credit card EMI carries hidden processing fees (typically ₹199 + 18% GST) and cash flow rigidity.',
      ],
      alternatives: [
        {
          title: '3-Month Sinking Fund (Save First, Buy in Cash)',
          description: `Direct your ${formatINR(amounts.goals)}/mo Financial Goals budget and half of Lifestyle into a dedicated sub-account for 3 months to buy with zero debt.`,
          financialDiff: 'Zero debt, zero EMI risk, peace of mind',
          recommendation: 'Highly Recommended.',
        },
        {
          title: 'Wait for Festive / Sale Discounts (Diwali / Republic Day)',
          description: 'Waiting for an upcoming platform sale typically discounts high-end electronics by 12% to 20% with instant bank discounts.',
          financialDiff: `Saves approx ${formatINR(Math.round(itemPrice * 0.15))}`,
          recommendation: 'Great option if your current device is still working.',
        },
      ],
      finalRecommendation: verdict === 'Good Financial Decision'
        ? `This purchase of ${formatINR(itemPrice)} is well within your safe financial capacity. You can comfortably afford it without jeopardizing emergency savings or essential living standards.`
        : `A purchase of ${formatINR(itemPrice)} represents ${((itemPrice / income) * 100).toFixed(0)}% of your monthly salary. While you can fund it, waiting ${monthsToSaveWithGoals} months to save for it via your Goals allocation prevents touching your core savings.`,
      actionPlan: [
        `1. Do not use emergency fund money for any consumer electronic purchase.`,
        `2. If opting for EMI, choose strictly 0% No-Cost EMI with a duration not exceeding 3-6 months.`,
        `3. Trade in or sell your old device on Cashify/exchange to shave off 15-25% of the purchase price.`,
        `4. Add this as a tracked Financial Goal in SpendSense AI to watch your progress bar fill up.`,
      ],
      assumptions: [
        `Item purchase price: ${formatINR(itemPrice)}`,
        `Financing assumption: Cash or 6-month No-Cost EMI`,
        `No liquidation of core emergency fund`,
      ],
    };
  }

  // 3. APARTMENT / RENT INCREASE (e.g. Move to Bangalore / ₹20,000 - ₹25,000 rent)
  if (lower.includes('apartment') || lower.includes('flat') || lower.includes('rent') || lower.includes('move')) {
    const newRent = parameters?.monthlyRentNew || 22000;
    const currentRent = profile.monthlyRent || 12000;
    const rentDelta = newRent - currentRent;
    const securityDeposit = newRent * 6; // Typical 6-10 months in India (e.g. Bangalore)
    const rentToIncomeRatio = (newRent / income) * 100;

    let verdict: DecisionReport['verdict'] = 'Affordable, But Consider Waiting';
    let tone: DecisionReport['verdictTone'] = 'moderate';

    if (rentToIncomeRatio > 40 || securityDeposit > currentLiquidSavings * 0.8) {
      verdict = 'Not Financially Advisable Right Now';
      tone = 'danger';
    } else if (rentToIncomeRatio > 30) {
      verdict = 'Risky Financial Decision';
      tone = 'warning';
    } else {
      verdict = 'Good Financial Decision';
      tone = 'positive';
    }

    return {
      id,
      timestamp,
      question: query,
      category: 'apartment',
      verdict,
      verdictTone: tone,
      financialOverview: {
        monthlyIncome: income,
        disposableIncome: income - totalCommitments - amounts.essentials,
        existingCommitments: totalCommitments,
        currentSavingsAllocation: amounts.savings,
        emergencyFundCoverMonths: Number(emergencyMetrics.monthsOfSafetyCurrent),
      },
      estimatedImpact: {
        upfrontCost: securityDeposit,
        monthlyCommitment: newRent,
        totalOwnershipCost: newRent * 12 + securityDeposit,
        savingsRateChange: `New rent of ${formatINR(newRent)} increases monthly fixed expenses by ${formatINR(rentDelta)}, taking up ${rentToIncomeRatio.toFixed(1)}% of your monthly income.`,
        emiToIncomeRatio: Math.round(rentToIncomeRatio),
        timeToRecoverMonths: Math.ceil(securityDeposit / Math.max(1, amounts.savings)),
      },
      benefits: {
        practical: [
          'Better living environment, proximity to workplace, saved commute hours, and higher quality of life.',
          'Gated community amenities (security, power backup, gym, green open spaces).',
        ],
        financial: [
          'Reduced daily commuting costs if significantly closer to office.',
          'Security deposit is refundable upon tenancy completion.',
        ],
      },
      risks: [
        `High lock-in: A security deposit of ${formatINR(securityDeposit)} locks away capital that generates 0% return.`,
        `Ongoing monthly outflow increases by ${formatINR(rentDelta)} every single month (${formatINR(rentDelta * 12)} per year).`,
        `Leaves less monthly headroom for investments (${formatINR(amounts.savings)}) and travel.`,
      ],
      alternatives: [
        {
          title: 'Find a 2BHK Shared Flat or Co-Living Option',
          description: `Splitting a quality apartment in the same prime neighborhood keeps your individual rent at ~₹14,000 to ₹16,000.`,
          financialDiff: `Saves approx ${formatINR((newRent - 15000) * 12)}/year in rent alone`,
          recommendation: 'Great balance of comfort and wealth building.',
        },
        {
          title: 'Negotiate Deposit Down to 3-4 Months',
          description: 'Offer a slightly higher rent lock-in or company lease agreement in exchange for a 3-month refundable deposit instead of 6-10 months.',
          financialDiff: `Frees up ${formatINR(newRent * 3)} in liquid liquidity`,
          recommendation: 'Strongly recommended before signing any rental agreement.',
        },
      ],
      finalRecommendation: rentToIncomeRatio > 30
        ? `A rent of ${formatINR(newRent)} represents ${rentToIncomeRatio.toFixed(1)}% of your monthly income. Financial guidelines recommend keeping total housing costs below 30% so your savings rate doesn't suffer.`
        : `Moving into this apartment is affordable for your income profile. Ensure you have the upfront deposit of ${formatINR(securityDeposit)} without depleting your ${formatINR(emergencyMetrics.targetAmount)} emergency target.`,
      actionPlan: [
        `1. Recalibrate your SpendSense Essentials allocation to accommodate ${formatINR(newRent)} rent without exceeding 50% total essentials.`,
        `2. Ensure the security deposit is backed by a registered rental agreement with clear refund terms.`,
        `3. Factor in moving costs (Packers & Movers ~₹8,000-₹15,000 + brokerage if applicable).`,
      ],
      assumptions: [
        `Target monthly rent: ${formatINR(newRent)}`,
        `Security deposit: ${formatINR(securityDeposit)} (6 months standard)`,
        `Maintenance & utilities: estimated ₹3,000/month`,
      ],
    };
  }

  // 4. VACATION / TRAVEL (e.g. ₹40,000 to ₹1,50,000 vacation)
  if (lower.includes('vacation') || lower.includes('trip') || lower.includes('travel') || lower.includes('holiday')) {
    let tripCost = 50000;
    const match = query.match(/(\d+[\d,]*)/);
    if (match) {
      const parsed = parseInt(match[1].replace(/,/g, ''), 10);
      if (parsed > 5000 && parsed < 1000000) tripCost = parsed;
    }
    if (parameters?.itemCost) tripCost = parameters.itemCost;

    const travelAllocationMonthly = amounts.travel;
    const monthsToAccumulate = travelAllocationMonthly > 0 ? Math.ceil(tripCost / travelAllocationMonthly) : 10;
    const isReadyNow = profile.travelFund.currentSaved >= tripCost;

    let verdict: DecisionReport['verdict'] = 'Affordable, But Consider Waiting';
    let tone: DecisionReport['verdictTone'] = 'moderate';

    if (isReadyNow || tripCost <= travelAllocationMonthly * 2) {
      verdict = 'Good Financial Decision';
      tone = 'positive';
    } else if (tripCost > income * 1.5) {
      verdict = 'Not Financially Advisable Right Now';
      tone = 'danger';
    } else {
      verdict = 'Affordable, But Consider Waiting';
      tone = 'moderate';
    }

    return {
      id,
      timestamp,
      question: query,
      category: 'travel',
      verdict,
      verdictTone: tone,
      financialOverview: {
        monthlyIncome: income,
        disposableIncome: income - totalCommitments - amounts.essentials,
        existingCommitments: totalCommitments,
        currentSavingsAllocation: amounts.savings,
        emergencyFundCoverMonths: Number(emergencyMetrics.monthsOfSafetyCurrent),
      },
      estimatedImpact: {
        upfrontCost: tripCost,
        monthlyCommitment: 0,
        totalOwnershipCost: tripCost,
        savingsRateChange: `At your current travel allocation of ${formatINR(travelAllocationMonthly)}/month, you accumulate the full cost in ${monthsToAccumulate} months.`,
        timeToRecoverMonths: monthsToAccumulate,
      },
      benefits: {
        practical: [
          'Rest, mental rejuvenation, cultural exploration, and quality time with loved ones.',
          'Prevents burnout and boosts long-term career productivity.',
        ],
        financial: [
          'No recurring debt or interest payments if paid from your designated Travel Fund.',
          'Experiential asset that enriches life without lingering liabilities.',
        ],
      },
      risks: [
        'Booking on credit card EMI without dedicated savings adds 16-24% annual financing cost.',
        'Vacations often encounter 15-20% unexpected incidental costs (local transit, food, visas).',
        'Should never compromise emergency fund reserves.',
      ],
      alternatives: [
        {
          title: 'Travel in Shoulder Season (Save 25-35%)',
          description: 'Scheduling your trip just before or after the peak tourist window cuts flight and hotel tariffs substantially.',
          financialDiff: `Saves approx ${formatINR(Math.round(tripCost * 0.25))}`,
          recommendation: 'Smartest travel planning strategy.',
        },
        {
          title: 'Book 3-4 Months in Advance',
          description: 'Lock in flights and domestic stays early to avoid surge booking prices while accumulating monthly travel savings.',
          financialDiff: 'Avoids last-minute surge pricing of 20-40%',
          recommendation: 'Highly recommended.',
        },
      ],
      finalRecommendation: isReadyNow
        ? `Pack your bags! Your dedicated Travel Fund has already accumulated the necessary funds, so this trip does not harm your savings or emergency readiness.`
        : `This ${formatINR(tripCost)} trip is a wonderful goal, but we recommend waiting ${monthsToAccumulate} months so it is fully funded by your monthly Travel Fund (${formatINR(travelAllocationMonthly)}/mo) rather than taking debt or dipping into savings.`,
      actionPlan: [
        `1. Automate your monthly ${formatINR(travelAllocationMonthly)} travel allocation to a separate high-yield savings account or liquid fund.`,
        `2. Keep a 15% buffer (${formatINR(Math.round(tripCost * 0.15))}) for miscellaneous expenses and travel insurance.`,
        `3. Avoid converting travel expenses to credit card EMIs.`,
      ],
      assumptions: [
        `Estimated all-inclusive trip cost: ${formatINR(tripCost)}`,
        `Funded via monthly travel allocation of ${formatINR(travelAllocationMonthly)}/month`,
      ],
    };
  }

  // 5. PERSONAL LOAN / BORROWING
  if (lower.includes('loan') || lower.includes('borrow') || lower.includes('debt') || lower.includes('emi')) {
    const loanAmount = parameters?.itemCost || 200000;
    const loanRate = parameters?.loanRate || 14.5; // Personal loan rates in India 12-18%
    const tenureMonths = parameters?.loanTenureMonths || 24;

    const loanDetails = calculateLoanEMI(loanAmount, loanRate, tenureMonths);
    const emiToIncomeRatio = (loanDetails.emi / income) * 100;

    let verdict: DecisionReport['verdict'] = 'Risky Financial Decision';
    let tone: DecisionReport['verdictTone'] = 'warning';

    if (emiToIncomeRatio > 25 || loanRate > 15) {
      verdict = 'Not Financially Advisable Right Now';
      tone = 'danger';
    } else if (emiToIncomeRatio < 10) {
      verdict = 'Affordable, But Consider Waiting';
      tone = 'moderate';
    }

    return {
      id,
      timestamp,
      question: query,
      category: 'loan',
      verdict,
      verdictTone: tone,
      financialOverview: {
        monthlyIncome: income,
        disposableIncome: income - totalCommitments - amounts.essentials,
        existingCommitments: totalCommitments,
        currentSavingsAllocation: amounts.savings,
        emergencyFundCoverMonths: Number(emergencyMetrics.monthsOfSafetyCurrent),
      },
      estimatedImpact: {
        upfrontCost: 0,
        monthlyCommitment: loanDetails.emi,
        totalInterestPaid: loanDetails.totalInterest,
        totalOwnershipCost: loanDetails.totalPayment,
        savingsRateChange: `Monthly EMI of ${formatINR(loanDetails.emi)} will eat up ${emiToIncomeRatio.toFixed(1)}% of your monthly salary for ${tenureMonths} months.`,
        emiToIncomeRatio: Math.round(emiToIncomeRatio),
        timeToRecoverMonths: tenureMonths,
      },
      benefits: {
        practical: [
          'Immediate access to capital for critical emergencies, medical situations, or high-ROI debt consolidation.',
        ],
        financial: [
          'Can consolidate high-interest credit card revolving debt (typically 36-42% APR) into a lower rate.',
        ],
      },
      risks: [
        `Unsecured personal loans carry steep interest rates (~${loanRate}% p.a.).`,
        `You will pay ${formatINR(loanDetails.totalInterest)} purely in non-recoverable interest.`,
        `Reduces your monthly cash cushion by ${formatINR(loanDetails.emi)} every single month.`,
      ],
      alternatives: [
        {
          title: 'Liquidate Low-Yield Deposits or Gold Loan',
          description: 'A gold loan or loan against mutual funds/PPF typically charges 8.5% - 10.5%, significantly lower than unsecured personal loans.',
          financialDiff: `Saves approx ${formatINR(Math.round(loanDetails.totalInterest * 0.4))} in interest`,
          recommendation: 'Check collateral-backed alternatives first.',
        },
        {
          title: 'Pause Discretionary Spending for 4 Months',
          description: 'Redirecting Lifestyle and Travel allocations can raise a substantial portion of this capital without any debt.',
          financialDiff: 'Zero interest, zero debt liabilities',
          recommendation: 'Recommended if the expense is non-emergency.',
        },
      ],
      finalRecommendation: `Personal loans at ~${loanRate}% carry heavy financial friction. Unless this is an urgent unavoidable emergency, avoid taking on a ${formatINR(loanDetails.emi)}/mo commitment that drains ${formatINR(loanDetails.totalInterest)} in interest.`,
      actionPlan: [
        `1. Check if the requirement can be staggered or postponed.`,
        `2. If urgent, compare loan offers on aggregator platforms and check processing fee caps (aim for < 1%).`,
        `3. Ensure the loan terms allow penalty-free foreclosure after 6 or 12 months.`,
      ],
      assumptions: [
        `Loan principal: ${formatINR(loanAmount)}`,
        `Interest rate: ${loanRate}% p.a. over ${tenureMonths} months`,
      ],
    };
  }

  // 6. DEFAULT / GENERAL FINANCIAL QUESTION (e.g. "How much will I save?", "Am I saving enough?")
  const annualSavings = amounts.savings * 12;
  const savingsRate = profile.allocations.savings;

  return {
    id,
    timestamp,
    question: query,
    category: 'savings',
    verdict: savingsRate >= 20 ? 'Good Financial Decision' : 'Affordable, But Consider Waiting',
    verdictTone: savingsRate >= 20 ? 'positive' : 'moderate',
    financialOverview: {
      monthlyIncome: income,
      disposableIncome: income - totalCommitments - amounts.essentials,
      existingCommitments: totalCommitments,
      currentSavingsAllocation: amounts.savings,
      emergencyFundCoverMonths: Number(emergencyMetrics.monthsOfSafetyCurrent),
    },
    estimatedImpact: {
      upfrontCost: 0,
      monthlyCommitment: amounts.savings,
      totalOwnershipCost: 0,
      savingsRateChange: `You are saving ${savingsRate}% (${formatINR(amounts.savings)}/month). In 12 months, this accumulates to ${formatINR(annualSavings)}.`,
      timeToRecoverMonths: 12,
    },
    benefits: {
      practical: [
        'Disciplined wealth building without feeling deprived in day-to-day lifestyle.',
        'Compounding growth shields your future against inflation and uncertainties.',
      ],
      financial: [
        `At ₹${amounts.savings.toLocaleString('en-IN')}/month, you will accumulate ${formatINR(annualSavings)} in 1 year and ${formatINR(annualSavings * 3)} in 3 years (principal only).`,
        'Consistent savings creates capital to invest in index funds, PPF, or gold.',
      ],
    },
    risks: [
      'Keeping savings in a basic 2.5-3% savings account loses purchasing power to inflation (~5-6%).',
      'Ensure emergency buffer is liquid before locking funds into illiquid investments.',
    ],
    alternatives: [
      {
        title: 'Step-Up Savings by 10% Annually',
        description: 'Increase your monthly savings amount whenever your salary increases to avoid lifestyle creep.',
        financialDiff: 'Accelerates financial independence by 4-6 years',
        recommendation: 'Highly Recommended practice.',
      },
      {
        title: 'Automate Salary-Day SIPs',
        description: 'Schedule automated investments on the 1st or 2nd of every month so you invest before spending.',
        financialDiff: 'Guarantees disciplined execution',
        recommendation: 'Gold standard personal finance rule.',
      },
    ],
    finalRecommendation: savingsRate >= 20
      ? `Your savings allocation of ${savingsRate}% (${formatINR(amounts.savings)}/month) is strong and adheres to the best 50/30/20 financial principles. Continue this steady pace and ensure your emergency fund is fully fortified.`
      : `You are currently allocating ${savingsRate}% (${formatINR(amounts.savings)}/month) to savings. Aiming to gradually step this up to 20% (${formatINR(income * 0.2)}/mo) will build a much stronger future safety net.`,
    actionPlan: [
      `1. Keep emergency savings in high-yield liquid instruments (auto-sweep FD or liquid mutual fund).`,
      `2. Allocate your ${formatINR(amounts.savings)} monthly savings into diversified long-term instruments.`,
      `3. Review and rebalance your SpendSense categories every quarter.`,
    ],
    assumptions: [
      `Monthly income: ${formatINR(income)}`,
      `Monthly savings allocation: ${savingsRate}% (${formatINR(amounts.savings)})`,
      `Projections assume regular contributions with zero withdrawals.`,
    ],
  };
}
