'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { ShieldAlert, Download, Building, CheckCircle2, UserCheck } from 'lucide-react';
import { INITIAL_EMPLOYEES, EmployeeMock } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/payroll-engine';

export default function MonthlyBesPage() {
  const [employees, setEmployees] = useState<EmployeeMock[]>([]);
  const [selectedBank, setSelectedBank] = useState('Garanti Emeklilik');

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

  const totalGross = employees.reduce((sum, e) => sum + e.baseSalary, 0);
  const totalBesDeduction = totalGross * 0.03; // %3 Zorunlu BES Kesintisi

  const handleExportBes = () => {
    let csv = `TCKN;AD_SOYAD;BRUT_MAAS;BES_ORANI;BES_KESINTI_TUTARI;EMEKLILIK_SIRKETI\n`;
    employees.forEach((emp) => {
      const besAmt = (emp.baseSalary * 0.03).toFixed(2);
      csv += `${emp.tcNo};${emp.firstName} ${emp.lastName};${emp.baseSalary};%3;${besAmt};${selectedBank}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bes_aktarim_${selectedBank.replace(/[^a-zA-Z0-9]/g, '_')}_2026_08.csv`;
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
                <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Zorunlu BES (Otomatik Katılım OKA) Yönetimi
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                45 yaş altı çalışanlar için brüt maaş üzerinden %3 zorunlu Bireysel Emeklilik kesintileri ve Emeklilik Şirketi aktarım dosyası
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold focus:outline-none"
              >
                <option value="Garanti Emeklilik">Garanti BBVA Emeklilik</option>
                <option value="Anadolu Hayat Emeklilik">Anadolu Hayat Emeklilik</option>
                <option value="Türkiye Hayat Emeklilik">Türkiye Hayat Emeklilik</option>
                <option value="Allianz Emeklilik">Allianz Emeklilik</option>
                <option value="AgeSA Hayat Emeklilik">AgeSA Hayat Emeklilik</option>
              </select>

              <button
                onClick={handleExportBes}
                disabled={employees.length === 0}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> BES Dosyası İndir (.CSV)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="b2b-card p-4 rounded-lg">
              <span className="text-xs text-slate-500">Kapsamdaki Çalışan Sayısı</span>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                {employees.length} Kişi
              </p>
            </div>

            <div className="b2b-card p-4 rounded-lg">
              <span className="text-xs text-slate-500">Toplam Brüt Maaş Matrahı</span>
              <p className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
                {formatCurrency(totalGross)}
              </p>
            </div>

            <div className="b2b-card p-4 rounded-lg">
              <span className="text-xs text-slate-500">Toplam Aylık BES Kesintisi (%3)</span>
              <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(totalBesDeduction)}
              </p>
            </div>
          </div>

          <div className="b2b-card rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3">Sicil / TC No</th>
                  <th className="p-3">Çalışan Ad Soyad</th>
                  <th className="p-3">Durum</th>
                  <th className="p-3 text-right">Temel Brüt Maaş</th>
                  <th className="p-3 text-center">Kesinti Oranı</th>
                  <th className="p-3 text-right">Aylık BES Kesintisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp) => {
                  const besAmount = emp.baseSalary * 0.03;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <span className="font-mono font-bold text-sky-600 dark:text-sky-400 block">
                          {emp.employeeCode}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {emp.tcNo}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                          <UserCheck className="w-3 h-3 text-emerald-500" /> Otomatik Katılım (OKA)
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(emp.baseSalary)}
                      </td>
                      <td className="p-3 text-center font-mono font-semibold text-sky-600 dark:text-sky-400">
                        %3,00
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(besAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
