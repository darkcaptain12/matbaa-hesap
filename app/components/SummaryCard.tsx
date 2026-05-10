'use client';
import { Job } from '../types';
import { calcSummary } from '../lib/calcJob';
import { Copy, FileText, Zap, Wallet } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

interface Props {
  jobs: Job[];
  balance: string;
  onBalanceChange: (v: string) => void;
  onCopy: () => void;
  onPdf: () => void;
  kdv: number;
}

export default function SummaryCard({ jobs, balance, onBalanceChange, onCopy, onPdf, kdv }: Props) {
  const bal = parseFloat(balance) || 0;
  const summary = jobs.length > 0 ? calcSummary(jobs, bal) : null;

  return (
    <div className="sticky top-6 space-y-4">
      {/* Ana Kart */}
      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-lg">Hesap Özeti</span>
          </div>
          {jobs.length > 0 && (
            <span className="text-orange-100 text-xs bg-white/15 px-2.5 py-1 rounded-full font-medium">
              {jobs.length} iş
            </span>
          )}
        </div>

        <div className="p-5">
          {!summary ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-orange-500/40" />
              </div>
              <p className="text-gray-500 text-sm">Soldan iş ekleyerek hesaplamayı başlat</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* İş bazlı liste (kompakt) */}
              {jobs.length > 1 && (
                <div className="space-y-1.5 pb-2">
                  {jobs.map((job, i) => (
                    <div key={job.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-white/5 text-gray-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                        <span className="truncate max-w-[160px]">{job.printTypeName}</span>
                      </span>
                      <span className="text-gray-400 font-medium shrink-0">{fmt(job.subtotal)} ₺</span>
                    </div>
                  ))}
                  <div className="h-px bg-white/8 mt-2" />
                </div>
              )}

              {/* KDV Hariç — büyük gösterge */}
              <div className="bg-white/4 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">KDV Hariç Toplam</p>
                <p className="text-white font-black text-4xl tracking-tight leading-none">
                  {fmt(summary.totalSubtotal)}
                  <span className="text-orange-400 text-2xl ml-1">₺</span>
                </p>
              </div>

              {/* KDV satırı */}
              <div className="flex items-center justify-between px-1">
                <span className="text-gray-500 text-sm">KDV (%{kdv})</span>
                <span className="text-gray-400 text-sm font-semibold">+{fmt(summary.totalKdv)} ₺</span>
              </div>

              {/* KDV Dahil */}
              <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
                <span className="text-orange-300 text-sm font-medium">KDV Dahil Toplam</span>
                <span className="text-orange-400 font-bold text-xl">{fmt(summary.totalWithKdv)} ₺</span>
              </div>

              {/* Bakiye */}
              {bal > 0 && (
                <>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-green-400 text-sm">Müşteri Bakiyesi</span>
                    <span className="text-green-400 font-semibold text-sm">-{fmt(bal)} ₺</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <span className="text-white font-bold text-sm">Ödenecek Tutar</span>
                    <span className="text-white font-black text-2xl">{fmt(summary.finalPrice)} ₺</span>
                  </div>
                </>
              )}

              {/* Aksiyonlar */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={onCopy}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-medium py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Copy className="w-4 h-4" />
                  Kopyala
                </button>
                <button
                  onClick={onPdf}
                  className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/20"
                >
                  <FileText className="w-4 h-4" />
                  PDF Teklif
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Müşteri Bakiyesi */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4 text-orange-400" />
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Müşteri Bakiyesi</h2>
        </div>
        <div className="relative">
          <input
            type="number"
            min="0"
            value={balance}
            onChange={(e) => onBalanceChange(e.target.value)}
            placeholder="0"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-lg font-semibold placeholder-gray-700 focus:outline-none focus:border-green-500/50 transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₺</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {bal > 0 && summary
            ? bal >= summary.totalWithKdv
              ? '✓ Bakiye tüm borcu karşılıyor'
              : `Kalan: ${fmt(summary.finalPrice)} ₺ ödenmesi gerekiyor`
            : 'Müşteri ön ödemesi varsa girin'}
        </p>
      </div>
    </div>
  );
}
