'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { PayslipModal } from '@/components/payslip-modal';
import {
  PlaySquare,
  ArrowRight,
  FileText,
  CheckCircle2,
  Search,
  Filter,
  Users,
  CheckSquare,
  Square,
  RefreshCw,
} from 'lucide-react';
import { INITIAL_EMPLOYEES, EmployeeMock } from '@/lib/mock-data';
import { calculatePayroll, formatCurrency } from '@/lib/payroll-engine';

export default function RunPayrollPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeMock[]>([]);
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState<EmployeeMock | null>(null);
  const [selectedPayslipMonthly, setSelectedPayslipMonthly] = useState<any>(null);

  // Selection & Filtering States
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

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
          setSelectedEmpIds(INITIAL_EMPLOYEES.map((e) => e.id));
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
                setSelectedEmpIds(empData.employees.map((e: any) => e.id));
              } else {
                setEmployees([]);
                setSelectedEmpIds([]);
              }
            })
            .catch(() => setEmployees([]));

          // Fetch all monthly data categories
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

  // Department List for Filter Dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e: any) => {
      const dName = e.departmentName || e.department;
      if (dName) set.add(dName);
    });
    return Array.from(set);
  }, [employees]);

  // Filtered employees list based on search term & department filter
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp: any) => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const code = (emp.employeeCode || '').toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || code.includes(searchTerm.toLowerCase());
      const dName = emp.departmentName || emp.department;
      const matchesDept = deptFilter === 'ALL' || dName === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, deptFilter]);

  // Selection Helper Handlers
  const isAllSelected = filteredEmployees.length > 0 && filteredEmployees.every((e) => selectedEmpIds.includes(e.id));
  const isSomeSelected = filteredEmployees.some((e) => selectedEmpIds.includes(e.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Remove all filtered employees from selection
      const filteredIds = new Set(filteredEmployees.map((e) => e.id));
      setSelectedEmpIds(selectedEmpIds.filter((id) => !filteredIds.has(id)));
    } else {
      // Add all filtered employees to selection
      const newSet = new Set([...selectedEmpIds, ...filteredEmployees.map((e) => e.id)]);
      setSelectedEmpIds(Array.from(newSet));
    }
  };

  const toggleSelectEmp = (id: string) => {
    if (selectedEmpIds.includes(id)) {
      setSelectedEmpIds(selectedEmpIds.filter((empId) => empId !== id));
    } else {
      setSelectedEmpIds([...selectedEmpIds, id]);
    }
  };

  // Calculate monthly aggregates ONLY FOR SELECTED EMPLOYEES
  let totalGross = 0;
  let totalNet = 0;
  let totalEmployerCost = 0;
  let totalSgkEmployee = 0;

  const calculatedList = employees.map((emp) => {
    const isSelected = selectedEmpIds.includes(emp.id);

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

    if (isSelected) {
      totalGross += res.totalGrossEarnings;
      totalNet += res.netSalary;
      totalEmployerCost += res.totalEmployerCost;
      totalSgkEmployee += res.totalSgkEmployee;
    }

    return {
      emp,
      res,
      isSelected,
      ovHours,
      incTot,
      commTot,
      dedTot,
      loanTot,
    };
  });

  // Navigate to Stage 2 with selected employee IDs saved
  const handleProceedToApprove = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('payroll_selected_emp_ids_2026-08', JSON.stringify(selectedEmpIds));
    }
    router.push('/payroll/approve');
  };

  return (
    <div className="flex h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Header & Stepper */}
          <div className="b2b-card p-5 rounded-lg space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <PlaySquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  1. Aşama: Bordro Hazırlığı & Kişi Seçim Matrisi
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ağustos 2026 dönemi bordro hesaplanacak çalışanları seçin ve Brüt &rarr; Net sonuçları inceleyin
                </p>
              </div>

              <button
                onClick={handleProceedToApprove}
                disabled={selectedEmpIds.length === 0}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-sm ${
                  selectedEmpIds.length > 0
                    ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer active:scale-95'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>2. Aşamaya Geç ({selectedEmpIds.length} Kişi)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Steps */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="py-2 rounded bg-sky-600 text-white flex items-center justify-center gap-1.5 shadow-xs">
                <span className="w-4 h-4 rounded-full bg-white text-sky-700 text-[10px] flex items-center justify-center font-bold">1</span>
                1. Kişileri Seç & Hazırla
              </div>
              <div className="py-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 text-[10px] flex items-center justify-center font-bold">2</span>
                2. Onayla
              </div>
              <div className="py-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 text-[10px] flex items-center justify-center font-bold">3</span>
                3. Yetkilendir & Kilitle
              </div>
            </div>
          </div>

          {/* Aggregates Summary Bar (DYNAMICALLY COMPUTED FOR SELECTED EMPLOYEES) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="b2b-card b2b-card-hover p-4 rounded-lg">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span>Seçili Brüt Kazanç</span>
                <span className="text-[10px] font-mono bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded">
                  {selectedEmpIds.length} / {employees.length} Kişi
                </span>
              </div>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                {formatCurrency(totalGross)}
              </p>
            </div>

            <div className="b2b-card b2b-card-hover p-4 rounded-lg">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Seçili Toplam Net</span>
              <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(totalNet)}
              </p>
            </div>

            <div className="b2b-card b2b-card-hover p-4 rounded-lg">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Seçili SGK İşçi Payı (%14)</span>
              <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {formatCurrency(totalSgkEmployee)}
              </p>
            </div>

            <div className="b2b-card b2b-card-hover p-4 rounded-lg">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Seçili İşveren Maliyeti</span>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                {formatCurrency(totalEmployerCost)}
              </p>
            </div>
          </div>

          {/* Filtering and Selection Controls Bar */}
          <div className="b2b-card p-4 rounded-lg space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="İsim, soyisim veya sicil no ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Department Filter Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tüm Departmanlar</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bulk Selection Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedEmpIds(employees.map((e) => e.id))}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  Tümünü Seç
                </button>
                <button
                  onClick={() => setSelectedEmpIds([])}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold transition-colors"
                >
                  Seçimi Temizle
                </button>
              </div>
            </div>
          </div>

          {/* Calculation Table */}
          <div className="b2b-card rounded-lg overflow-hidden shadow-sm">
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Ağustos 2026 Bordro Matrisi
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  {selectedEmpIds.length} / {employees.length} Personel Seçili
                </span>
              </div>
            </div>

            {employees.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <PlaySquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Hesaplanacak Çalışan Bulunmuyor
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Şirketiniz için bordro matrisi oluşturmak ve maaş hesaplamak için lütfen önce çalışan tanımı yapınız.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/employees/new"
                    className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors shadow-sm"
                  >
                    + Yeni Çalışan Ekle
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = !isAllSelected && isSomeSelected;
                          }}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 accent-sky-600 cursor-pointer rounded"
                          title="Tümünü Seç / Seçimi Kaldır"
                        />
                      </th>
                      <th className="p-3">Personel / Sicil</th>
                      <th className="p-3">Departman</th>
                      <th className="p-3 text-right">Temel Brüt</th>
                      <th className="p-3 text-right">Fazla Mesai</th>
                      <th className="p-3 text-right">Ek Gelir / Prim</th>
                      <th className="p-3 text-right">Top. Brüt</th>
                      <th className="p-3 text-right">SGK İşçi</th>
                      <th className="p-3 text-right">Gelir Vergisi</th>
                      <th className="p-3 text-right">Damga V.</th>
                      <th className="p-3 text-right">Kesinti / Borç</th>
                      <th className="p-3 text-right">Ele Geçen Net</th>
                      <th className="p-3 text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {calculatedList
                      .filter(({ emp }: any) => {
                        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
                        const code = (emp.employeeCode || '').toLowerCase();
                        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || code.includes(searchTerm.toLowerCase());
                        const dName = emp.departmentName || emp.department;
                        const matchesDept = deptFilter === 'ALL' || dName === deptFilter;
                        return matchesSearch && matchesDept;
                      })
                      .map(({ emp, res, isSelected, ovHours, incTot, commTot, dedTot, loanTot }: any) => (
                        <tr
                          key={emp.id}
                          className={`transition-colors ${
                            isSelected
                              ? 'bg-sky-50/40 dark:bg-sky-950/20 hover:bg-sky-50/70 dark:hover:bg-sky-950/30'
                              : 'opacity-60 bg-slate-50/30 dark:bg-slate-900/30 hover:opacity-100'
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectEmp(emp.id)}
                              className="w-4 h-4 accent-sky-600 cursor-pointer rounded"
                            />
                          </td>
                          <td className="p-3 font-sans">
                            <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                              {emp.firstName} {emp.lastName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {emp.employeeCode}
                            </span>
                          </td>
                          <td className="p-3 font-sans text-xs text-slate-600 dark:text-slate-400">
                            {emp.departmentName || (emp as any).department || '-'}
                          </td>
                          <td className="p-3 text-right text-slate-700 dark:text-slate-300">
                            {formatCurrency(res.grossSalary)}
                          </td>
                          <td className="p-3 text-right font-medium text-sky-600 dark:text-sky-400">
                            {ovHours > 0 ? (
                              <span>
                                {ovHours} Sa ({formatCurrency(res.overtimeAmount)})
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                            {incTot + commTot > 0 ? (
                              <span>+ {formatCurrency(incTot + commTot)}</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(res.totalGrossEarnings)}
                          </td>
                          <td className="p-3 text-right text-amber-600 dark:text-amber-400 font-medium">
                            - {formatCurrency(res.totalSgkEmployee)}
                          </td>
                          <td className="p-3 text-right text-rose-600 dark:text-rose-400 font-medium">
                            - {formatCurrency(res.netIncomeTax)}
                          </td>
                          <td className="p-3 text-right text-rose-600 dark:text-rose-400 font-medium">
                            - {formatCurrency(res.netStampTax)}
                          </td>
                          <td className="p-3 text-right text-rose-700 font-medium">
                            {dedTot + loanTot > 0 ? (
                              <span>- {formatCurrency(dedTot + loanTot)}</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            {formatCurrency(res.netSalary)}
                          </td>
                          <td className="p-3 text-center font-sans">
                            <button
                              onClick={() => {
                                setSelectedPayslipEmp(emp);
                                setSelectedPayslipMonthly({
                                  overtimeHours: ovHours,
                                  totalIncomes: incTot,
                                  commissions: commTot,
                                  deductions: dedTot,
                                  loanInstallment: loanTot,
                                });
                              }}
                              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/60 hover:text-sky-600 transition-colors flex items-center gap-1 mx-auto text-[11px] font-semibold"
                              title="Pusula Önizle"
                            >
                              <FileText className="w-3.5 h-3.5 text-sky-600" /> Pusula
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <PayslipModal
        employee={selectedPayslipEmp}
        monthlyInputs={selectedPayslipMonthly}
        periodName="Ağustos 2026 Bordrosu"
        onClose={() => {
          setSelectedPayslipEmp(null);
          setSelectedPayslipMonthly(null);
        }}
      />
    </div>
  );
}
