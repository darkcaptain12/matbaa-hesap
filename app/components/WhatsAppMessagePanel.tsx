'use client';
import { useState, useEffect } from 'react';
import { X, Copy, MessageCircle, Check } from 'lucide-react';
import { Job } from '../types';
import { calcSummary } from '../lib/calcJob';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

interface MsgConfig {
  showJobLines: boolean;
  showKdvLine: boolean;
  showKdvDahil: boolean;
  showBalance: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  jobs: Job[];
  balance: number;
  kdv: number;
  customerName?: string;
  customerPhone?: string;
}

function buildMessage(jobs: Job[], balance: number, kdv: number, config: MsgConfig, customerName?: string): string {
  const s = calcSummary(jobs, balance);
  const date = new Date().toLocaleDateString('tr-TR');
  const lines: string[] = [
    `📋 MATBAA FİYAT TEKLİFİ – ${date}`,
    ...(customerName ? [`Müşteri: ${customerName}`] : []),
    '━━━━━━━━━━━━━━━━━━━━',
  ];

  if (config.showJobLines) {
    jobs.forEach((j, i) => {
      lines.push(
        `${i + 1}. ${j.printTypeName}${j.quantity > 1 ? ` (${j.quantity}×)` : ''} | ${j.width}×${j.height}cm | ${fmt(j.totalM2)} m² | ${fmt(j.subtotal)} ₺ (KDV Hariç)`
      );
    });
    lines.push('━━━━━━━━━━━━━━━━━━━━');
  }

  lines.push(`KDV Hariç Toplam : ${fmt(s.totalSubtotal)} ₺`);

  if (config.showKdvLine) {
    lines.push(`KDV (%${kdv})           : +${fmt(s.totalKdv)} ₺`);
  }

  if (config.showKdvDahil) {
    lines.push(`KDV Dahil Toplam : ${fmt(s.totalWithKdv)} ₺`);
  }

  if (config.showBalance && balance > 0) {
    lines.push(`Bakiye           : -${fmt(balance)} ₺`);
    lines.push(`ÖDENECEK         : ${fmt(s.finalPrice)} ₺`);
  }

  return lines.join('\n');
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
        checked
          ? 'bg-green-500/15 border-green-500/30 text-green-400'
          : 'bg-white/5 border-white/10 text-gray-500'
      }`}
    >
      <div
        className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
          checked ? 'bg-green-500 border-green-500' : 'border-gray-600'
        }`}
      >
        {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </div>
      {label}
    </button>
  );
}

export default function WhatsAppMessagePanel({
  open, onClose, jobs, balance, kdv, customerName, customerPhone,
}: Props) {
  const [config, setConfig] = useState<MsgConfig>({
    showJobLines: true,
    showKdvLine: false,
    showKdvDahil: false,
    showBalance: true,
  });
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setText(buildMessage(jobs, balance, kdv, config, customerName));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, jobs, balance, kdv, customerName]);

  useEffect(() => {
    if (open) {
      setText(buildMessage(jobs, balance, kdv, config, customerName));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const toggleConfig = (key: keyof MsgConfig) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(text);
    const base = customerPhone
      ? `https://wa.me/${customerPhone.replace(/\D/g, '')}`
      : 'https://wa.me/';
    window.open(`${base}?text=${encoded}`, '_blank');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-400" />
            <h2 className="text-white font-bold text-sm">WhatsApp Mesajı</h2>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">Düzenlenebilir</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle satırları */}
        <div className="px-5 py-3 border-b border-white/8">
          <p className="text-xs text-gray-600 mb-2 uppercase tracking-wider">Mesaja eklenecekler</p>
          <div className="flex flex-wrap gap-2">
            <Toggle label="İş detayları" checked={config.showJobLines} onChange={() => toggleConfig('showJobLines')} />
            <Toggle label="KDV satırı" checked={config.showKdvLine} onChange={() => toggleConfig('showKdvLine')} />
            <Toggle label="KDV dahil toplam" checked={config.showKdvDahil} onChange={() => toggleConfig('showKdvDahil')} />
            {balance > 0 && (
              <Toggle label="Bakiye" checked={config.showBalance} onChange={() => toggleConfig('showBalance')} />
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-200 text-sm font-mono leading-relaxed focus:outline-none focus:border-green-500/50 transition-all resize-none"
          />
          <p className="text-xs text-gray-600 mt-1.5">
            Mesajı göndermeden önce düzenleyebilirsiniz. Yukarıdaki toggle&apos;lar metni sıfırlar.
          </p>
        </div>

        {/* Aksiyonlar */}
        <div className="px-5 pb-5 grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-medium py-2.5 rounded-xl transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Kopyalandı!' : 'Panoya Kopyala'}
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-green-500/20"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp&apos;a Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
