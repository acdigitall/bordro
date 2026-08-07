'use client';

import React from 'react';
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
} from 'lucide-react';

export default function MonthlyDataOverviewPage() {
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-sky-600" /> Aylık Veri Giriş Modülleri
            </h1>
            <p className="text-xs text-slate-500">
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
