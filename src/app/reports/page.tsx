'use client';

import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { FileSpreadsheet, FileText, Banknote, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ReportsMainPage() {
  const reportsList = [
    {
      title: 'Banka Ödeme Listesi',
      desc: 'Toplu banka maaş transfer dosyası (TXT/Excel formatında 0001, 0015 kodlu ödeme disketi).',
      href: '/reports/bank-lists',
      icon: Banknote,
      badge: 'Banka Hazır',
    },
    {
      title: 'Maaş Pusulaları (PDF)',
      desc: 'Çalışan bazında yasal 4857 sayılı İş Kanununa uygun toplu PDF maaş pusulası dökümleri.',
      href: '/reports/payslips',
      icon: FileText,
      badge: 'Toplu PDF',
    },
    {
      title: 'Gelir Vergisi Kümülatif Matrah Özeti',
      desc: 'Çalışanların 2026 yılı kümülatif gelir vergisi matrahları, vergi dilimleri ve muafiyet tutarları.',
      href: '/reports/tax-summary',
      icon: FileSpreadsheet,
      badge: 'Vergi Matrahı',
    },
    {
      title: 'SGK e-Bildirge & MPHBT Özeti',
      desc: 'SGK prim gün sayıları, SPEK (SGK Matrahı), malullük/emeklilik işveren ve işçi prim özeti.',
      href: '/reports/sgk-summary',
      icon: ShieldCheck,
      badge: 'SGK Bildirge',
    },
  ];

  return (
    <div className="flex h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-slate-600 dark:text-slate-400" /> Raporlar & Analizler Merkezi
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Resmi mevzuata uygun banka ödeme listeleri, SGK e-Bildirge ve PDF maaş pusulaları
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportsList.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="b2b-card b2b-card-hover p-5 rounded-lg flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </h2>
                      </div>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-medium">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center text-xs font-semibold text-sky-600 dark:text-sky-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    Raporu Görüntüle & İndir <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
