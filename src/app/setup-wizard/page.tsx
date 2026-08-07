'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Building,
  Users,
  Settings,
  Landmark,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { INITIAL_COMPANY } from '@/lib/mock-data';

export default function SetupWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: 'Şirket Bilgileri', description: 'Unvan, Vergi No, Adres' },
    { id: 2, title: 'Departmanlar', description: 'Şirket departman yapısı' },
    { id: 3, title: 'Vergi & SGK', description: '2026 Mevzuat parametreleri' },
    { id: 4, title: 'Banka Tanımları', description: 'Maaş ödeme bankaları' },
    { id: 5, title: 'Onay Akışı', description: 'Bordro 3 aşamalı onay' },
    { id: 6, title: 'Tamamlandı', description: 'Kurulum hazır!' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/dashboard');
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
      {/* Top Header */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center font-bold text-white shadow-md">
            TR
          </div>
          <div>
            <h1 className="font-bold text-sm">İlk Kurulum Sihirbazı (Setup Wizard)</h1>
            <p className="text-xs text-slate-400">Şirketinizin bordro altyapısını hazırlayın</p>
          </div>
        </div>
        <span className="text-xs font-mono text-sky-400 bg-sky-950 px-2.5 py-1 rounded border border-sky-800">
          Adım {currentStep} / {steps.length}
        </span>
      </div>

      {/* Wizard Progress Stepper */}
      <div className="max-w-4xl w-full mx-auto my-6">
        <div className="grid grid-cols-6 gap-2">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-sky-950/80 border-sky-500 shadow-md shadow-sky-500/10'
                    : isCompleted
                    ? 'bg-slate-900/60 border-emerald-500/50'
                    : 'bg-slate-900/30 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    0{step.id}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-xs font-semibold text-slate-200 truncate">{step.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="max-w-4xl w-full mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl flex-1 flex flex-col justify-between">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-sky-400" /> Şirket Temel Bilgileri
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Şirket Unvanı</label>
                <input
                  type="text"
                  defaultValue={INITIAL_COMPANY.name}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Vergi Numarası</label>
                <input
                  type="text"
                  defaultValue={INITIAL_COMPANY.taxNo}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Vergi Dairesi</label>
                <input
                  type="text"
                  defaultValue={INITIAL_COMPANY.taxOffice}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Adres</label>
                <input
                  type="text"
                  defaultValue={INITIAL_COMPANY.address}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" /> Departman Yapısı
            </h2>
            <p className="text-xs text-slate-400">Varsayılan departmanlar otomatik oluşturuldu:</p>
            <div className="space-y-2">
              {['Yazılım & Teknoloji', 'İnsan Kaynakları & Bordro', 'Finans & Muhasebe', 'Pazarlama & Satış'].map(
                (d, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{d}</span>
                    <span className="text-emerald-400 font-mono text-[10px]">Aktif</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-sky-400" /> 2026 Mevzuat Oranları
            </h2>
            <div className="bg-sky-950/40 border border-sky-800/60 p-4 rounded-xl text-xs space-y-2 text-sky-200">
              <div className="flex justify-between">
                <span>Gelir Vergisi Dilimleri:</span>
                <span className="font-bold font-mono">%15 - %20 - %27 - %35 - %40</span>
              </div>
              <div className="flex justify-between">
                <span>SGK İşçi Payı:</span>
                <span className="font-bold font-mono">%14 + %1 İşsizlik</span>
              </div>
              <div className="flex justify-between">
                <span>Damga Vergisi Oranı:</span>
                <span className="font-bold font-mono">Binde 7.59</span>
              </div>
              <div className="flex justify-between">
                <span>Asgari Ücret Vergi İstisnası:</span>
                <span className="font-bold font-mono">Etkin (Otomatik Düşülür)</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-sky-400" /> Maaş Ödeme Bankaları
            </h2>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-semibold">Türkiye İş Bankası</span>
                <span className="font-mono text-slate-400 text-[11px]">TR42 0006 4000 ... 4455 66</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-semibold">Garanti BBVA</span>
                <span className="font-mono text-slate-400 text-[11px]">TR12 0006 2000 ... 6655 44</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" /> 3 Aşamalı Bordro Onay Akışı
            </h2>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold">1</span>
                <div>
                  <p className="font-bold text-slate-200">1. Bordroyu Hazırla (Run Payroll)</p>
                  <p className="text-slate-400 text-[11px]">Aylık veriler girilir, net maaşlar hesaplanır ve önizlenir.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold">2</span>
                <div>
                  <p className="font-bold text-slate-200">2. Bordroyu Onayla (Approve Payroll)</p>
                  <p className="text-slate-400 text-[11px]">İkinci yetkili kontrol eder ve veri girişlerini dondurur.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">3</span>
                <div>
                  <p className="font-bold text-slate-200">3. Yetkilendir & Kilitle (Authorize Payroll)</p>
                  <p className="text-slate-400 text-[11px]">Banka ödeme listeleri ve maaş pusulaları (payslip) oluşturulur.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/30">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white">Tebrikler! Kurulum Tamamlandı</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Şirketiniz bordro hesaplama ve çalışan yönetimine hazır. Ana panele geçerek bordronuzu çalıştırmaya başlayabilirsiniz.
            </p>
          </div>
        )}

        {/* Wizard Controls Footer */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Geri
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 text-white text-xs font-bold hover:from-sky-500 hover:to-blue-500 shadow-md shadow-sky-600/30 flex items-center gap-1.5"
          >
            {currentStep === steps.length ? 'Ana Panele Git' : 'Devam Et'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
