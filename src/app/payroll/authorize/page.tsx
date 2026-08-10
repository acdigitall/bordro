'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  ArrowRight,
  Calendar,
  BarChart3,
  Check,
  X,
} from 'lucide-react';
import { INITIAL_EMPLOYEES, INITIAL_BANKS } from '@/lib/mock-data';
import { formatCurrency, calculatePayroll } from '@/lib/payroll-engine';

export default function AuthorizePayrollPage() {
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve selected employee IDs from Stage 1
    let selectedIds: string[] = [];
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('payroll_selected_emp_ids_2026-08');
      if (stored) {
        try {
          selectedIds = JSON.parse(stored);
        } catch {}
      }

      // Check if period was already locked previously
      const isPeriodLocked = localStorage.getItem('payroll_status_2026-08') === 'LOCKED';
      if (isPeriodLocked) {
        setIsLocked(true);
      }
    }

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        const isKeban =
          data.company?.name?.toLowerCase().includes('keban') ||
          data.user?.email === 'admin@teknoloji.com';

        if (isKeban) {
          if (selectedIds.length > 0) {
            setEmployees(INITIAL_EMPLOYEES.filter((e) => selectedIds.includes(e.id)));
          } else {
            setEmployees(INITIAL_EMPLOYEES);
          }
        } else {
          fetch('/api/employees')
            .then((r) => r.json())
            .then((empData) => {
              if (empData.success && Array.isArray(empData.employees) && empData.employees.length > 0) {
                if (selectedIds.length > 0) {
                  setEmployees(empData.employees.filter((e: any) => selectedIds.includes(e.id)));
                } else {
                  setEmployees(empData.employees);
                }
              } else {
                setEmployees([]);
              }
            })
            .catch(() => setEmployees([]));
        }
      })
      .catch(() => setEmployees([]));
  }, []);

  let totalGross = 0;
  let totalNet = 0;
  let totalEmployerCost = 0;

  employees.forEach((e) => {
    const res = calculatePayroll({ baseSalary: e.baseSalary, taxExemptionType: e.taxExemptionType || 'STANDARD' });
    totalGross += res.totalGrossEarnings;
    totalNet += res.netSalary;
    totalEmployerCost += res.totalEmployerCost;
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAuthorize = () => {
    setIsLocked(true);
    setShowCompletionModal(true);

    if (typeof window !== 'undefined') {
      localStorage.setItem('payroll_status_2026-08', 'LOCKED');
      const rolledOverMatrahs: { [empId: string]: number } = {};
      employees.forEach((emp) => {
        const res = calculatePayroll({ baseSalary: emp.baseSalary });
        rolledOverMatrahs[emp.id] = (emp.cumulativeMatrah || 0) + res.incomeTaxMatrah;
      });
      localStorage.setItem('payroll_cum_matrahs_2026-09', JSON.stringify(rolledOverMatrahs));
    }
  };

  const handleStartNextPeriod = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('active_payroll_period', '2026-09');
    }
    router.push('/payroll/run');
  };

  // Real Browser File Download Helper for Bank Transfer CSV
  const handleDownloadBankFile = (bankName: string) => {
    const headers = ['TCKN', 'Ad Soyad', 'Banka', 'IBAN', 'Net Odenecek (TRY)', 'Aciklama'];
    const rows = employees.map((emp) => {
      const res = calculatePayroll({ baseSalary: emp.baseSalary });
      return [
        emp.tcNo || '11111111111',
        `"${emp.firstName} ${emp.lastName}"`,
        `"${bankName}"`,
        `"${emp.iban || 'TR420006400000112233445566'}"`,
        res.netSalary.toFixed(2),
        `"2026 Agustos Maas Odemesi"`
      ].join(';');
    });

    const content = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeBankName = bankName.toLowerCase().replace(/\s+/g, '_');
    link.download = `${safeBankName}_maas_transfer_2026_08.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`${bankName} Toplu Maaş Transfer Dosyası (.CSV) başarıyla indirildi.`);
  };

  // Real Browser File Download Helper for Payslips Dökümü
  const handleDownloadPayslips = () => {
    const lines = [
      '=========================================================================',
      '             TÜRKİYE BORDRO SAAS - AĞUSTOS 2026 TOPLU MAAŞ PUSULALARI    ',
      '=========================================================================',
      '',
      `Toplam Personel Sayısı: ${employees.length}`,
      `Toplam Net Ödenecek: ${formatCurrency(totalNet)}`,
      `Tarih: ${new Date().toLocaleDateString('tr-TR')}`,
      '-------------------------------------------------------------------------',
      '',
    ];

    employees.forEach((emp, index) => {
      const res = calculatePayroll({ baseSalary: emp.baseSalary });
      lines.push(`[Personel ${index + 1}]`);
      lines.push(`Ad Soyad     : ${emp.firstName} ${emp.lastName}`);
      lines.push(`Sicil / TCKN : ${emp.employeeCode || '-'} / ${emp.tcNo || '-'}`);
      lines.push(`Temel Brüt   : ${formatCurrency(res.grossSalary)}`);
      lines.push(`SGK İşçi Payı: -${formatCurrency(res.totalSgkEmployee)}`);
      lines.push(`Gelir Vergisi: -${formatCurrency(res.netIncomeTax)}`);
      lines.push(`Damga Vergisi: -${formatCurrency(res.netStampTax)}`);
      lines.push(`Net Maaş     : ${formatCurrency(res.netSalary)}`);
      lines.push('-------------------------------------------------------------------------');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `toplu_maas_pusulalari_2026_08.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Seçili ${employees.length} personel için Toplu Maaş Pusulaları dökümü indirildi.`);
  };

  return (
    <div className="flex h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans relative">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Header & Stepper Card */}
          <div className="b2b-card p-5 rounded-lg space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  3. Aşama: Yetkilendirme & Dönem Kilidi
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Maaş ödeme yetkisi onaylanır, seçili {employees.length} personel için banka ödeme dosyaları üretilir ve dönem kilitlenir
                </p>
              </div>

              {!isLocked ? (
                <button
                  onClick={handleAuthorize}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-sm active:scale-95 cursor-pointer"
                >
                  <Lock className="w-4 h-4" /> Yetkilendir & Dönemi Kilitle ({employees.length} Kişi)
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Dönem Kilitlendi & Yetkilendirildi
                  </span>

                  <button
                    onClick={handleStartNextPeriod}
                    className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span>Eylül 2026 Bordrosunu Başlat</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Stepper Steps */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="py-2 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1. Kişiler Seçildi
              </div>
              <div className="py-2 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 2. Onaylandı
              </div>
              <div className={`py-2 rounded text-white flex items-center justify-center gap-1.5 shadow-xs ${isLocked ? 'bg-emerald-600' : 'bg-sky-600'}`}>
                <Lock className="w-4 h-4" /> 3. Yetkilendir & Kilitle (Aktif)
              </div>
            </div>
          </div>

          {/* Locked Period Completion Summary Card */}
          {isLocked && (
            <div className="b2b-card bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80 p-5 rounded-lg space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-700">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase">
                        Kilitlendi & Tamamlandı
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      Ağustos 2026 Bordro Dönemi Başarıyla Kapanmıştır
                    </h2>
                  </div>
                </div>

                <button
                  onClick={handleStartNextPeriod}
                  className="flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm active:scale-95 cursor-pointer shrink-0"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Eylül 2026 (Sonraki Dönem) Bordrosunu Başlat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-3 border-t border-emerald-200/60 dark:border-emerald-900/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <Link
                  href="/reports/bank-lists"
                  className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors shadow-xs"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <FileSpreadsheet className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Banka Ödeme Raporu
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  href="/reports/payslips"
                  className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-xs"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Toplu PDF Pusulaları
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  href="/reports/sgk-summary"
                  className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-xs"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" /> SGK e-Bildirge İcmali
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          )}

          {/* Generated Documents & Exports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Bank Payment Excel Templates */}
            <div className="b2b-card p-4 rounded-lg space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <FileSpreadsheet className="w-4 h-4 text-slate-500" /> Banka Toplu Ödeme Transfer Dosyaları
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seçili {employees.length} personel için bankaların otomatik internet şubesi toplu ödeme formatında hazırlanmış dosyalar:
              </p>

              <div className="space-y-2 text-xs">
                {INITIAL_BANKS.map((b) => (
                  <div key={b.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{b.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Banka Transfer Disketi (IBAN + Tutar)</span>
                    </div>
                    <button
                      onClick={() => handleDownloadBankFile(b.name)}
                      className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white font-medium px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> İndir (.CSV)
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Toplu Payslip PDF Generation */}
            <div className="b2b-card p-4 rounded-lg space-y-3 flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <FileText className="w-4 h-4 text-slate-500" /> Toplu Maaş Pusulaları (Payslip PDF)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Seçili {employees.length} personel için toplu PDF pusula dökümü oluşturun:
                </p>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Seçili Toplam Ödenecek Net:</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(totalNet)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Seçili Personel Sayısı:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{employees.length} Kişi</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownloadPayslips}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors mt-4 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Toplu Maaş Pusulalarını İndir
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-6 rounded-xl max-w-md w-full space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase">
                Dönem Kilitlendi & Yetkilendirildi
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Ağustos 2026 Bordrosu Tamamlandı!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {employees.length} personel için bordro kilitlendi. Kümülatif vergi matrahları otomatik olarak sonraki aya (Eylül 2026) devredilmiştir.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">İşlem Yapılan Personel:</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">{employees.length} Kişi</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
                <span className="text-slate-500">Toplam Ödenecek Net Maaş:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(totalNet)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
                <span className="text-slate-500">Sonraki Dönem:</span>
                <span className="text-sky-600 dark:text-sky-400 font-bold">Eylül 2026 (Otomatik Devir)</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleStartNextPeriod}
                className="w-full flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <span>Eylül 2026 Bordrosunu Başlat</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowCompletionModal(false)}
                className="w-full flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer"
              >
                Kapat & Bu Ekranda Kal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sleek In-App Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-slate-100 px-4 py-3 rounded-xl border border-slate-700 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
