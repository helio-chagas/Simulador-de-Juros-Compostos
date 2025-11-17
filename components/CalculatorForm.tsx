import React, { useState } from 'react';
import type { CalculationType, RatePeriod } from '../types';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  prefix?: string;
  suffix?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, prefix, suffix, ...props }) => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-blue-700 focus-within:border-blue-700">
        {prefix && (
          <span className="inline-flex items-center px-3 rounded-l-md border-r border-gray-300 bg-gray-100 text-gray-600 sm:text-sm">
            {prefix}
          </span>
        )}
        <input
          className={`flex-1 block w-full border-0 focus:ring-0 sm:text-sm px-3 py-2 ${prefix ? 'rounded-r-md' : 'rounded-md'}`}
          {...props}
        />
        {suffix}
      </div>
    </div>
  );

interface CurrencyInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ label, value, onChange }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val === '') {
            onChange('0,00');
            return;
        }
        val = val.padStart(3, '0');
        const integerPart = val.slice(0, -2);
        const decimalPart = val.slice(-2);
        const formatted = `${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`;
        onChange(formatted);
    };

    return <Input label={label} prefix="R$" value={value} onChange={handleInputChange} />;
};


interface CalculatorFormProps {
  onCalculate: (inputs: any) => void;
  onClear: () => void;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({ onCalculate, onClear }) => {
  const [calculationType, setCalculationType] = useState<CalculationType>('time');
  const [initialValue, setInitialValue] = useState('0,00');
  const [monthlyValue, setMonthlyValue] = useState('0,00');
  const [interestRate, setInterestRate] = useState('8');
  const [ratePeriod, setRatePeriod] = useState<RatePeriod>('annual');
  const [timeInYears, setTimeInYears] = useState('25');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parseCurrency = (val: string) => parseFloat(val.replace(/\./g, '').replace(',', '.'));
    
    onCalculate({
      calculationType,
      initialValue: parseCurrency(initialValue),
      monthlyValue: calculationType === 'time' ? parseCurrency(monthlyValue) : 0,
      interestRate: parseFloat(interestRate),
      ratePeriod,
      timeInYears: calculationType === 'contribution' ? parseInt(timeInYears, 10) : 0,
    });
  };

  const handleClear = () => {
    setInitialValue('0,00');
    setMonthlyValue('0,00');
    setInterestRate('8');
    setRatePeriod('annual');
    setTimeInYears('25');
    onClear();
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Calculadora do Primeiro Milhão</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="calc-type" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cálculo</label>
            <select
              id="calc-type"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-700 focus:border-blue-700 sm:text-sm rounded-md"
              value={calculationType}
              onChange={(e) => setCalculationType(e.target.value as CalculationType)}
            >
              <option value="time">Calcular prazo para atingir R$ 1 milhão</option>
              <option value="contribution">Calcular aporte para atingir R$ 1 milhão</option>
            </select>
          </div>

          <CurrencyInput label="Valor inicial" value={initialValue} onChange={setInitialValue} />

          {calculationType === 'time' ? (
            <CurrencyInput label="Valor mensal" value={monthlyValue} onChange={setMonthlyValue} />
          ) : (
            <Input label="Prazo (anos)" type="number" value={timeInYears} onChange={(e) => setTimeInYears(e.target.value)} />
          )}

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Taxa de juros</label>
            <div className="flex border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-blue-700 focus-within:border-blue-700">
              <span className="inline-flex items-center px-3 rounded-l-md border-r border-gray-300 bg-gray-100 text-gray-600 sm:text-sm">%</span>
              <input
                type="number"
                step="0.1"
                className="flex-1 block w-full border-0 focus:ring-0 sm:text-sm px-3 py-2"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
              <select
                className="block w-auto pl-3 pr-8 py-2 text-base bg-white border-0 border-l border-gray-300 focus:outline-none focus:ring-0 sm:text-sm rounded-r-md"
                value={ratePeriod}
                onChange={(e) => setRatePeriod(e.target.value as RatePeriod)}
              >
                <option value="annual">anual</option>
                <option value="monthly">mensal</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center space-x-4">
          <button type="submit" className="px-8 py-2 bg-blue-700 text-white font-semibold rounded-md hover:bg-blue-800 transition-colors">
            Calcular
          </button>
          <button type="button" onClick={handleClear} className="px-8 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors">
            Limpar
          </button>
        </div>
      </form>
    </div>
  );
};