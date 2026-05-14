'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Customer, CustomerEntry } from '../types';

const LS_KEY = 'matbaa_customers';

function genId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// localStorage fallback (offline / KV yokken)
function lsLoad(): Customer[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function lsSave(list: Customer[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

async function kvLoad(): Promise<Customer[]> {
  const res = await fetch('/api/customers');
  if (!res.ok) throw new Error('KV fetch failed');
  return res.json();
}

async function kvSave(list: Customer[]): Promise<void> {
  const res = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(list),
  });
  if (!res.ok) throw new Error('KV save failed');
}

export function netBalance(customer: Customer): number {
  return customer.entries.reduce((sum, e) => e.type === 'charge' ? sum + e.amount : sum - e.amount, 0);
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // İlk yükleme: KV'den al, başarısız olursa localStorage'a düş
  useEffect(() => {
    kvLoad()
      .then((data) => {
        setCustomers(data);
        lsSave(data); // yerel kopyayı güncelle
      })
      .catch(() => {
        setCustomers(lsLoad()); // KV yoksa localStorage
      })
      .finally(() => setLoading(false));
  }, []);

  // Debounced save: son değişiklikten 500ms sonra kaydet
  const persist = useCallback((list: Customer[]) => {
    lsSave(list); // anında localStorage
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      kvSave(list).catch(() => {}); // KV yoksa sessizce geç
    }, 500);
  }, []);

  const addCustomer = useCallback((name: string, phone?: string): Customer => {
    const c: Customer = { id: genId(), name: name.trim(), phone: phone?.trim() || undefined, entries: [] };
    setCustomers((prev) => { const next = [...prev, c]; persist(next); return next; });
    return c;
  }, [persist]);

  const addEntry = useCallback((customerId: string, entry: Omit<CustomerEntry, 'id' | 'date'>) => {
    setCustomers((prev) => {
      const next = prev.map((c) =>
        c.id !== customerId ? c : {
          ...c,
          entries: [...c.entries, { ...entry, id: genId(), date: new Date().toISOString() }],
        }
      );
      persist(next);
      return next;
    });
  }, [persist]);

  const updateCustomer = useCallback((customerId: string, fields: { name?: string; phone?: string }) => {
    setCustomers((prev) => {
      const next = prev.map((c) =>
        c.id !== customerId ? c : { ...c, ...fields, name: fields.name?.trim() || c.name, phone: fields.phone?.trim() || undefined }
      );
      persist(next);
      return next;
    });
  }, [persist]);

  const deleteCustomer = useCallback((customerId: string) => {
    setCustomers((prev) => { const next = prev.filter((c) => c.id !== customerId); persist(next); return next; });
  }, [persist]);

  const deleteEntry = useCallback((customerId: string, entryId: string) => {
    setCustomers((prev) => {
      const next = prev.map((c) =>
        c.id !== customerId ? c : { ...c, entries: c.entries.filter((e) => e.id !== entryId) }
      );
      persist(next);
      return next;
    });
  }, [persist]);

  // Mevcut KDV dahil charge tutarlarını KDV hariç'e çevirir
  const migrateToKdvExcl = useCallback((kdv: number) => {
    const divisor = 1 + kdv / 100;
    setCustomers((prev) => {
      const next = prev.map((c) => ({
        ...c,
        entries: c.entries.map((e) =>
          e.type === 'charge' ? { ...e, amount: Math.round((e.amount / divisor) * 100) / 100 } : e
        ),
      }));
      persist(next);
      return next;
    });
  }, [persist]);

  // Mevcut KDV hariç charge tutarlarına KDV ekler
  const migrateToKdvIncl = useCallback((kdv: number) => {
    const multiplier = 1 + kdv / 100;
    setCustomers((prev) => {
      const next = prev.map((c) => ({
        ...c,
        entries: c.entries.map((e) =>
          e.type === 'charge' ? { ...e, amount: Math.round((e.amount * multiplier) * 100) / 100 } : e
        ),
      }));
      persist(next);
      return next;
    });
  }, [persist]);

  return { customers, loading, addCustomer, updateCustomer, addEntry, deleteCustomer, deleteEntry, migrateToKdvExcl, migrateToKdvIncl };
}
