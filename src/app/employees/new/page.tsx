'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  User,
  Briefcase,
  DollarSign,
  Shield,
  Gift,
  Paperclip,
  Save,
  ArrowLeft,
  Upload,
  Loader2,
} from 'lucide-react';
import { INITIAL_DEPARTMENTS, INITIAL_BANKS, INITIAL_EMPLOYEES } from '@/lib/mock-data';

function EmployeeFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('id');

  const [activeTab, setActiveTab] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    tcNo: '',
    gender: 'Erkek',
    birthDate: '',
    phone: '',
    address: '',
    hireDate: '2026-08-01',
    departmentId: 'dept-01',
    title: '',
    employmentType: 'FULL_TIME',
    baseSalary: 35000,
    currency: 'TRY',
    bankId: 'bank-01',
    iban: 'TR42 0006 4000 0011 2233 4455',
    sgkNo: '',
    taxExemptionType: 'STANDARD',
    foodAllowance: 4500,
    transportAllowance: 2500,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form if editing an existing employee
  useEffect(() => {
    if (!editId) return;

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((meData) => {
        const isKeban =
          meData.company?.name?.toLowerCase().includes('keban') ||
          meData.user?.email === 'admin@teknoloji.com';

        if (isKeban) {
          const match = INITIAL_EMPLOYEES.find((e) => e.id === editId);
          if (match) {
            setFormData((prev) => ({
              ...prev,
              firstName: match.firstName,
              lastName: match.lastName,
              tcNo: match.tcNo,
              departmentId: match.departmentId || 'dept-01',
              title: match.title || '',
              baseSalary: match.baseSalary,
              iban: match.iban || '',
              taxExemptionType: match.taxExemptionType || 'STANDARD',
            }));
          }
          setFetching(false);
        } else {
          fetch('/api/employees')
            .then((r) => r.json())
            .then((empData) => {
              if (empData.success && Array.isArray(empData.employees)) {
                const match = empData.employees.find((e: any) => e.id === editId);
                if (match) {
                  setFormData((prev) => ({
                    ...prev,
                    firstName: match.firstName,
                    lastName: match.lastName,
                    tcNo: match.tcNo,
                    departmentId: match.departmentId || 'dept-01',
                    title: match.title || '',
                    baseSalary: match.baseSalary,
                    iban: match.iban || '',
                    taxExemptionType: match.taxExemptionType || 'STANDARD',
                  }));
                }
              }
            })
            .catch(() => {})
            .finally(() => setFetching(false));
        }
      })
      .catch(() => setFetching(false));
  }, [editId]);

  const tabs = [
    { id: 1, name: 'Kişisel Bilgiler', icon: User },
    { id: 2, name: 'İstihdam Bilgileri', icon: Briefcase },
    { id: 3, name: 'Ücret Bilgileri', icon: DollarSign },
    { id: 4, name: 'SGK & Vergi', icon: Shield },
    { id: 5, name: 'Standart Ödemeler', icon: Gift },
    { id: 6, name: 'Evraklar & Dosyalar', icon: Paperclip },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.tcNo || !formData.baseSalary) {
      alert('Lütfen Ad, Soyad, TC No ve Brüt Ücret alanlarını doldurunuz.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = '/api/employees';
      const method = editId ? 'PUT' : 'POST';
      const payload = editId
        ? {
            id: editId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            tcNo: formData.tcNo,
            baseSalary: formData.baseSalary,
            title: formData.title,
            departmentId: formData.departmentId,
            iban: formData.iban,
          }
        : {
            firstName: formData.firstName,
            lastName: formData.lastName,
            tcNo: formData.tcNo,
            baseSalary: formData.baseSalary,
            title: formData.title,
            departmentId: formData.departmentId,
            iban: formData.iban,
          };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'İşlem başarısız.');

      alert(editId ? 'Çalışan bilgileri güncellendi.' : 'Yeni çalışan kaydedildi.');
      router.push('/employees');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Bir sunucu hatası oluştu.');
      alert(err.message || 'Hata oluştu.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/employees"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Yeni Çalışan Tanımla (Employee Registration)
                </h1>
                <p className="text-xs text-slate-500">6 Sekmeli Çoklu Özlük ve Bordro Formu</p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-sky-600/30"
            >
              <Save className="w-4 h-4" /> Kaydet ve Tamamla
            </button>
          </div>

          {/* 6-Tab Navigation Bar */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 border-sky-600 dark:border-sky-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Form Content Area */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* TAB 1: Kişisel Bilgiler */}
              {activeTab === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ad
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      placeholder="Ahmet"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Soyad
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      placeholder="Yılmaz"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      TC Kimlik No (11 Haneli)
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      value={formData.tcNo}
                      onChange={(e) => setFormData({ ...formData, tcNo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                      placeholder="10293847561"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cinsiyet
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    >
                      <option value="Erkek">Erkek</option>
                      <option value="Kadın">Kadın</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 2: İstihdam Bilgileri */}
              {activeTab === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      İşe Giriş Tarihi
                    </label>
                    <input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Departman
                    </label>
                    <select
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    >
                      {INITIAL_DEPARTMENTS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Görev / Unvan
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      placeholder="Senior Yazılım Uzmanı"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Ücret Bilgileri */}
              {activeTab === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Aylık Brüt Temel Maaş (TRY)
                    </label>
                    <input
                      type="number"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold font-mono text-sky-600 dark:text-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ödeme Bankası
                    </label>
                    <select
                      value={formData.bankId}
                      onChange={(e) => setFormData({ ...formData, bankId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    >
                      {INITIAL_BANKS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      IBAN Adresi
                    </label>
                    <input
                      type="text"
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                      placeholder="TR42 0006 4000 0011 2233 4455 66"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: SGK & Vergi Bilgileri */}
              {activeTab === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      SGK Sicil / Sigorta No
                    </label>
                    <input
                      type="text"
                      value={formData.sgkNo}
                      onChange={(e) => setFormData({ ...formData, sgkNo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                      placeholder="40192837465"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Vergi Muafiyet / Engellilik İndirimi
                    </label>
                    <select
                      value={formData.taxExemptionType}
                      onChange={(e) => setFormData({ ...formData, taxExemptionType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    >
                      <option value="STANDARD">Yok (Standart Vergilendirme)</option>
                      <option value="DISABLED_1">1. Derece Engelli (₺6.900 Matrah İndirimi)</option>
                      <option value="DISABLED_2">2. Derece Engelli (₺4.000 Matrah İndirimi)</option>
                      <option value="DISABLED_3">3. Derece Engelli (₺1.700 Matrah İndirimi)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 5: Standart Ek Ödemeler */}
              {activeTab === 5 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Aylık Standart Yemek Kartı (Netsel/Sodexo/Multinet)
                    </label>
                    <input
                      type="number"
                      value={formData.foodAllowance}
                      onChange={(e) => setFormData({ ...formData, foodAllowance: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Aylık Standart Yol Kartı / Ulaşım
                    </label>
                    <input
                      type="number"
                      value={formData.transportAllowance}
                      onChange={(e) => setFormData({ ...formData, transportAllowance: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* TAB 6: Evraklar & Dosya Yükleme (S3) */}
              {activeTab === 6 && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40">
                    <Upload className="w-8 h-8 text-sky-500 mx-auto" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        İş Sözleşmesi, Kimlik Fotokopisi veya İkametgah Yükleyin
                      </p>
                      <p className="text-[11px] text-slate-400">PDF, PNG, JPG (Maks. 10MB - S3/R2 Depolama)</p>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow"
                    >
                      Dosya Seç
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function NewEmployeePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center text-xs text-slate-500 font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-sky-600 mr-2" />
          Çalışan Formu Yükleniyor...
        </div>
      }
    >
      <EmployeeFormContent />
    </Suspense>
  );
}

