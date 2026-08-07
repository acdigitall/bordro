import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center mx-auto text-sky-600 dark:text-sky-400">
          <FileQuestion className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Sayfa Bulunamadı (404)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı kalmış olabilir.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Ana Panele Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
