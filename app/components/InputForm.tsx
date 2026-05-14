'use client';
import dynamic from 'next/dynamic';
import { PriceData, TechniqueKey } from '../types';
import { Ruler, Printer, Zap, Waves, Plus } from 'lucide-react';

const PdfDimensionReader = dynamic(() => import('./PdfDimensionReader'), { ssr: false });

interface Props {
  width: string;
  height: string;
  quantity: number;
  technique: TechniqueKey;
  printType: string;
  extras: string[];
  prices: PriceData;
  onChange: (field: string, value: string | string[]) => void;
  onQuantityChange: (q: number) => void;
  onAdd: () => void;
  onAddMultiple: (dims: { width: number; height: number }[]) => void;
  canAdd: boolean;
}

function handleEnter(e: React.KeyboardEvent, canAdd: boolean, onAdd: () => void) {
  if (e.key === 'Enter' && canAdd) onAdd();
}

const techniqueInfo = {
  uv: { label: 'UV Baskı', icon: Zap },
  solvent: { label: 'Solvent Baskı', icon: Waves },
};

export default function InputForm({
  width, height, quantity, technique, printType, extras, prices, onChange, onQuantityChange, onAdd, onAddMultiple, canAdd,
}: Props) {
  const printOptions = Object.entries(prices[technique]);
  const extrasOptions = Object.entries(prices.extras);

  const toggleExtra = (key: string) => {
    const next = extras.includes(key) ? extras.filter((e) => e !== key) : [...extras, key];
    onChange('extras', next);
  };

  return (
    <div className="space-y-4">
      {/* Ölçüler */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Ruler className="w-4 h-4 text-orange-400" />
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Ölçüler (cm)</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'En (cm)', field: 'width', val: width, ph: 'ör. 100' },
            { label: 'Boy (cm)', field: 'height', val: height, ph: 'ör. 60' },
          ].map(({ label, field, val, ph }) => (
            <div key={field} className="space-y-1.5">
              <label className="text-xs text-gray-500 uppercase tracking-wider">{label}</label>
              <input
                type="number"
                min="1"
                value={val}
                onChange={(e) => onChange(field, e.target.value)}
                placeholder={ph}
                onKeyDown={(e) => handleEnter(e, canAdd, onAdd)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-semibold placeholder-gray-700 focus:outline-none focus:border-orange-500/50 transition-all"
              />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Adet</label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="w-10 h-[52px] bg-black/40 border border-white/10 rounded-xl text-white text-xl font-bold hover:bg-white/10 transition-all shrink-0 flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
                onKeyDown={(e) => handleEnter(e, canAdd, onAdd)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-3 text-white text-lg font-semibold text-center placeholder-gray-700 focus:outline-none focus:border-orange-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => onQuantityChange(quantity + 1)}
                className="w-10 h-[52px] bg-black/40 border border-white/10 rounded-xl text-white text-xl font-bold hover:bg-white/10 transition-all shrink-0 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <PdfDimensionReader onAddJobs={onAddMultiple} />
        </div>
      </div>

      {/* Teknik */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Printer className="w-4 h-4 text-orange-400" />
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Baskı Tekniği</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(techniqueInfo) as [TechniqueKey, { label: string; icon: typeof Zap }][]).map(([key, info]) => {
            const Icon = info.icon;
            const isActive = technique === key;
            return (
              <button
                key={key}
                onClick={() => { onChange('technique', key); onChange('printType', ''); }}
                className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? key === 'uv'
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                      : 'bg-purple-500/15 border-purple-500/40 text-purple-400'
                    : 'bg-black/30 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{info.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Baskı Türü */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Printer className="w-4 h-4 text-orange-400" />
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Baskı Türü</h2>
        </div>
        <div className="space-y-2">
          {printOptions.map(([key, option]) => {
            const isActive = printType === key;
            return (
              <button
                key={key}
                onClick={() => onChange('printType', key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                    : 'bg-black/20 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
                }`}
              >
                <span className="text-sm font-medium">{option.name}</span>
                <span className={`text-sm font-bold ${isActive ? 'text-orange-400' : 'text-gray-500'}`}>
                  {option.price} ₺/m²
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ekstra */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-orange-400" />
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Ekstra Hizmetler</h2>
        </div>
        <div className="space-y-2">
          {extrasOptions.map(([key, option]) => {
            const isActive = extras.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggleExtra(key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-black/20 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isActive ? 'bg-green-500 border-green-500' : 'border-white/20'}`}>
                    {isActive && <Plus className="w-3 h-3 text-white rotate-45" />}
                  </div>
                  <span className="text-sm font-medium">{option.name}</span>
                </div>
                <span className={`text-sm font-bold ${isActive ? 'text-green-400' : 'text-gray-500'}`}>
                  +{option.price} ₺/m²
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ekle Butonu */}
      <button
        onClick={onAdd}
        disabled={!canAdd}
        className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
          canAdd
            ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/25 hover:scale-[1.01] active:scale-[0.99]'
            : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
        }`}
      >
        <Plus className="w-5 h-5" />
        İş Ekle
      </button>
    </div>
  );
}
