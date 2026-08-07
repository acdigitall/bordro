'use client';

import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import { EmployeeMock, INITIAL_COMPANY } from '@/lib/mock-data';
import { calculatePayroll, formatCurrency } from '@/lib/payroll-engine';

interface PayslipModalProps {
  employee: EmployeeMock | null;
  periodName: string;
  monthlyInputs?: {
    overtimeHours?: number;
    totalIncomes?: number;
    commissions?: number;
    deductions?: number;
    loanInstallment?: number;
  };
  onClose: () => void;
}

export function PayslipModal({ employee, periodName, monthlyInputs, onClose }: PayslipModalProps) {
  const [companyInfo, setCompanyInfo] = React.useState({
    name: INITIAL_COMPANY.name,
    address: INITIAL_COMPANY.address,
    taxOffice: INITIAL_COMPANY.taxOffice,
    taxNo: INITIAL_COMPANY.taxNo,
    logoUrl: '',
  });

  const [localMonthly, setLocalMonthly] = React.useState({
    overtimeHours: monthlyInputs?.overtimeHours || 0,
    totalIncomes: monthlyInputs?.totalIncomes || 0,
    commissions: monthlyInputs?.commissions || 0,
    deductions: monthlyInputs?.deductions || 0,
    loanInstallment: monthlyInputs?.loanInstallment || 0,
  });

  React.useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.authenticated && data.company) {
          setCompanyInfo({
            name: data.company.name || INITIAL_COMPANY.name,
            address: data.company.address || 'Adres bilgisi girilmemiştir',
            taxOffice: data.company.taxOffice || 'Büyük Mükellefler V.D.',
            taxNo: data.company.taxNo || '0000000000',
            logoUrl: data.company.logoUrl || '',
          });
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (employee && !monthlyInputs) {
      Promise.all([
        fetch('/api/monthly-data?type=overtime').then((r) => r.json()).catch(() => ({})),
        fetch('/api/monthly-data?type=incomes').then((r) => r.json()).catch(() => ({})),
        fetch('/api/monthly-data?type=commissions').then((r) => r.json()).catch(() => ({})),
        fetch('/api/monthly-data?type=deductions').then((r) => r.json()).catch(() => ({})),
        fetch('/api/monthly-data?type=loans').then((r) => r.json()).catch(() => ({})),
      ]).then(([ov, inc, comm, ded, ln]) => {
        const empId = employee.id;
        const ovHours = (ov.data && ov.data[empId]) || 0;

        let incTot = 0;
        if (Array.isArray(inc.data)) {
          inc.data.filter((i: any) => i.employeeId === empId).forEach((i: any) => (incTot += Number(i.amount || 0)));
        }

        let commTot = 0;
        if (Array.isArray(comm.data)) {
          comm.data.filter((c: any) => c.employeeId === empId).forEach((c: any) => (commTot += Number(c.amount || 0)));
        }

        let dedTot = 0;
        if (Array.isArray(ded.data)) {
          ded.data.filter((d: any) => d.employeeId === empId).forEach((d: any) => (dedTot += Number(d.amount || 0)));
        }

        let loanTot = 0;
        if (Array.isArray(ln.data)) {
          ln.data.filter((l: any) => l.employeeId === empId).forEach((l: any) => (loanTot += Number(l.monthlyAmount || 0)));
        }

        setLocalMonthly({
          overtimeHours: ovHours,
          totalIncomes: incTot,
          commissions: commTot,
          deductions: dedTot,
          loanInstallment: loanTot,
        });
      });
    } else if (monthlyInputs) {
      setLocalMonthly({
        overtimeHours: monthlyInputs.overtimeHours || 0,
        totalIncomes: monthlyInputs.totalIncomes || 0,
        commissions: monthlyInputs.commissions || 0,
        deductions: monthlyInputs.deductions || 0,
        loanInstallment: monthlyInputs.loanInstallment || 0,
      });
    }
  }, [employee, monthlyInputs]);

  if (!employee) return null;

  const result = calculatePayroll({
    baseSalary: employee.baseSalary,
    previousCumulativeMatrah: employee.cumulativeMatrah,
    taxExemptionType: employee.taxExemptionType,
    overtimeHours: localMonthly.overtimeHours,
    totalIncomes: localMonthly.totalIncomes,
    commissions: localMonthly.commissions,
    deductions: localMonthly.deductions,
    loanInstallment: localMonthly.loanInstallment,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg max-w-3xl w-full shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Modal Action Bar (No-print) */}
        <div className="p-3.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between no-print font-sans">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
              Resmi Maaş Pusulası (Payslip) - {periodName}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-1 rounded transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" /> Yazdır / PDF İndir
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official Printable Payslip Document */}
        <div className="p-6 space-y-5 font-sans text-xs bg-white text-slate-900">
          {/* Document Header */}
          <div className="flex items-start justify-between border-b border-slate-300 pb-3">
            <div className="flex items-start gap-3">
              {companyInfo.logoUrl && (
                <img
                  src={companyInfo.logoUrl}
                  alt={companyInfo.name}
                  className="w-12 h-12 object-contain rounded border border-slate-200 p-0.5 shrink-0"
                />
              )}
              <div>
                <h1 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
                  {companyInfo.name}
                </h1>
                <p className="text-[11px] text-slate-500 mt-0.5">{companyInfo.address}</p>
                <p className="text-[11px] text-slate-500">
                  Vergi Dairesi: {companyInfo.taxOffice} | V.No: {companyInfo.taxNo}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block bg-slate-100 text-slate-800 px-2.5 py-1 font-bold text-xs border border-slate-300 rounded">
                MAAŞ PUSULASI
              </div>
              <p className="text-[11px] font-semibold text-slate-600 mt-1">{periodName}</p>
            </div>
          </div>

          {/* Employee Information Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 bg-slate-50/80 p-3.5 rounded border border-slate-200 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Ad Soyad:</span>
                <span className="font-bold text-slate-900">
                  {employee.firstName} {employee.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TC Kimlik No:</span>
                <span className="font-mono font-semibold text-slate-800">{employee.tcNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sicil No:</span>
                <span className="font-mono font-semibold text-slate-800">{employee.employeeCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">İşe Giriş Tarihi:</span>
                <span className="font-medium text-slate-800">{employee.hireDate}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Departman:</span>
                <span className="font-semibold text-slate-800">{employee.departmentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unvan:</span>
                <span className="font-medium text-slate-800">{employee.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ödeme Bankası:</span>
                <span className="font-medium text-slate-800">{employee.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IBAN:</span>
                <span className="font-mono text-[10px] text-slate-800">{employee.iban}</span>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Grid */}
          <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded overflow-hidden">
            {/* Left Column: Earnings (Kazançlar) */}
            <div>
              <div className="bg-slate-100 font-bold p-2 border-b border-slate-300 text-slate-800 text-[11px] uppercase tracking-wider">
                Kazançlar (Hakedişler)
              </div>
              <div className="p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span>Temel Brüt Ücret (30 Gün / 225 Saat):</span>
                  <span className="font-mono font-semibold">{formatCurrency(result.grossSalary)}</span>
                </div>

                <div className="flex justify-between text-sky-700 font-medium">
                  <span>Fazla Mesai ({localMonthly.overtimeHours} Saat / %150):</span>
                  <span className="font-mono">{formatCurrency(result.overtimeAmount)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Ek Gelirler & İkramiye:</span>
                  <span className="font-mono">{formatCurrency(result.totalIncome)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Prim & Satış Komisyonu:</span>
                  <span className="font-mono">{formatCurrency(result.commissionAmount)}</span>
                </div>

                <div className="flex justify-between font-bold pt-2 border-t border-slate-200 text-slate-900">
                  <span>TOPLAM BRÜT KAZANÇ:</span>
                  <span className="font-mono">{formatCurrency(result.totalGrossEarnings)}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Deductions & Taxes (Kesintiler & Vergiler) */}
            <div className="border-l border-slate-300">
              <div className="bg-slate-100 font-bold p-2 border-b border-slate-300 text-slate-800 text-[11px] uppercase tracking-wider">
                Kesintiler & Vergiler
              </div>
              <div className="p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span>SGK İşçi Payı (%14):</span>
                  <span className="font-mono">{formatCurrency(result.sgkEmployee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>İşsizlik İşçi Payı (%1):</span>
                  <span className="font-mono">{formatCurrency(result.unemploymentEmployee)}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-medium">
                  <span>Gelir Vergisi (Net):</span>
                  <span className="font-mono">{formatCurrency(result.netIncomeTax)}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-medium">
                  <span>Damga Vergisi (Net):</span>
                  <span className="font-mono">{formatCurrency(result.netStampTax)}</span>
                </div>

                {/* Additional Deductions / Loans if present */}
                {result.totalDeductionsInput > 0 && (
                  <div className="flex justify-between text-rose-800 font-medium">
                    <span>Yasal Kesintiler (İcra / Cezalar):</span>
                    <span className="font-mono">- {formatCurrency(result.totalDeductionsInput)}</span>
                  </div>
                )}
                {result.loanInstallmentInput > 0 && (
                  <div className="flex justify-between text-amber-800 font-medium">
                    <span>Avans / Borç Taksit Düşümü:</span>
                    <span className="font-mono">- {formatCurrency(result.loanInstallmentInput)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold pt-2 border-t border-slate-200 text-slate-900">
                  <span>TOPLAM KESİNTİ:</span>
                  <span className="font-mono">
                    {formatCurrency(
                      result.totalSgkEmployee +
                        result.netIncomeTax +
                        result.netStampTax +
                        result.totalDeductionsInput +
                        result.loanInstallmentInput
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cumulative Tax & Exemption Status Bar */}
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Önceki Kümülatif GV Matrahı</span>
              <span className="font-mono font-semibold text-slate-800">
                {formatCurrency(result.previousCumulativeMatrah)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Yeni Kümülatif GV Matrahı</span>
              <span className="font-mono font-semibold text-slate-800">
                {formatCurrency(result.newCumulativeMatrah)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Asgari Ücret Vergi İstisnası</span>
              <span className="font-mono font-bold text-emerald-700">
                {formatCurrency(result.minWageExemptionGV + result.minWageExemptionDV)}
              </span>
            </div>
          </div>

          {/* Clean Net Salary Box */}
          <div className="bg-slate-100 border border-slate-300 p-3.5 rounded flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                ÖDENECEK NET MAAŞ
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Banka havalesi ile çalışanın hesabına yatırılacak tutar
              </span>
            </div>
            <span className="text-xl font-bold font-mono text-emerald-700 tracking-tight">
              {formatCurrency(result.netSalary)}
            </span>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-12 text-center text-slate-700">
            <div className="border-t border-slate-300 pt-2">
              <p className="font-semibold text-xs">İşveren / İK Yetkilisi İmza</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{companyInfo.name}</p>
            </div>
            <div className="border-t border-slate-300 pt-2">
              <p className="font-semibold text-xs">Çalışan Teslim Alan İmza</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {employee.firstName} {employee.lastName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

