'use client';
import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { usePrices } from './hooks/usePrices';
import { calcQuote } from './lib/calcEngine';
import { openQuotePdf } from './components/QuotePdf';
import Header from './components/Header';
import ConfigBar from './components/ConfigBar';
import JobTable from './components/JobTable';
import GroupResults from './components/GroupResults';
import TotalSummary from './components/TotalSummary';
import AdminPanel from './components/AdminPanel';
import type { Job, TechniqueKey } from './types';

const PdfUploader = dynamic(() => import('./components/PdfUploader'), { ssr: false });

export default function Home() {
  const { prices, updatePrices, resetPrices } = usePrices();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [technique, setTechnique] = useState<TechniqueKey>('uv');
  const [productKey, setProductKey] = useState('');
  const [sadeceBaski, setSadeceBaski] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);

  const quote = useMemo(
    () => calcQuote(jobs, prices, sadeceBaski),
    [jobs, prices, sadeceBaski]
  );

  const handleAddJobs = useCallback((newJobs: Job[]) => {
    setJobs((prev) => [...prev, ...newJobs]);
  }, []);

  const handleRemoveJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  const handleUpdateJob = useCallback((id: string, updated: Job) => {
    setJobs((prev) => prev.map((j) => j.id === id ? { ...updated, id } : j));
  }, []);

  const handleClearJobs = useCallback(() => {
    setJobs([]);
  }, []);

  const handleGeneratePdf = useCallback(() => {
    if (quote.groups.length === 0) return;
    openQuotePdf(quote, companyName, sadeceBaski);
  }, [quote, companyName, sadeceBaski]);

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      <Header jobCount={jobs.length} onAdminOpen={() => setAdminOpen(true)} />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Akıllı Baskı <span className="text-orange-500">Hesaplama</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            PDF yükleyin, ölçüleri otomatik okutun, grup bazlı fiyatlandırma ile teklif oluşturun.
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr_380px] gap-5 items-start">
          {/* Left: Config */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <ConfigBar
              prices={prices}
              technique={technique}
              productKey={productKey}
              sadeceBaski={sadeceBaski}
              onTechniqueChange={setTechnique}
              onProductChange={setProductKey}
              onSadeceBaskiChange={setSadeceBaski}
            />
          </motion.div>

          {/* Center: Upload + Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <PdfUploader
              technique={technique}
              productKey={productKey}
              prices={prices}
              onAddJobs={handleAddJobs}
            />
            <JobTable
              jobs={jobs}
              prices={prices}
              onRemove={handleRemoveJob}
              onUpdate={handleUpdateJob}
              onClear={handleClearJobs}
            />
            {jobs.length > 0 && (
              <GroupResults groups={quote.groups} sadeceBaski={sadeceBaski} />
            )}
          </motion.div>

          {/* Right: Summary */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-20"
          >
            <TotalSummary
              quote={quote}
              sadeceBaski={sadeceBaski}
              companyName={companyName}
              onCompanyNameChange={setCompanyName}
              onGeneratePdf={handleGeneratePdf}
            />
          </motion.div>
        </div>
      </main>

      <AdminPanel
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        prices={prices}
        onUpdate={updatePrices}
        onReset={resetPrices}
      />
    </div>
  );
}
