'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { Plus, Users, Loader2 } from 'lucide-react';
import { INITIAL_USERS } from '@/lib/mock-data';

export default function UserSettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('PAYROLL_OFFICER');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        const isKeban =
          data.company?.name?.toLowerCase().includes('keban') ||
          data.user?.email === 'admin@teknoloji.com';

        if (isKeban) {
          setUsers(INITIAL_USERS);
          setLoading(false);
        } else {
          fetch('/api/users')
            .then((r) => r.json())
            .then((userData) => {
              if (userData.success && Array.isArray(userData.users) && userData.users.length > 0) {
                setUsers(userData.users);
              } else if (data.user) {
                setUsers([
                  {
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    role: data.user.role || 'TENANT_ADMIN',
                    status: 'ACTIVE',
                  },
                ]);
              } else {
                setUsers([]);
              }
            })
            .catch(() => {
              if (data.user) {
                setUsers([
                  {
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    role: data.user.role || 'TENANT_ADMIN',
                    status: 'ACTIVE',
                  },
                ]);
              }
            })
            .finally(() => setLoading(false));
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setSaving(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kullanıcı ekleme başarısız.');

      if (data.user) {
        setUsers((prev) => [...prev, data.user]);
      } else {
        setUsers((prev) => [
          ...prev,
          {
            id: `u-${Date.now()}`,
            name,
            email,
            role,
            status: 'ACTIVE',
          },
        ]);
      }

      setName('');
      setEmail('');
    } catch (err: any) {
      alert(err.message || 'Kullanıcı eklenirken hata oluştu.');
    } finally {
      setSaving(false);
    }
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
                <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" /> Kullanıcı Yetkileri & Rol Yönetimi (RBAC)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Şirket içi yetkili kullanıcılar, Bordro Uzmanı ve Finans Onay rolleri
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="b2b-card p-4 rounded-lg space-y-4 h-fit">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
                Yeni Kullanıcı Davet Et
              </h2>
              <form onSubmit={handleAddUser} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Merve Yılmaz"
                    required
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    E-Posta Adresi
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="merve@sirketiniz.com"
                    required
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Sistem Rolü
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="TENANT_ADMIN">Tenant Admin (Tam Yetki)</option>
                    <option value="PAYROLL_OFFICER">Bordro Uzmanı (Veri Girişi & Hazırlık)</option>
                    <option value="FINANCE_APPROVER">Finans Onaycısı (Ödeme & Onay)</option>
                    <option value="AUDITOR">Denetçi (Salt Okunur)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Ekleniyor...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Kullanıcıyı Davet Et
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 b2b-card rounded-lg overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  Kullanıcılar yükleniyor...
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-3">Kullanıcı</th>
                      <th className="p-3">E-Posta</th>
                      <th className="p-3">Rol</th>
                      <th className="p-3 text-center">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map((u) => (
                      <tr key={u.id || u.email} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {u.name}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 font-mono">
                          {u.email}
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded text-[10px]">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] border border-emerald-200 dark:border-emerald-800 font-medium">
                            Aktif
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
