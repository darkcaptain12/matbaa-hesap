'use client';
import { motion } from 'framer-motion';
import { Calculator, FileText, Percent } from 'lucide-react';
import type { QuoteSummary } from '../types';
import { fmt } from '../lib/calcEngine';

interface Props {
  quote: QuoteSummary;
  sadeceBaski: boolean;
  companyName: string;
  onCompanyNameChange: (v: string) => void;
  onGeneratePdf: () => void;
}

export default function TotalSummary({ quote, sadeceBaski, companyName, onCompanyNameChange, onGeneratePdf }: Props) {
  if (quote.groups.length === 0) {
    return (
      <div className="bg-[#0e0e0e] border border-white/8 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-3.5 flex items-center gap-2">
          <Calculator className="w-4.5 h-4.5 text-white" />
          <span className="text-white font-bold text-sm">Hesap Özeti</span>
        </div>
        <div className="py-16 text-center">
          <div className="w-14 h-14 bg-orange-500/8 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Calculator className="w-7 h-7 text-orange-500/30" />
          </div>
          <p className="text-gray-500 text-sm">İş ekleyerek hesaplamayı başlatın</p>
          <p className="text-gray-600 text-xs mt-1">PDF yükleyin veya manuel ölçü girin</p>
        </div>
      </div>
    );
  }

  const totalM2 = quote.groups.reduce((s, g) => s + g.totalM2, 0);
  const totalJobs = quote.groups.reduce((s, g) => s + g.jobs.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Total Card */}
      <div className="bg-[#0e0e0e] border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4.5 h-4.5 text-white" />
            <span className="text-white font-bold text-sm">Hesap Özeti</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-100 text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-medium">
              {totalJobs} iş · {fmt(totalM2)} m²
            </span>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {/* Grup Listesi (compact) */}
          {quote.groups.length > 1 && (
            <div className="space-y-1 pb-2">
              {quote.groups.map((g) => (
                <div key={g.groupKey} className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 truncate">
                    {g.materialWidth} {g.materialGroup} · {g.productName}
                  </span>
                  <span className="text-gray-400 font-medium shrink-0 ml-2">{fmt(g.groupTotal)} ₺</span>
                </div>
              ))}
              <div className="h-px bg-white/6 mt-2" />
            </div>
          )}

          {/* KDV Hariç */}
          <div className="bg-white/3 border border-white/8 rounded-xl p-4">
            <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-1">
              {sadeceBaski ? 'İndirimli Toplam (KDV Hariç)' : 'KDV Hariç Toplam'}
            </p>
            <p className="text-white font-black text-3xl sm:text-4xl tracking-tight leading-none">
              {fmt(quote.afterDiscount)}
              <span className="text-orange-400 text-xl ml-1">₺</span>
            </p>
          </div>

          {/* İndirim */}
          {sadeceBaski && quote.discountTotal > 0 && (
            <div className="flex items-center justify-between bg-green-500/6 border border-green-500/15 rounded-xl px-4 py-2.5">
              <span className="text-green-400 text-xs font-medium flex items-center gap-1.5">
                <Percent className="w-3 h-3" /> Sadece Baskı İndirimi
              </span>
              <span className="text-green-400 font-bold text-sm">-{fmt(quote.discountTotal)} ₺</span>
            </div>
          )}

          {/* KDV */}
          {quote.kdvRate > 0 && (
            <>
              <div className="flex items-center justify-between px-1">
                <span className="text-gray-500 text-xs">KDV (%{quote.kdvRate})</span>
                <span className="text-gray-400 text-xs font-semibold">+{fmt(quote.kdvAmount)} ₺</span>
              </div>
              <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
                <span className="text-orange-300 text-xs font-semibold">KDV Dahil Toplam</span>
                <span className="text-orange-400 font-bold text-xl">{fmt(quote.grandTotal)} ₺</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Company Name Input */}
      <div className="bg-[#0e0e0e] border border-white/8 rounded-2xl p-4">
        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Firma Adı (Teklif İçin)</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => onCompanyNameChange(e.target.value)}
          placeholder="Firma adı girin..."
          className="w-full mt-2 bg-black/30 border border-white/8 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-orange-500/40 transition-all"
        />
      </div>

      {/* PDF Action */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGeneratePdf}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-500/20 text-sm"
      >
        <FileText className="w-4 h-4" />
        PDF Teklif Oluştur
      </motion.button>
    </motion.div>
  );
}
