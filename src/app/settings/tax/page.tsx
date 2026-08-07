'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Settings, Save, CheckCircle2, Loader2 } from 'lucide-react';
import {
  DEFAULT_MIN_GROSS_WAGE,
  DEFAULT_SGK_CEILING,
  DEFAULT_STAMP_TAX_RATE,
  formatCurrency,
} from '@/lib/payroll-engine';

export default function TaxSettingsPage() {
  const [minWage, setMinWage] = useState(DEFAULT_MIN_GROSS_WAGE);
  const [sgkCeiling, setSgkCeiling] = useState(DEFAULT_SGK_CEILING);
  const [stampRate, setStampRate] = useState(DEFAULT_STAMP_TAX_RATE);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings/tax')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.taxSetting) {
          setMinWage(data.taxSetting.minimumGrossWage || DEFAULT_MIN_GROSS_WAGE);
          setSgkCeiling(data.taxSetting.sgkCeiling || DEFAULT_SGK_CEILING);
          setStampRate(data.taxSetting.stampTaxRate || DEFAULT_STAMP_TAX_RATE);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/settings/tax', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minimumGrossWage: minWage,
          sgkCeiling: sgkCeiling,
          stampTaxRate: stampRate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kaydetme başarısız.');

      setSuccessMsg('2026 Asgari Ücret ve SGK Vergi Ayarları veritabanına başarıyla kaydedildi.');
    } catch (err: any) {
      alert(err.message || 'Ayarlar kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Settings className="w-6 h-6 text-sky-600" /> Vergi & SGK Oran Ayarları (2026)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Şirketiniz için Asgari Ücret, SGK Tavanı ve Gelir Vergisi parametrelerini yönetin
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Ayarları Kaydet (DB)
                </>
              )}
            </button>
          </div>

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2 max-w-3xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-w-3xl shadow-sm">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-xs">
                Temel Asgari Ücret & SGK Taban/Tavan Oranları
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Aylık Brüt Asgari Ücret (TRY) *
                  </label>
                  <input
                    type="number"
                    value={minWage}
                    onChange={(e) => setMinWage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold font-mono text-sky-700 dark:text-sky-400 focus:outline-none focus:border-sky-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Hesaplanan Net Asgari Ücret: <b>{formatCurrency(minWage * 0.85)}</b>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SGK Tavan Ücreti (7.5 Katı) *
                  </label>
                  <input
                    type="number"
                    value={sgkCeiling}
                    onChange={(e) => setSgkCeiling(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Damga Vergisi Oranı
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={stampRate}
                    onChange={(e) => setStampRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-xs">
                SGK Prim Oranları (Kanuni Sabitler)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-500">SGK İşçi Payı:</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-100 block">%14</span>
                </div>
                <div>
                  <span className="text-slate-500">İşsizlik İşçi Payı:</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-100 block">%1</span>
                </div>
                <div>
                  <span className="text-slate-500">SGK İşveren Payı (5 Puan Teşvikli):</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-100 block">%15.5</span>
                </div>
                <div>
                  <span className="text-slate-500">İşsizlik İşveren Payı:</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-100 block">%2</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
