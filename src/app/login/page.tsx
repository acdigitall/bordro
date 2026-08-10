'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Building2,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  ShieldCheck,
  Check,
} from 'lucide-react';

const FEATURES = [
  {
    no: '1',
    title: 'Otomatik Gelir & Damga Vergisi Muafiyetleri',
    desc: 'Asgari ücret istisnası ve kümülatif dilim takibi otomatik hesaplanır.',
  },
  {
    no: '2',
    title: 'Banka Toplu Ödeme Listesi',
    desc: 'TXT ve Excel formatında, banka şablonuna uygun çıktı üretilir.',
  },
  {
    no: '3',
    title: 'Resmi PDF Maaş Pusulası Döküm Merkezi',
    desc: 'Toplu veya tekil, şirket antetli maaş pusulaları hazırlanır.',
  },
  {
    no: '4',
    title: 'SGK e-Bildirge & MPHBT İcmal Özeti',
    desc: 'Aylık prim ve hizmet belgesi için hazır icmal raporu sunulur.',
  },
];

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [taxNo, setTaxNo] = useState('');
  const [adminName, setAdminName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    const mode = searchParams?.get('mode');
    if (mode === 'register') setActiveTab('register');
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Giriş işlemi başarısız.');

      setStamped(true);
      setTimeout(() => {
        router.push(data.redirectUrl || '/dashboard');
        router.refresh();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Bir bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, taxOffice, taxNo, adminName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Şirket kaydı başarısız.');

      setStamped(true);
      setTimeout(() => {
        router.push(data.redirectUrl || '/dashboard');
        router.refresh();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setActiveTab('login');
    setEmail('admin@teknoloji.com');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl bg-[#FBF9F4] border border-[#E3DDD0] rounded-lg shadow-[0_15px_50px_-15px_rgba(16,25,43,0.12)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden font-sans">
      {/* SOL PANEL — Kurumsal antetli kağıt bloğu */}
      <div className="lg:col-span-5 bg-[#10192B] text-[#AEB9CC] p-8 flex flex-col justify-between relative overflow-hidden">
        {/* Zemin dokusu */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#5FA07F 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />

        <div className="relative space-y-7">
          {/* Mühür + marka */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 shrink-0 rounded-full border border-[#3C8562]/60 flex items-center justify-center">
              <div className="absolute inset-[3px] rounded-full border border-dashed border-[#3C8562]/40" />
              <span className="font-mono text-[10px] font-bold tracking-wider text-[#5FA07F]">TB</span>
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-[#EDEFF3] tracking-tight">Türkiye Bordro</h2>
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#5FA07F]">
                Kurumsal İK & Bordro Sistemi
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-lg font-bold text-[#EDEFF3] leading-snug tracking-tight">
              Bordro ve SGK süreçlerinizi
              <br />
              uçtan uca yönetin.
            </h1>
            <p className="text-[11.5px] text-[#8996AD] leading-relaxed pt-1">
              4857 Sayılı İş Kanunu ve 5510 Sayılı SGK mevzuatına tam uyumlu.
            </p>
          </div>

          {/* Özellikler — mevzuat maddesi formatında */}
          <div className="space-y-3 pt-1">
            {FEATURES.map((f, i) => (
              <div
                key={f.no}
                className={`pt-2.5 ${i !== 0 ? 'border-t border-dashed border-[#24314A]' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9.5px] font-semibold text-[#5FA07F]">
                    Madde {f.no}
                  </span>
                  <Check className="w-3.5 h-3.5 text-[#5FA07F]/70" />
                </div>
                <p className="text-[12px] text-[#D5DBE6] font-semibold leading-snug mt-0.5">{f.title}</p>
                <p className="text-[11px] text-[#78859E] leading-relaxed mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative pt-5 mt-6 border-t border-dashed border-[#24314A] text-[10.5px] text-[#6B7690] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#5FA07F]" />
          <span className="font-mono tracking-wide font-medium">256-BIT SSL KORUMALI GÜVENLİ PORTAL</span>
        </div>
      </div>

      {/* SAĞ PANEL — Kağıt üzerinde tutarlı form */}
      <div className="lg:col-span-7 p-8 flex flex-col justify-between bg-[#FBF9F4] relative">
        {stamped && (
          <div className="absolute inset-0 z-10 bg-[#FBF9F4]/80 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border-[3px] border-[#3C8562] flex items-center justify-center -rotate-[10deg] animate-[stampIn_0.4s_ease-out]">
              <div className="w-[92px] h-[92px] rounded-full border border-dashed border-[#3C8562] flex items-center justify-center">
                <span className="font-mono text-[11px] font-bold tracking-widest text-[#3C8562] text-center leading-tight">
                  ONAYLANDI
                </span>
              </div>
            </div>
            <style>{`
              @keyframes stampIn {
                0% { opacity: 0; transform: scale(1.6) rotate(-10deg); }
                60% { opacity: 1; transform: scale(0.92) rotate(-10deg); }
                100% { opacity: 1; transform: scale(1) rotate(-10deg); }
              }
            `}</style>
          </div>
        )}

        <div>
          {/* Sekmeler */}
          <div className="flex items-center gap-6 mb-6 border-b border-[#E3DDD0]">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 -mb-px transition-colors ${
                activeTab === 'login'
                  ? 'text-[#10192B] border-[#3C8562]'
                  : 'text-[#9A9282] border-transparent hover:text-[#4A4636]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setError(null); }}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 -mb-px transition-colors ${
                activeTab === 'register'
                  ? 'text-[#10192B] border-[#3C8562]'
                  : 'text-[#9A9282] border-transparent hover:text-[#4A4636]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Yeni Şirket Kaydı
            </button>
          </div>

          {error && (
            <div className="mb-5 py-2 px-3 border-l-2 border-[#B5793C] bg-[#B5793C]/[0.06] text-[#8A5A24] text-xs font-medium">
              {error}
            </div>
          )}

          {/* GİRİŞ FORMU */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="E-Posta Adresi" required>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="ornek@sirketiniz.com"
                  required
                />
              </Field>

              <Field
                label="Şifre"
                required
                right={
                  <a href="#" className="font-mono text-[10px] font-semibold tracking-wider text-[#3C8562] hover:text-[#2E6B4E]">
                    ŞİFREMİ UNUTTUM
                  </a>
                }
              >
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls} pr-8`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#9A9282] hover:text-[#4A4636] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              <div className="pt-2 space-y-3">
                <SubmitButton loading={loading} idleLabel="Sisteme Giriş Yap" busyLabel="Giriş Yapılıyor..." />

                <div className="pt-2 border-t border-[#E3DDD0]">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@teknoloji.com');
                      setPassword('admin123');
                    }}
                    className="w-full text-[11px] text-[#6B7690] hover:text-[#10192B] bg-[#EFECE6] hover:bg-[#E3DDD0] py-2 px-3 rounded-lg transition-colors font-medium text-center"
                  >
                    Örnek / Demo Hesabı İle Doldur (Keban Ltd. Şti.)
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* KAYIT FORMU */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <Field label="Şirket Unvanı" required>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputCls}
                  placeholder="Keban Teknoloji A.Ş."
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Vergi Dairesi">
                  <input
                    type="text"
                    value={taxOffice}
                    onChange={(e) => setTaxOffice(e.target.value)}
                    className={inputCls}
                    placeholder="Büyük Mükellefler V.D."
                  />
                </Field>
                <Field label="Vergi Numarası">
                  <input
                    type="text"
                    value={taxNo}
                    onChange={(e) => setTaxNo(e.target.value)}
                    className={`${inputCls} font-mono`}
                    placeholder="5480192837"
                  />
                </Field>
              </div>

              <Field label="Yönetici Adı Soyadı" required>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className={inputCls}
                  placeholder="Cenker Yaman"
                  required
                />
              </Field>

              <Field label="E-Posta Adresi" required>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="admin@sirketiniz.com"
                  required
                />
              </Field>

              <Field label="Şifre Belirleyin" required>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                  placeholder="••••••••"
                  required
                />
              </Field>

              <div className="pt-2">
                <SubmitButton loading={loading} idleLabel="Şirket Kaydını Tamamla" busyLabel="Kayıt Oluşturuluyor..." />
              </div>
            </form>
          )}

          {/* Demo Hesap Doldurma Butonu */}
          <button
            type="button"
            onClick={fillDemoAccount}
            className="w-full mt-6 py-2.5 px-3.5 border border-dashed border-[#D8D2C0] hover:border-[#3C8562]/60 rounded transition-colors flex items-center justify-between group text-left bg-white/50"
          >
            <div>
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#9A9282]">
                Demo Giriş Hesabı — Teknoloji A.Ş.
              </span>
              <p className="text-[11px] text-[#4A4636] font-mono mt-0.5">
                admin@teknoloji.com · admin123
              </p>
            </div>
            <span className="text-xs font-semibold text-[#3C8562] flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Doldur <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>

        <div className="mt-6 text-center text-[10.5px] text-[#B0A990] font-mono tracking-wide">
          © 2026 TÜRKİYE BORDRO SAAS — TÜM HAKLARI SAKLIDIR
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full bg-transparent border-0 border-b border-[#D8D2C0] rounded-none px-0 py-1.5 text-xs text-[#241F1A] placeholder-[#B0A990] focus:outline-none focus:border-[#3C8562] transition-colors font-medium';

function Field({
  label,
  required,
  right,
  children,
}: {
  label: string;
  required?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#8A8272]">
          {label}
          {required && <span className="text-[#3C8562] ml-0.5">*</span>}
        </label>
        {right}
      </div>
      {children}
    </div>
  );
}

function SubmitButton({
  loading,
  idleLabel,
  busyLabel,
}: {
  loading: boolean;
  idleLabel: string;
  busyLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-2.5 rounded font-semibold text-xs text-[#FBF9F4] bg-[#10192B] hover:bg-[#1B2740] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{busyLabel}</span>
        </>
      ) : (
        <>
          <span>{idleLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#10192B] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambiyans — Sönük dev mühür halkaları */}
      <div
        aria-hidden
        className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full border border-[#1B2740] opacity-60 pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full border border-dashed border-[#1B2740] opacity-40 pointer-events-none"
        style={{ transform: 'scale(0.85)' }}
      />

      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-[#8996AD] text-xs font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-[#3C8562]" />
            Yükleniyor...
          </div>
        }
      >
        <AuthContent />
      </Suspense>
    </div>
  );
}