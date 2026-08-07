'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { PayslipModal } from '@/components/payslip-modal';
import { FileText, Printer, Eye, UserPlus } from 'lucide-react';
import { INITIAL_EMPLOYEES, EmployeeMock } from '@/lib/mock-data';
import { formatCurrency, calculatePayroll } from '@/lib/payroll-engine';

export default function PayslipsReportPage() {
  const [employees, setEmployees] = useState<EmployeeMock[]>([]);
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState<EmployeeMock | null>(null);
  const [monthlyMap, setMonthlyMap] = useState<{
    overtime: { [empId: string]: number };
    incomes: { [empId: string]: number };
    commissions: { [empId: string]: number };
    deductions: { [empId: string]: number };
    loans: { [empId: string]: number };
  }>({ overtime: {}, incomes: {}, commissions: {}, deductions: {}, loans: {} });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        const isKeban =
          data.company?.name?.toLowerCase().includes('keban') ||
          data.user?.email === 'admin@teknoloji.com';

        if (isKeban) {
          setEmployees(INITIAL_EMPLOYEES);
          setMonthlyMap({
            overtime: { 'emp-101': 10, 'emp-103': 15 },
            incomes: { 'emp-01': 15000, 'emp-02': 8500 },
            commissions: { 'emp-03': 31000 },
            deductions: { 'emp-01': 8250 },
            loans: { 'emp-02': 5000 },
          });
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

          Promise.all([
            fetch('/api/monthly-data?type=overtime').then((r) => r.json()).catch(() => ({})),
            fetch('/api/monthly-data?type=incomes').then((r) => r.json()).catch(() => ({})),
            fetch('/api/monthly-data?type=commissions').then((r) => r.json()).catch(() => ({})),
            fetch('/api/monthly-data?type=deductions').then((r) => r.json()).catch(() => ({})),
            fetch('/api/monthly-data?type=loans').then((r) => r.json()).catch(() => ({})),
          ]).then(([ov, inc, comm, ded, ln]) => {
            const ovMap: { [empId: string]: number } = ov.data || {};

            const incMap: { [empId: string]: number } = {};
            if (Array.isArray(inc.data)) {
              inc.data.forEach((i: any) => {
                incMap[i.employeeId] = (incMap[i.employeeId] || 0) + Number(i.amount || 0);
              });
            }

            const commMap: { [empId: string]: number } = {};
            if (Array.isArray(comm.data)) {
              comm.data.forEach((c: any) => {
                commMap[c.employeeId] = (commMap[c.employeeId] || 0) + Number(c.amount || 0);
              });
            }

            const dedMap: { [empId: string]: number } = {};
            if (Array.isArray(ded.data)) {
              ded.data.forEach((d: any) => {
                dedMap[d.employeeId] = (dedMap[d.employeeId] || 0) + Number(d.amount || 0);
              });
            }

            const lnMap: { [empId: string]: number } = {};
            if (Array.isArray(ln.data)) {
              ln.data.forEach((l: any) => {
                lnMap[l.employeeId] = (lnMap[l.employeeId] || 0) + Number(l.monthlyAmount || 0);
              });
            }

            setMonthlyMap({
              overtime: ovMap,
              incomes: incMap,
              commissions: commMap,
              deductions: dedMap,
              loans: lnMap,
            });
          });
        }
      })
      .catch(() => setEmployees([]));
  }, []);

  const handleBulkPrint = () => {
    window.print();
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
                <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" /> Resmi Maaş Pusulaları (PDF)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                4857 Sayılı İş Kanunu Ek-2 maddesine uygun toplu ve bireysel maaş pusula dökümleri
              </p>
            </div>

            <button
              onClick={handleBulkPrint}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" /> Toplu Yazdır / PDF Al
            </button>
          </div>

          <div className="b2b-card rounded-lg overflow-hidden">
            {employees.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Pusulası Gösterilecek Çalışan Bulunmuyor
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Maaş pusulası dökümü alabilmek için lütfen şirketiniz için çalışan kaydı ekleyiniz.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/employees/new"
                    className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" /> + Yeni Çalışan Ekle
                  </Link>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3">Sicil / Çalışan</th>
                    <th className="p-3">Departman</th>
                    <th className="p-3 text-right">Temel Brüt</th>
                    <th className="p-3 text-right">Toplam Brüt</th>
                    <th className="p-3 text-right">Net Ödenecek</th>
                    <th className="p-3 text-center">Pusula Önizle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {employees.map((emp) => {
                    const ovHours = monthlyMap.overtime[emp.id] || 0;
                    const incTot = monthlyMap.incomes[emp.id] || 0;
                    const commTot = monthlyMap.commissions[emp.id] || 0;
                    const dedTot = monthlyMap.deductions[emp.id] || 0;
                    const loanTot = monthlyMap.loans[emp.id] || 0;

                    const res = calculatePayroll({
                      baseSalary: emp.baseSalary,
                      previousCumulativeMatrah: emp.cumulativeMatrah || 0,
                      taxExemptionType: emp.taxExemptionType || 'STANDARD',
                      overtimeHours: ovHours,
                      totalIncomes: incTot,
                      commissions: commTot,
                      deductions: dedTot,
                      loanInstallment: loanTot,
                    });

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3">
                          <span className="font-mono font-bold text-sky-600 dark:text-sky-400 mr-2">
                            {emp.employeeCode}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {emp.firstName} {emp.lastName}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {emp.departmentName || 'Genel Yönetim'}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                          {formatCurrency(emp.baseSalary)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-sky-700 dark:text-sky-300">
                          {formatCurrency(res.totalGrossEarnings)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(res.netSalary)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedPayslipEmp(emp)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-medium text-[11px]"
                          >
                            <Eye className="w-3.5 h-3.5" /> Görüntüle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      <PayslipModal
        employee={selectedPayslipEmp}
        periodName="Ağustos 2026 Bordrosu"
        onClose={() => setSelectedPayslipEmp(null)}
      />
    </div>
  );
}

