'use client';

import React, { useState } from 'react';
import { Calculator, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { calculatePayroll, formatCurrency, DEFAULT_MIN_GROSS_WAGE } from '@/lib/payroll-engine';

export function PayrollCalculator() {
  const [grossInput, setGrossInput] = useState<number>(50000);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [extraIncome, setExtraIncome] = useState<number>(0);
  const [prevCumMatrah, setPrevCumMatrah] = useState<number>(150000);
  const [disabilityType, setDisabilityType] = useState<string>('STANDARD');

  const result = calculatePayroll({
    baseSalary: grossInput,
    overtimeHours: overtimeHours,
    totalIncomes: extraIncome,
    previousCumulativeMatrah: prevCumMatrah,
    taxExemptionType: disabilityType,
  });

  const handleMinWageClick = () => {
    setGrossInput(DEFAULT_MIN_GROSS_WAGE);
  };

  return (
    <div className="b2b-card rounded-lg p-4 space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-slate-500" />
          <div>
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Maaş Simülatörü
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Anlık Brüt &rarr; Net Hesaplama Matrisi
            </p>
          </div>
        </div>
        <button
          onClick={handleMinWageClick}
          className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded font-medium border border-slate-200 dark:border-slate-700 transition-colors"
        >
          Asgari Ücret Doldur
        </button>
      </div>

      {/* Input Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Brüt Maaş (TRY)
          </label>
          <input
            type="number"
            value={grossInput || ''}
            onChange={(e) => setGrossInput(parseFloat(e.target.value) || 0)}
            step="500"
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Önceki Kümülatif GV Matrahı
          </label>
          <input
            type="number"
            value={prevCumMatrah || 0}
            onChange={(e) => setPrevCumMatrah(parseFloat(e.target.value) || 0)}
            step="1000"
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono font-medium text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Fazla Mesai Saati (%50 Zamlı)
          </label>
          <input
            type="number"
            value={overtimeHours || 0}
            onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono font-medium text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Engellilik Durumu
          </label>
          <select
            value={disabilityType}
            onChange={(e) => setDisabilityType(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none cursor-pointer"
          >
            <option value="STANDARD" className="bg-white dark:bg-slate-900">Yok (Standart)</option>
            <option value="DISABLED_1" className="bg-white dark:bg-slate-900">1. Derece Engelli (₺6.900 Muaf)</option>
            <option value="DISABLED_2" className="bg-white dark:bg-slate-900">2. Derece Engelli (₺4.000 Muaf)</option>
            <option value="DISABLED_3" className="bg-white dark:bg-slate-900">3. Derece Engelli (₺1.700 Muaf)</option>
          </select>
        </div>
      </div>

      {/* Calculation Breakdown */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3.5 space-y-3 border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">Ele Geçen Net Ücret:</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {formatCurrency(result.netSalary)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Top. Brüt Kazanç:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {formatCurrency(result.totalGrossEarnings)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">SGK İşçi (%15):</span>
            <span className="font-medium text-amber-600 dark:text-amber-400 font-mono">
              - {formatCurrency(result.totalSgkEmployee)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Gelir Vergisi (Net):</span>
            <span className="font-medium text-rose-600 dark:text-rose-400 font-mono">
              - {formatCurrency(result.netIncomeTax)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Damga Vergisi (Net):</span>
            <span className="font-medium text-rose-600 dark:text-rose-400 font-mono">
              - {formatCurrency(result.netStampTax)}
            </span>
          </div>
        </div>

        {/* Min Wage Exemption Callout */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Asgari Ücret Vergi İstisnası:</span>
          <span className="font-semibold font-mono text-slate-700 dark:text-slate-300">
            + {formatCurrency(result.minWageExemptionGV + result.minWageExemptionDV)}
          </span>
        </div>
      </div>
    </div>
  );
}


