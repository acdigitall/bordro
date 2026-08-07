'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Calendar,
  UserPlus,
  Play,
  Moon,
  Sun,
  ChevronRight,
} from 'lucide-react';
import { INITIAL_PERIODS } from '@/lib/mock-data';

export function Header() {
  const pathname = usePathname();
  const [selectedPeriod, setSelectedPeriod] = useState('2026-08');
  const [darkMode, setDarkMode] = useState(false);

  const activePeriodObj = INITIAL_PERIODS.find(
    (p) => `${p.year}-${String(p.month).padStart(2, '0')}` === selectedPeriod
  ) || INITIAL_PERIODS[0];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  // Dynamic breadcrumb text
  const getBreadcrumb = () => {
    if (pathname.startsWith('/employees')) return 'Çalışan Yönetimi';
    if (pathname.startsWith('/monthly-data')) return 'Aylık Veri Girişi';
    if (pathname.startsWith('/payroll')) return 'Bordro Çalıştırma';
    if (pathname.startsWith('/reports')) return 'Raporlar & Analizler';
    if (pathname.startsWith('/settings')) return 'Sistem Ayarları';
    if (pathname.startsWith('/admin')) return 'SaaS Yönetimi';
    return 'Ana Panel';
  };

  return (
    <header className="h-13 min-h-[52px] bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 px-4 flex items-center justify-between sticky top-0 z-20 font-sans">
      {/* Breadcrumb Context */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Bordro</span>
        <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {getBreadcrumb()}
        </span>
      </div>

      {/* Command Search Trigger (Linear Style) */}
      <div className="relative hidden md:block w-72">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Ara veya git... ⌘K"
          className="w-full pl-8 pr-3 py-1 bg-slate-100/70 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 rounded text-xs border border-transparent focus:border-slate-300 dark:focus:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Compact Period Selector */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-transparent font-medium focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200 text-xs"
          >
            {INITIAL_PERIODS.map((p) => (
              <option key={p.id} value={`${p.year}-${String(p.month).padStart(2, '0')}`} className="bg-white dark:bg-slate-900">
                {p.monthName}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
            ● Taslak
          </span>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Primary Action Button */}
        <Link
          href="/payroll/run"
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-none"
        >
          <Play className="w-3 h-3 fill-current" />
          Bordro Hesapla
        </Link>

        {/* Theme & Notifications */}
        <button
          onClick={toggleDarkMode}
          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          title="Koyu / Açık Tema"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <button className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-sky-500" />
        </button>
      </div>
    </header>
  );
}



