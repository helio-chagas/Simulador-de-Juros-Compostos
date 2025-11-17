
import React from 'react';
import type { CalculationResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend as PieLegend, Tooltip as PieTooltip } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatTime = (years: number, months?: number) => {
    const timeParts = [];
    if (years > 0) {
        timeParts.push(`${years} an${years > 1 ? 'os' : 'o'}`);
    }
    if (months && months > 0) {
        timeParts.push(`${months} ${months > 1 ? 'meses' : 'mês'}`);
    }

    if (timeParts.length === 0) return 'Menos de um mês';
    
    return timeParts.join(' e ');
};


const SummaryCards: React.FC<{ result: CalculationResult }> = ({ result }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-blue-700 text-white p-4 rounded-lg shadow-lg text-center">
      <p className="text-sm opacity-90">Valor total final</p>
      <p className="text-2xl font-bold">{formatCurrency(result.finalTotalValue)}</p>
    </div>
    <div className="bg-white p-4 rounded-lg shadow-md text-center">
      <p className="text-sm text-gray-600">Valor total investido</p>
      <p className="text-2xl font-bold text-gray-800">{formatCurrency(result.totalInvested)}</p>
    </div>
    <div className="bg-white p-4 rounded-lg shadow-md text-center">
      <p className="text-sm text-gray-600">Total em juros</p>
      <p className="text-2xl font-bold text-gray-800">{formatCurrency(result.totalInterest)}</p>
    </div>
  </div>
);

const CompositionChart: React.FC<{ result: CalculationResult }> = ({ result }) => {
  const data = [
    { name: 'Valor Investido', value: result.totalInvested },
    { name: 'Total em Juros', value: result.totalInterest },
  ];
  const COLORS = ['#4A5568', '#1D4ED8']; // Gray, Blue-700

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="list-none p-0 m-0 space-y-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-start">
            <svg width="14" height="14" className="mt-1 mr-2">
              <circle cx="7" cy="7" r="7" fill={entry.color} />
            </svg>
            <div>
              <div className="text-gray-700">{entry.value}</div>
              <div className="font-bold text-lg">{formatCurrency(data[index].value)}</div>
              <div className="text-sm text-gray-500">
                {((data[index].value / result.finalTotalValue) * 100).toFixed(1)}% do total
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-xl font-bold text-blue-700 mb-6 text-center">Composição do Primeiro Milhão:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
               <PieTooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col space-y-4">
            <CustomLegend payload={data.map((d, i) => ({ value: d.name, color: COLORS[i]}))} />
            <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center">
              <p className="font-bold text-xl">{((result.totalInterest / result.totalInvested) * 100).toFixed(0)}%</p>
              <p className="text-sm">mais em rendimentos do que investido</p>
            </div>
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-center">
              <p className="font-bold text-xl">{formatTime(result.yearsToGoal, result.monthsToGoal)}</p>
              <p className="text-sm">Tempo para a Meta</p>
            </div>
        </div>
      </div>
    </div>
  );
};

const EvolutionChart: React.FC<{ result: CalculationResult }> = ({ result }) => {
  const chartData = result.evolutionData.map(d => ({
    name: d.year,
    'Total Acumulado': d.totalAccumulated,
    'Valor Investido': d.totalInvested,
    'Total em Juros': d.totalInterest,
  }));

  return (
     <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-xl font-bold text-blue-700 mb-6 text-center">Evolução no Tempo:</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" label={{ value: 'Anos', position: 'insideBottom', offset: -5 }} />
            <YAxis tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <ReferenceLine y={1000000} label={{ value: "Meta R$ 1 Milhão", position: "insideTopLeft" }} stroke="#a0aec0" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="Total Acumulado" stroke="#1D4ED8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="Valor Investido" stroke="#1A202C" strokeWidth={2} />
            <Line type="monotone" dataKey="Total em Juros" stroke="#F59E0B" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AnnualTable: React.FC<{ result: CalculationResult }> = ({ result }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-bold text-blue-700 mb-4 text-center">Detalhamento Anual:</h3>
    <div className="max-h-96 overflow-y-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3">Ano</th>
            <th scope="col" className="px-6 py-3">Investimento Anual</th>
            <th scope="col" className="px-6 py-3">Juros do Ano</th>
            <th scope="col" className="px-6 py-3">Total Investido</th>
            <th scope="col" className="px-6 py-3">Total Juros</th>
            <th scope="col" className="px-6 py-3">Total Acumulado</th>
          </tr>
        </thead>
        <tbody>
          {result.evolutionData.map((row) => (
            <tr key={row.year} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{row.year}</td>
              <td className="px-6 py-4">{formatCurrency(row.annualInvestment)}</td>
              <td className="px-6 py-4">{formatCurrency(row.yearInterest)}</td>
              <td className="px-6 py-4">{formatCurrency(row.totalInvested)}</td>
              <td className="px-6 py-4">{formatCurrency(row.totalInterest)}</td>
              <td className="px-6 py-4 font-semibold text-gray-800">{formatCurrency(row.totalAccumulated)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const ResultsDisplay: React.FC<{ result: CalculationResult; calculationType: string }> = ({ result, calculationType }) => {
  const timeToGoalText = formatTime(result.yearsToGoal, result.monthsToGoal);
  
  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
        <p className="text-2xl text-blue-700 font-bold">
          {calculationType === 'time'
            ? `Você atingirá R$ 1 milhão em ${timeToGoalText}!`
            : `Você precisa investir ${formatCurrency(result.monthlyContributionNeeded || 0)} por mês.`}
        </p>
        <p className="text-gray-800 font-semibold mt-1">
          {calculationType === 'time' 
           ? `Tempo necessário: ${timeToGoalText}`
           : `Para atingir R$ 1 milhão em ${result.yearsToGoal} anos.`}
        </p>
      </div>

      <SummaryCards result={result} />

      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
        <h4 className="font-bold text-amber-800">Considerações Importantes:</h4>
        <ul className="list-disc list-inside text-sm text-amber-700 mt-2 space-y-1">
          <li>Este cálculo não considera imposto de Renda sobre rendimentos.</li>
          <li>A inflação pode reduzir o poder de compra do valor final.</li>
          <li>Rentabilidades podem variar ao longo do tempo.</li>
        </ul>
      </div>

      <CompositionChart result={result} />
      <EvolutionChart result={result} />
      <AnnualTable result={result} />
    </div>
  );
};