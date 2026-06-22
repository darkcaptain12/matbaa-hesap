'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronDown, ChevronUp, FileText, RotateCw, Pencil, Check, X } from 'lucide-react';
import type { Job, PriceData, TechniqueKey } from '../types';
import { createJob, fmt } from '../lib/calcEngine';

interface Props {
  jobs: Job[];
  prices: PriceData;
  onRemove: (id: string) => void;
  onUpdate: (id: string, job: Job) => void;
  onClear: () => void;
}

function JobRow({ job, prices, index, onRemove, onUpdate }: {
  job: Job;
  prices: PriceData;
  index: number;
  onRemove: () => void;
  onUpdate: (j: Job) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editW, setEditW] = useState(String(job.width));
  const [editH, setEditH] = useState(String(job.height));

  const handleSave = () => {
    const w = parseFloat(editW);
    const h = parseFloat(editH);
    if (!w || !h || w <= 0 || h <= 0) return;
    const updated = createJob(w, h, job.technique, job.productKey, prices, job.fileName);
    if (updated) {
      updated.id = job.id;
      onUpdate(updated);
    }
    setEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`border rounded-xl overflow-hidden transition-colors ${open ? 'border-white/15' : 'border-white/6'}`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="w-6 h-6 rounded-lg bg-orange-500/15 text-orange-400 text-[11px] font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !editing && setOpen((v) => !v)}>
          {editing ? (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                value={editW}
                onChange={(e) => setEditW(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-20 bg-black/50 border border-white/15 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-orange-500/50"
                placeholder="En"
              />
              <span className="text-gray-600 self-center text-sm">×</span>
              <input
                type="number"
                value={editH}
                onChange={(e) => setEditH(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-20 bg-black/50 border border-white/15 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-orange-500/50"
                placeholder="Boy"
              />
            </div>
          ) : (
            <>
              <p className="text-white text-sm font-medium truncate">
                <FileText className="w-3 h-3 inline mr-1.5 text-gray-500" />
                {job.fileName}
              </p>
              <p className="text-gray-500 text-[11px] mt-0.5">
                {job.width}×{job.height} cm → {job.selectedWidth} cm {job.material}
                {job.rotated && <RotateCw className="w-2.5 h-2.5 inline ml-1 text-orange-400/60" />}
                {' '}· {fmt(job.totalM2)} m²
              </p>
            </>
          )}
        </div>

        <span className="text-orange-400 font-bold text-sm shrink-0">{fmt(job.totalM2)} m²</span>

        {editing ? (
          <div className="flex gap-1 shrink-0">
            <button onClick={handleSave} className="p-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-all">
              <Check className="w-3 h-3" />
            </button>
            <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:bg-white/10 transition-all">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditW(String(job.width)); setEditH(String(job.height)); setEditing(true); }}
            className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-all shrink-0"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}

        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg bg-red-500/10 text-red-400/70 hover:text-red-400 hover:bg-red-500/20 transition-all shrink-0"
        >
          <Trash2 className="w-3 h-3" />
        </button>

        <button
          onClick={() => setOpen((v) => !v)}
          className="p-1 text-gray-600 hover:text-gray-400 transition-colors shrink-0"
        >
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-2 border-t border-white/6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                <span className="text-gray-500">Teknik</span>
                <span className="text-gray-300 text-right">{job.technique.toUpperCase()}</span>
                <span className="text-gray-500">Ürün</span>
                <span className="text-gray-300 text-right">{job.productName}</span>
                <span className="text-gray-500">Malzeme</span>
                <span className="text-gray-300 text-right">{job.material} · {job.selectedWidth} cm</span>
                <span className="text-gray-500">Ölçü</span>
                <span className="text-gray-300 text-right">{job.width} × {job.height} cm {job.rotated ? '(döndürülmüş)' : ''}</span>
                <span className="text-gray-500">Hesaplanan Alan</span>
                <span className="text-gray-300 text-right">{fmt(job.totalM2)} m²</span>
                <span className="text-gray-500">Fire</span>
                <span className="text-gray-300 text-right">%{fmt(job.wastePercent)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function JobTable({ jobs, prices, onRemove, onUpdate, onClear }: Props) {
  if (jobs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0e0e0e] border border-white/8 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
          İş Listesi
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{jobs.length} iş</span>
          {jobs.length > 1 && (
            <button
              onClick={onClear}
              className="text-[10px] text-red-400/60 hover:text-red-400 border border-red-500/15 hover:border-red-500/30 px-2 py-0.5 rounded-full transition-all"
            >
              Tümünü sil
            </button>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {jobs.map((job, i) => (
            <JobRow
              key={job.id}
              job={job}
              prices={prices}
              index={i}
              onRemove={() => onRemove(job.id)}
              onUpdate={(j) => onUpdate(job.id, j)}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
