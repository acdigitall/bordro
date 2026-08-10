'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Award, Heart, BookOpen } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-12 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-mono font-black text-base shadow-md">
                TB
              </div>
              <span className="font-extrabold text-base text-slate-100">Türkiye Bordro SaaS</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Türkiye İş ve Vergi Mevzuatına %100 Uyumlu, Kümülatif Vergi ve Asgari Ücret İstisnalı Multi-Tenant Bulut Bordro Platformu.
            </p>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>GVK 193 & 5510 Sayılı Kanun Uyumlu</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Ürün & Dokümantasyon</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/guide" className="hover:text-sky-400 font-semibold text-sky-300 flex items-center gap-1.5 transition-colors">
                  <BookOpen className="w-3.5 h-3.5" /> Kullanım Rehberi (Kılavuz)
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-sky-400 transition-colors">Bordro Çalıştırma Motoru</Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-sky-400 transition-colors">2026 Gelir Vergisi Matrisi</Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-sky-400 transition-colors">SGK e-Bildirge & Banka Listeleri</Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-sky-400 transition-colors">Kıdem & İhbar Tazminatı Takibi</Link>
              </li>
            </ul>
          </div>

          {/* Corporate Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Kurumsal</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/pricing" className="hover:text-sky-400 transition-colors">Paketler & Fiyatlandırma</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-sky-400 transition-colors">Bize Ulaşın / İletişim</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-sky-400 transition-colors">Müşteri Portalı (Giriş)</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-sky-400 transition-colors">Ücretsiz Hesap Oluştur</Link>
              </li>
            </ul>
          </div>

          {/* Security & Badges */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Güvenlik & Sertifikalar</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <Lock className="w-4 h-4 text-sky-400 shrink-0" />
                <span>256-Bit Banka Seviyesinde SSL Şifreleme</span>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>KVKK Korumalı Multi-Tenant İzolasyonu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Türkiye Bordro SaaS A.Ş. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">KVKK Aydınlatma Metni</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Gizlilik Politikası</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Kullanım Şartları</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
