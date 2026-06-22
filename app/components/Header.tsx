'use client';
import { Settings, Layers } from 'lucide-react';
import { CustomerPanelTrigger } from './CustomerPanel';
import type { Customer } from '../types';

interface Props {
  jobCount: number;
  customers: Customer[];
  onAdminOpen: () => void;
  onCustomersOpen: () => void;
}

export default function Header({ jobCount, customers, onAdminOpen, onCustomersOpen }: Props) {
  return (
    <header className="border-b border-white/10 bg-[#060606]/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Layers className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-tight">MATBAA PRO</span>
            <span className="text-gray-600 text-xs ml-2 hidden sm:inline">Akıllı Baskı Hesaplama</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {jobCount > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-orange-400 text-xs font-medium">{jobCount} iş</span>
            </div>
          )}
          <CustomerPanelTrigger customers={customers} onOpen={onCustomersOpen} />
          <button
            onClick={onAdminOpen}
            className="w-9 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-300 transition-all"
            title="Admin Panel"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
