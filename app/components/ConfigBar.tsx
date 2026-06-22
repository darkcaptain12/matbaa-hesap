'use client';
import { Waves, RotateCw, Flag } from 'lucide-react';
import type { PriceData, TechniqueKey } from '../types';
import { MATERIAL_LABELS } from '../lib/calcEngine';

interface Props {
  prices: PriceData;
  technique: TechniqueKey;
  productKey: string;
  onTechniqueChange: (t: TechniqueKey) => void;
  onProductChange: (p: string) => void;
}

const techniqueConfig: Record<TechniqueKey, { label: string; icon: typeof Waves; accent: string; bg: string; border: string; text: string }> = {
  solvent_folyo: {
    label: 'Solvent Folyo',
    icon: Waves,
    accent: 'purple',
    bg: 'rgba(168,85,247,0.15)',
    border: 'rgba(168,85,247,0.4)',
    text: '#c084fc',
  },
  solvent_branda: {
    label: 'Solvent Branda',
    icon: Flag,
    accent: 'emerald',
    bg: 'rgba(16,185,129,0.15)',
    border: 'rgba(16,185,129,0.4)',
    text: '#34d399',
  },
  uv_roll: {
    label: 'UV Roll',
    icon: RotateCw,
    accent: 'cyan',
    bg: 'rgba(34,211,238,0.15)',
    border: 'rgba(34,211,238,0.4)',
    text: '#22d3ee',
  },
};

export default function ConfigBar({
  prices, technique, productKey,
  onTechniqueChange, onProductChange,
}: Props) {
  const techData = prices.techniques[technique];
  const products = techData ? Object.entries(techData.products) : [];

  return (
    <div className="space-y-4">
      {/* Technique Tabs */}
      <div className="bg-[#0e0e0e] border border-white/8 rounded-2xl p-4">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3">Baskı Tekniği</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(techniqueConfig) as [TechniqueKey, typeof techniqueConfig.solvent_folyo][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const active = technique === key;
            return (
              <button
                key={key}
                onClick={() => { onTechniqueChange(key); onProductChange(''); }}
                className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-200 ${
                  active
                    ? ''
                    : 'bg-black/20 border-white/8 text-gray-500 hover:border-white/15 hover:text-gray-400'
                }`}
                style={active ? {
                  backgroundColor: cfg.bg,
                  borderColor: cfg.border,
                  color: cfg.text,
                } : undefined}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold leading-tight text-center">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Selection */}
      <div className="bg-[#0e0e0e] border border-white/8 rounded-2xl p-4">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3">Ürün Seçimi</p>
        <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
          {products.map(([key, product]) => {
            const active = productKey === key;
            return (
              <button
                key={key}
                onClick={() => onProductChange(key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all duration-150 ${
                  active
                    ? 'bg-orange-500/12 border-orange-500/35 text-orange-400'
                    : 'bg-black/20 border-white/6 text-gray-400 hover:border-white/15 hover:text-gray-300'
                }`}
              >
                <span className="text-sm font-medium">{product.name}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                  product.materialGroup === 'foil' ? 'bg-amber-500/10 text-amber-500/80'
                    : product.materialGroup === 'branda' ? 'bg-emerald-500/10 text-emerald-500/80'
                    : product.materialGroup === 'oneway' ? 'bg-purple-500/10 text-purple-500/80'
                    : 'bg-sky-500/10 text-sky-500/80'
                }`}>
                  {MATERIAL_LABELS[product.materialGroup] || product.materialGroup}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
