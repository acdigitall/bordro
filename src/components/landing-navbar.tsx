'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Menu, X, ArrowRight, UserCheck, BookOpen } from 'lucide-react';

export function LandingNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return null;
        return res.json();
      })
      .then((data) => {
        if (data && data.authenticated) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { label: 'Ana Sayfa', href: '/' },
    { label: 'Kullanım Rehberi', href: '/guide' },
    { label: 'Özellikler', href: '/features' },
    { label: '2026 Mevzuatı', href: '/#mevzuat' },
    { label: 'Fiyatlandırma', href: '/pricing' },
    { label: 'İletişim', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 pt-[env(safe-area-inset-top,0px)] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-mono font-black text-lg shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            TB
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-100 tracking-tight">Türkiye Bordro</span>
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                SaaS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
              2026 Mevzuat Uyumlu Bulut Platform
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-sky-400 bg-sky-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-sky-900/30 active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              <span>Ana Panele Git</span>
            </Link>
          ) : (
            <>
              {/* Müşteri Girişi */}
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>Müşteri Girişi</span>
              </Link>

              {/* Ücretsiz Dene */}
              <Link
                href="/register"
                className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-sky-900/30 active:scale-95"
              >
                <span>Ücretsiz Dene</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Menü"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-sky-400" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white text-xs font-bold py-3 rounded-xl shadow-md"
              >
                <UserCheck className="w-4 h-4" />
                <span>Ana Panele Git</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold py-3 rounded-xl shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Müşteri Girişi</span>
                </Link>

                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold py-3 rounded-xl shadow-md"
                >
                  <span>14 Gün Ücretsiz Deneyin</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
