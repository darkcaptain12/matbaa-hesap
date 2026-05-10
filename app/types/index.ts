export type TechniqueKey = 'uv' | 'solvent';
export type MaterialType = 'folyo' | 'vinil';

export interface PrintOption {
  name: string;
  price: number;
  material: MaterialType;
}

export interface ExtrasOption {
  name: string;
  price: number;
}

export interface PriceData {
  materials: {
    folyo: { widths: number[]; unit: string };
    vinil: { widths: number[]; unit: string };
  };
  uv: Record<string, PrintOption>;
  solvent: Record<string, PrintOption>;
  extras: Record<string, ExtrasOption>;
  kdv: number;
  version: string;
}

export interface Job {
  id: string;
  width: number;
  height: number;
  technique: TechniqueKey;
  printType: string;
  extras: string[];
  // calculated fields
  selectedMaterial: MaterialType;
  selectedWidth: number;
  cutLength: number;
  rotated: boolean;
  totalM2: number;
  firePercent: number;
  unitPrice: number;
  basePrice: number;
  extrasPrice: number;
  subtotal: number;
  kdvAmount: number;
  totalWithKdv: number;
  printTypeName: string;
}

export interface Summary {
  jobs: Job[];
  totalSubtotal: number;
  totalKdv: number;
  totalWithKdv: number;
  balance: number;
  finalPrice: number;
}

// ─── Müşteri ──────────────────────────────────────────────────────────────────

export interface CustomerEntry {
  id: string;
  type: 'charge' | 'payment';
  amount: number;
  date: string;
  note: string;
}

export interface Customer {
  id: string;
  name: string;
  entries: CustomerEntry[];
}
