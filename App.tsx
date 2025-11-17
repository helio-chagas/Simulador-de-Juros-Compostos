
import React, { useState, useCallback } from 'react';
import type { CalculationResult, CalculatorInputs, AnnualData } from './types';
import { CalculatorForm } from './components/CalculatorForm';
import { ResultsDisplay } from './components/ResultsDisplay';

const TARGET_GOAL = 1000000;

// Helper to avoid floating point issues
const round = (num: number) => Math.round(num * 100) / 100;

const calculateInvestment = (inputs: CalculatorInputs): CalculationResult | null => {
    const { calculationType, initialValue, monthlyValue, interestRate, ratePeriod, timeInYears } = inputs;
    
    if (interestRate <= 0) return null;

    const monthlyInterestRate = ratePeriod === 'annual'
        ? Math.pow(1 + interestRate / 100, 1 / 12) - 1
        : interestRate / 100;

    if (monthlyInterestRate <= 0) return null;

    let balance = initialValue;
    let totalInvested = initialValue;
    let months = 0;
    const evolutionData: AnnualData[] = [];
    let lastYearBalance = initialValue;
    let lastYearTotalInvested = initialValue;

    if (calculationType === 'time') {
        if (monthlyValue <= 0 && initialValue < TARGET_GOAL) return null; // Avoid infinite loop
        
        while (balance < TARGET_GOAL) {
            balance += balance * monthlyInterestRate;
            balance += monthlyValue;
            totalInvested += monthlyValue;
            months++;

            if (months % 12 === 0) {
                const year = months / 12;
                const currentTotalInterest = balance - totalInvested;
                const lastYearTotalInterest = lastYearBalance - lastYearTotalInvested;

                evolutionData.push({
                    year,
                    annualInvestment: totalInvested - lastYearTotalInvested,
                    yearInterest: currentTotalInterest - lastYearTotalInterest,
                    totalInvested,
                    totalInterest: currentTotalInterest,
                    totalAccumulated: balance,
                });
                lastYearBalance = balance;
                lastYearTotalInvested = totalInvested;
            }
             if (months > 1200) return null; // Safety break after 100 years
        }

        if (months % 12 !== 0) {
            const year = Math.ceil(months / 12);
            const currentTotalInterest = balance - totalInvested;
            const lastYearTotalInterest = lastYearBalance - lastYearTotalInvested;

            evolutionData.push({
                year,
                annualInvestment: totalInvested - lastYearTotalInvested,
                yearInterest: currentTotalInterest - lastYearTotalInterest,
                totalInvested,
                totalInterest: currentTotalInterest,
                totalAccumulated: balance,
            });
        }

        return {
            yearsToGoal: Math.floor(months / 12),
            monthsToGoal: months % 12,
            finalTotalValue: round(balance),
            totalInvested: round(totalInvested),
            totalInterest: round(balance - totalInvested),
            evolutionData
        };

    } else { // calculationType === 'contribution'
        const totalMonths = timeInYears * 12;
        if (totalMonths <= 0) return null;

        const futureValueFactor = Math.pow(1 + monthlyInterestRate, totalMonths);
        const fvOfInitial = initialValue * futureValueFactor;
        const fvOfAnnuityFactor = (futureValueFactor - 1) / monthlyInterestRate;
        
        const monthlyContributionNeeded = (TARGET_GOAL - fvOfInitial) / fvOfAnnuityFactor;

        if (monthlyContributionNeeded < 0) return null; // Goal already met
        
        // Now simulate with the calculated monthly contribution
        balance = initialValue;
        totalInvested = initialValue;
        
        for (let m = 1; m <= totalMonths; m++) {
            balance += balance * monthlyInterestRate;
            balance += monthlyContributionNeeded;
            totalInvested += monthlyContributionNeeded;

            if (m % 12 === 0) {
                 const year = m / 12;
                const currentTotalInterest = balance - totalInvested;
                const lastYearTotalInterest = lastYearBalance - lastYearTotalInvested;
                
                evolutionData.push({
                    year,
                    annualInvestment: totalInvested - lastYearTotalInvested,
                    yearInterest: currentTotalInterest - lastYearTotalInterest,
                    totalInvested,
                    totalInterest: currentTotalInterest,
                    totalAccumulated: balance,
                });
                lastYearBalance = balance;
                lastYearTotalInvested = totalInvested;
            }
        }

        return {
            yearsToGoal: timeInYears,
            finalTotalValue: round(balance),
            totalInvested: round(totalInvested),
            totalInterest: round(balance - totalInvested),
            monthlyContributionNeeded: round(monthlyContributionNeeded),
            evolutionData,
        };
    }
};


const HowToUse: React.FC = () => (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Como usar a Calculadora</h2>
        <p className="text-gray-600 mb-6">Siga os passos abaixo para simular seu caminho até o primeiro milhão.</p>
        <ol className="list-decimal list-inside space-y-4 text-gray-700">
            <li>
                <span className="font-semibold">Escolha o tipo de cálculo:</span>
                <ul className="list-disc list-inside ml-4 mt-2 text-sm text-gray-600 space-y-1">
                    <li><span className="font-semibold">Calcular prazo:</span> Descubra quanto tempo levará para atingir R$ 1 milhão.</li>
                    <li><span className="font-semibold">Calcular aporte:</span> Descubra quanto precisa investir mensalmente para atingir a meta em um prazo definido.</li>
                </ul>
            </li>
            <li>
                <span className="font-semibold">Informe o valor inicial:</span> Digite o valor que você já possui investido. Se estiver começando do zero, pode deixar em R$ 0,00.
            </li>
             <li>
                <span className="font-semibold">Configure os aportes ou o prazo:</span>
                <ul className="list-disc list-inside ml-4 mt-2 text-sm text-gray-600 space-y-1">
                    <li>Se escolheu “Calcular prazo”, informe quanto pretende investir por mês.</li>
                    <li>Se escolheu “Calcular aporte”, informe em quantos anos quer atingir a meta.</li>
                </ul>
            </li>
            <li>
                <span className="font-semibold">Defina a taxa de juros:</span> Informe a rentabilidade esperada para seus investimentos (anual ou mensal). Uma referência conservadora é de 8% ao ano.
            </li>
            <li>
                <span className="font-semibold">Clique em “Calcular”:</span> O resultado completo aparecerá abaixo com gráficos e tabelas detalhadas.
            </li>
        </ol>
    </div>
);


const App: React.FC = () => {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currentCalcType, setCurrentCalcType] = useState<string>('time');

  const handleCalculate = useCallback((inputs: CalculatorInputs) => {
    const calculationResult = calculateInvestment(inputs);
    setResult(calculationResult);
    setCurrentCalcType(inputs.calculationType);
  }, []);

  const handleClear = useCallback(() => {
    setResult(null);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700">Simulador de Juros Compostos</h1>
        <p className="text-lg text-gray-600 mt-2">Planeje sua jornada para o primeiro milhão</p>
      </header>
      
      <main className="max-w-4xl mx-auto">
        <CalculatorForm onCalculate={handleCalculate} onClear={handleClear} />
        {result ? (
          <ResultsDisplay result={result} calculationType={currentCalcType} />
        ) : (
          <HowToUse />
        )}
      </main>
      <footer className="text-center mt-12 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Calculadora do Primeiro Milhão. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;