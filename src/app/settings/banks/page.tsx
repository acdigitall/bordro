'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Building2, Plus, CreditCard, CheckCircle2 } from 'lucide-react';

export default function BankSettingsPage() {
  const [banks, setBanks] = useState([
    { id: 'b1', name: 'Garanti BBVA', branch: 'Keban Şubesi (Code: 1042)', iban: 'TR14 0006 2000 0000 0012 3456 78', isDefault: true },
    { id: 'b2', name: 'Türkiye İş Bankası', branch: 'Merkez Şube (Code: 1001)', iban: 'TR42 0006 4000 0000 0098 7654 32', isDefault: false },
  ]);

  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [iban, setIban] = useState('');

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !iban) return;
    setBanks([
      ...banks,
      {
        id: `b-${Date.now()}`,
        name: bankName,
        branch: branch || 'Genel Şube',
        iban: iban,
        isDefault: false,
      },
    ]);
    setBankName('');
    setBranch('');
    setIban('');
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
                <CreditCard className="w-5 h-5 text-slate-600 dark:text-slate-400" /> Şirket Banka & IBAN Tanımları
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Toplu maaş ödemeleri ve EFT/Havale kaynak banka hesap yöneticisi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="b2b-card p-4 rounded-lg space-y-4 h-fit">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
                Yeni Banka Hesabı Ekle
              </h2>
              <form onSubmit={handleAddBank} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Banka Adı (Örn: Garanti, Akbank)
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Akbank"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Şube Adı & Kodu
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="Kadıköy Şubesi (102)"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Şirket IBAN No
                  </label>
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono uppercase focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Banka Hesabını Kaydet
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-3">
              {banks.map((b) => (
                <div key={b.id} className="b2b-card p-4 rounded-lg flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {b.name}
                      </h3>
                      {b.isDefault && (
                        <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Varsayılan Ödeme Hesabı
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{b.branch}</p>
                    <p className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 pt-1">
                      {b.iban}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
