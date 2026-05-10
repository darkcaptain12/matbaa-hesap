'use client';
import { useState } from 'react';
import { PriceData } from '../types';
import { Settings, X, RotateCcw, Save, Lock, Eye, EyeOff } from 'lucide-react';

const ADMIN_PASSWORD = 'matbaa2024';

interface Props {
  prices: PriceData;
  onUpdate: (p: PriceData) => void;
  onReset: () => void;
}

function PriceRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 bg-black/30 rounded-xl">
      <span className="text-gray-300 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-orange-400 font-bold text-sm focus:outline-none text-right"
        />
        <span className="text-gray-600 text-xs w-8">₺/m²</span>
      </div>
    </div>
  );
}

export default function AdminPanel({ prices, onUpdate, onReset }: Props) {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState('');
  const [local, setLocal] = useState<PriceData>(prices);
  const [saved, setSaved] = useState(false);

  const close = () => { setOpen(false); setAuthed(false); setPwd(''); setErr(''); };

  const tryAuth = () => {
    if (pwd === ADMIN_PASSWORD) { setAuthed(true); setLocal(prices); setErr(''); }
    else setErr('Hatalı şifre');
  };

  const setUvPrice = (key: string, price: number) =>
    setLocal((p) => ({ ...p, uv: { ...p.uv, [key]: { ...p.uv[key], price } } }));
  const setSolventPrice = (key: string, price: number) =>
    setLocal((p) => ({ ...p, solvent: { ...p.solvent, [key]: { ...p.solvent[key], price } } }));
  const setExtrasPrice = (key: string, price: number) =>
    setLocal((p) => ({ ...p, extras: { ...p.extras, [key]: { ...p.extras[key], price } } }));
  const setKdv = (v: number) => setLocal((p) => ({ ...p, kdv: v }));

  const save = () => { onUpdate(local); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handleReset = () => { onReset(); setLocal(prices); };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-11 h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-400 transition-all duration-200 z-50"
        title="Admin Panel"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Overlay */}
      <div
        onClick={close}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-400" />
              <h2 className="text-white font-bold text-lg">Admin Panel</h2>
            </div>
            <button
              onClick={close}
              className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-gray-400"
            >
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
              <div>
                <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">KDV Oranı</h3>
                <div className="flex items-center gap-3 bg-black/30 rounded-xl p-3">
                  <span className="text-gray-300 text-sm flex-1">KDV %</span>
                  <input
                    type="number"
                    value={local.kdv}
                    onChange={(e) => setKdv(Number(e.target.value))}
                    className="w-20 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-orange-400 font-bold text-sm focus:outline-none text-right"
                  />
                  <span className="text-gray-600 text-xs">%</span>
                </div>
              </div>

              <div>
                <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">UV Baskı Fiyatları</h3>
                <div className="space-y-2">
                  {Object.entries(local.uv).map(([key, opt]) => (
                    <PriceRow key={key} label={opt.name} value={opt.price} onChange={(v) => setUvPrice(key, v)} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Solvent Baskı Fiyatları</h3>
                <div className="space-y-2">
                  {Object.entries(local.solvent).map(([key, opt]) => (
                    <PriceRow key={key} label={opt.name} value={opt.price} onChange={(v) => setSolventPrice(key, v)} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Ekstra Hizmetler</h3>
                <div className="space-y-2">
                  {Object.entries(local.extras).map(([key, opt]) => (
                    <div key={key} className="flex items-center justify-between py-2.5 px-3 bg-black/30 rounded-xl">
                      <span className="text-gray-300 text-sm">{opt.name}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={opt.price}
                          onChange={(e) => setExtrasPrice(key, Number(e.target.value))}
                          className="w-24 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-orange-400 font-bold text-sm focus:outline-none text-right"
                        />
                        <span className="text-gray-600 text-xs w-4">₺</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 py-3 rounded-xl transition-all text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Sıfırla
                </button>
                <button
                  onClick={save}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-sm font-semibold ${saved ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-400 text-white'}`}
                >
                  <Save className="w-4 h-4" />
                  {saved ? 'Kaydedildi!' : 'Kaydet'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
