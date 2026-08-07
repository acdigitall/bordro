'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { DollarSign, Plus, Save, Trash2 } from 'lucide-react';
import { INITIAL_EMPLOYEES } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/payroll-engine';

export default function MonthlyIncomesPage() {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [incomeType, setIncomeType] = useState('İkramiye');
  const [amount, setAmount] = useState<number>(5000);
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
          setSelectedEmp(INITIAL_EMPLOYEES[0]?.id || '');
          setIncomes([
            { id: '1', employeeId: 'emp-01', name: 'Ahmet Yılmaz', type: 'İkramiye', amount: 15000, isTaxable: true },
            { id: '2', employeeId: 'emp-02', name: 'Ayşe Demir', type: 'Performans Primi', amount: 8500, isTaxable: true },
          ]);
        } else {
          // Fetch employees
          fetch('/api/employees')
            .then((r) => r.json())
            .then((empData) => {
              if (empData.success && Array.isArray(empData.employees) && empData.employees.length > 0) {
                setEmployees(empData.employees);
                setSelectedEmp(empData.employees[0].id);
              } else {
                setEmployees([]);
              }
            })
            .catch(() => setEmployees([]));

          // Fetch incomes from DB
          fetch('/api/monthly-data?type=incomes')
            .then((r) => r.json())
            .then((incData) => {
              if (incData.success && Array.isArray(incData.data)) {
                setIncomes(incData.data);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !amount) return;

    setSaving(true);
    try {
      const res = await fetch('/api/monthly-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'incomes',
          employeeId: selectedEmp,
          type: incomeType,
          amount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kayıt başarısız.');

      if (data.item) {
        setIncomes([data.item, ...incomes]);
      }
    } catch (err: any) {
      alert(err.message || 'Hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/monthly-data?category=incomes&id=${id}`, { method: 'DELETE' });
      setIncomes(incomes.filter((i) => i.id !== id));
    } catch {
      setIncomes(incomes.filter((i) => i.id !== id));
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
                <DollarSign className="w-5 h-5 text-slate-600 dark:text-slate-400" /> Ek Gelir & İkramiye Girişi
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dönemlik brüt ek ödeme, ikramiye ve özel tazminat kayıtları
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="b2b-card p-4 rounded-lg space-y-4 h-fit">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
                Yeni Ek Gelir Ekle
              </h2>
              <form onSubmit={handleAdd} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Çalışan Seçin
                  </label>
                  <select
                    value={selectedEmp}
                    onChange={(e) => setSelectedEmp(e.target.value)}
                    disabled={employees.length === 0}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-sky-500 cursor-pointer disabled:opacity-50"
                  >
                    {employees.length === 0 ? (
                      <option value="">Kayıtlı Çalışan Yok</option>
                    ) : (
                      employees.map((e) => (
                        <option key={e.id} value={e.id} className="bg-white dark:bg-slate-900">
                          {e.firstName} {e.lastName} ({e.employeeCode || 'Sicil'})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Gelir Tipi
                  </label>
                  <select
                    value={incomeType}
                    onChange={(e) => setIncomeType(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="İkramiye">İkramiye</option>
                    <option value="Performans Primi">Performans Primi</option>
                    <option value="Yakacak / Giyim Yardımı">Yakacak / Giyim Yardımı</option>
                    <option value="Kıdem Teşvik Prim">Kıdem Teşvik Prim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Brüt Tutar (TRY)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    step="500"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={employees.length === 0}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Ek Gelir Ekle
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 b2b-card rounded-lg overflow-hidden">
              {incomes.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 font-medium">
                  Bu aya ait kayıtlı ek gelir veya ikramiye bulunmuyor.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-3">Çalışan</th>
                      <th className="p-3">Gelir Tipi</th>
                      <th className="p-3 text-right">Brüt Tutar</th>
                      <th className="p-3 text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {incomes.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {inc.name}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {inc.type}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(inc.amount)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDelete(inc.id)}
                            className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

