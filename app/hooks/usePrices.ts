'use client';
import { useState, useEffect, useCallback } from 'react';
import type { PriceData } from '../types';
import defaultPrices from '../data/prices.json';

const STORAGE_KEY = 'matbaa_prices';

export function usePrices() {
  const [prices, setPrices] = useState<PriceData>(defaultPrices as PriceData);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPrices(JSON.parse(stored));
      } catch {
        // corrupted, use defaults
      }
    }
  }, []);

  const updatePrices = useCallback((newPrices: PriceData) => {
    setPrices(newPrices);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrices));
  }, []);

  const resetPrices = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPrices(defaultPrices as PriceData);
  }, []);

  return { prices, updatePrices, resetPrices };
}
