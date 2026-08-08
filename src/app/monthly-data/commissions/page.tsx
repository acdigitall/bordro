'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { TrendingUp, Plus, Trash2 } from 'lucide-react';
import { INITIAL_EMPLOYEES } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/payroll-engine';

export default function MonthlyCommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [sales, setSales] = useState<number>(200000);
  const [rate, setRate] = useState<number>(3);
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
          setCommissions([
            { id: '1', name: 'Zeynep Kaya', sales: 620000, commissionRate: 5, amount: 31000 },
            { id: '2', name: 'Mustafa Şahin', sales: 280000, commissionRate: 4, amount: 11200 },
          ]);
        } else {
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

          fetch('/api/monthly-data?type=commissions')
            .then((r) => r.json())
            .then((commData) => {
              if (commData.success && Array.isArray(commData.data)) {
                setCommissions(commData.data);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !sales || !rate) return;

    setSaving(true);
    try {
      const calcAmount = (sales * rate) / 100;
      const res = await fetch('/api/monthly-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'commissions',
          employeeId: selectedEmp,
          sales,
          rate,
          amount: calcAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kayıt başarısız.');

      if (data.item) {
        setCommissions([{ ...data.item, sales, commissionRate: rate }, ...commissions]);
      }
    } catch (err: any) {
      alert(err.message || 'Hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/monthly-data?category=commissions&id=${id}`, { method: 'DELETE' });
      setCommissions(commissions.filter((c) => c.id !== id));
    } catch {
      setCommissions(commissions.filter((c) => c.id !== id));
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
                <TrendingUp className="w-5 h-5 text-slate-600 dark:text-slate-400" /> Prim & Satış Komisyon Yönetimi
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Satış personelleri kota, ciro gerçekleşme ve hakediş prim hesapları
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 h-fit">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                Prim Hakediş Kaydı Ekle
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-sky-500 cursor-pointer disabled:opacity-50 text-xs font-medium"
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

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Ciro (TRY)
                    </label>
                    <input
                      type="number"
                      value={sales}
                      onChange={(e) => setSales(Number(e.target.value))}
                      step="10000"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold focus:outline-none focus:border-sky-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Komisyon (%)
                    </label>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      step="0.5"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold focus:outline-none focus:border-sky-500 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Hesaplanan Prim:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency((sales * rate) / 100)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Prim Kaydet
                </button>
              </form>
            </div>

            {/* List / Table Section */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              {/* NATIVE MOBILE LIST VIEW (< md / Mobile Screens) */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                {commissions.map((c) => (
                  <div key={c.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="overflow-hidden">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {c.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        Ciro: {formatCurrency(c.sales)} • Oran: %{c.commissionRate || 3}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[9.5px] uppercase font-semibold text-slate-400 block">Top. Prim</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          + {formatCurrency(c.amount || c.totalAmount)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE VIEW (>= md / Desktop Screens) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-3">Çalışan</th>
                      <th className="p-3 text-right">Ciro</th>
                      <th className="p-3 text-center">Oran</th>
                      <th className="p-3 text-right">Top. Prim</th>
                      <th className="p-3 text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {commissions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {c.name}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">
                          {formatCurrency(c.sales)}
                        </td>
                        <td className="p-3 text-center font-mono font-semibold text-sky-600 dark:text-sky-400">
                          %{c.commissionRate || 3}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(c.amount || c.totalAmount)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
