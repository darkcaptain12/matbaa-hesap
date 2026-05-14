'use client';
import { useState } from 'react';
import { Customer } from '../types';
import { netBalance } from '../hooks/useCustomers';
import { Users, X, Plus, Trash2, ChevronDown, ChevronUp, CreditCard, TrendingDown, MessageCircle, Pencil, Check, RefreshCw } from 'lucide-react';

function buildWhatsAppUrl(phone: string, name: string, balance: number): string {
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  if (cleaned.startsWith('0')) cleaned = '90' + cleaned.slice(1);
  else if (!cleaned.startsWith('90')) cleaned = '90' + cleaned;
  const fmtBal = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(balance);
  const msg = `Sayın ${name}, hesabınızda ${fmtBal} ₺ (KDV Hariç) borcunuz bulunmaktadır.\n\nMATBAA HESAP`;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

interface Props {
  customers: Customer[];
  loading?: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAddEntry: (customerId: string, entry: { type: 'charge' | 'payment'; amount: number; note: string }) => void;
  onUpdateCustomer: (id: string, fields: { name?: string; phone?: string }) => void;
  onDeleteCustomer: (id: string) => void;
  onDeleteEntry: (customerId: string, entryId: string) => void;
  onMigrateToKdvExcl: () => void;
  onMigrateToKdvIncl: () => void;
  kdv: number;
}

export function CustomerPanelTrigger({ customers, onOpen }: { customers: Customer[]; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-1.5 bg-white/5 hover:bg-white/8 border border-white/10 text-gray-400 hover:text-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
    >
      <Users className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Müşteriler</span>
      {customers.length > 0 && (
        <span className="bg-orange-500/20 text-orange-400 text-xs px-1.5 py-0.5 rounded-full font-bold">
          {customers.length}
        </span>
      )}
    </button>
  );
}

function CustomerRow({ customer, onAddEntry, onUpdateCustomer, onDeleteCustomer, onDeleteEntry }: {
  customer: Customer;
  onAddEntry: Props['onAddEntry'];
  onUpdateCustomer: Props['onUpdateCustomer'];
  onDeleteCustomer: Props['onDeleteCustomer'];
  onDeleteEntry: Props['onDeleteEntry'];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(customer.name);
  const [editPhone, setEditPhone] = useState(customer.phone || '');
  const [payAmt, setPayAmt] = useState('');
  const [payNote, setPayNote] = useState('');
  const balance = netBalance(customer);

  const handleEditSave = () => {
    if (!editName.trim()) return;
    onUpdateCustomer(customer.id, { name: editName, phone: editPhone });
    setEditing(false);
  };

  const handlePayment = () => {
    const amt = parseFloat(payAmt);
    if (!amt || amt <= 0) return;
    onAddEntry(customer.id, { type: 'payment', amount: amt, note: payNote || 'Ödeme' });
    setPayAmt('');
    setPayNote('');
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${open ? 'border-white/15' : 'border-white/8'}`}>
      {/* Başlık */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/3 transition-all"
        onClick={() => !editing && setOpen((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
              <input
                autoFocus
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                placeholder="Müşteri adı"
                className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-orange-500/50"
              />
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                placeholder="Telefon numarası (ör. 05301234567)"
                className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-orange-500/50"
              />
            </div>
          ) : (
            <>
              <p className="text-white font-medium text-sm truncate">{customer.name}</p>
              <p className="text-xs mt-0.5">
                {customer.phone
                  ? <span className="text-gray-500">{customer.phone} · </span>
                  : null}
                {balance > 0
                  ? <span className="text-red-400">Borç: {fmt(balance)} ₺</span>
                  : balance < 0
                  ? <span className="text-green-400">Alacak: {fmt(Math.abs(balance))} ₺</span>
                  : <span className="text-gray-500">Hesap sıfır</span>}
              </p>
            </>
          )}
        </div>

        {editing ? (
          <button
            onClick={(e) => { e.stopPropagation(); handleEditSave(); }}
            className="p-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 transition-all shrink-0"
            title="Kaydet"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setEditName(customer.name); setEditPhone(customer.phone || ''); setEditing(true); }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-all shrink-0"
            title="Düzenle"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}

        {!editing && balance > 0 && customer.phone && (
          <a
            href={buildWhatsAppUrl(customer.phone, customer.name, balance)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-all shrink-0"
            title="WhatsApp'a borç gönder"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </a>
        )}
        {!editing && (
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteCustomer(customer.id); }}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
        {!editing && (open ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />)}
      </div>

      {open && (
        <div className="border-t border-white/8 p-4 space-y-4">
          {/* Ödeme Al */}
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2 text-green-400 text-xs font-semibold uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5" />
              Ödeme Al
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={payAmt}
                onChange={(e) => setPayAmt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePayment()}
                placeholder="Tutar (₺)"
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50"
              />
              <input
                type="text"
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePayment()}
                placeholder="Not (isteğe bağlı)"
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50"
              />
              <button
                onClick={handlePayment}
                disabled={!payAmt || parseFloat(payAmt) <= 0}
                className="px-3 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white rounded-lg transition-all text-sm font-medium shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* İşlem Geçmişi */}
          {customer.entries.length === 0 ? (
            <p className="text-gray-600 text-xs text-center py-2">Henüz işlem yok</p>
          ) : (
            <div className="space-y-1.5">
              <p className="text-gray-500 text-xs uppercase tracking-wider">İşlemler</p>
              {[...customer.entries].reverse().map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.type === 'charge' ? 'bg-red-400' : 'bg-green-400'}`} />
                  <span className="text-gray-400 shrink-0">{fmtDate(e.date)}</span>
                  <span className="text-gray-300 flex-1 truncate">{e.note}</span>
                  <span className={`font-semibold shrink-0 ${e.type === 'charge' ? 'text-red-400' : 'text-green-400'}`}>
                    {e.type === 'charge' ? '+' : '-'}{fmt(e.amount)} ₺
                  </span>
                  <button
                    onClick={() => onDeleteEntry(customer.id, e.id)}
                    className="shrink-0 p-0.5 hover:text-red-400 text-gray-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CustomerPanel({ customers, loading, open, onOpen: _onOpen, onClose, onAddEntry, onUpdateCustomer, onDeleteCustomer, onDeleteEntry, onMigrateToKdvExcl, onMigrateToKdvIncl, kdv }: Props) {
  const totalDebt = customers.reduce((s, c) => s + Math.max(0, netBalance(c)), 0);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              <h2 className="text-white font-bold text-lg">Müşteriler</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Toplu KDV İşlemleri */}
          {customers.some((c) => c.entries.some((e) => e.type === 'charge')) && (
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 space-y-2">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Toplu KDV İşlemleri</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Tüm borç kayıtlarını toplu olarak KDV dahil/hariç'e çevirir. İşlem geri alınamaz.
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    if (window.confirm(`Tüm borçlara %${kdv} KDV eklensin mi? (×${(1 + kdv / 100).toFixed(2)})`)) {
                      onMigrateToKdvIncl();
                    }
                  }}
                  className="flex items-center gap-1.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  +KDV Ekle (%{kdv})
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Tüm borçlardan %${kdv} KDV düşülsün mü? (÷${(1 + kdv / 100).toFixed(2)})`)) {
                      onMigrateToKdvExcl();
                    }
                  }}
                  className="flex items-center gap-1.5 bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/30 text-yellow-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  −KDV Çıkar (%{kdv})
                </button>
              </div>
            </div>
          )}

          {/* Özet */}
          {customers.length > 0 && totalDebt > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
              <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <p className="text-red-400 text-xs uppercase tracking-wider font-semibold">Toplam Alacak</p>
                <p className="text-red-300 font-bold text-lg leading-tight">{fmt(totalDebt)} ₺</p>
              </div>
            </div>
          )}

          {/* Liste */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Users className="w-10 h-10 text-gray-700 mx-auto" />
              <p className="text-gray-500 text-sm">Henüz müşteri eklenmedi</p>
              <p className="text-gray-600 text-xs">Sol tarafta müşteri seçici kullanarak ekle</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customers.map((c) => (
                <CustomerRow
                  key={c.id}
                  customer={c}
                  onAddEntry={onAddEntry}
                  onUpdateCustomer={onUpdateCustomer}
                  onDeleteCustomer={onDeleteCustomer}
                  onDeleteEntry={onDeleteEntry}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
