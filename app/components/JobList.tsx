'use client';
import { Job } from '../types';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

interface Props {
  jobs: Job[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

function JobRow({ job, index, onRemove }: { job: Job; index: number; onRemove: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${open ? 'border-white/15 bg-white/3' : 'border-white/8 bg-black/20'}`}>
      {/* Satır başlığı */}
      <div className="flex items-center gap-2 px-3 py-3">
        {/* Numara */}
        <span className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>

        {/* İçerik — tıklanınca açılır */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => setOpen((v) => !v)}
        >
          <p className="text-white text-sm font-medium truncate leading-tight">{job.printTypeName}</p>
          <p className="text-gray-500 text-xs leading-tight mt-0.5">
            {job.width}×{job.height} cm · {job.selectedMaterial.toUpperCase()} {job.selectedWidth}cm · {fmt(job.totalM2)} m² · <span className="text-gray-600">{fmt(job.unitPrice)} ₺/m²</span>
          </p>
        </div>

        {/* Fiyat */}
        <span className="text-orange-400 font-bold text-sm shrink-0">{fmt(job.subtotal)} ₺</span>

        {/* Sil butonu — her zaman görünür */}
        <button
          onClick={onRemove}
          className="shrink-0 flex items-center gap-1 bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-400 px-2.5 py-1.5 rounded-lg transition-all text-xs font-medium"
          title="Sil"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sil</span>
        </button>

        {/* Detay aç/kapa */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Detay */}
      {open && (
        <div className="px-4 pb-3 border-t border-white/8 pt-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <span className="text-gray-500">Teknik</span>
            <span className="text-gray-300 text-right">{job.technique === 'uv' ? '⚡ UV Baskı' : '🌊 Solvent Baskı'}</span>
            <span className="text-gray-500">Seçilen en</span>
            <span className="text-gray-300 text-right">{job.selectedWidth} cm {job.rotated && <span className="text-orange-400/70">↻ 90° döndürüldü</span>}</span>
            <span className="text-gray-500">Alan</span>
            <span className="text-gray-300 text-right">{fmt(job.totalM2)} m²</span>
            <span className="text-gray-500">Fire</span>
            <span className="text-gray-300 text-right">%{fmt(job.firePercent)}</span>
            <span className="text-gray-500">Birim fiyat</span>
            <span className="text-gray-300 text-right">{fmt(job.unitPrice)} ₺/m²</span>
            {job.extrasPrice > 0 && (
              <>
                <span className="text-gray-500">Ekstra hizmet</span>
                <span className="text-gray-300 text-right">+{fmt(job.extrasPrice)} ₺</span>
              </>
            )}
            <span className="text-gray-500 font-medium">KDV hariç</span>
            <span className="text-orange-400 text-right font-semibold">{fmt(job.subtotal)} ₺</span>
            <span className="text-gray-500">KDV dahil</span>
            <span className="text-gray-300 text-right">{fmt(job.totalWithKdv)} ₺</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobList({ jobs, onRemove, onClear }: Props) {
  if (jobs.length === 0) return null;

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Eklenen İşler</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{jobs.length} iş</span>
          {jobs.length > 1 && (
            <button
              onClick={onClear}
              className="text-xs text-red-400/70 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 px-2 py-0.5 rounded-full transition-all"
            >
              Tümünü sil
            </button>
          )}
        </div>
      </div>
      {jobs.map((job, i) => (
        <JobRow key={job.id} job={job} index={i} onRemove={() => onRemove(job.id)} />
      ))}
    </div>
  );
}
