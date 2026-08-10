'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { INITIAL_EMPLOYEES } from '@/lib/mock-data';
import { formatCurrency, calculatePayroll } from '@/lib/payroll-engine';

export default function ApprovePayrollPage() {
  const router = useRouter();
  const [approved, setApproved] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        const isKeban =
          data.company?.name?.toLowerCase().includes('keban') ||
          data.user?.email === 'admin@teknoloji.com';

        if (isKeban) {
          setEmployees(INITIAL_EMPLOYEES);
        } else {
          fetch('/api/employees')
            .then((r) => r.json())
            .then((empData) => {
              if (empData.success && Array.isArray(empData.employees) && empData.employees.length > 0) {
                setEmployees(empData.employees);
              } else {
                setEmployees([]);
              }
            })
            .catch(() => setEmployees([]));
        }
      })
      .catch(() => setEmployees([]));
  }, []);

  let totalGross = 0;
  let totalNet = 0;
  employees.forEach((e) => {
    const res = calculatePayroll({ baseSalary: e.baseSalary, taxExemptionType: e.taxExemptionType || 'STANDARD' });
    totalGross += res.totalGrossEarnings;
    totalNet += res.netSalary;
  });

  const handleApprove = () => {
    setApproved(true);
    setTimeout(() => {
      router.push('/payroll/authorize');
    }, 1200);
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
                  <FileCheck className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  2. Aşama: Bordro Kontrolü & İdari Onay
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Onaylandıktan sonra bu ay için mesai, prim ve kesinti veri girişleri dondurulur
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/payroll/run"
                  className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> 1. Aşamaya Dön
                </Link>

                <button
                  onClick={handleApprove}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Bordroyu Onayla
                </button>
              </div>
            </div>

            {/* Stepper Steps */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="py-2 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1. Hazırlandı
              </div>
              <div className="py-2 rounded bg-sky-600 text-white flex items-center justify-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-white text-sky-700 text-[10px] flex items-center justify-center font-bold">2</span>
                2. Onayla (Aktif)
              </div>
              <div className="py-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 text-[10px] flex items-center justify-center font-bold">3</span>
                3. Yetkilendir & Kilitle
              </div>
            </div>
          </div>

          {/* Audit Notice Box */}
          <div className="b2b-card p-5 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Onay Öncesi İcmal Özeti
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Hesaplanan Çalışan</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{employees.length} Personel</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Toplam Brüt Ücret</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm font-mono mt-0.5">{formatCurrency(totalGross)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Toplam Net Ödenecek</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm font-mono mt-0.5">{formatCurrency(totalNet)}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


