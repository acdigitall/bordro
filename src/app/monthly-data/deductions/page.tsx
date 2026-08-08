'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { ShieldAlert, Plus, Trash2 } from 'lucide-react';
import { INITIAL_EMPLOYEES } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/payroll-engine';

export default function MonthlyDeductionsPage() {
  const [deductions, setDeductions] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [type, setType] = useState('İcra Kesintisi (1/4)');
  const [fileNo, setFileNo] = useState('2026/1458 Esas');
  const [amount, setAmount] = useState<number>(4000);
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
          setDeductions([
            { id: '1', name: 'Ahmet Yılmaz', type: 'İcra Kesintisi (1/4)', fileNo: '2025/4821 Esas', amount: 8250 },
            { id: '2', name: 'Zeynep Kaya', type: 'Eksik Gün Kesintisi', fileNo: '2 Gün Mazeretsiz', amount: 3333 },
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

          fetch('/api/monthly-data?type=deductions')
            .then((r) => r.json())
            .then((dedData) => {
              if (dedData.success && Array.isArray(dedData.data)) {
                setDeductions(dedData.data);
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
          category: 'deductions',
          employeeId: selectedEmp,
          type,
          amount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kayıt başarısız.');

      if (data.item) {
        setDeductions([{ ...data.item, fileNo: 'Manuel Kayıt' }, ...deductions]);
      }
    } catch (err: any) {
      alert(err.message || 'Hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/monthly-data?category=deductions&id=${id}`, { method: 'DELETE' });
      setDeductions(deductions.filter((d) => d.id !== id));
    } catch {
      setDeductions(deductions.filter((d) => d.id !== id));
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
                <ShieldAlert className="w-5 h-5 text-slate-600 dark:text-slate-400" /> Kesintiler & İcra Dosyaları
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Yasal icra 1/4 kesintileri, disiplin cezaları ve devamsızlık kesintisi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 h-fit">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                Yeni Kesinti Ekle
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

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Kesinti Türü
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-sky-500 cursor-pointer text-xs font-medium"
                  >
                    <option value="İcra Kesintisi">İcra Kesintisi (%25 Yasal Tavan)</option>
                    <option value="Nafaka Borcu">Nafaka Borcu</option>
                    <option value="Şirket Hasar / Disiplin Cezası">Şirket Hasar / Disiplin Cezası</option>
                    <option value="Eksik Gün / Ücretsiz İzin">Eksik Gün / Ücretsiz İzin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    İcra / Dosya No / Açıklama
                  </label>
                  <input
                    type="text"
                    value={fileNo}
                    onChange={(e) => setFileNo(e.target.value)}
                    placeholder="2026/1458 İcra Dairesi..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Kesinti Tutarı (TRY)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    step="100"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={employees.length === 0}
                  className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Kesinti Ekle
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                {deductions.map((d) => (
                  <div key={d.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="overflow-hidden">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {d.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {d.type} {d.fileNo ? `• ${d.fileNo}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
                        - {formatCurrency(d.amount)}
                      </span>

                      <button
                        onClick={() => handleDelete(d.id)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-3">Çalışan</th>
                      <th className="p-3">Kesinti Türü</th>
                      <th className="p-3">Açıklama / Dosya</th>
                      <th className="p-3 text-right">Kesinti Tutarı</th>
                      <th className="p-3 text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {deductions.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {d.name}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {d.type}
                        </td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">
                          {d.fileNo}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                          - {formatCurrency(d.amount)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDelete(d.id)}
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
