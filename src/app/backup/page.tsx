'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  DatabaseBackup,
  Download,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  FileCheck,
} from 'lucide-react';

export default function BackupPage() {
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleDownloadBackup = async () => {
    setDownloading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/backup/export');
      if (!res.ok) {
        throw new Error('Yedek alma başarısız.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bordro_yedek_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatusMsg('Şirket veritabanı yedek dosyası (.json) başarıyla indirildi.');
    } catch (err: any) {
      alert(err.message || 'Yedekleme sırasında bir hata oluştu.');
    } finally {
      setDownloading(false);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Yedek dosyasını geri yüklemek üzeresiniz. Devam etmek istiyor musunuz?')) {
      return;
    }

    setRestoring(true);
    setStatusMsg(null);

    try {
      const text = await file.text();
      const backupJson = JSON.parse(text);

      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupJson),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Geri yükleme başarısız.');

      setStatusMsg('Yedek veritabanına başarıyla geri yüklendi.');
    } catch (err: any) {
      alert(err.message || 'Geri yükleme sırasında hata oluştu.');
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <DatabaseBackup className="w-6 h-6 text-sky-600" /> Yedekleme & Geri Yükleme (Backup & Restore)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Şirketinizin tüm bordro, çalışan, vergi ve kesinti verilerini güvenli yedekleyin veya geri yükleyin
            </p>
          </div>

          {statusMsg && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2 max-w-4xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* 1. Anlık Şirket Verisi Yedeği Al */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-sky-600 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Download className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  1. Anlık Şirket Verisi Yedeği Al
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Şirketinize ait tüm çalışanlar, departmanlar, aylık fazla mesai/prim verileri ve geçmiş bordro kayıtları tam formatlı JSON yedeği olarak indirilir.
              </p>

              <button
                onClick={handleDownloadBackup}
                disabled={downloading}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Yedeğiniz Hazırlanıyor...
                  </>
                ) : (
                  <>
                    <DatabaseBackup className="w-4 h-4" /> Şimdi Yedekle ve İndir (.JSON)
                  </>
                )}
              </button>
            </div>

            {/* 2. Yedekten Geri Yükle (Restore) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Upload className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  2. Yedekten Geri Yükle (Restore)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Daha önce indirdiğiniz <code>.json</code> formatındaki şirket yedek dosyanızı seçerek veritabanına geri yükleyebilirsiniz.
              </p>

              <label className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all">
                {restoring ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> Geri Yükleniyor...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4 text-emerald-500" /> Yedek Dosyası Seç (.JSON)
                  </>
                )}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  disabled={restoring}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
