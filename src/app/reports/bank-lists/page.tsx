'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Banknote, Download } from 'lucide-react';
import { INITIAL_EMPLOYEES, EmployeeMock } from '@/lib/mock-data';
import { formatCurrency, calculatePayroll } from '@/lib/payroll-engine';

export default function BankListsReportPage() {
  const [employees, setEmployees] = useState<EmployeeMock[]>([]);
  const [selectedBank, setSelectedBank] = useState('Garanti BBVA');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        const isKeban =
          data.company?.name?.toLowerCase().includes('keban') ||
          data.user?.email === 'admin@teknoloji.com';

        if (isKeban) {
          setEmployees(INITIAL_EMPLOYEES);
        } else {
          fetch('/api/employees')
            .then((r) => r.json())
            .then((empData) => {
              if (empData.success && Array.isArray(empData.employees) && empData.employees.length > 0) {
                setEmployees(empData.employees);
              } else {
                setEmployees([]);
              }
            })
            .catch(() => setEmployees([]));
        }
      })
      .catch(() => setEmployees([]));
  }, []);

  const totalPayrollNet = employees.reduce((sum, e) => {
    const res = calculatePayroll({
      baseSalary: e.baseSalary,
      previousCumulativeMatrah: e.cumulativeMatrah || 0,
      taxExemptionType: e.taxExemptionType || 'STANDARD',
    });
    return sum + res.netSalary;
  }, 0);

  const handleDownloadBankFile = () => {
    let content = `TCKN;AD_SOYAD;BANKA;IBAN;NET_TUTAR;ACIKLAMA\n`;
    employees.forEach((emp) => {
      const res = calculatePayroll({
        baseSalary: emp.baseSalary,
        previousCumulativeMatrah: emp.cumulativeMatrah || 0,
        taxExemptionType: emp.taxExemptionType || 'STANDARD',
      });
      content += `${emp.tcNo};${emp.firstName} ${emp.lastName};${selectedBank};${emp.iban};${res.netSalary.toFixed(2)};Agustos 2026 Maas Odemesi\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `banka_maas_disket_${selectedBank.replace(/[^a-zA-Z0-9]/g, '_')}_2026_08.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-slate-600 dark:text-slate-400" /> Banka Toplu Ödeme Listesi (Maaş Disketi)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Garanti BBVA, Akbank, İş Bankası, Yapı Kredi, Ziraat Bankası uyumlu otomatik maaş transfer dosyası
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="Garanti BBVA">Garanti BBVA</option>
                <option value="İş Bankası">Türkiye İş Bankası</option>
                <option value="Akbank">Akbank</option>
                <option value="Yapı Kredi">Yapı Kredi Bankası</option>
                <option value="Ziraat Bankası">Ziraat Bankası</option>
                <option value="QNB Finansbank">QNB Finansbank</option>
              </select>

              <button
                onClick={handleDownloadBankFile}
                disabled={employees.length === 0}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> Banka Disketini İndir (.TXT)
              </button>
            </div>
          </div>

          {/* Total Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="b2b-card p-4 rounded-lg">
              <span className="text-xs text-slate-500">Toplam Ödenecek Kişi</span>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                {employees.length} Personel
              </p>
            </div>

            <div className="b2b-card p-4 rounded-lg">
              <span className="text-xs text-slate-500">Net Transfer Toplamı</span>
              <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(totalPayrollNet)}
              </p>
            </div>

            <div className="b2b-card p-4 rounded-lg">
              <span className="text-xs text-slate-500">Anlaşmalı Banka</span>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                {selectedBank} (Kurumsal Transfer)
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="b2b-card rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3">Sıra / Sicil</th>
                    <th className="p-3">Ad Soyad</th>
                    <th className="p-3">TC Kimlik No</th>
                    <th className="p-3">Banka</th>
                    <th className="p-3">IBAN No</th>
                    <th className="p-3 text-right">Ödenecek Net Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {employees.map((emp, index) => {
                    const res = calculatePayroll({
                      baseSalary: emp.baseSalary,
                      previousCumulativeMatrah: emp.cumulativeMatrah || 0,
                      taxExemptionType: emp.taxExemptionType || 'STANDARD',
                    });

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-slate-500">
                          #{index + 1} - {emp.employeeCode}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                          {emp.firstName} {emp.lastName}
                        </td>
                        <td className="p-3 font-mono text-slate-500">
                          {emp.tcNo}
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                          {emp.bankName || selectedBank}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {emp.iban}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(res.netSalary)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

