'use client';
import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { usePrices } from './hooks/usePrices';
import { useCustomers } from './hooks/useCustomers';
import { calcQuote } from './lib/calcEngine';
import { openQuotePdf } from './components/QuotePdf';
import Header from './components/Header';
import ConfigBar from './components/ConfigBar';
import CustomerSelector from './components/CustomerSelector';
import JobTable from './components/JobTable';
import GroupResults from './components/GroupResults';
import TotalSummary from './components/TotalSummary';
import AdminPanel from './components/AdminPanel';
import CustomerPanel from './components/CustomerPanel';
import type { Job, TechniqueKey } from './types';

const PdfUploader = dynamic(() => import('./components/PdfUploader'), { ssr: false });

export default function Home() {
  const { prices, updatePrices, resetPrices } = usePrices();
  const { customers, loading: customersLoading, addCustomer, updateCustomer, addEntry, deleteCustomer, deleteEntry, toggleSabitFiyat } = useCustomers();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [technique, setTechnique] = useState<TechniqueKey>('uv');
  const [productKey, setProductKey] = useState('');
  const [sadeceBaski, setSadeceBaski] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [customerPanelOpen, setCustomerPanelOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const sabitFiyat = selectedCustomer?.sabitFiyat ?? false;

  const quote = useMemo(
    () => calcQuote(jobs, prices, sadeceBaski, sabitFiyat),
    [jobs, prices, sadeceBaski, sabitFiyat]
  );

  const handleAddJobs = useCallback((newJobs: Job[]) => {
    setJobs((prev) => [...prev, ...newJobs]);
    // Müşteri seçiliyse her iş için borç kaydı ekle
    if (selectedCustomerId) {
      for (const job of newJobs) {
        const techData = prices.techniques[job.technique];
        const product = techData?.products[job.productKey];
        if (!product) continue;
        const tier = job.totalM2 >= 20 ? 'above20' : (job.totalM2 >= 5 || sabitFiyat) ? 'above5' : 'below5' as const;
        const unitPrice = product.prices[tier];
        const amount = job.totalM2 * unitPrice * (sadeceBaski ? (1 - prices.discountRate / 100) : 1);
        addEntry(selectedCustomerId, {
          type: 'charge',
          amount,
          note: `${product.name} – ${job.width}×${job.height} cm`,
        });
      }
    }
  }, [selectedCustomerId, addEntry, prices, sadeceBaski]);

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
    openQuotePdf(quote, companyName || selectedCustomer?.name || '', sadeceBaski);
  }, [quote, companyName, selectedCustomer, sadeceBaski]);

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      <Header
        jobCount={jobs.length}
        customers={customers}
        onAdminOpen={() => setAdminOpen(true)}
        onCustomersOpen={() => setCustomerPanelOpen(true)}
      />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr_380px] gap-5 items-start">
          {/* Sol: Config + Müşteri */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <CustomerSelector
              customers={customers}
              selectedId={selectedCustomerId}
              onSelect={setSelectedCustomerId}
              onAddCustomer={addCustomer}
            />
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

          {/* Orta: Upload + İşler + Gruplar */}
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

          {/* Sağ: Özet */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-20"
          >
            <TotalSummary
              quote={quote}
              sadeceBaski={sadeceBaski}
              companyName={companyName || selectedCustomer?.name || ''}
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

      <CustomerPanel
        customers={customers}
        loading={customersLoading}
        open={customerPanelOpen}
        onClose={() => setCustomerPanelOpen(false)}
        onAddEntry={addEntry}
        onUpdateCustomer={updateCustomer}
        onDeleteCustomer={deleteCustomer}
        onDeleteEntry={deleteEntry}
        onToggleSabitFiyat={toggleSabitFiyat}
      />
    </div>
  );
}
