export type TechniqueKey = 'solvent_folyo' | 'solvent_branda' | 'uv_roll';
export type MaterialGroup = 'foil' | 'branda' | 'vinyl' | 'oneway';
export type PriceTier = 'above20' | 'above5' | 'below5';

export interface ProductPrices {
  above20: number;
  above5: number;
  below5: number;
}

export interface Product {
  name: string;
  materialGroup: MaterialGroup;
  prices: ProductPrices;
}

export interface Technique {
  name: string;
  products: Record<string, Product>;
}

export interface MaterialConfig {
  widths: number[];
}

export interface PriceData {
  techniques: Record<TechniqueKey, Technique>;
  materials: Record<MaterialGroup, MaterialConfig>;
  kdv: number;
  discountRate: number;
  minJobPrice: number;
}

export interface Job {
  id: string;
  fileName: string;
  width: number;
  height: number;
  technique: TechniqueKey;
  productKey: string;
  productName: string;
  materialGroup: MaterialGroup;
  selectedWidth: number;
  cutLength: number;
  rotated: boolean;
  totalM2: number;
  wastePercent: number;
  groupKey: string;
}

export interface JobGroup {
  groupKey: string;
  technique: TechniqueKey;
  techniqueName: string;
  productKey: string;
  productName: string;
  materialGroup: MaterialGroup;
  materialWidth: number;
  jobs: Job[];
  totalM2: number;
  priceTier: PriceTier;
  priceTierLabel: string;
  unitPrice: number;
  normalTotal: number;
  discountAmount: number;
  groupTotal: number;
}

export interface QuoteSummary {
  groups: JobGroup[];
  subtotal: number;
  discountTotal: number;
  afterDiscount: number;
  kdvRate: number;
  kdvAmount: number;
  grandTotal: number;
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
  phone?: string;
  sabitFiyat?: boolean;
  entries: CustomerEntry[];
}
