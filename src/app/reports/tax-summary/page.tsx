'use client';

import React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { FileSpreadsheet, Download, AlertCircle, TrendingUp } from 'lucide-react';
import { INITIAL_EMPLOYEES } from '@/lib/mock-data';
import { formatCurrency, calculatePayroll } from '@/lib/payroll-engine';

export default function TaxSummaryReportPage() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-sky-600" /> Gelir Vergisi Kümülatif Matrah Takip Raporu
              </h1>
              <p className="text-xs text-slate-500">
                Türkiye Gelir Vergisi kanununa göre yıl boyunca biriken matrah ve dilim ilerlemeleri
              </p>
            </div>

            <button
              onClick={() => alert('Kümülatif Vergi Raporu Excel Olarak İndirildi.')}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <Download className="w-3 h-3" /> Excel İndir
            </button>
          </div>

          {/* Tax Bracket Reference Table */}
          <div className="bg-sky-950/40 border border-sky-800/60 p-4 rounded-xl text-xs space-y-2 text-sky-200">
            <h3 className="font-bold text-sky-300 text-xs">2026 Gelir Vergisi Tarifesi (Ücret Gelirleri):</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px]">
              <div className="p-2 bg-slate-900 rounded">₺110.000'e kadar: %15</div>
              <div className="p-2 bg-slate-900 rounded">₺230.000'e kadar: %20</div>
              <div className="p-2 bg-slate-900 rounded">₺870.000'e kadar: %27</div>
              <div className="p-2 bg-slate-900 rounded">₺3.000.000'a kadar: %35</div>
              <div className="p-2 bg-slate-900 rounded">₺3.000.000 üzeri: %40</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="p-3.5">Çalışan Adı</th>
                  <th className="p-3.5 text-right">Önceki Kümülatif Matrah</th>
                  <th className="p-3.5 text-right">Ağustos GV Matrahı</th>
                  <th className="p-3.5 text-right">Yeni Kümülatif Matrah</th>
                  <th className="p-3.5 text-center">Mevcut Vergi Dilimi</th>
                  <th className="p-3.5 text-right">Ağustos Net Gelir Vergisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {INITIAL_EMPLOYEES.map((emp) => {
                  const res = calculatePayroll({
                    baseSalary: emp.baseSalary,
                    previousCumulativeMatrah: emp.cumulativeMatrah,
                    taxExemptionType: emp.taxExemptionType,
                  });

                  let rateLabel = '%15';
                  if (res.newCumulativeMatrah > 870000) rateLabel = '%35';
                  else if (res.newCumulativeMatrah > 230000) rateLabel = '%27';
                  else if (res.newCumulativeMatrah > 110000) rateLabel = '%20';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-sans font-bold text-slate-800 dark:text-slate-100">
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td className="p-3.5 text-right text-slate-600 dark:text-slate-300">
                        {formatCurrency(res.previousCumulativeMatrah)}
                      </td>
                      <td className="p-3.5 text-right text-slate-800 dark:text-slate-200 font-bold">
                        {formatCurrency(res.incomeTaxMatrah)}
                      </td>
                      <td className="p-3.5 text-right font-black text-sky-600 dark:text-sky-400">
                        {formatCurrency(res.newCumulativeMatrah)}
                      </td>
                      <td className="p-3.5 text-center font-sans">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-bold">
                          {rateLabel}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(res.netIncomeTax)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
