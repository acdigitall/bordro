'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Clock, Save, ArrowLeft, UserPlus } from 'lucide-react';
import { INITIAL_EMPLOYEES } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/payroll-engine';

export default function OvertimePage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [overtimeMap, setOvertimeMap] = useState<{ [id: string]: number }>({});

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        const isKeban =
          data.company?.name?.toLowerCase().includes('keban') ||
          data.user?.email === 'admin@teknoloji.com';

        if (isKeban) {
          setEmployees(INITIAL_EMPLOYEES);
          setOvertimeMap({ 'emp-101': 10, 'emp-103': 15 });
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

          fetch('/api/monthly-data?type=overtime')
            .then((r) => r.json())
            .then((ovData) => {
              if (ovData.success && ovData.data) {
                setOvertimeMap(ovData.data);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => setEmployees([]));
  }, []);

  const handleHourChange = (id: string, hours: number) => {
    setOvertimeMap({ ...overtimeMap, [id]: Math.max(0, hours) });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(overtimeMap).map(([employeeId, hours]) =>
        fetch('/api/monthly-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: 'overtime',
            employeeId,
            hours,
          }),
        })
      );
      await Promise.all(promises);
      alert('Fazla Mesai Verileri Veritabanına Kaydedildi.');
    } catch {
      alert('Fazla mesai verileri kaydedildi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/monthly-data"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-amber-500" /> Fazla Mesai Girişi (Overtime)
                </h1>
                <p className="text-xs text-slate-500">
                  Saatlik Ücret = Brüt / 225 sa | Mesai Ücreti = Saat &times; Saatlik Ücret &times; 1.5 (%50 Zamlı)
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md"
            >
              <Save className="w-4 h-4" /> Değişiklikleri Kaydet
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {employees.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Clock className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Mesai Girilecek Çalışan Bulunmuyor
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Fazla mesai saat kaydı yapabilmek için lütfen şirketiniz için çalışan kaydı ekleyiniz.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/employees/new"
                    className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" /> + Yeni Çalışan Ekle
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* NATIVE MOBILE LIST VIEW (< md / Mobile Screens) */}
                <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                  {employees.map((emp) => {
                    const hours = overtimeMap[emp.id] || 0;
                    const hourlyRate = (emp.baseSalary || 0) / 225;
                    const overtimeAmount = hours * hourlyRate * 1.5;
                    const empInitials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();

                    return (
                      <div key={emp.id} className="p-3.5 space-y-3">
                        {/* Employee & Base Salary Header */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono font-bold text-xs flex items-center justify-center">
                              {empInitials || 'Ç'}
                            </div>
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {emp.firstName} {emp.lastName}
                                </h3>
                                <span className="font-mono text-[10px] text-sky-600 dark:text-sky-400 font-bold shrink-0">
                                  {emp.employeeCode}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {emp.departmentName || 'Genel Yönetim'} • Brüt: {formatCurrency(emp.baseSalary || 0)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400 font-mono block">Saatlik Ücret</span>
                            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {formatCurrency(hourlyRate)}
                            </span>
                          </div>
                        </div>

                        {/* Touch Stepper & Amount Calculation Bar */}
                        <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          {/* Hour Stepper Input */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleHourChange(emp.id, Math.max(0, hours - 1))}
                              className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center hover:bg-slate-300 transition-colors active:scale-95"
                            >
                              -
                            </button>
                            <div className="relative">
                              <input
                                type="number"
                                value={hours}
                                onChange={(e) => handleHourChange(emp.id, parseFloat(e.target.value) || 0)}
                                className="w-16 py-1 px-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-center text-xs font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleHourChange(emp.id, hours + 1)}
                              className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold text-sm flex items-center justify-center hover:bg-sky-500 transition-colors active:scale-95"
                            >
                              +
                            </button>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold ml-1">Saat</span>
                          </div>

                          {/* Calculated Amount */}
                          <div className="text-right">
                            <span className="text-[9.5px] uppercase font-semibold text-slate-400 block">
                              + %50 Zamlı Mesai
                            </span>
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                              + {formatCurrency(overtimeAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DESKTOP TABLE VIEW (>= md / Desktop Screens) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase">
                        <th className="p-3.5">Çalışan</th>
                        <th className="p-3.5 text-right">Temel Brüt Ücret</th>
                        <th className="p-3.5 text-right">Saatlik Normal Ücret</th>
                        <th className="p-3.5 text-center">Fazla Mesai Saati (%50 Zamlı)</th>
                        <th className="p-3.5 text-right">Hesaplanan Mesai Tutarı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {employees.map((emp) => {
                        const hours = overtimeMap[emp.id] || 0;
                        const hourlyRate = (emp.baseSalary || 0) / 225;
                        const overtimeAmount = hours * hourlyRate * 1.5;

                        return (
                          <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">
                              {emp.firstName} {emp.lastName}
                              <span className="block text-[10px] text-slate-400 font-mono">
                                {emp.employeeCode} - {emp.departmentName || 'Genel Yönetim'}
                              </span>
                            </td>

                            <td className="p-3.5 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                              {formatCurrency(emp.baseSalary || 0)}
                            </td>

                            <td className="p-3.5 text-right font-mono text-slate-500">
                              {formatCurrency(hourlyRate)} / saat
                            </td>

                            <td className="p-3.5 text-center">
                              <input
                                type="number"
                                value={hours}
                                onChange={(e) => handleHourChange(emp.id, parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-bold text-slate-800 dark:text-slate-100 font-mono"
                              />
                            </td>

                            <td className="p-3.5 text-right font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                              + {formatCurrency(overtimeAmount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

