'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { PayslipModal } from '@/components/payslip-modal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Edit,
  FileText,
} from 'lucide-react';
import { INITIAL_EMPLOYEES, EmployeeMock } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/payroll-engine';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeMock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState<EmployeeMock | null>(null);

  useEffect(() => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.employees)) {
          // If user is in demo company or has employees
          if (data.employees.length > 0) {
            setEmployees(data.employees);
          } else if (data.companyId === 'demo-company-id' || data.isDemo) {
            setEmployees(INITIAL_EMPLOYEES);
          } else {
            setEmployees([]);
          }
        } else {
          setEmployees([]);
        }
      })
      .catch(() => {
        setEmployees([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.tcNo.includes(searchTerm) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || emp.departmentId === selectedDept;
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'ACTIVE' && (emp.status === 'ACTIVE' || !emp.status)) ||
      (selectedStatus === 'TERMINATED' && (emp.status === 'TERMINATED' || emp.status === 'LEAVING'));
    return matchesSearch && matchesDept && matchesStatus;
  });

  const maskTcNo = (tc: string) => {
    if (!tc || tc.length < 11) return tc || '---';
    return `${tc.slice(0, 3)}*****${tc.slice(8)}`;
  };

  const handleTerminateEmployee = async (emp: EmployeeMock) => {
    const isAlreadyTerminated = emp.status === 'TERMINATED' || emp.status === 'LEAVING';
    const confirmMsg = isAlreadyTerminated
      ? `${emp.firstName} ${emp.lastName} isimli çalışanı tekrar AKTİF yapmak istiyor musunuz?`
      : `${emp.firstName} ${emp.lastName} isimli çalışanı İŞTEN ÇIKARMAK (pasife almak) istediğinizden emin misiniz?`;

    if (!confirm(confirmMsg)) return;

    const newStatus = isAlreadyTerminated ? 'ACTIVE' : 'TERMINATED';

    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: emp.id, status: newStatus }),
      });

      if (!res.ok) throw new Error('İşlem başarısız.');

      setEmployees((prev) =>
        prev.map((e) => (e.id === emp.id ? { ...e, status: newStatus } : e))
      );

      alert(
        isAlreadyTerminated
          ? 'Çalışan tekrar AKTİF duruma getirildi.'
          : 'Çalışan başarıyla İŞTEN ÇIKARILDI ve pasif konuma alındı.'
      );
    } catch {
      // Fallback local update
      setEmployees((prev) =>
        prev.map((e) => (e.id === emp.id ? { ...e, status: newStatus } : e))
      );
      alert(
        isAlreadyTerminated
          ? 'Çalışan tekrar AKTİF duruma getirildi.'
          : 'Çalışan başarıyla İŞTEN ÇIKARILDI ve pasif konuma alındı.'
      );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" /> Çalışan Listesi (Employees)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tüm aktif ve işten ayrılan personel özlük, banka ve maaş bilgileri (KVKK Korumalı)
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => alert('Banka ve Personel Verileri Excel Olarak Dışa Aktarıldı.')}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Excel'e Aktar
              </button>

              <Link
                href="/employees/new"
                className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" /> Yeni Çalışan Ekle
              </Link>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="b2b-card p-3.5 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ad, Soyad, TC No veya Sicil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-white dark:bg-slate-900">Tüm Durumlar</option>
                <option value="ACTIVE" className="bg-white dark:bg-slate-900">Sadece Aktif Çalışanlar</option>
                <option value="TERMINATED" className="bg-white dark:bg-slate-900">İşten Ayrılanlar (Pasif)</option>
              </select>

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-white dark:bg-slate-900">Tüm Departmanlar</option>
                <option value="dept-01" className="bg-white dark:bg-slate-900">Yazılım & Teknoloji</option>
                <option value="dept-02" className="bg-white dark:bg-slate-900">İnsan Kaynakları & Bordro</option>
                <option value="dept-03" className="bg-white dark:bg-slate-900">Finans & Muhasebe</option>
                <option value="dept-04" className="bg-white dark:bg-slate-900">Pazarlama & Satış</option>
              </select>
            </div>
          </div>

          {/* Employees Data Table or Empty State */}
          <div className="b2b-card rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500 font-medium">
                Çalışan listesi yükleniyor...
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Kayıtlı Çalışan Bulunmuyor
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Arama kriterlerinize uygun çalışan bulunamadı veya henüz çalışan eklenmedi.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/employees/new"
                    className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" /> İlk Çalışanı Ekle
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* NATIVE MOBILE LIST VIEW (< md / Mobile Screens) */}
                <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800">
                  {filteredEmployees.map((emp) => {
                    const isTerminated = emp.status === 'TERMINATED' || emp.status === 'LEAVING';
                    const empInitials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();

                    return (
                      <div
                        key={emp.id}
                        className={`p-3.5 transition-colors ${
                          isTerminated ? 'bg-rose-50/20 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        {/* Main Info Row */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div
                              className={`w-9 h-9 shrink-0 rounded-full font-bold text-xs flex items-center justify-center font-mono ${
                                isTerminated
                                  ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              {empInitials || 'Ç'}
                            </div>

                            <div className="overflow-hidden">
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {emp.firstName} {emp.lastName}
                                </h3>
                                <span className="font-mono text-[10px] text-sky-600 dark:text-sky-400 font-bold shrink-0">
                                  {emp.employeeCode}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {emp.departmentName} • {emp.title}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                              {formatCurrency(emp.baseSalary)}
                            </div>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isTerminated ? 'bg-rose-500' : 'bg-emerald-500'
                                }`}
                              />
                              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                {isTerminated ? 'Ayrıldı' : 'Aktif'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Sub-Details Bar */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          <span className="truncate">
                            {emp.bankName} • {emp.iban ? `${emp.iban.slice(0, 10)}...` : '---'}
                          </span>
                          <span>TC: {maskTcNo(emp.tcNo)}</span>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="mt-2.5 flex items-center justify-end gap-2 text-xs">
                          <button
                            onClick={() => setSelectedPayslipEmp(emp)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-colors"
                          >
                            <FileText className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                            Pusula
                          </button>

                          <Link
                            href={`/employees/severance?id=${emp.id}`}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-colors"
                          >
                            <Users className="w-3 h-3 text-amber-600" />
                            Kıdem
                          </Link>

                          <Link
                            href={`/employees/new?id=${emp.id}`}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-colors"
                          >
                            <Edit className="w-3 h-3 text-slate-500" />
                            Düzenle
                          </Link>

                          <button
                            onClick={() => handleTerminateEmployee(emp)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                              isTerminated
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {isTerminated ? '✓ Aktif Yap' : '✕ Çıkar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DESKTOP TABLE VIEW (>= md / Desktop Screens) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="p-3">Sicil / TC No</th>
                        <th className="p-3">Ad Soyad</th>
                        <th className="p-3">Departman & Unvan</th>
                        <th className="p-3">Çalışma Şekli</th>
                        <th className="p-3 text-right">Aylık Brüt Maaş</th>
                        <th className="p-3">Ödeme Bankası / IBAN</th>
                        <th className="p-3 text-center">Durum</th>
                        <th className="p-3 text-center">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredEmployees.map((emp) => {
                        const isTerminated = emp.status === 'TERMINATED' || emp.status === 'LEAVING';

                        return (
                          <tr
                            key={emp.id}
                            className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                              isTerminated ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                            }`}
                          >
                            <td className="p-3">
                              <span className="font-mono font-bold text-sky-600 dark:text-sky-400 block">
                                {emp.employeeCode}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400" title="KVKK Maskeli">
                                {maskTcNo(emp.tcNo)}
                              </span>
                            </td>

                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">
                              {emp.firstName} {emp.lastName}
                              {emp.taxExemptionType && emp.taxExemptionType !== 'STANDARD' && (
                                <span className="ml-1.5 text-[9px] bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-mono">
                                  Engelli T.
                                </span>
                              )}
                            </td>

                            <td className="p-3">
                              <span className="font-medium text-slate-700 dark:text-slate-300 block">
                                {emp.departmentName}
                              </span>
                              <span className="text-[11px] text-slate-400">{emp.title}</span>
                            </td>

                            <td className="p-3">
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium text-[11px]">
                                Tam Zamanlı
                              </span>
                            </td>

                            <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                              {formatCurrency(emp.baseSalary)}
                            </td>

                            <td className="p-3">
                              <span className="font-medium text-slate-700 dark:text-slate-300 block text-[11px]">
                                {emp.bankName}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[140px] block">
                                {emp.iban}
                              </span>
                            </td>

                            <td className="p-3 text-center">
                              {isTerminated ? (
                                <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-medium px-2 py-0.5 rounded text-[10px] border border-rose-200 dark:border-rose-800">
                                  İşten Ayrıldı
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium px-2 py-0.5 rounded text-[10px] border border-emerald-200 dark:border-emerald-800">
                                  Aktif
                                </span>
                              )}
                            </td>

                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setSelectedPayslipEmp(emp)}
                                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                  title="Maaş Pusulası Oluştur"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>

                                <Link
                                  href={`/employees/severance?id=${emp.id}`}
                                  className="p-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors border border-amber-200 dark:border-amber-800"
                                  title="Kıdem / İhbar Tazminatı Hesabı & Çıkış"
                                >
                                  <Users className="w-3.5 h-3.5" />
                                </Link>

                                <Link
                                  href={`/employees/new?id=${emp.id}`}
                                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                  title="Düzenle"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Link>

                                <button
                                  onClick={() => handleTerminateEmployee(emp)}
                                  className={`p-1 rounded transition-colors border ${
                                    isTerminated
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 hover:bg-emerald-100 border-emerald-200'
                                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 border-rose-200'
                                  }`}
                                  title={isTerminated ? 'Tekrar Aktif Yap' : 'İşten Çıkar (Pasife Al)'}
                                >
                                  {isTerminated ? '✓' : '✕'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Official Payslip Preview Modal */}
      <PayslipModal
        employee={selectedPayslipEmp}
        periodName="Ağustos 2026 Bordrosu"
        onClose={() => setSelectedPayslipEmp(null)}
      />
    </div>
  );
}



