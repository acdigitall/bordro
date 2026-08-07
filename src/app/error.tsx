'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Route Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Bir İşlem Hatası Oluştu
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Sayfa yüklenirken beklenmeyen bir hata meydana geldi. Yeniden denemek için aşağıdaki butona tıklayabilirsiniz.
          </p>
        </div>

        {error?.message && (
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-left text-[11px] font-mono text-slate-600 dark:text-slate-300 break-all max-h-24 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Yeniden Dene
          </button>
        </div>
      </div>
    </div>
  );
}
