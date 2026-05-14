'use client';
import { useState, useRef, useEffect } from 'react';
import { Customer } from '../types';
import { netBalance } from '../hooks/useCustomers';
import { UserCheck, Plus, ChevronDown, X } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

interface Props {
  customers: Customer[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddCustomer: (name: string, phone?: string) => void;
}

export default function CustomerSelector({ customers, selectedId, onSelect, onAddCustomer }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = customers.find((c) => c.id === selectedId);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddCustomer(newName.trim(), newPhone.trim() || undefined);
    setNewName('');
    setNewPhone('');
    setOpen(false);
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <UserCheck className="w-4 h-4 text-orange-400" />
        <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Müşteri</h2>
      </div>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
            selected
              ? 'bg-blue-500/10 border-blue-500/30 text-white'
              : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/20'
          }`}
        >
          <div className="min-w-0 flex-1">
            {selected ? (
              <div>
                <p className="font-semibold text-sm truncate">{selected.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Bakiye: <span className={netBalance(selected) > 0 ? 'text-red-400' : 'text-green-400'}>
                    {fmt(netBalance(selected))} ₺
                  </span>
                </p>
              </div>
            ) : (
              <span className="text-sm">Müşteri seçin veya ekleyin</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {selected && (
              <span
                onClick={(e) => { e.stopPropagation(); onSelect(''); }}
                className="p-1 hover:bg-white/10 rounded-lg text-gray-500 hover:text-gray-300 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden">
            {/* Arama */}
            <div className="p-2 border-b border-white/8">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Müşteri ara..."
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            {/* Liste */}
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-4">Müşteri bulunamadı</p>
              )}
              {filtered.map((c) => {
                const bal = netBalance(c);
                return (
                  <button
                    key={c.id}
                    onClick={() => { onSelect(c.id); setOpen(false); setSearch(''); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 text-left transition-all"
                  >
                    <span className="text-white text-sm truncate">{c.name}</span>
                    <span className={`text-xs font-semibold shrink-0 ml-2 ${bal > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {fmt(bal)} ₺
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Yeni Müşteri */}
            <div className="p-2 border-t border-white/8 space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Müşteri adı..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                />
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Telefon (opsiyonel)"
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                />
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className="px-3 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-1 text-sm font-medium shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ekle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
