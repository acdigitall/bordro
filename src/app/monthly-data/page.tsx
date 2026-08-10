'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  CalendarCheck,
  PlusCircle,
  Clock,
  Award,
  MinusCircle,
  CreditCard,
  ChevronRight,
  Lock,
  ArrowRight,
} from 'lucide-react';

export default function MonthlyDataOverviewPage() {
  const [activePeriod, setActivePeriod] = useState('2026-08');
  const [isPeriodLocked, setIsPeriodLocked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = localStorage.getItem('active_payroll_period') || '2026-08';
      setActivePeriod(p);
      const isLoc = localStorage.getItem(`payroll_status_${p}`) === 'LOCKED';
      setIsPeriodLocked(isLoc);
    }
  }, []);

  const dataModules = [
    {
      title: 'Ek Gelirler (Incomes)',
      desc: 'İkramiye, huzur hakkı, prim dışı ek kazançlar (vergiye tabi seçimi)',
      href: '/monthly-data/incomes',
      icon: PlusCircle,
      color: 'sky',
    },
    {
      title: 'Fazla Mesai (Overtime)',
      desc: 'Çalışan bazlı mesai saati girişi (%50 zamlı otomatik hesap)',
      href: '/monthly-data/overtime',
      icon: Clock,
      color: 'amber',
    },
    {
      title: 'Prim & Komisyon (Commissions)',
      desc: 'Satış primi ve performans komisyon tanımları',
      href: '/monthly-data/commissions',
      icon: Award,
      color: 'emerald',
    },
    {
      title: 'Kesintiler (Deductions)',
      desc: 'İcra kesintisi, nafaka, sendika aidatı, özel sağlık sigortası',
      href: '/monthly-data/deductions',
      icon: MinusCircle,
      color: 'rose',
    },
    {
      title: 'Avans & Borçlar (Loans)',
      desc: 'Çalışana verilen avans ve taksitli maaş düşüm takibi',
      href: '/monthly-data/loans',
      icon: CreditCard,
      color: 'purple',
    },
  ];

  return (
    <div className="flex h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Lock Banner */}
          {isPeriodLocked && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                  🔒 KİLİTLİ DÖNEM
                </span>
                <div>
                  <h4 className="font-bold">{activePeriod} Dönem Veri Girişleri Kilitlenmiştir</h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                    Bu dönemin bordrosu onaylandığı için yeni gelir, mesai veya kesinti eklenemez/silinemez.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('active_payroll_period', '2026-09');
                  }
                  window.location.reload();
                }}
                className="flex items-center justify-center gap-1.5 bg-amber-700 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold px-3.5 py-2 rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                <span>Eylül 2026 Dönemine Geç</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-sky-600 dark:text-sky-400" /> Aylık Veri Giriş Modülleri ({activePeriod})
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Bordro çalıştırılmadan önce o aya ait özel gelir, mesai, prim ve kesintilerin girildiği ekranlar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataModules.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 flex items-center justify-between">
                    {m.title}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{m.desc}</p>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
