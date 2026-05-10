'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Customer, CustomerEntry } from '../types';

const KEY = 'matbaa_customers';

function genId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function load(): Customer[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

function save(list: Customer[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function netBalance(customer: Customer): number {
  return customer.entries.reduce((sum, e) => e.type === 'charge' ? sum + e.amount : sum - e.amount, 0);
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => { setCustomers(load()); }, []);

  const addCustomer = useCallback((name: string): Customer => {
    const c: Customer = { id: genId(), name: name.trim(), entries: [] };
    setCustomers((prev) => { const next = [...prev, c]; save(next); return next; });
    return c;
  }, []);

  const addEntry = useCallback((customerId: string, entry: Omit<CustomerEntry, 'id' | 'date'>) => {
    setCustomers((prev) => {
      const next = prev.map((c) =>
        c.id !== customerId ? c : {
          ...c,
          entries: [...c.entries, { ...entry, id: genId(), date: new Date().toISOString() }],
        }
      );
      save(next);
      return next;
    });
  }, []);

  const deleteCustomer = useCallback((customerId: string) => {
    setCustomers((prev) => { const next = prev.filter((c) => c.id !== customerId); save(next); return next; });
  }, []);

  const deleteEntry = useCallback((customerId: string, entryId: string) => {
    setCustomers((prev) => {
      const next = prev.map((c) =>
        c.id !== customerId ? c : { ...c, entries: c.entries.filter((e) => e.id !== entryId) }
      );
      save(next);
      return next;
    });
  }, []);

  return { customers, addCustomer, addEntry, deleteCustomer, deleteEntry };
}
