'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  Calculator,
  Printer,
  FileCheck,
  Building,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { INITIAL_EMPLOYEES, EmployeeMock, INITIAL_COMPANY } from '@/lib/mock-data';
import { calculateSeverancePay, SeveranceResult, DEFAULT_SEVERANCE_CEILING } from '@/lib/severance-engine';
import { formatCurrency } from '@/lib/payroll-engine';

export default function SeveranceCalculatorPage() {
  const [employees, setEmployees] = useState<EmployeeMock[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [leaveDate, setLeaveDate] = useState('2026-08-31');
  const [regularBenefits, setRegularBenefits] = useState(5000);
  const [unusedLeaveDays, setUnusedLeaveDays] = useState(10);
  const [reason, setReason] = useState('İşveren Tarafından Haklı Neden Olmaksızın Fesih (Kod 04)');

  const [companyInfo, setCompanyInfo] = useState({
    name: INITIAL_COMPANY.name,
    address: INITIAL_COMPANY.address,
    taxOffice: INITIAL_COMPANY.taxOffice,
    taxNo: INITIAL_COMPANY.taxNo,
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.company) {
          setCompanyInfo({
            name: data.company.name || INITIAL_COMPANY.name,
            address: data.company.address || INITIAL_COMPANY.address,
            taxOffice: data.company.taxOffice || INITIAL_COMPANY.taxOffice,
            taxNo: data.company.taxNo || INITIAL_COMPANY.taxNo,
          });
        }
        const isKeban =
          data.company?.name?.toLowerCase().includes('keban') ||
          data.user?.email === 'admin@teknoloji.com';

        if (isKeban) {
          setEmployees(INITIAL_EMPLOYEES);
          setSelectedEmpId(INITIAL_EMPLOYEES[0]?.id || '');
        } else {
          fetch('/api/employees')
            .then((r) => r.json())
            .then((empData) => {
              if (empData.success && Array.isArray(empData.employees) && empData.employees.length > 0) {
                setEmployees(empData.employees);
                setSelectedEmpId(empData.employees[0].id);
              } else {
                setEmployees([]);
              }
            })
            .catch(() => setEmployees([]));
        }
      })
      .catch(() => setEmployees([]));
  }, []);

  const selectedEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];

  let calcResult: SeveranceResult | null = null;
  if (selectedEmp) {
    calcResult = calculateSeverancePay({
      hireDate: selectedEmp.hireDate,
      leaveDate: leaveDate,
      baseSalary: selectedEmp.baseSalary,
      regularBenefits: regularBenefits,
      unusedLeaveDays: unusedLeaveDays,
      reason: reason,
    });
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 no-print">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-sky-600" /> Kıdem & İhbar Tazminatı ve İbraname Modülü
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                4857 Sayılı İş Kanunu Ek-17 maddesine uygun tazminat hesabı ve resmi ibraname dökümü
              </p>
            </div>

            <button
              onClick={handlePrint}
              disabled={!selectedEmp}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded transition-colors shadow-sm disabled:opacity-50"
            >
              <Printer className="w-4 h-4" /> İbraname & Çıkış Bordrosu Yazdır
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
            {/* Input Form Card */}
            <div className="b2b-card p-5 rounded-lg space-y-4 h-fit">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-sky-500" /> Çıkış Yapan Personel Bilgileri
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Çalışan Seçin
                  </label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    disabled={employees.length === 0}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-sky-500 cursor-pointer disabled:opacity-50"
                  >
                    {employees.length === 0 ? (
                      <option value="">Kayıtlı Çalışan Bulunmuyor</option>
                    ) : (
                      employees.map((e) => (
                        <option key={e.id} value={e.id} className="bg-white dark:bg-slate-900">
                          {e.firstName} {e.lastName} ({e.title})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {selectedEmp && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-1 text-[11px] font-mono border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">İşe Giriş Tarihi:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEmp.hireDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Son Brüt Maaş:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(selectedEmp.baseSalary)}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    İşten Ayrılış Tarihi
                  </label>
                  <input
                    type="date"
                    value={leaveDate}
                    onChange={(e) => setLeaveDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Aylık Düzenli Yan Haklar (Yol/Yemek/İkramiye Brüt)
                  </label>
                  <input
                    type="number"
                    value={regularBenefits}
                    onChange={(e) => setRegularBenefits(Number(e.target.value))}
                    step="500"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Kullanılmayan İzin Günü Sayısı
                  </label>
                  <input
                    type="number"
                    value={unusedLeaveDays}
                    onChange={(e) => setUnusedLeaveDays(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    İşten Çıkış Nedeni
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="İşveren Feshi (Kod 04)">İşveren Tarafından Haklı Neden Olmaksızın Fesih (Kod 04)</option>
                    <option value="Emeklilik (Kod 08)">Emeklilik (Kod 08)</option>
                    <option value="Askerlik (Kod 09)">Askerlik Nedeniyle Fesih (Kod 09)</option>
                    <option value="Kadın Çalışanın Evlenmesi (Kod 13)">Evlilik Nedeniyle Fesih (Kod 13)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Calculations Summary Card */}
            {calcResult && selectedEmp ? (
              <div className="lg:col-span-2 b2b-card p-5 rounded-lg space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-500" /> Hesaplama Özeti
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Toplam Kıdem Süresi: <b>{calcResult.tenureYears} Yıl, {calcResult.tenureMonths} Ay, {calcResult.tenureDays} Gün</b> ({calcResult.totalTenureDays} Gün)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">2026 Kıdem Tavanı</span>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {formatCurrency(DEFAULT_SEVERANCE_CEILING)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Kıdem Card */}
                  <div className="p-4 bg-sky-50/60 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800 space-y-2">
                    <span className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider block">
                      1. Kıdem Tazminatı
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Giydirilmiş Brüt:</span>
                        <span className="font-mono">{formatCurrency(calcResult.grossMonthlyBasis)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Brüt Kıdem:</span>
                        <span className="font-mono font-semibold">{formatCurrency(calcResult.grossSeverance)}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 text-[11px]">
                        <span>Damga Vergisi (‰7.59):</span>
                        <span className="font-mono">- {formatCurrency(calcResult.severanceStampTax)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-sky-200 dark:border-sky-800 font-bold text-sky-900 dark:text-sky-100">
                        <span>Net Kıdem:</span>
                        <span className="font-mono">{formatCurrency(calcResult.netSeverance)}</span>
                      </div>
                    </div>
                  </div>

                  {/* İhbar Card */}
                  <div className="p-4 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                      2. İhbar Tazminatı ({calcResult.noticeWeeks} Hafta)
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Brüt İhbar:</span>
                        <span className="font-mono font-semibold">{formatCurrency(calcResult.grossNotice)}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 text-[11px]">
                        <span>Gelir Vergisi (%15):</span>
                        <span className="font-mono">- {formatCurrency(calcResult.noticeIncomeTax)}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 text-[11px]">
                        <span>Damga V. (‰7.59):</span>
                        <span className="font-mono">- {formatCurrency(calcResult.noticeStampTax)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-amber-200 dark:border-amber-800 font-bold text-amber-900 dark:text-amber-100">
                        <span>Net İhbar:</span>
                        <span className="font-mono">{formatCurrency(calcResult.netNotice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* İzin Ücreti Card */}
                  <div className="p-4 bg-purple-50/60 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2">
                    <span className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider block">
                      3. İzin Ücreti ({unusedLeaveDays} Gün)
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Brüt İzin Ücreti:</span>
                        <span className="font-mono font-semibold">{formatCurrency(calcResult.grossUnusedLeave)}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 text-[11px]">
                        <span>SGK İşçi (%15):</span>
                        <span className="font-mono">- {formatCurrency(calcResult.unusedLeaveSgk)}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 text-[11px]">
                        <span>Gelir & Damga V.:</span>
                        <span className="font-mono">- {formatCurrency(calcResult.unusedLeaveIncomeTax + calcResult.unusedLeaveStampTax)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-purple-200 dark:border-purple-800 font-bold text-purple-900 dark:text-purple-100">
                        <span>Net İzin Ücreti:</span>
                        <span className="font-mono">{formatCurrency(calcResult.netUnusedLeave)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Net Box */}
                <div className="bg-emerald-50 dark:bg-emerald-950/60 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                      TOPLAM ÖDENECEK NET TAZMİNAT & HAKEDİŞ
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Banka kanalıyla çalışanın hesabına yatırılacak toplam tutar
                    </span>
                  </div>
                  <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(calcResult.totalNetPay)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2 b2b-card p-12 text-center text-xs text-slate-400">
                Lütfen hesaplama yapmak için çalışan seçiniz.
              </div>
            )}
          </div>

          {/* Printable Official Release Document (İbraname) */}
          {calcResult && selectedEmp && (
            <div className="p-8 bg-white text-slate-900 space-y-6 font-sans text-xs border border-slate-300 rounded shadow-md mt-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-300 pb-4">
                <div>
                  <h1 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                    {companyInfo.name}
                  </h1>
                  <p className="text-[11px] text-slate-500 mt-0.5">{companyInfo.address}</p>
                  <p className="text-[11px] text-slate-500">
                    V.D.: {companyInfo.taxOffice} | V.No: {companyInfo.taxNo}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-slate-100 text-slate-800 px-3 py-1.5 font-bold text-xs border border-slate-300 rounded">
                    KIDEM, İHBAR VE İBRANAME BELGESİ
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600 mt-1">Tarih: {leaveDate}</p>
                </div>
              </div>

              {/* Employee Summary */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <p><b>Çalışan Ad Soyad:</b> {selectedEmp.firstName} {selectedEmp.lastName}</p>
                  <p><b>TC Kimlik No:</b> {selectedEmp.tcNo}</p>
                  <p><b>Sicil No:</b> {selectedEmp.employeeCode}</p>
                </div>
                <div>
                  <p><b>İşe Giriş Tarihi:</b> {selectedEmp.hireDate}</p>
                  <p><b>İşten Çıkış Tarihi:</b> {leaveDate}</p>
                  <p><b>Toplam Kıdem:</b> {calcResult.tenureYears} Yıl {calcResult.tenureMonths} Ay {calcResult.tenureDays} Gün</p>
                </div>
              </div>

              {/* Breakdown Table */}
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-left">Ödeme Kalemi</th>
                    <th className="border border-slate-300 p-2 text-right">Brüt Tutar</th>
                    <th className="border border-slate-300 p-2 text-right">Kesintiler</th>
                    <th className="border border-slate-300 p-2 text-right">Net Ödenen Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-2 font-medium">Kıdem Tazminatı</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{formatCurrency(calcResult.grossSeverance)}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono text-rose-600">- {formatCurrency(calcResult.severanceStampTax)}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-bold">{formatCurrency(calcResult.netSeverance)}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2 font-medium">İhbar Tazminatı ({calcResult.noticeWeeks} Hafta)</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{formatCurrency(calcResult.grossNotice)}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono text-rose-600">- {formatCurrency(calcResult.noticeIncomeTax + calcResult.noticeStampTax)}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-bold">{formatCurrency(calcResult.netNotice)}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2 font-medium">Kullanılmayan İzin Ücreti ({unusedLeaveDays} Gün)</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{formatCurrency(calcResult.grossUnusedLeave)}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono text-rose-600">- {formatCurrency(calcResult.unusedLeaveSgk + calcResult.unusedLeaveIncomeTax + calcResult.unusedLeaveStampTax)}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-bold">{formatCurrency(calcResult.netUnusedLeave)}</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold">
                    <td className="border border-slate-300 p-2">GENEL TOPLAM</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{formatCurrency(calcResult.totalGrossPay)}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono text-rose-600">- {formatCurrency(calcResult.totalDeductions)}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono text-emerald-700 text-sm">{formatCurrency(calcResult.totalNetPay)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Release Text */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 leading-relaxed">
                <b>İBRANAME BEYANI:</b> İşverenden yukarıda dökümü yapılan <b>{formatCurrency(calcResult.totalNetPay)}</b> tutarındaki kıdem tazminatı, ihbar tazminatı ve kullanılmayan yıllık izin alacaklarımı banka kanalıyla eksiksiz olarak teslim aldım. İşyerinden çalıştığım süreye ilişkin başkaca bir hak ve alacağımın kalmadığını, işvereni gayrikabili rücu serbest irademle ibra ettiğimi kabul ve beyan ederim.
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 gap-12 text-center text-slate-700">
                <div className="border-t border-slate-300 pt-2">
                  <p className="font-semibold text-xs">İşveren / İK Yetkilisi İmza</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{companyInfo.name}</p>
                </div>
                <div className="border-t border-slate-300 pt-2">
                  <p className="font-semibold text-xs">İbra Eden Çalışan İmza</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {selectedEmp.firstName} {selectedEmp.lastName}
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
