'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Calendar, UserCheck, Plus, CheckCircle2, Clock } from 'lucide-react';
import { INITIAL_EMPLOYEES, EmployeeMock } from '@/lib/mock-data';

export default function LeaveManagementPage() {
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

  /**
   * 4857 Sayılı Kanun Madde 53 Yıllık İzin Hakedişi
   */
  const calculateLeaveEntitlement = (hireDateStr: string) => {
    const hire = new Date(hireDateStr);
    const now = new Date();
    const tenureYears = Math.floor((now.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24 * 365));

    if (tenureYears < 1) return { years: 0, days: 0 };
    if (tenureYears >= 1 && tenureYears <= 5) return { years: tenureYears, days: 14 };
    if (tenureYears > 5 && tenureYears < 15) return { years: tenureYears, days: 20 };
    return { years: tenureYears, days: 26 };
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
                <Calendar className="w-5 h-5 text-sky-600" /> Yıllık Ücretli İzin & Kıdem Hakediş Takibi
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                4857 Sayılı İş Kanunu Madde 53 hükümlerine göre kıdem yılı bazlı yıllık izin bakiyeleri
              </p>
            </div>
          </div>

          <div className="b2b-card rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3">Sicil / Personel</th>
                  <th className="p-3">İşe Giriş Tarihi</th>
                  <th className="p-3 text-center">Hizmet Süresi (Kıdem)</th>
                  <th className="p-3 text-center">Yıllık İzin Hakedişi</th>
                  <th className="p-3 text-center">Kullanılan İzin</th>
                  <th className="p-3 text-center">Kalan İzin Bakiyesi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp, index) => {
                  const entitlement = calculateLeaveEntitlement(emp.hireDate);
                  const usedDays = (index + 1) * 3; // Simulated used days
                  const remainingDays = Math.max(0, entitlement.days - usedDays);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <span className="font-mono font-bold text-sky-600 dark:text-sky-400 block">
                          {emp.employeeCode}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {emp.firstName} {emp.lastName}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                        {emp.hireDate}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {entitlement.years} Yıl
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-sky-600 dark:text-sky-400">
                        {entitlement.days} Gün
                      </td>
                      <td className="p-3 text-center font-mono font-semibold text-amber-600 dark:text-amber-400">
                        {usedDays} Gün
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {remainingDays} Gün
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
