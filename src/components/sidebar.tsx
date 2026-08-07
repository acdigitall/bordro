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
} from 'lucide-react';
import { INITIAL_COMPANY } from '@/lib/mock-data';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
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
      .catch(() => {});
  }, []);

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
    <aside className="w-64 bg-[#10192B] text-[#AEB9CC] h-full flex flex-col border-r border-[#24314A] select-none z-30 font-sans shadow-xl">
      {/* Workspace Header */}
      <div className="px-4 py-4 border-b border-dashed border-[#24314A] flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative w-9 h-9 shrink-0 rounded-full border border-[#3C8562]/60 flex items-center justify-center">
            <div className="absolute inset-[3px] rounded-full border border-dashed border-[#3C8562]/40" />
            <span className="font-mono text-[10px] font-bold tracking-wider text-[#5FA07F]">
              {companyInitials || 'TB'}
            </span>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-[13.5px] font-bold text-[#EDEFF3] truncate leading-tight">
              {companyName}
            </h1>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#5FA07F]/90 truncate">
              {INITIAL_COMPANY.planName}
            </p>
          </div>
        </div>
      </div>

      {/* Ana Navigasyon */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="font-mono text-[9.5px] font-medium text-[#4C5A75] uppercase tracking-[0.14em] px-2 mb-2">
            Navigasyon
          </div>
          <nav className="space-y-0.5">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onMobileClose && onMobileClose()}
                    className={`relative flex items-center gap-2.5 pl-3 pr-2.5 py-2.5 lg:py-1.5 text-[13px] lg:text-[12.5px] transition-colors ${
                      isActive
                        ? 'text-[#EDEFF3] font-medium bg-[#1B2740]'
                        : 'text-[#8996AD] hover:text-[#D5DBE6] hover:bg-[#161F35]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-[#3C8562]" />
                    )}
                    <Icon
                      className={`w-[16px] h-[16px] shrink-0 ${
                        isActive ? 'text-[#5FA07F]' : 'text-[#4C5A75]'
                      }`}
                    />
                    <span>{item.title}</span>
                  </Link>

                  {item.submenu && isActive && (
                    <div className="ml-[26px] mt-0.5 mb-1 pl-3 border-l border-[#24314A] space-y-0.5">
                      {item.submenu.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => onMobileClose && onMobileClose()}
                            className={`block py-1.5 lg:py-1 text-[12px] lg:text-[11.5px] transition-colors ${
                              isSubActive
                                ? 'text-[#5FA07F] font-medium'
                                : 'text-[#6B7690] hover:text-[#B7C0D4]'
                            }`}
                          >
                            {sub.title}
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

        {/* Yönetim (Yalnızca Süper Admin Yetkisinde Görünür) */}
        {isSuperAdmin && (
          <div className="pt-4 border-t border-dashed border-[#24314A]">
            <div className="font-mono text-[9.5px] font-medium text-[#4C5A75] uppercase tracking-[0.14em] px-2 mb-2">
              SaaS Yönetimi
            </div>
            <nav className="space-y-0.5">
              {saasNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onMobileClose && onMobileClose()}
                    className={`relative flex items-center gap-2.5 pl-3 pr-2.5 py-2 lg:py-1.5 text-[12.5px] rounded-sm border transition-colors ${
                      isActive
                        ? 'text-[#D9B183] bg-[#2A2013]/60 border-[#B5793C]/40 font-medium'
                        : 'text-[#8996AD] border-transparent hover:text-[#D5DBE6] hover:bg-[#161F35]'
                    }`}
                  >
                    <Icon
                      className={`w-[15px] h-[15px] shrink-0 ${
                        isActive ? 'text-[#B5793C]' : 'text-[#4C5A75]'
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

      {/* Kullanıcı Footer — Dinamik avatar + Çıkış Butonu */}
      <div className="px-4 py-3 border-t border-dashed border-[#24314A] flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 shrink-0 rounded-sm bg-[#1B2740] border border-[#24314A] text-[#AEB9CC] flex items-center justify-center font-mono text-[10px] font-bold">
            {userInitials || 'CY'}
          </div>
          <div className="overflow-hidden">
            <p className="text-[12px] font-medium text-[#D5DBE6] truncate">{userName}</p>
            <p className="font-mono text-[9.5px] uppercase tracking-wide text-[#5A6684] truncate">
              {userRole}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-1.5 text-[#6B7690] hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
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
      <div className="hidden lg:flex h-screen shrink-0 sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative flex-1 max-w-xs w-full h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}