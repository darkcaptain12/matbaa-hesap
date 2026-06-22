'use client';
import { motion } from 'framer-motion';
import { Layers, TrendingUp, Percent } from 'lucide-react';
import type { JobGroup } from '../types';
import { fmt, MATERIAL_LABELS } from '../lib/calcEngine';

interface Props {
  groups: JobGroup[];
}

export default function GroupResults({ groups }: Props) {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Layers className="w-3.5 h-3.5 text-orange-400" />
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
          Grup Özeti ({groups.length} grup)
        </p>
      </div>

      {groups.map((group, i) => (
        <motion.div
          key={group.groupKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-[#0e0e0e] border border-white/8 rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-semibold">
                {group.materialWidth} cm {MATERIAL_LABELS[group.materialGroup]}
              </p>
              <p className="text-gray-500 text-[11px] mt-0.5">
                {group.techniqueName} · {group.productName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-orange-400/80 bg-orange-500/10 px-2 py-0.5 rounded-md">
                {group.jobs.length} iş
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                group.priceTier === 'above20' ? 'text-green-400 bg-green-500/10' :
                group.priceTier === 'above5' ? 'text-blue-400 bg-blue-500/10' :
                'text-amber-400 bg-amber-500/10'
              }`}>
                {group.priceTierLabel}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="px-4 py-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Toplam m²</span>
                <span className="text-white font-semibold">{fmt(group.totalM2)} m²</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Birim Fiyat</span>
                <span className="text-white font-semibold">{fmt(group.unitPrice)} ₺/m²</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Fire (ort.)</span>
                <span className="text-gray-400">
                  %{fmt(group.jobs.reduce((s, j) => s + j.wastePercent, 0) / group.jobs.length)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Rulo Eni</span>
                <span className="text-gray-400">{group.materialWidth} cm</span>
              </div>
            </div>

            {/* Price */}
            <div className="mt-3 pt-3 border-t border-white/6">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Grup Toplamı
                </span>
                <span className="text-orange-400 font-bold text-base">{fmt(group.groupTotal)} ₺</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
