import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Calendar,
  Play,
  Moon,
  Sun,
  ChevronRight,
  Menu,
  X,
  LayoutDashboard,
  Users,
  CalendarCheck,
  Settings,
  BookOpen,
} from 'lucide-react';
import { INITIAL_PERIODS } from '@/lib/mock-data';

export function Header() {
  const pathname = usePathname();
  const [selectedPeriod, setSelectedPeriod] = useState('2026-08');
  const [isLocked, setIsLocked] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const activeP = localStorage.getItem('active_payroll_period');
      if (activeP) setSelectedPeriod(activeP);

      const checkLock = () => {
        const p = localStorage.getItem('active_payroll_period') || '2026-08';
        const isLoc = localStorage.getItem(`payroll_status_${p}`) === 'LOCKED';
        setIsLocked(isLoc);
      };
      checkLock();
      window.addEventListener('storage', checkLock);
      return () => window.removeEventListener('storage', checkLock);
    }
  }, []);

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    if (typeof window !== 'undefined') {
      localStorage.setItem('active_payroll_period', newPeriod);
      const isLoc = localStorage.getItem(`payroll_status_${newPeriod}`) === 'LOCKED';
      setIsLocked(isLoc);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  const handleToggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
    }
  };

  // Dynamic breadcrumb text
  const getBreadcrumb = () => {
    if (pathname.startsWith('/employees')) return 'Çalışan Yönetimi';
    if (pathname.startsWith('/monthly-data')) return 'Aylık Veri Girişi';
    if (pathname.startsWith('/payroll')) return 'Bordro Çalıştırma';
    if (pathname.startsWith('/reports')) return 'Raporlar & Analizler';
    if (pathname.startsWith('/settings')) return 'Sistem Ayarları';
    if (pathname.startsWith('/guide')) return 'Kullanım Rehberi';
    if (pathname.startsWith('/admin')) return 'SaaS Yönetimi';
    return 'Ana Panel';
  };

  const bottomNavItems = [
    { label: 'Ana Panel', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Çalışanlar', href: '/employees', icon: Users },
    { label: 'Veri Girişi', href: '/monthly-data', icon: CalendarCheck },
    { label: 'Bordro', href: '/payroll/run', icon: Play },
    { label: 'Ayarlar', href: '/settings', icon: Settings },
  ];

  return (
    <>
      <header className="pt-[env(safe-area-inset-top,0px)] min-h-[calc(3.5rem+env(safe-area-inset-top,0px))] bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 md:px-4 flex items-center justify-between sticky top-0 z-20 font-sans shadow-xs">
        {/* Mobile Hamburger & Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleToggleMobileMenu}
            className="md:hidden p-2 -ml-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Menüyü Aç"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
          </button>

          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-slate-400 font-medium hidden sm:inline">Bordro</span>
            <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 hidden sm:inline" />
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
              {getBreadcrumb()}
            </span>
          </div>
        </div>

        {/* Command Search Trigger (Linear Style) */}
        <div className="relative hidden xl:block w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ara veya git... ⌘K"
            className="w-full pl-8 pr-3 py-1 bg-slate-100/70 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 rounded-lg text-xs border border-transparent focus:border-slate-300 dark:focus:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Compact Period Selector */}
          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200 text-xs"
            >
              {INITIAL_PERIODS.map((p) => {
                const val = `${p.year}-${String(p.month).padStart(2, '0')}`;
                const locked = mounted && localStorage.getItem(`payroll_status_${val}`) === 'LOCKED';
                return (
                  <option key={p.id} value={val} className="bg-white dark:bg-slate-900">
                    {locked ? `🔒 ${p.monthName} (Kilitli)` : p.monthName}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Primary Action Button */}
          <Link
            href="/payroll/run"
            className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm shrink-0"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="hidden xs:inline">Bordro Hesapla</span>
          </Link>

          {/* Kullanım Rehberi Button */}
          <Link
            href="/guide"
            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Kullanım Rehberi"
          >
            <BookOpen className="w-4 h-4" />
          </Link>

          {/* Theme & Notifications */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Koyu / Açık Tema"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative hidden sm:block">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-sky-500" />
          </button>
        </div>
      </header>

      {/* Mobile Fixed Bottom App Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around font-sans shadow-lg">
        {bottomNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400 font-bold bg-sky-50 dark:bg-sky-950/60'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}



