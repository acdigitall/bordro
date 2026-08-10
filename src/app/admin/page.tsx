'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  ShieldAlert,
  Building,
  Users,
  CreditCard,
  Plus,
  CheckCircle2,
  TrendingUp,
  Activity,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { INITIAL_COMPANY } from '@/lib/mock-data';

export default function SuperAdminPage() {
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

  const [tenants] = useState([
    {
      id: 'cmp-keban-001',
      name: 'Keban Şirketler Grubu Ltd. Şti.',
      plan: 'Profesyonel SaaS',
      employees: 8,
      maxEmployees: 50,
      monthlyFee: 2490,
      status: 'ACTIVE',
      lastLogin: '2026-08-07 01:10',
    },
    {
      id: 'cmp-atlas-002',
      name: 'Atlas Lojistik A.Ş.',
      plan: 'Kurumsal SaaS',
      employees: 142,
      maxEmployees: 500,
      monthlyFee: 8900,
      status: 'ACTIVE',
      lastLogin: '2026-08-06 18:30',
    },
    {
      id: 'cmp-vadi-003',
      name: 'Vadi Bilişim & Danışmanlık',
      plan: 'Başlangıç SaaS',
      employees: 4,
      maxEmployees: 10,
      monthlyFee: 990,
      status: 'ACTIVE',
      lastLogin: '2026-08-05 14:15',
    },
  ]);

  if (authorized === null) {
    return (
      <div className="flex h-[100dvh] bg-slate-950 items-center justify-center text-slate-400 font-sans text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500 mr-2" />
        Süper Admin Yetkisi Kontrol Ediliyor...
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="flex h-[100dvh] bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-amber-500" /> Süper Admin Kontrol Paneli (SaaS Super Admin)
              </h1>
              <p className="text-xs text-slate-400">
                Tüm Tenant (Şirket) Hesapları, Abonelik Paketleri ve Sistem Metrikleri Yönetimi
              </p>
            </div>

            <button
              onClick={() => alert('Yeni Tenant Oluşturma Formu')}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-amber-600/30"
            >
              <Plus className="w-4 h-4" /> + Yeni Tenant (Şirket) Ekle
            </button>
          </div>

          {/* Key SaaS Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Aktif Toplam Tenant</p>
              <h3 className="text-2xl font-black font-mono text-white mt-1">3 Şirket</h3>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Toplam Kayıtlı Çalışan</p>
              <h3 className="text-2xl font-black font-mono text-sky-400 mt-1">154 Personel</h3>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Aylık Tekrarlayan Gelir (MRR)</p>
              <h3 className="text-2xl font-black font-mono text-emerald-400 mt-1">₺12.380 / ay</h3>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Sistem Durumu</p>
              <h3 className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Tüm Servisler Çalışıyor
              </h3>
            </div>
          </div>

          {/* Registered Tenants List */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-500" /> Kayıtlı Tenant (Şirket) Listesi
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="p-3">Tenant Kodu / Unvan</th>
                    <th className="p-3">Abonelik Paketi</th>
                    <th className="p-3 text-center">Aktif Çalışan Kota</th>
                    <th className="p-3 text-right">Aylık Ücret</th>
                    <th className="p-3 text-center">Son Giriş</th>
                    <th className="p-3 text-center">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/50">
                      <td className="p-3">
                        <span className="font-bold text-slate-100 block">{t.name}</span>
                        <span className="font-mono text-[10px] text-slate-500">{t.id}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-800 text-sky-300 font-semibold px-2 py-0.5 rounded text-[11px]">
                          {t.plan}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-200">
                        {t.employees} / {t.maxEmployees}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        {t.monthlyFee}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-400 text-[11px]">
                        {t.lastLogin}
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
