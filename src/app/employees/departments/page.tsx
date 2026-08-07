'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Building2, Plus, Users, Edit2, Trash2 } from 'lucide-react';
import { INITIAL_DEPARTMENTS } from '@/lib/mock-data';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode) return;
    const newDept = {
      id: `dept-${Date.now()}`,
      companyId: 'cmp-keban-001',
      code: newDeptCode.toUpperCase(),
      name: newDeptName,
      employeeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDepartments([...departments, newDept]);
    setNewDeptName('');
    setNewDeptCode('');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-400" /> Departman Yönetimi
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Organizasyon yapısı, departman kodları ve personel dağılımı
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Dept Form */}
            <div className="b2b-card p-4 rounded-lg space-y-4 h-fit">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
                Yeni Departman Ekle
              </h2>
              <form onSubmit={handleAddDept} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Departman Kodu (Örn: YAZ, HR, FIN)
                  </label>
                  <input
                    type="text"
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    placeholder="YAZ"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono uppercase focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Departman Adı
                  </label>
                  <input
                    type="text"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    placeholder="Yazılım & Ar-Ge"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-sky-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Departman Kaydet
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 b2b-card rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3">Kod</th>
                    <th className="p-3">Departman Adı</th>
                    <th className="p-3 text-center">Çalışan Sayısı</th>
                    <th className="p-3 text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                        {dept.code}
                      </td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                        {dept.name}
                      </td>
                      <td className="p-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          <Users className="w-3 h-3 text-slate-400" />
                          {dept.employeeCount || 2} Kişi
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-600 dark:text-slate-300 hover:text-rose-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
