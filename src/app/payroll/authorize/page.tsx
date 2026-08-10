'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { INITIAL_EMPLOYEES, INITIAL_BANKS } from '@/lib/mock-data';
import { formatCurrency, calculatePayroll } from '@/lib/payroll-engine';

export default function AuthorizePayrollPage() {
  const [isLocked, setIsLocked] = useState(false);

  let totalNet = 0;
  INITIAL_EMPLOYEES.forEach((e) => {
    const res = calculatePayroll({ baseSalary: e.baseSalary, taxExemptionType: e.taxExemptionType });
    totalNet += res.netSalary;
  });

  const handleAuthorize = () => {
    setIsLocked(true);
  };

  return (
    <div className="flex h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Header & Stepper */}
          <div className="b2b-card p-5 rounded-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  3. Aşama: Yetkilendirme & Dönem Kilidi
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Maaş ödeme yetkisi onaylanır, banka ödeme dosyaları üretilir ve dönem kilitlenir
                </p>
              </div>

              {!isLocked ? (
                <button
                  onClick={handleAuthorize}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded transition-colors shadow-sm"
                >
                  <Lock className="w-4 h-4" /> Yetkilendir & Dönemi Kilitle
                </button>
              ) : (
                <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4" /> Dönem Kilitlendi & Yetkilendirildi
                </span>
              )}
            </div>

            {/* Stepper Steps */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="py-2 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1. Hazırlandı
              </div>
              <div className="py-2 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 2. Onaylandı
              </div>
              <div className={`py-2 rounded text-white flex items-center justify-center gap-1.5 ${isLocked ? 'bg-emerald-600' : 'bg-sky-600'}`}>
                <Lock className="w-4 h-4" /> 3. Yetkilendir & Kilitle (Aktif)
              </div>
            </div>
          </div>

          {/* Generated Documents & Exports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Bank Payment Excel Templates */}
            <div className="b2b-card p-4 rounded-lg space-y-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <FileSpreadsheet className="w-4 h-4 text-slate-500" /> Banka Toplu Ödeme Transfer Dosyaları
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bankaların otomatik internet şubesi toplu ödeme formatında hazırlanmış dosyalar:
              </p>

              <div className="space-y-2 text-xs">
                {INITIAL_BANKS.map((b) => (
                  <div key={b.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{b.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Banka Transfer Disketi (IBAN + Tutar)</span>
                    </div>
                    <button
                      onClick={() => alert(`${b.name} Maaş Transfer Excel Dosyası İndirildi.`)}
                      className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white font-medium px-2.5 py-1 rounded text-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> İndir
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Toplu Payslip PDF Generation */}
            <div className="b2b-card p-4 rounded-lg space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <FileText className="w-4 h-4 text-slate-500" /> Toplu Maaş Pusulaları (Payslip PDF)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tüm çalışanlar için toplu PDF pusula dökümü oluşturun veya e-posta gönderin:
                </p>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Toplam Ödenecek Net Maaş:</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(totalNet)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Personel Sayısı:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{INITIAL_EMPLOYEES.length} Kişi</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => alert('Toplu PDF Maaş Pusulaları Oluşturuldu.')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors mt-4"
              >
                <Download className="w-4 h-4" /> Tüm Maaş Pusulalarını Toplu PDF Olarak İndir
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

