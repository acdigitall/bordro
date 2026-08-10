'use client';

import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  BookOpen,
  Building2,
  Users,
  CalendarCheck,
  PlaySquare,
  FileSpreadsheet,
  DatabaseBackup,
  ShieldCheck,
  CheckCircle2,
  Calculator,
  Layers,
  Play,
} from 'lucide-react';

export default function UserGuidePage() {
  const guideModules = [
    {
      id: 'sirket-ayarlari',
      number: '01',
      title: 'Şirket Kurulumu & Mevzuat Parametreleri',
      icon: Building2,
      desc: 'Şirket unvanı, vergi dairesi, banka IBAN hesapları ve 2026 kanuni oranlarının sisteme tanımlanması.',
      steps: [
        'Sol menüden "Ayarlar > Şirket Bilgileri" sekmesine gidin.',
        'Resmi şirket unvanı, Vergi Dairesi, Vergi No ve Adres bilgilerinizi eksiksiz kaydedin.',
        '"Ayarlar > Vergi & SGK Oranları" ekranından 2026 yılı Asgari Ücret (₺20.002,50) ve SGK Tavanı (₺150.018,75) değerlerini kontrol edin.',
        '"Ayarlar > Banka IBAN Hesapları" kısmına maaş ödemelerinin yapılacağı kurumsal banka hesaplarınızı ekleyin.',
      ],
    },
    {
      id: 'personel-yonetimi',
      number: '02',
      title: 'Personel Ekleme & Özlük Dosyası Yönetimi',
      icon: Users,
      desc: 'Çalışan kimlik, maaş, engel derecesi, departman ve banka IBAN bilgilerinin KVKK uyumlu kaydı.',
      steps: [
        '"Çalışanlar > + Yeni Çalışan Ekle" butonuna tıklayın.',
        'Ad, Soyad, TC Kimlik No, İşe Giriş Tarihi ve Aylık Brüt Maaş tutarını girin.',
        'Varsa Engellilik Derecesini seçin (1. Derece ₺6.900, 2. Derece ₺4.000, 3. Derece ₺1.700 GV matrah indirimi sağlar).',
        'Personelin maaş ödemesi alacağı banka IBAN numarasını kaydedin.',
        'Departmanlar, Yıllık İzin takibi ve Kıdem/İhbar Tazminatı matrahları otomatik oluşturulacaktır.',
      ],
    },
    {
      id: 'aylik-veri-girisi',
      number: '03',
      title: 'Aylık Veri Girişleri (Mesai, Prim, Kesinti, BES)',
      icon: CalendarCheck,
      desc: 'O aya özel değişken gelir ve kesintilerin (Fazla Mesai, İkramiye, İcra, Avans, Zorunlu BES) sisteme aktarılması.',
      steps: [
        '"Aylık Veri Girişi" modülüne gidin.',
        'Ek Gelirler: İkramiye, huzur hakkı veya prim dışı kazançları çalışana tanımlayın.',
        'Fazla Mesai: Personelin o ay yaptığı mesai saatini girin (%50 zamlı tutar İş Kanununa göre 225 saatlik birim fiyattan otomatik hesaplanır).',
        'Kesintiler: İcra kesintisi, nafaka, sendika aidatı veya borç taksitlerini ekleyin.',
        'Zorunlu BES (OKA): Otomatik Katılım Sigortası kesintisini aktifleştirin.',
      ],
    },
    {
      id: 'vergi-mantigi-2026',
      number: '04',
      title: '2026 Gelir Vergisi & İstisna Hesaplama Mantığı',
      icon: Calculator,
      desc: 'Kümülatif matrah dilim atlamaları, fark yöntemi ve ₺4.211,33 asgari ücret istisnasının otomatik çalışması.',
      steps: [
        'Adım 1 — Brüt Ücretten SGK İşçi Payı (%14) ve İşsizlik Payı (%1) düşülerek o ayın Gelir Vergisi Matrahı bulunur.',
        'Adım 2 — Yeni Kümülatif Matrah = (Önceki Kümülatif Matrah) + (Bu Ayki Matrah).',
        'Adım 3 — 2026 Vergi Dilimleri (190K / 400K / 1.5M / 5.3M TL) üzerinden Fark Yöntemi uygulanır: bu_ayın_istisnasız_vergisi = yeni_kümülatif_vergi - önceki_kümülatif_vergi.',
        'Adım 4 — 2026 Asgari Ücret GV İstisnası (₺4.211,33) uygulanır: ödenecek_gelir_vergisi = MAX(0, istisnasız_vergi - 4211.33).',
        'Adım 5 — Damga Vergisi istisnası (₺250,70) uygulanır: ödenecek_damga_vergisi = MAX(0, brüt * %0.759 - 250.70).',
      ],
    },
    {
      id: 'bordro-calistirma',
      number: '05',
      title: '3 Adımda Bordro Çalıştırma & Dönem Kilidi',
      icon: PlaySquare,
      desc: 'Dönem bordrosunu hazırlama, kontrolleri yapma, onaylama ve geriye dönük müdahaleyi önlemek için kilitleme.',
      steps: [
        '1. Aşama — Bordroyu Hazırla: "Bordro Çalıştırma > 1. Aşama" ekranına gidin. Dönem personel listesini ve hesaplama matrisini inceleyin.',
        '2. Aşama — Bordroyu Onayla: Toplam Brüt, SGK İşçi/İşveren Payları, Net Ödenecek Maaş ve İşveren Maliyetini kontrol edip onaylayın.',
        '3. Aşama — Yetkilendir & Dönemi Kilitle: Kilit butonuna basarak dönemi kapatın. Kilitlenen dönem üzerinde yetkisiz değişiklik yapılamaz.',
      ],
    },
    {
      id: 'raporlar-ve-banka',
      number: '06',
      title: 'Banka Ödeme Listeleri & PDF Maaş Pusulaları',
      icon: FileSpreadsheet,
      desc: 'Bankalar için virman/EFT çıktıları alma, resmi PDF maaş pusulası basma ve SGK e-Bildirge özetleri.',
      steps: [
        '"Raporlar > Banka Ödeme Listesi" ekranından çalıştığınız bankayı (Garanti, Akbank, Yapı Kredi vb.) seçerek XLS/CSV ödeme dosyasını indirin.',
        '"Raporlar > Maaş Pusulaları" ekranından personelinize resmi onaylı PDF pusulalarını tek tıkla bastırın veya e-posta ile gönderin.',
        '"Raporlar > SGK e-Bildirge Özeti" ekranından SPEK (SGK Matrahı) ve prim gün sayılarını kontrol edin.',
      ],
    },
    {
      id: 'yedekleme-ve-guvenlik',
      number: '07',
      title: 'Veritabanı Yedekleme & Güvenlik',
      icon: DatabaseBackup,
      desc: 'Sistem verilerinizi JSON formatında bilgisayarınıza yedekleme ve ihtiyaç durumunda geri yükleme.',
      steps: [
        'Sol menüden "Yedekleme" sayfasına gidin.',
        '"JSON Yedeği İndir" butonuna tıklayarak şirket veritabanınızın anlık yedeğini bilgisayarınıza kaydedin.',
        'Farklı bir bilgisayara geçildiğinde veya veri geri yüklemek istendiğinde yedek dosyasını seçerek "Veritabanına Geri Yükle" işlemini gerçekleştirin.',
      ],
    },
  ];

  return (
    <div className="flex h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                Adım Adım Bordro Kullanım Rehberi (Dokümantasyon)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                2026 Mevzuatı, Gelir Vergisi matrisi ve bordro otomasyonu için adım adım kullanım kılavuzu
              </p>
            </div>

            <Link
              href="/payroll/run"
              className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm shrink-0 w-fit"
            >
              <Play className="w-3.5 h-3.5" /> Bordro Hesapla
            </Link>
          </div>

          {/* Quick Links / Table of Contents */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Hızlı Modül İndeksi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-medium">
              {guideModules.map((m) => (
                <a
                  key={m.id}
                  href={`#${m.id}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200 dark:border-slate-800 transition-all truncate"
                >
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{m.number}</span>
                  <span className="truncate">{m.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Detailed Guide Cards */}
          <div className="space-y-6">
            {guideModules.map((module) => {
              const Icon = module.icon;
              return (
                <section
                  key={module.id}
                  id={module.id}
                  className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm scroll-mt-20"
                >
                  <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shrink-0 border border-sky-200 dark:border-sky-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                        MODÜL {module.number}
                      </span>
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {module.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {module.desc}
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Uygulama Adımları:
                    </h4>
                    <ol className="space-y-2">
                      {module.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </section>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
