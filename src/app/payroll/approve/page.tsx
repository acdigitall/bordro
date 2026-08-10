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
  Users,
} from 'lucide-react';
import { INITIAL_EMPLOYEES } from '@/lib/mock-data';
import { formatCurrency, calculatePayroll } from '@/lib/payroll-engine';

export default function ApprovePayrollPage() {
  const router = useRouter();
  const [approved, setApproved] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    // Retrieve selected employee IDs from Stage 1
    let selectedIds: string[] = [];
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('payroll_selected_emp_ids_2026-08');
      if (stored) {
        try {
          selectedIds = JSON.parse(stored);
        } catch {}
      }
    }

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        const isKeban =
          data.company?.name?.toLowerCase().includes('keban') ||
          data.user?.email === 'admin@teknoloji.com';

        let rawList = isKeban ? INITIAL_EMPLOYEES : [];

        if (isKeban) {
          if (selectedIds.length > 0) {
            setEmployees(INITIAL_EMPLOYEES.filter((e) => selectedIds.includes(e.id)));
          } else {
            setEmployees(INITIAL_EMPLOYEES);
          }
        } else {
          fetch('/api/employees')
            .then((r) => r.json())
            .then((empData) => {
              if (empData.success && Array.isArray(empData.employees) && empData.employees.length > 0) {
                if (selectedIds.length > 0) {
                  setEmployees(empData.employees.filter((e: any) => selectedIds.includes(e.id)));
                } else {
                  setEmployees(empData.employees);
                }
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
  let totalSgkEmployee = 0;
  let totalEmployerCost = 0;

  employees.forEach((e) => {
    const res = calculatePayroll({ baseSalary: e.baseSalary, taxExemptionType: e.taxExemptionType || 'STANDARD' });
    totalGross += res.totalGrossEarnings;
    totalNet += res.netSalary;
    totalSgkEmployee += res.totalSgkEmployee;
    totalEmployerCost += res.totalEmployerCost;
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
          <div className="b2b-card p-5 rounded-lg space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  2. Aşama: Bordro Kontrolü & İdari Onay
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  1. aşamada seçilen {employees.length} personel için idari kontrol ve onay işlemi
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/payroll/run"
                  className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> 1. Aşamaya Dön (Kişi Seçimi)
                </Link>

                <button
                  onClick={handleApprove}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Bordroyu Onayla ({employees.length} Kişi)
                </button>
              </div>
            </div>

            {/* Stepper Steps */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="py-2 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1. Kişiler Seçildi
              </div>
              <div className="py-2 rounded bg-sky-600 text-white flex items-center justify-center gap-1.5 shadow-xs">
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
          <div className="b2b-card p-5 rounded-lg space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Onay Öncesi Seçili Personel İcmal Özeti
              </div>
              <span className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                Seçili {employees.length} Personel
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Onaylanacak Çalışan</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-base mt-0.5 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  {employees.length} Personel
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Seçili Toplam Brüt Ücret</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-base font-mono mt-0.5">{formatCurrency(totalGross)}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Seçili Toplam Net Ödenecek</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-base font-mono mt-0.5">{formatCurrency(totalNet)}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Seçili İşveren Maliyeti</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-base font-mono mt-0.5">{formatCurrency(totalEmployerCost)}</p>
              </div>
            </div>

            {approved && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Bordro başarıyla onaylandı! 3. Aşama (Yetkilendir & Kilitle) ekranına yönlendiriliyorsunuz...</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
