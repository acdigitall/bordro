'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  PlaySquare,
  FileSpreadsheet,
  Settings,
  DatabaseBackup,
  ShieldAlert,
  CreditCard,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sparkles,
  X,
  BookOpen,
} from 'lucide-react';
import { INITIAL_COMPANY } from '@/lib/mock-data';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  submenu?: { title: string; href: string }[];
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [companyName, setCompanyName] = useState(INITIAL_COMPANY.name);
  const [userName, setUserName] = useState('Cenker Yaman');
  const [userRole, setUserRole] = useState('Yönetici');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setInternalMobileOpen((prev) => !prev);
    if (typeof window !== 'undefined') {
      window.addEventListener('toggle-mobile-sidebar', handleToggle);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('toggle-mobile-sidebar', handleToggle);
      }
    };
  }, []);

  const isDrawerOpen = mobileOpen || internalMobileOpen;
  const handleCloseDrawer = () => {
    setInternalMobileOpen(false);
    if (onMobileClose) onMobileClose();
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.authenticated) {
          if (data.company?.name) setCompanyName(data.company.name);
          if (data.user?.name) setUserName(data.user.name);
          if (data.user?.role) {
            const isSuper =
              data.user.role === 'SUPER_ADMIN' ||
              data.user.email === 'cagataydalaman@outlook.com';

            setIsSuperAdmin(isSuper);
            setUserRole(
              isSuper
                ? 'Süper Admin'
                : data.user.role === 'TENANT_ADMIN'
                  ? 'Şirket Yöneticisi'
                  : 'İK Uzmanı'
            );
          }
        }
      })
      .catch(() => { });
  }, []);

  // Automatically expand current active submenu
  useEffect(() => {
    navigation.forEach((item) => {
      if (item.submenu && pathname.startsWith(item.href)) {
        setOpenSubmenus((prev) => ({ ...prev, [item.href]: true }));
      }
    });
  }, [pathname]);

  const toggleSubmenu = (href: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const navigation: NavItem[] = [
    { title: 'Ana Panel', href: '/dashboard', icon: LayoutDashboard },
    {
      title: 'Çalışanlar',
      href: '/employees',
      icon: Users,
      submenu: [
        { title: 'Tüm Çalışanlar', href: '/employees' },
        { title: '+ Yeni Çalışan Ekle', href: '/employees/new' },
        { title: 'Departmanlar', href: '/employees/departments' },
        { title: 'Kıdem & İhbar Tazminatı', href: '/employees/severance' },
        { title: 'Yıllık İzin Takibi', href: '/employees/leaves' },
      ],
    },
    {
      title: 'Aylık Veri Girişi',
      href: '/monthly-data',
      icon: CalendarCheck,
      submenu: [
        { title: 'Genel Giriş Ekranı', href: '/monthly-data' },
        { title: 'Ek Gelirler', href: '/monthly-data/incomes' },
        { title: 'Fazla Mesai', href: '/monthly-data/overtime' },
        { title: 'Prim & Komisyon', href: '/monthly-data/commissions' },
        { title: 'Kesintiler (İcra vb.)', href: '/monthly-data/deductions' },
        { title: 'Avans & Borçlar', href: '/monthly-data/loans' },
        { title: 'Zorunlu BES (OKA)', href: '/monthly-data/bes' },
      ],
    },
    {
      title: 'Bordro Çalıştırma',
      href: '/payroll/run',
      icon: PlaySquare,
      badge: '2026',
      submenu: [
        { title: '1 — Bordroyu Hazırla', href: '/payroll/run' },
        { title: '2 — Bordroyu Onayla', href: '/payroll/approve' },
        { title: '3 — Yetkilendir & Kilitle', href: '/payroll/authorize' },
      ],
    },
    {
      title: 'Raporlar',
      href: '/reports',
      icon: FileSpreadsheet,
      submenu: [
        { title: 'Banka Ödeme Listesi', href: '/reports/bank-lists' },
        { title: 'Maaş Pusulaları (PDF)', href: '/reports/payslips' },
        { title: 'Gelir Vergisi (Kümülatif)', href: '/reports/tax-summary' },
        { title: 'SGK e-Bildirge Özeti', href: '/reports/sgk-summary' },
      ],
    },
    {
      title: 'Ayarlar',
      href: '/settings',
      icon: Settings,
      submenu: [
        { title: 'Şirket Bilgileri', href: '/settings/company' },
        { title: 'Vergi & SGK Oranları', href: '/settings/tax' },
        { title: 'Banka IBAN Hesapları', href: '/settings/banks' },
        { title: 'Kullanıcılar & Yetkiler', href: '/settings/users' },
      ],
    },
    { title: 'Kullanım Rehberi', href: '/guide', icon: BookOpen },
    { title: 'Yedekleme', href: '/backup', icon: DatabaseBackup },
  ];

  const saasNavigation: NavItem[] = [
    { title: 'Süper Admin Paneli', href: '/admin', icon: ShieldAlert },
    { title: 'Abonelik & Faturalama', href: '/admin/plans', icon: CreditCard },
  ];

  const companyInitials = companyName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const sidebarContent = (
    <aside className="w-64 bg-gradient-to-b from-[#0F172A] via-[#0B132B] to-[#030712] text-slate-300 h-full flex flex-col border-r border-slate-800/80 select-none z-30 font-sans shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Decorative Top Glow */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-sky-500/10 via-indigo-500/5 to-transparent pointer-events-none" />

      {/* Workspace Header */}
      <div className="px-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-4 border-b border-slate-800/60 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/30 border border-sky-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <span className="font-mono text-xs font-extrabold tracking-wider text-sky-300">
              {companyInitials || 'TB'}
            </span>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-[13.5px] font-bold text-slate-100 truncate leading-tight flex items-center gap-1.5">
              {companyName}
            </h1>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-emerald-400/90 font-semibold truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shadow-[0_0_8px_#34d399]" />
              {INITIAL_COMPANY.planName}
            </p>
          </div>
        </div>

        {/* Mobile Close X Button */}
        <button
          onClick={handleCloseDrawer}
          className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Menüyü Kapat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 relative z-10 custom-sidebar-scroll">
        <div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const hasSubmenu = !!item.submenu;
              const isExpanded = openSubmenus[item.href] ?? isActive;
              const Icon = item.icon;

              return (
                <div key={item.href} className="group">
                  <div className="flex items-center justify-between">
                    <Link
                      href={hasSubmenu ? '#' : item.href}
                      onClick={(e) => {
                        if (hasSubmenu) {
                          e.preventDefault();
                          toggleSubmenu(item.href);
                        } else if (onMobileClose) {
                          onMobileClose();
                        }
                      }}
                      className={`relative flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-[12.5px] transition-all duration-200 ease-out ${isActive
                          ? 'bg-gradient-to-r from-sky-500/20 via-blue-500/10 to-transparent text-sky-300 font-bold border-l-3 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.12)]'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] hover:translate-x-0.5'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-[17px] h-[17px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'text-slate-400 group-hover:text-sky-400'
                            }`}
                        />
                        <span>{item.title}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold font-mono bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-md">
                            {item.badge}
                          </span>
                        )}
                        {hasSubmenu && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubmenu(item.href);
                            }}
                            className="p-0.5 rounded hover:bg-white/10 text-slate-400"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-sky-400 transition-transform duration-200" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200" />
                            )}
                          </button>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Submenu Accordion */}
                  {hasSubmenu && isExpanded && (
                    <div className="ml-5 mt-1 mb-1 pl-3.5 border-l border-sky-500/20 space-y-1 transition-all duration-200">
                      {item.submenu!.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => onMobileClose && onMobileClose()}
                            className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-[11.5px] transition-all duration-150 ${isSubActive
                                ? 'text-sky-300 font-bold bg-sky-500/10 border-l-2 border-sky-400'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                              }`}
                          >
                            {isSubActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8] shrink-0" />
                            )}
                            <span className="truncate">{sub.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Super Admin Section */}
        {isSuperAdmin && (
          <div className="pt-4 border-t border-slate-800/60">
            <div className="font-mono text-[9.5px] font-bold text-amber-400/90 uppercase tracking-[0.15em] px-3 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>SaaS Yönetimi</span>
            </div>
            <nav className="space-y-1">
              {saasNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onMobileClose && onMobileClose()}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium border transition-all ${isActive
                        ? 'text-amber-300 bg-amber-500/10 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)] font-bold'
                        : 'text-slate-400 border-transparent hover:text-amber-200 hover:bg-amber-500/5'
                      }`}
                  >
                    <Icon
                      className={`w-[16px] h-[16px] shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'
                        }`}
                    />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* User Footer Card */}
      <div className="p-3 mx-3 mt-3 mb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-slate-900/80 border border-slate-800/80 rounded-2xl flex items-center justify-between relative z-10 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="relative w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 text-white flex items-center justify-center font-mono text-[11px] font-bold shadow-md shadow-sky-900/40">
            {userInitials || 'CY'}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-[0_0_8px_#34d399]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[12px] font-bold text-slate-100 truncate">{userName}</p>
            <p className="font-mono text-[9.5px] font-medium uppercase tracking-wide text-sky-400/90 truncate">
              {userRole}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          title="Oturumu Kapat"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-[100dvh] shrink-0 sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
            onClick={handleCloseDrawer}
          />
          <div className="relative flex-1 max-w-xs w-full h-full z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
          {/* Floating Close Button outside drawer */}
          <button
            onClick={handleCloseDrawer}
            className="absolute top-[calc(1rem+env(safe-area-inset-top,0px))] right-4 z-20 p-2 rounded-full bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition-all active:scale-95"
            title="Menüyü Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
}