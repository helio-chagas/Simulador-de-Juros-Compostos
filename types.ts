
export type CalculationType = 'time' | 'contribution';
export type RatePeriod = 'annual' | 'monthly';

export interface CalculatorInputs {
  calculationType: CalculationType;
  initialValue: number;
  monthlyValue: number;
  interestRate: number;
  ratePeriod: RatePeriod;
  timeInYears: number;
}

export interface AnnualData {
  year: number;
  annualInvestment: number;
  yearInterest: number;
  totalInvested: number;
  totalInterest: number;
  totalAccumulated: number;
}

export interface CalculationResult {
  yearsToGoal: number;
  monthsToGoal?: number;
  finalTotalValue: number;
  totalInvested: number;
  totalInterest: number;
  monthlyContributionNeeded?: number;
  evolutionData: AnnualData[];
}