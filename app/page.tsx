'use client';
import { useState, useReducer, useCallback } from 'react';
import { usePrices } from './hooks/usePrices';
import { useCustomers } from './hooks/useCustomers';

// HTTP (non-HTTPS) bağlantılarda crypto.randomUUID() çalışmaz
function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

import InputForm from './components/InputForm';
import JobList from './components/JobList';
import SummaryCard from './components/SummaryCard';
import AdminPanel from './components/AdminPanel';
import CustomerSelector from './components/CustomerSelector';
import CustomerPanel, { CustomerPanelTrigger } from './components/CustomerPanel';
import WhatsAppMessagePanel from './components/WhatsAppMessagePanel';
import { calcJob, calcSummary } from './lib/calcJob';
import { Job, TechniqueKey } from './types';

interface FormState {
  width: string;
  height: string;
  technique: TechniqueKey;
  printType: string;
  extras: string[];
}

const initialForm: FormState = {
  width: '',
  height: '',
  technique: 'uv',
  printType: '',
  extras: [],
};

function formReducer(state: FormState, action: { field: string; value: string | string[] }): FormState {
  return { ...state, [action.field]: action.value };
}

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

function buildPdfHtml(jobs: Job[], balance: number, kdv: number, customerName?: string): string {
  const s = calcSummary(jobs, balance);
  const date = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  const rows = jobs.map((j, i) => `
    <tr>
      <td style="padding:10px 12px;color:#6b7280;font-size:13px;">${i + 1}</td>
      <td style="padding:10px 12px;font-size:13px;color:#111;">${j.printTypeName}${j.quantity > 1 ? ` <span style="background:#fed7aa;color:#c2410c;font-size:11px;font-weight:700;padding:2px 6px;border-radius:4px;">${j.quantity}×</span>` : ''}</td>
      <td style="padding:10px 12px;font-size:13px;color:#374151;text-align:center;">${j.width}×${j.height} cm</td>
      <td style="padding:10px 12px;font-size:13px;color:#374151;text-align:center;">${fmt(j.totalM2)} m²</td>
      <td style="padding:10px 12px;font-size:13px;font-weight:600;color:#111;text-align:right;">${fmt(j.subtotal)} ₺</td>
    </tr>`).join('');
  return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"/><title>Matbaa Teklif</title>
  <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;background:#f5f5f5;color:#1a1a1a;}.page{max-width:720px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,.12);}.header{background:linear-gradient(135deg,#ea580c,#f97316);padding:36px 40px;}.header h1{color:#fff;font-size:26px;font-weight:800;}.header p{color:rgba(255,255,255,.75);font-size:14px;margin-top:4px;}.body{padding:36px 40px;}table{width:100%;border-collapse:collapse;}th{background:#f9fafb;padding:10px 12px;text-align:left;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;}tr:nth-child(even) td{background:#fafafa;}.totals{margin-top:24px;}.row{display:flex;justify-content:space-between;padding:10px 16px;border-radius:8px;}.label{color:#6b7280;font-size:14px;}.value{font-weight:600;font-size:14px;}.big-box{background:linear-gradient(135deg,#fff7ed,#fff);border:2px solid #fed7aa;border-radius:12px;padding:20px 24px;margin:16px 0;}.big-label{font-size:11px;color:#9a3412;font-weight:700;text-transform:uppercase;letter-spacing:.05em;}.big-value{font-size:40px;font-weight:900;color:#ea580c;letter-spacing:-2px;line-height:1;margin-top:4px;}.final-box{background:#1a1a1a;border-radius:12px;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;margin-top:16px;}.footer{background:#f9fafb;padding:20px 40px;display:flex;justify-content:space-between;}</style></head>
  <body><div class="page">
  <div class="header"><h1>Matbaa Fiyat Teklifi</h1><p>${customerName ? `Müşteri: ${customerName} · ` : ''}Baskı ve üretim hizmetleri · ${jobs.length} iş kalemi</p></div>
  <div class="body">
  <table><thead><tr><th>#</th><th>İş Türü</th><th style="text-align:center">Ölçü</th><th style="text-align:center">Alan</th><th style="text-align:right">KDV Hariç</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="totals">
    <div class="big-box"><div class="big-label">KDV Hariç Toplam</div><div class="big-value">${fmt(s.totalSubtotal)} ₺</div></div>
    <div class="row" style="background:#f9fafb;border-radius:8px;margin-bottom:6px;"><span class="label">KDV (%${kdv})</span><span class="value">+${fmt(s.totalKdv)} ₺</span></div>
    <div class="row" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;"><span class="label" style="color:#c2410c;font-weight:600;">KDV Dahil Toplam</span><span class="value" style="color:#ea580c;font-size:18px;">${fmt(s.totalWithKdv)} ₺</span></div>
    ${balance > 0 ? `<div class="final-box"><div><div style="color:#9ca3af;font-size:12px;">Müşteri bakiyesi düşüldükten sonra</div><div style="color:#6b7280;font-size:12px;margin-top:2px;">Bakiye: -${fmt(balance)} ₺</div></div><div style="color:#fff;font-size:28px;font-weight:900;">${fmt(s.finalPrice)} ₺</div></div>` : ''}
  </div></div>
  <div class="footer"><span style="font-size:12px;color:#9ca3af;">Teklif Tarihi: ${date}</span><span style="font-size:13px;font-weight:700;color:#ea580c;">MATBAA HESAP</span></div>
  </div></body></html>`;
}

export default function Home() {
  const { prices, updatePrices, resetPrices } = usePrices();
  const { customers, loading: customersLoading, addCustomer, updateCustomer, addEntry, deleteCustomer, deleteEntry } = useCustomers();
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [balance, setBalance] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerPanelOpen, setCustomerPanelOpen] = useState(false);
  const [wpOpen, setWpOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const onChange = useCallback((field: string, value: string | string[]) => {
    dispatch({ field, value });
  }, []);

  // preview of current form (not yet added)
  const previewJob = calcJob(
    '__preview__',
    parseFloat(form.width) || 0,
    parseFloat(form.height) || 0,
    form.technique,
    form.printType,
    form.extras,
    prices,
    quantity,
  );

  const canAdd = previewJob !== null;

  const chargeCustomer = useCallback((job: Job) => {
    if (!selectedCustomerId) return;
    addEntry(selectedCustomerId, {
      type: 'charge',
      amount: job.subtotal,
      note: `${job.printTypeName} – ${job.width}×${job.height} cm`,
    });
  }, [selectedCustomerId, addEntry]);

  const handleAdd = useCallback(() => {
    if (!previewJob) return;
    const job = { ...previewJob, id: genId() };
    setJobs((prev) => [...prev, job]);
    chargeCustomer(job);
    setQuantity(1);
  }, [previewJob, chargeCustomer]);

  const handleAddMultiple = useCallback((dims: { width: number; height: number }[]) => {
    if (!form.printType) return;
    const newJobs: Job[] = [];
    for (const { width, height } of dims) {
      const job = calcJob(genId(), width, height, form.technique, form.printType, form.extras, prices);
      if (job) {
        newJobs.push(job);
        if (selectedCustomerId) {
          addEntry(selectedCustomerId, {
            type: 'charge',
            amount: job.subtotal,
            note: `${job.printTypeName} – ${job.width}×${job.height} cm (PDF)`,
          });
        }
      }
    }
    if (newJobs.length > 0) setJobs((prev) => [...prev, ...newJobs]);
  }, [form.technique, form.printType, form.extras, prices, selectedCustomerId, addEntry]);

  const handleRemove = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const handleOpenMessage = () => {
    if (jobs.length === 0) return;
    setWpOpen(true);
  };

  const handlePdf = () => {
    if (jobs.length === 0) return;
    const html = buildPdfHtml(jobs, parseFloat(balance) || 0, prices.kdv, selectedCustomer?.name);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#080808]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-white font-black text-xs">M</span>
            </div>
            <div>
              <span className="text-white font-bold text-sm">MATBAA HESAP</span>
              <span className="text-gray-600 text-xs ml-2">Fiyat Hesaplama Sistemi</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {jobs.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-medium">{jobs.length} iş eklendi</span>
              </div>
            )}
            {jobs.length > 0 && (
              <button
                onClick={() => { setJobs([]); setBalance(''); }}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors border border-white/10 px-3 py-1.5 rounded-lg hover:border-red-500/30"
              >
                Temizle
              </button>
            )}
            <CustomerPanelTrigger customers={customers} onOpen={() => setCustomerPanelOpen(true)} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Baskı Fiyat <span className="text-orange-500">Hesaplama</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">İş ekleyerek toplam fiyatı hesaplayın. Bakiye otomatik düşülür.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
          {/* Sol: Müşteri + Form + İş listesi */}
          <div className="space-y-4">
            <CustomerSelector
              customers={customers}
              selectedId={selectedCustomerId}
              onSelect={setSelectedCustomerId}
              onAddCustomer={addCustomer}
            />
            <InputForm
              width={form.width}
              height={form.height}
              quantity={quantity}
              technique={form.technique}
              printType={form.printType}
              extras={form.extras}
              prices={prices}
              onChange={onChange}
              onQuantityChange={setQuantity}
              onAdd={handleAdd}
              onAddMultiple={handleAddMultiple}
              canAdd={canAdd}
            />
            <JobList jobs={jobs} onRemove={handleRemove} onClear={() => setJobs([])} />
          </div>

          {/* Sağ: Özet */}
          <SummaryCard
            jobs={jobs}
            balance={balance}
            onBalanceChange={setBalance}
            onMessage={handleOpenMessage}
            onPdf={handlePdf}
            kdv={prices.kdv}
          />
        </div>
      </main>

      <CustomerPanel
        customers={customers}
        loading={customersLoading}
        open={customerPanelOpen}
        onOpen={() => setCustomerPanelOpen(true)}
        onClose={() => setCustomerPanelOpen(false)}
        onAddEntry={addEntry}
        onUpdateCustomer={updateCustomer}
        onDeleteCustomer={deleteCustomer}
        onDeleteEntry={deleteEntry}
      />
      <AdminPanel prices={prices} onUpdate={updatePrices} onReset={resetPrices} />
      <WhatsAppMessagePanel
        open={wpOpen}
        onClose={() => setWpOpen(false)}
        jobs={jobs}
        balance={parseFloat(balance) || 0}
        kdv={prices.kdv}
        customerName={selectedCustomer?.name}
        customerPhone={selectedCustomer?.phone}
      />
    </div>
  );
}
