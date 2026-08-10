'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Building, Save, Upload, CheckCircle2, FileImage, Loader2 } from 'lucide-react';
import { INITIAL_COMPANY } from '@/lib/mock-data';

export default function CompanySettingsPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [taxNo, setTaxNo] = useState('');
  const [address, setAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/company')
      .then((res) => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success && data.company) {
          setName(data.company.name || '');
          setTaxOffice(data.company.taxOffice || '');
          setTaxNo(data.company.taxNo || '');
          setAddress(data.company.address || '');
          setLogoUrl(data.company.logoUrl || '');
        } else {
          // Fallback to auth session or INITIAL_COMPANY
          fetch('/api/auth/me')
            .then((r) => {
              if (!r.ok || !r.headers.get('content-type')?.includes('application/json')) {
                return null;
              }
              return r.json();
            })
            .then((meData) => {
              if (meData && meData.authenticated && meData.company) {
                setName(meData.company.name || INITIAL_COMPANY.name);
                setTaxOffice(meData.company.taxOffice || INITIAL_COMPANY.taxOffice);
                setTaxNo(meData.company.taxNo || INITIAL_COMPANY.taxNo);
                setAddress(meData.company.address || INITIAL_COMPANY.address);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Lütfen resmi şirket unvanını giriniz.');
      return;
    }

    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          taxOffice,
          taxNo,
          address,
          logoUrl,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      }

      if (!res.ok) throw new Error(data.error || 'Güncelleme başarısız.');

      setSuccessMsg('Şirket ve logo bilgileri veritabanında başarıyla güncellendi.');
      router.refresh();

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSave}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Building className="w-6 h-6 text-sky-600" /> Şirket Unvan & Logo Bilgileri
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Resmi evrak ve maaş pusulalarında gösterilecek firma detayları
                </p>
              </div>

              <button
                type="submit"
                disabled={saving || loading}
                className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:from-sky-500 hover:to-blue-500 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Değişiklikleri Kaydet
                  </>
                )}
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-lg flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-6 max-w-3xl">
              {/* Form Card 1: Resmi Unvan & Vergi Bilgileri */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                  Resmi Şirket Kimlik Bilgileri
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Resmi Şirket Unvanı *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-sky-500"
                      placeholder="Örn: ABC Teknoloji Ltd. Şti."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Vergi Numarası
                    </label>
                    <input
                      type="text"
                      value={taxNo}
                      onChange={(e) => setTaxNo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono focus:outline-none focus:border-sky-500"
                      placeholder="10 Haneli Vergi No"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Vergi Dairesi
                    </label>
                    <input
                      type="text"
                      value={taxOffice}
                      onChange={(e) => setTaxOffice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-sky-500"
                      placeholder="Örn: Büyük Mükellefler V.D."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Resmi Adres
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-sky-500"
                      placeholder="Örn: Maslak Mah. Büyükdere Cad. No:142 Şişli / İstanbul"
                    />
                  </div>
                </div>
              </div>

              {/* Form Card 2: Şirket Logosu (İsteğe Bağlı) */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FileImage className="w-4 h-4 text-sky-500" /> Şirket Logosu (İsteğe Bağlı)
                  </h2>
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-medium">
                    Zorunlu Değildir
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Logo yüklenmesi zorunlu değildir. Eğer bir logo URL adresi eklerseniz resmi maaş pusulası başlığında logonuz görüntülenir; eklemezseniz şık şirket harf simgeniz kullanılır.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Logo Görsel URL Adresi (veya PNG / SVG linki)
                    </label>
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono focus:outline-none focus:border-sky-500"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  {/* Logo Preview */}
                  {logoUrl ? (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                      <img
                        src={logoUrl}
                        alt="Şirket Logosu Önizleme"
                        className="w-12 h-12 object-contain rounded bg-white p-1 border border-slate-200"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          Logo Önizleme Aktif
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Resmi maaş pusulasında bu logo yer alacaktır.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-400 space-y-1">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                      <p className="font-medium">Henüz logo URL adresi girilmedi</p>
                      <p className="text-[11px] text-slate-500">
                        (Boş bırakıldığında standart firma harf simgeniz kullanılacaktır)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}


