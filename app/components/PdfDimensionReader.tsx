'use client';
import { useRef, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';

interface PdfDims {
  width: number;
  height: number;
}

interface Props {
  onAddJobs: (dims: PdfDims[]) => void;
}

export default function PdfDimensionReader({ onAddJobs }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (files: FileList) => {
    setLoading(true);
    setError('');
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const dims: PdfDims[] = [];
      for (const file of Array.from(files)) {
        try {
          const buf = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
          const page = await pdf.getPage(1);
          const vp = page.getViewport({ scale: 1 });
          // 1 pt = 25.4/72 mm; divide by 10 for cm, round to 1 decimal
          const wCm = Math.round((vp.width * 25.4) / 72 / 10 * 10) / 10;
          const hCm = Math.round((vp.height * 25.4) / 72 / 10 * 10) / 10;
          if (wCm > 0 && hCm > 0) dims.push({ width: wCm, height: hCm });
        } catch {
          console.error('PDF okuma hatası:', file.name);
        }
      }

      if (dims.length === 0) {
        setError('Hiçbir PDF\'den ölçü okunamadı');
      } else {
        onAddJobs(dims);
      }
    } catch {
      setError('PDF kütüphanesi yüklenemedi');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-white/20 hover:border-orange-500/40 text-gray-500 hover:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        {loading ? 'PDF okunuyor...' : 'PDF\'ten ölçü al (toplu ekle)'}
      </button>
      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
    </div>
  );
}
