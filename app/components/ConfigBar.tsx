'use client';
import { motion } from 'framer-motion';
import { Zap, Waves, RotateCw, Check } from 'lucide-react';
import type { PriceData, TechniqueKey } from '../types';

interface Props {
  prices: PriceData;
  technique: TechniqueKey;
  productKey: string;
  sadeceBaski: boolean;
  onTechniqueChange: (t: TechniqueKey) => void;
  onProductChange: (p: string) => void;
  onSadeceBaskiChange: (v: boolean) => void;
}

const techniqueConfig: Record<TechniqueKey, { label: string; icon: typeof Zap; color: string }> = {
  uv: { label: 'UV', icon: Zap, color: 'blue' },
  solvent: { label: 'Solvent', icon: Waves, color: 'purple' },
  uv_roll: { label: 'UV Roll', icon: RotateCw, color: 'cyan' },
};

export default function ConfigBar({
  prices, technique, productKey, sadeceBaski,
  onTechniqueChange, onProductChange, onSadeceBaskiChange,
}: Props) {
  const techData = prices.techniques[technique];
  const products = techData ? Object.entries(techData.products) : [];

  return (
    <div className="space-y-4">
      {/* Technique Tabs */}
      <div className="bg-[#0e0e0e] border border-white/8 rounded-2xl p-4">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3">Baskı Tekniği</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(techniqueConfig) as [TechniqueKey, typeof techniqueConfig.uv][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const active = technique === key;
            return (
              <button
                key={key}
                onClick={() => { onTechniqueChange(key); onProductChange(''); }}
                className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-200 ${
                  active
                    ? `bg-${cfg.color}-500/15 border-${cfg.color}-500/40 text-${cfg.color}-400`
                    : 'bg-black/20 border-white/8 text-gray-500 hover:border-white/15 hover:text-gray-400'
                }`}
                style={active ? {
                  backgroundColor: cfg.color === 'blue' ? 'rgba(59,130,246,0.15)' :
                                   cfg.color === 'purple' ? 'rgba(168,85,247,0.15)' :
                                   'rgba(34,211,238,0.15)',
                  borderColor: cfg.color === 'blue' ? 'rgba(59,130,246,0.4)' :
                               cfg.color === 'purple' ? 'rgba(168,85,247,0.4)' :
                               'rgba(34,211,238,0.4)',
                  color: cfg.color === 'blue' ? '#60a5fa' :
                         cfg.color === 'purple' ? '#c084fc' :
                         '#22d3ee',
                } : undefined}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Selection */}
      <div className="bg-[#0e0e0e] border border-white/8 rounded-2xl p-4">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3">Ürün Seçimi</p>
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
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
                  product.material === 'folyo'
                    ? 'bg-amber-500/10 text-amber-500/80'
                    : 'bg-sky-500/10 text-sky-500/80'
                }`}>
                  {product.material}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sadece Baskı Toggle */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onSadeceBaskiChange(!sadeceBaski)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 ${
          sadeceBaski
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-[#0e0e0e] border-white/8 hover:border-white/15'
        }`}
      >
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
          sadeceBaski ? 'bg-green-500 border-green-500' : 'border-gray-600'
        }`}>
          {sadeceBaski && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
        <div className="flex-1 text-left">
          <p className={`text-sm font-semibold ${sadeceBaski ? 'text-green-400' : 'text-gray-400'}`}>
            Sadece Baskı
          </p>
          <p className="text-[11px] text-gray-600">Tüm fiyatlara %{20} indirim uygulanır</p>
        </div>
        {sadeceBaski && (
          <span className="text-xs font-bold text-green-400 bg-green-500/15 px-2.5 py-1 rounded-lg">
            -%20
          </span>
        )}
      </motion.button>
    </div>
  );
}
