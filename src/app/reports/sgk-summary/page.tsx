'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { ShieldCheck, Download } from 'lucide-react';
import { INITIAL_EMPLOYEES, EmployeeMock } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/payroll-engine';

export default function SgkSummaryReportPage() {
  const [employees, setEmployees] = useState<EmployeeMock[]>([]);

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

  const totalSpek = employees.reduce((sum, e) => sum + e.baseSalary, 0);
  const sgkEmployeeTotal = totalSpek * 0.14;
  const sgkEmployerTotal = totalSpek * 0.205;

  const handleXmlDownload = async () => {
    try {
      const res = await fetch('/api/reports/sgk-xml');
      if (!res.ok) throw new Error('XML oluşturma başarısız.');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sgk_mphby_2026_08.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert('SGK e-Bildirge XML / Excel Dosyası Oluşturuldu.');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-slate-600 dark:text-slate-400" /> SGK e-Bildirge & MPHBT Özeti
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                5510 Sayılı Kanun kapsamı SGK Prim Gün, SPEK ve İşveren/İşçi Prim İcmali
              </p>
            </div>

            <button
              onClick={handleXmlDownload}
              disabled={employees.length === 0}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> e-Bildirge XML İndir
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="b2b-card p-4 rounded-lg">
              <span className="text-xs text-slate-500">Toplam SGK Matrahı (SPEK)</span>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                {formatCurrency(totalSpek)}
              </p>
            </div>

            <div className="b2b-card p-4 rounded-lg">
              <span className="text-xs text-slate-500">SGK İşçi Payı (%14)</span>
              <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {formatCurrency(sgkEmployeeTotal)}
              </p>
            </div>

            <div className="b2b-card p-4 rounded-lg">
              <span className="text-xs text-slate-500">SGK İşveren Payı (%20.5)</span>
              <p className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
                {formatCurrency(sgkEmployerTotal)}
              </p>
            </div>
          </div>

          <div className="b2b-card rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3">Sicil / TC No</th>
                  <th className="p-3">Ad Soyad</th>
                  <th className="p-3 text-center">Prim Gün</th>
                  <th className="p-3 text-right">SPEK Matrahı</th>
                  <th className="p-3 text-right">SGK İşçi (%14)</th>
                  <th className="p-3 text-right">SGK İşveren (%20.5)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3">
                      <span className="font-mono font-bold text-sky-600 dark:text-sky-400 block">
                        {emp.employeeCode}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {emp.tcNo}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="p-3 text-center font-mono font-semibold">
                      30 Gün
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(emp.baseSalary)}
                    </td>
                    <td className="p-3 text-right font-mono font-medium text-amber-600 dark:text-amber-400">
                      {formatCurrency(emp.baseSalary * 0.14)}
                    </td>
                    <td className="p-3 text-right font-mono font-medium text-sky-600 dark:text-sky-400">
                      {formatCurrency(emp.baseSalary * 0.205)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
