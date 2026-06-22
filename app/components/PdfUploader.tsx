'use client';
import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Loader2, AlertCircle, Plus, X } from 'lucide-react';
import type { PriceData, TechniqueKey } from '../types';
import { createJob } from '../lib/calcEngine';
import type { Job } from '../types';

interface Props {
  technique: TechniqueKey;
  productKey: string;
  prices: PriceData;
  onAddJobs: (jobs: Job[]) => void;
}

export default function PdfUploader({ technique, productKey, prices, onAddJobs }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [manualWidth, setManualWidth] = useState('');
  const [manualHeight, setManualHeight] = useState('');
  const [showManual, setShowManual] = useState(false);

  const processFiles = useCallback(async (files: FileList) => {
    if (!productKey) {
      setError('Lütfen önce ürün seçin');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const newJobs: Job[] = [];
      for (const file of Array.from(files)) {
        try {
          const buf = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
          const page = await pdf.getPage(1);
          const vp = page.getViewport({ scale: 1 });
          const wCm = Math.round((vp.width * 25.4) / 72 * 10) / 10;
          const hCm = Math.round((vp.height * 25.4) / 72 * 10) / 10;

          if (wCm > 0 && hCm > 0) {
            const job = createJob(wCm, hCm, technique, productKey, prices, file.name);
            if (job) newJobs.push(job);
          }
        } catch {
          console.error('PDF okuma hatası:', file.name);
        }
      }

      if (newJobs.length === 0) {
        setError('Hiçbir PDF\'den ölçü okunamadı');
      } else {
        onAddJobs(newJobs);
      }
    } catch {
      setError('PDF kütüphanesi yüklenemedi');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [technique, productKey, prices, onAddJobs]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleManualAdd = () => {
    const w = parseFloat(manualWidth);
    const h = parseFloat(manualHeight);
    if (!w || !h || w <= 0 || h <= 0) return;
    if (!productKey) {
      setError('Lütfen önce ürün seçin');
      return;
    }
    const job = createJob(w, h, technique, productKey, prices);
    if (job) {
      onAddJobs([job]);
      setManualWidth('');
      setManualHeight('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && processFiles(e.target.files)}
      />
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
          dragOver
            ? 'border-orange-500/60 bg-orange-500/8'
            : 'border-white/12 bg-[#0e0e0e] hover:border-orange-500/30 hover:bg-orange-500/3'
        }`}
      >
        <div className="flex flex-col items-center justify-center py-8 px-4">
          {loading ? (
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-2" />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-3">
              {dragOver ? (
                <FileText className="w-6 h-6 text-orange-400" />
              ) : (
                <Upload className="w-6 h-6 text-orange-400" />
              )}
            </div>
          )}
          <p className="text-sm font-medium text-gray-300">
            {loading ? 'PDF okunuyor...' : dragOver ? 'Bırakın' : 'PDF Yükle'}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {loading ? '' : 'Sürükle & bırak veya tıkla · Toplu yükleme destekli'}
          </p>
        </div>
      </motion.div>

      {/* Manual Entry Toggle */}
      <button
        onClick={() => setShowManual(!showManual)}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs text-gray-500 hover:text-gray-400 transition-colors"
      >
        {showManual ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        {showManual ? 'Manuel girişi kapat' : 'Manuel ölçü gir'}
      </button>

      {/* Manual Entry */}
      <AnimatePresence>
        {showManual && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#0e0e0e] border border-white/8 rounded-2xl p-4">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <div>
                  <label className="text-[10px] text-gray-600 uppercase tracking-wider">En (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={manualWidth}
                    onChange={(e) => setManualWidth(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                    placeholder="100"
                    className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-medium placeholder-gray-700 focus:outline-none focus:border-orange-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-600 uppercase tracking-wider">Boy (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={manualHeight}
                    onChange={(e) => setManualHeight(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                    placeholder="60"
                    className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-medium placeholder-gray-700 focus:outline-none focus:border-orange-500/50 transition-all"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleManualAdd}
                    disabled={!manualWidth || !manualHeight || !productKey}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-all text-sm font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="text-xs text-red-400">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
