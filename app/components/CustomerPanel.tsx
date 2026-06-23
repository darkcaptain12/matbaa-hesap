'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Customer } from '../types';
import { netBalance } from '../hooks/useCustomers';
import { fmt } from '../lib/calcEngine';
import { Users, X, Plus, Trash2, ChevronDown, ChevronUp, CreditCard, TrendingDown, MessageCircle, Pencil, Check, FileDown, Crown } from 'lucide-react';

function buildWhatsAppUrl(phone: string, name: string, balance: number): string {
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  if (cleaned.startsWith('0')) cleaned = '90' + cleaned.slice(1);
  else if (!cleaned.startsWith('90')) cleaned = '90' + cleaned;
  const fmtBal = fmt(balance);
  const msg = `Sayın ${name}, hesabınızda ${fmtBal} ₺ (KDV Hariç) borcunuz bulunmaktadır.\n\nMATBAA PRO`;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`;
}

function downloadCustomerPdf(customer: Customer, balance: number) {
  const date = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  const rows = [...customer.entries].reverse().map((e) => {
    const isCharge = e.type === 'charge';
    return `<tr>
      <td style="padding:9px 12px;font-size:12px;color:#6b7280;">${new Date(e.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
      <td style="padding:9px 12px;font-size:12px;color:#111;">${e.note}</td>
      <td style="padding:9px 12px;font-size:12px;font-weight:600;text-align:right;color:${isCharge ? '#dc2626' : '#16a34a'};">${isCharge ? '+' : '-'}${fmt(e.amount)} ₺</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"/><title>${customer.name} – Hesap Ekstresi</title>
  <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;background:#f5f5f5;color:#1a1a1a;}
  .page{max-width:680px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,.12);}
  .header{background:linear-gradient(135deg,#ea580c,#f97316);padding:32px 36px;}
  .header h1{color:#fff;font-size:22px;font-weight:800;}
  .header p{color:rgba(255,255,255,.75);font-size:13px;margin-top:3px;}
  .body{padding:28px 36px;}
  table{width:100%;border-collapse:collapse;}
  th{background:#f9fafb;padding:9px 12px;text-align:left;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;}
  th:last-child{text-align:right;}
  tr:nth-child(even) td{background:#fafafa;}
  .summary{margin-top:20px;background:${balance > 0 ? 'linear-gradient(135deg,#fff1f2,#fff)' : 'linear-gradient(135deg,#f0fdf4,#fff)'};border:2px solid ${balance > 0 ? '#fecaca' : '#bbf7d0'};border-radius:12px;padding:18px 22px;display:flex;justify-content:space-between;align-items:center;}
  .summary-label{font-size:11px;color:${balance > 0 ? '#991b1b' : '#166534'};font-weight:700;text-transform:uppercase;letter-spacing:.05em;}
  .summary-value{font-size:32px;font-weight:900;color:${balance > 0 ? '#dc2626' : '#16a34a'};letter-spacing:-1px;}
  .footer{background:#f9fafb;padding:16px 36px;display:flex;justify-content:space-between;}
  </style></head>
  <body><div class="page">
  <div class="header"><h1>${customer.name}</h1><p>${customer.phone ? customer.phone + ' · ' : ''}Hesap Ekstresi</p></div>
  <div class="body">
    ${customer.entries.length === 0 ? '<p style="color:#9ca3af;font-size:14px;text-align:center;padding:40px 0;">Henüz işlem yok</p>' : `
    <table><thead><tr><th>Tarih</th><th>Açıklama</th><th style="text-align:right">Tutar</th></tr></thead><tbody>${rows}</tbody></table>`}
    <div class="summary">
      <div>
        <div class="summary-label">${balance > 0 ? 'Toplam Borç (KDV Hariç)' : balance < 0 ? 'Alacak' : 'Hesap Durumu'}</div>
        <div class="summary-value">${fmt(Math.abs(balance))} ₺</div>
      </div>
    </div>
  </div>
  <div class="footer"><span style="font-size:11px;color:#9ca3af;">${date}</span><span style="font-size:12px;font-weight:700;color:#ea580c;">MATBAA PRO</span></div>
  </div><script>window.onload=function(){setTimeout(function(){window.print();},400);}</script></body></html>`;

  const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

interface Props {
  customers: Customer[];
  loading?: boolean;
  open: boolean;
  onClose: () => void;
  onAddEntry: (customerId: string, entry: { type: 'charge' | 'payment'; amount: number; note: string }) => void;
  onUpdateCustomer: (id: string, fields: { name?: string; phone?: string }) => void;
  onDeleteCustomer: (id: string) => void;
  onDeleteEntry: (customerId: string, entryId: string) => void;
  onToggleSabitFiyat: (id: string) => void;
}

export function CustomerPanelTrigger({ customers, onOpen }: { customers: Customer[]; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-1.5 bg-white/5 hover:bg-white/8 border border-white/10 text-gray-400 hover:text-gray-200 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
    >
      <Users className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Müşteriler</span>
      {customers.length > 0 && (
        <span className="bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
          {customers.length}
        </span>
      )}
    </button>
  );
}

function CustomerRow({ customer, onAddEntry, onUpdateCustomer, onDeleteCustomer, onDeleteEntry, onToggleSabitFiyat }: {
  customer: Customer;
  onAddEntry: Props['onAddEntry'];
  onUpdateCustomer: Props['onUpdateCustomer'];
  onDeleteCustomer: Props['onDeleteCustomer'];
  onDeleteEntry: Props['onDeleteEntry'];
  onToggleSabitFiyat: Props['onToggleSabitFiyat'];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(customer.name);
  const [editPhone, setEditPhone] = useState(customer.phone || '');
  const [payAmt, setPayAmt] = useState('');
  const [payNote, setPayNote] = useState('');
  const [chargeAmt, setChargeAmt] = useState('');
  const [chargeNote, setChargeNote] = useState('');
  const balance = netBalance(customer);

  const handleEditSave = () => {
    if (!editName.trim()) return;
    onUpdateCustomer(customer.id, { name: editName, phone: editPhone });
    setEditing(false);
  };

  const handleManualCharge = () => {
    const amt = parseFloat(chargeAmt);
    if (!amt || amt <= 0 || !chargeNote.trim()) return;
    onAddEntry(customer.id, { type: 'charge', amount: amt, note: chargeNote.trim() });
    setChargeAmt('');
    setChargeNote('');
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
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/3 transition-all"
        onClick={() => !editing && setOpen((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
              <input autoFocus type="text" value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleEditSave()} placeholder="Müşteri adı"
                className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-orange-500/50" />
              <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleEditSave()} placeholder="Telefon (ör. 05301234567)"
                className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-orange-500/50" />
            </div>
          ) : (
            <>
              <p className="text-white font-medium text-sm truncate">
                {customer.name}
                {customer.sabitFiyat && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 bg-amber-500/15 text-amber-400 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase">
                    <Crown className="w-2.5 h-2.5" /> Sabit
                  </span>
                )}
              </p>
              <p className="text-xs mt-0.5">
                {customer.phone && <span className="text-gray-500">{customer.phone} · </span>}
                {balance > 0
                  ? <span className="text-red-400">Borç: {fmt(balance)} ₺</span>
                  : balance < 0
                  ? <span className="text-green-400">Alacak: {fmt(Math.abs(balance))} ₺</span>
                  : <span className="text-gray-500">Hesap sıfır</span>}
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {editing ? (
            <button onClick={(e) => { e.stopPropagation(); handleEditSave(); }} className="p-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 transition-all" title="Kaydet">
              <Check className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button onClick={(e) => { e.stopPropagation(); setEditName(customer.name); setEditPhone(customer.phone || ''); setEditing(true); }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-all" title="Düzenle">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onToggleSabitFiyat(customer.id); }}
                className={`p-1.5 rounded-lg transition-all ${customer.sabitFiyat ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-white/5 text-gray-600 hover:bg-white/10 hover:text-gray-400'}`}
                title={customer.sabitFiyat ? 'Sabit fiyat aktif — tıkla kapat' : 'Sabit fiyat aç (5m² altı yok)'}>
                <Crown className="w-3.5 h-3.5" />
              </button>
              {balance > 0 && customer.phone && (
                <a href={buildWhatsAppUrl(customer.phone, customer.name, balance)} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-all" title="WhatsApp borç gönder">
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              )}
              {customer.entries.length > 0 && (
                <button onClick={(e) => { e.stopPropagation(); downloadCustomerPdf(customer, balance); }}
                  className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 transition-all" title="PDF hesap ekstresi">
                  <FileDown className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`${customer.name} silinsin mi?`)) onDeleteCustomer(customer.id); }}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-white/8 p-4 space-y-4">
              {/* Manuel Borç Ekle */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2 text-red-400 text-xs font-semibold uppercase tracking-wider">
                  <Plus className="w-3.5 h-3.5" /> Manuel Borç Ekle
                </div>
                <div className="flex gap-2">
                  <input type="number" min="0" value={chargeAmt} onChange={(e) => setChargeAmt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleManualCharge()} placeholder="Tutar (₺)"
                    className="w-28 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500/50" />
                  <input type="text" value={chargeNote} onChange={(e) => setChargeNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleManualCharge()} placeholder="Açıklama (zorunlu)"
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500/50" />
                  <button onClick={handleManualCharge} disabled={!chargeAmt || parseFloat(chargeAmt) <= 0 || !chargeNote.trim()}
                    className="px-3 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-lg transition-all text-sm font-medium shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Ödeme Al */}
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2 text-green-400 text-xs font-semibold uppercase tracking-wider">
                  <CreditCard className="w-3.5 h-3.5" /> Ödeme Al
                </div>
                <div className="flex gap-2">
                  <input type="number" min="0" value={payAmt} onChange={(e) => setPayAmt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePayment()} placeholder="Tutar (₺)"
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50" />
                  <input type="text" value={payNote} onChange={(e) => setPayNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePayment()} placeholder="Not"
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50" />
                  <button onClick={handlePayment} disabled={!payAmt || parseFloat(payAmt) <= 0}
                    className="px-3 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white rounded-lg transition-all text-sm font-medium shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* İşlem Geçmişi */}
              {customer.entries.length === 0 ? (
                <p className="text-gray-600 text-xs text-center py-2">Henüz işlem yok</p>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">İşlemler</p>
                  {[...customer.entries].reverse().map((e) => (
                    <div key={e.id} className="flex items-center gap-2 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.type === 'charge' ? 'bg-red-400' : 'bg-green-400'}`} />
                      <span className="text-gray-400 shrink-0">{fmtDate(e.date)}</span>
                      <span className="text-gray-300 flex-1 truncate">{e.note}</span>
                      <span className={`font-semibold shrink-0 ${e.type === 'charge' ? 'text-red-400' : 'text-green-400'}`}>
                        {e.type === 'charge' ? '+' : '-'}{fmt(e.amount)} ₺
                      </span>
                      <button onClick={() => onDeleteEntry(customer.id, e.id)} className="shrink-0 p-0.5 hover:text-red-400 text-gray-600 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CustomerPanel({ customers, loading, open, onClose, onAddEntry, onUpdateCustomer, onDeleteCustomer, onDeleteEntry, onToggleSabitFiyat }: Props) {
  const totalDebt = customers.reduce((s, c) => s + Math.max(0, netBalance(c)), 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-400" />
                  <h2 className="text-white font-bold text-lg">Müşteriler</h2>
                </div>
                <button onClick={onClose} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {customers.length > 0 && totalDebt > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
                  <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <p className="text-red-400 text-[10px] uppercase tracking-wider font-semibold">Toplam Alacak</p>
                    <p className="text-red-300 font-bold text-lg leading-tight">{fmt(totalDebt)} ₺</p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Users className="w-10 h-10 text-gray-700 mx-auto" />
                  <p className="text-gray-500 text-sm">Henüz müşteri eklenmedi</p>
                  <p className="text-gray-600 text-xs">Sol tarafta müşteri seçici kullanarak ekleyin</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customers.map((c) => (
                    <CustomerRow key={c.id} customer={c} onAddEntry={onAddEntry} onUpdateCustomer={onUpdateCustomer} onDeleteCustomer={onDeleteCustomer} onDeleteEntry={onDeleteEntry} onToggleSabitFiyat={onToggleSabitFiyat} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
