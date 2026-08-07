'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <html lang="tr" className="h-full">
      <body className="h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Sistem Hatası
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Uygulamada bir kök sistem hatası meydana geldi.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sistemi Yeniden Başlat
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
