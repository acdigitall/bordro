'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { CreditCard, Check, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { INITIAL_PLANS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/payroll-engine';

export default function AdminPlansPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        const isSuper =
          data.user?.role === 'SUPER_ADMIN' ||
          data.user?.email === 'cagataydalaman@outlook.com';

        if (!isSuper) {
          router.push('/dashboard');
        } else {
          setAuthorized(true);
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  if (authorized === null) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center text-slate-500 font-sans text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500 mr-2" />
        Süper Admin Yetkisi Kontrol Ediliyor...
      </div>
    );
  }

  if (!authorized) return null;
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" /> SaaS Abonelik Planları & Fatura Yönetimi
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sistem geneli abonelik paketleri, limitler ve faturalama periyotları
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`b2b-card p-5 rounded-lg space-y-4 flex flex-col justify-between ${
                  plan.code === 'PRO' ? 'border-sky-500 shadow-sm' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {plan.name}
                    </h2>
                    {plan.code === 'PRO' && (
                      <span className="text-[10px] bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-bold px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                        Popüler
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                      {formatCurrency(plan.monthlyPrice)}
                    </span>
                    <span className="text-xs text-slate-500 font-normal"> / ay</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Maksimum <b>{plan.maxEmployees} Çalışan</b> desteği</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Tam Otomatik SGK & GV Hesap Motoru</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Banka Ödeme Listeleri & PDF Pusula</span>
                    </div>
                    {plan.code === 'ENTERPRISE' && (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Özel SQL / S3 Yedekleme Desteği</span>
                      </div>
                    )}
                  </div>
                </div>

                <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white text-xs font-semibold rounded transition-colors">
                  Planı Düzenle
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
