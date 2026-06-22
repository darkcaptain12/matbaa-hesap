'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, RotateCcw, Save, Lock, Eye, EyeOff, Check } from 'lucide-react';
import type { PriceData, TechniqueKey } from '../types';

const ADMIN_PASSWORD = '145323';

interface Props {
  open: boolean;
  onClose: () => void;
  prices: PriceData;
  onUpdate: (p: PriceData) => void;
  onReset: () => void;
}

function PriceInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-[72px] bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-orange-400 font-bold text-xs focus:outline-none focus:border-orange-500/50 text-right"
    />
  );
}

export default function AdminPanel({ open, onClose, prices, onUpdate, onReset }: Props) {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState('');
  const [local, setLocal] = useState<PriceData>(prices);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<TechniqueKey>('solvent_folyo');

  const close = () => { onClose(); setAuthed(false); setPwd(''); setErr(''); };

  const tryAuth = () => {
    if (pwd === ADMIN_PASSWORD) { setAuthed(true); setLocal(JSON.parse(JSON.stringify(prices))); setErr(''); }
    else setErr('Hatalı şifre');
  };

  const setProductPrice = (technique: TechniqueKey, productKey: string, tier: 'above20' | 'above5' | 'below5', value: number) => {
    setLocal((p) => ({
      ...p,
      techniques: {
        ...p.techniques,
        [technique]: {
          ...p.techniques[technique],
          products: {
            ...p.techniques[technique].products,
            [productKey]: {
              ...p.techniques[technique].products[productKey],
              prices: {
                ...p.techniques[technique].products[productKey].prices,
                [tier]: value,
              },
            },
          },
        },
      },
    }));
  };

  const setMaterialWidth = (mg: 'foil' | 'branda' | 'vinyl' | 'oneway', index: number, value: number) => {
    setLocal((p) => {
      const widths = [...p.materials[mg].widths];
      widths[index] = value;
      return { ...p, materials: { ...p.materials, [mg]: { widths: widths.sort((a, b) => a - b) } } };
    });
  };

  const save = () => {
    onUpdate(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    onReset();
    setLocal(prices);
  };

  const tabs: { key: TechniqueKey; label: string }[] = [
    { key: 'solvent_folyo', label: 'S. Folyo' },
    { key: 'solvent_branda', label: 'S. Branda' },
    { key: 'uv_roll', label: 'UV Roll' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#0a0a0a] border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-400" />
                  <h2 className="text-white font-bold text-lg">Admin Panel</h2>
                </div>
                <button onClick={close} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!authed ? (
                <div className="space-y-4">
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-orange-400 shrink-0" />
                    <p className="text-orange-300 text-sm">Bu alana erişim için şifre gereklidir.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Şifre</label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && tryAuth()}
                        placeholder="Admin şifresi"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-orange-500/50 transition-all"
                      />
                      <button onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {err && <p className="text-red-400 text-sm">{err}</p>}
                  </div>
                  <button onClick={tryAuth} className="w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl transition-all">
                    Giriş
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Global Settings */}
                  <div className="space-y-3">
                    <h3 className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold">Genel Ayarlar</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-black/30 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500 uppercase mb-1">KDV %</p>
                        <input
                          type="number"
                          value={local.kdv}
                          onChange={(e) => setLocal((p) => ({ ...p, kdv: Number(e.target.value) }))}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-orange-400 font-bold text-sm focus:outline-none text-center"
                        />
                      </div>
                      <div className="bg-black/30 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500 uppercase mb-1">İndirim %</p>
                        <input
                          type="number"
                          value={local.discountRate}
                          onChange={(e) => setLocal((p) => ({ ...p, discountRate: Number(e.target.value) }))}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-orange-400 font-bold text-sm focus:outline-none text-center"
                        />
                      </div>
                      <div className="bg-black/30 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500 uppercase mb-1">Min. Bedel</p>
                        <input
                          type="number"
                          value={local.minJobPrice}
                          onChange={(e) => setLocal((p) => ({ ...p, minJobPrice: Number(e.target.value) }))}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-orange-400 font-bold text-sm focus:outline-none text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Material Widths */}
                  <div className="space-y-3">
                    <h3 className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold">Malzeme Enleri (cm)</h3>
                    {([['foil', 'Folyo'], ['branda', 'Branda'], ['vinyl', 'Vinil'], ['oneway', 'One Way Vision']] as const).map(([mat, label]) => (
                      <div key={mat} className="bg-black/30 rounded-xl p-3">
                        <p className="text-xs text-gray-400 font-semibold mb-2">{label}</p>
                        <div className="flex gap-2 flex-wrap">
                          {local.materials[mat].widths.map((w, i) => (
                            <input
                              key={i}
                              type="number"
                              value={w}
                              onChange={(e) => setMaterialWidth(mat, i, Number(e.target.value))}
                              className="w-16 bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-orange-400 font-bold text-xs focus:outline-none text-center"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Tabs */}
                  <div className="space-y-3">
                    <h3 className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold">Fiyat Tablosu</h3>
                    <div className="flex gap-1 bg-black/30 rounded-xl p-1">
                      {tabs.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === tab.key
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'text-gray-500 hover:text-gray-400'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Price Table */}
                    <div className="space-y-1">
                      <div className="grid grid-cols-[1fr_72px_72px_72px] gap-1.5 px-2 mb-2">
                        <span className="text-[9px] text-gray-600 uppercase">Ürün</span>
                        <span className="text-[9px] text-gray-600 uppercase text-right">20m²+</span>
                        <span className="text-[9px] text-gray-600 uppercase text-right">5m²+</span>
                        <span className="text-[9px] text-gray-600 uppercase text-right">5m²-</span>
                      </div>
                      {Object.entries(local.techniques[activeTab].products).map(([key, product]) => (
                        <div key={key} className="grid grid-cols-[1fr_72px_72px_72px] gap-1.5 items-center bg-black/20 rounded-lg px-2 py-2">
                          <span className="text-gray-300 text-xs truncate">{product.name}</span>
                          <PriceInput value={product.prices.above20} onChange={(v) => setProductPrice(activeTab, key, 'above20', v)} />
                          <PriceInput value={product.prices.above5} onChange={(v) => setProductPrice(activeTab, key, 'above5', v)} />
                          <PriceInput value={product.prices.below5} onChange={(v) => setProductPrice(activeTab, key, 'below5', v)} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-2 sticky bottom-0 bg-[#0a0a0a] pb-2">
                    <button
                      onClick={handleReset}
                      className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 py-3 rounded-xl transition-all text-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Sıfırla
                    </button>
                    <button
                      onClick={save}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-sm font-semibold ${
                        saved ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-400 text-white'
                      }`}
                    >
                      {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      {saved ? 'Kaydedildi!' : 'Kaydet'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
