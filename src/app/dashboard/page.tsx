'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { PayrollCalculator } from '@/components/payroll-calculator';
import {
  Users,
  PlaySquare,
  FileSpreadsheet,
  AlertTriangle,
  ChevronRight,
  Activity,
  Check,
} from 'lucide-react';
import {
  INITIAL_EMPLOYEES,
  INITIAL_PERIODS,
  INITIAL_AUDIT_LOGS,
} from '@/lib/mock-data';
import { formatCurrency } from '@/lib/payroll-engine';

export default function DashboardPage() {
  const [isKeban, setIsKeban] = useState(false);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [totalGross, setTotalGross] = useState(0);
  const [totalNet, setTotalNet] = useState(0);
  const [totalEmployerCost, setTotalEmployerCost] = useState(0);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        const kebanCheck =
          data.company?.name?.toLowerCase().includes('keban') ||
          data.user?.email === 'admin@teknoloji.com';
        setIsKeban(kebanCheck);

        if (kebanCheck) {
          const currentPeriod = INITIAL_PERIODS[0];
          setEmployeeCount(INITIAL_EMPLOYEES.length);
          setTotalGross(currentPeriod.totalGross);
          setTotalNet(currentPeriod.totalNet);
          setTotalEmployerCost(currentPeriod.totalEmployerCost);
          setAuditLogs(INITIAL_AUDIT_LOGS);
        } else {
          // Fetch real employees for non-Keban company
          fetch('/api/employees')
            .then((r) => r.json())
            .then((empData) => {
              if (empData.success && Array.isArray(empData.employees)) {
                const emps = empData.employees;
                setEmployeeCount(emps.length);
                const gross = emps.reduce((acc: number, e: any) => acc + (e.baseSalary || 0), 0);
                const net = gross * 0.72; // Appx net
                const cost = gross * 1.225; // Appx employer cost
                setTotalGross(gross);
                setTotalNet(net);
                setTotalEmployerCost(cost);
              } else {
                setEmployeeCount(0);
                setTotalGross(0);
                setTotalNet(0);
                setTotalEmployerCost(0);
              }
            })
            .catch(() => {
              setEmployeeCount(0);
            });
          setAuditLogs([]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Key Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="b2b-card b2b-card-hover p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Toplam Çalışan
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  {employeeCount > 0 ? `+${employeeCount} Aktif` : 'Çalışan Yok'}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {employeeCount}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Personel</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="b2b-card b2b-card-hover p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Ağustos Brüt Toplamı
                </span>
                <span className="text-[11px] font-mono text-slate-400">Dönem</span>
              </div>
              <div className="mt-2">
                <h3 className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {formatCurrency(totalGross)}
                </h3>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="b2b-card b2b-card-hover p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Ödenecek Net Maaş
                </span>
                <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                  {employeeCount > 0 ? 'Banka Listesi Hazır' : 'Hesaplama Bekleniyor'}
                </span>
              </div>
              <div className="mt-2">
                <h3 className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalNet)}
                </h3>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="b2b-card b2b-card-hover p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  İşveren Maliyeti
                </span>
                <span className="text-[11px] font-mono text-slate-400">Brüt + SGK</span>
              </div>
              <div className="mt-2">
                <h3 className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {formatCurrency(totalEmployerCost)}
                </h3>
              </div>
            </div>
          </div>

          {/* 3-Column Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Setup Status & System Alerts (3 Cols) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="b2b-card rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Sistem Durumu
                  </h3>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                    Tamamlandı
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-600 dark:text-slate-300">Şirket Bilgileri</span>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-600 dark:text-slate-300">Departmanlar</span>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-600 dark:text-slate-300">Vergi / SGK Oranları</span>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600 dark:text-slate-300">Banka IBAN'ları</span>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                </div>

                <Link
                  href="/setup-wizard"
                  className="block text-center py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700 mt-2"
                >
                  Sihirbazı Çalıştır
                </Link>
              </div>

              {/* Alert Callout */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-3.5 rounded-lg space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Dönem Uyarısı
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400/90 leading-normal">
                  Ağustos 2026 bordrosu henüz <span className="font-semibold">Taslak</span> durumundadır. Ay sonundan önce onaylayıp kilitleyiniz.
                </p>
              </div>
            </div>

            {/* Center Column: Calculator (5 Cols) */}
            <div className="lg:col-span-5">
              <PayrollCalculator />
            </div>

            {/* Right Column: Workflow Actions (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="b2b-card rounded-lg p-4 space-y-3.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Bordro Süreci
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Ağustos 2026
                    </p>
                  </div>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-semibold px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                    Taslak
                  </span>
                </div>

                {/* Stepper */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-semibold">
                  <div className="py-1.5 rounded bg-sky-600 text-white">
                    1. Hazırla
                  </div>
                  <div className="py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
                    2. Onayla
                  </div>
                  <div className="py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
                    3. Kilitle
                  </div>
                </div>

                {/* Workflow Links */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Aylık İşlemler
                  </span>

                  <Link
                    href="/monthly-data/incomes"
                    className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <span>Ek Gelir & İkramiyeler</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    href="/monthly-data/overtime"
                    className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <span>Fazla Mesai Girişi</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    href="/monthly-data/commissions"
                    className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <span>Prim & Komisyonlar</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    href="/monthly-data/loans"
                    className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <span>Avans & Borç Kesintisi</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <Link
                    href="/payroll/run"
                    className="w-full py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <PlaySquare className="w-4 h-4 fill-current" />
                    Bordroyu Hesapla
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Trail List */}
          <div className="b2b-card rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-500" /> İşlem Günlüğü (Audit Log)
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Multi-Tenant Log</span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                Henüz kayıtlı işlem günlüğü bulunmuyor.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold text-[11px] flex items-center justify-center">
                        {log.userRole === 'SUPER_ADMIN' ? 'SA' : 'TA'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{log.action}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{log.userName}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {log.createdAt}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}



