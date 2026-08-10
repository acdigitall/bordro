'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return null;
        return res.json();
      })
      .then((data) => {
        if (data && data.authenticated) {
          router.replace('/dashboard');
        } else {
          router.replace('/login');
        }
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
        <span>Giriş Ekranına Yönlendiriliyor...</span>
      </div>
    </div>
  );
}
