import type { PriceData, Job, JobGroup, QuoteSummary, MaterialGroup, PriceTier, TechniqueKey } from '../types';

function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const MATERIAL_LABELS: Record<MaterialGroup, string> = {
  foil: 'Folyo',
  branda: 'Branda',
  vinyl: 'Vinil',
  oneway: 'One Way',
};

function findBestOrientation(widths: number[], width: number, height: number) {
  const sorted = [...widths].sort((a, b) => a - b);

  const normalFit = sorted.find((w) => w >= width);
  const rotatedFit = sorted.find((w) => w >= height);

  if (!normalFit && !rotatedFit) {
    return { selectedWidth: sorted[sorted.length - 1], cutLength: height, rotated: false };
  }
  if (!normalFit) {
    return { selectedWidth: rotatedFit!, cutLength: width, rotated: true };
  }
  if (!rotatedFit) {
    return { selectedWidth: normalFit, cutLength: height, rotated: false };
  }

  const normalM2 = (normalFit / 100) * (height / 100);
  const rotatedM2 = (rotatedFit / 100) * (width / 100);

  if (rotatedM2 < normalM2) {
    return { selectedWidth: rotatedFit, cutLength: width, rotated: true };
  }
  return { selectedWidth: normalFit, cutLength: height, rotated: false };
}

export function createJob(
  width: number,
  height: number,
  technique: TechniqueKey,
  productKey: string,
  prices: PriceData,
  fileName?: string,
): Job | null {
  if (!width || !height || width <= 0 || height <= 0) return null;

  const techData = prices.techniques[technique];
  if (!techData) return null;

  const product = techData.products[productKey];
  if (!product) return null;

  const mg = product.materialGroup as MaterialGroup;
  const availableWidths = prices.materials[mg]?.widths;
  if (!availableWidths || availableWidths.length === 0) return null;

  const { selectedWidth, cutLength, rotated } = findBestOrientation(availableWidths, width, height);

  const totalM2 = (selectedWidth / 100) * (cutLength / 100);
  const exactM2 = (width / 100) * (height / 100);
  const wastePercent = exactM2 > 0 ? ((totalM2 - exactM2) / exactM2) * 100 : 0;

  const groupKey = `${technique}_${productKey}_${selectedWidth}_${mg}`;

  return {
    id: genId(),
    fileName: fileName || `${width}×${height} cm`,
    width,
    height,
    technique,
    productKey,
    productName: product.name,
    materialGroup: mg,
    selectedWidth,
    cutLength,
    rotated,
    totalM2,
    wastePercent,
    groupKey,
  };
}

function getPriceTier(totalM2: number, sabitFiyat: boolean): { tier: PriceTier; label: string } {
  if (totalM2 >= 20) return { tier: 'above20', label: '20 m² Üstü' };
  if (totalM2 >= 5 || sabitFiyat) return { tier: 'above5', label: sabitFiyat && totalM2 < 5 ? '5 m² Üstü (Sabit)' : '5 m² Üstü' };
  return { tier: 'below5', label: '5 m² Altı' };
}

export function groupJobs(jobs: Job[], prices: PriceData, sadeceBaski: boolean, sabitFiyat: boolean = false): JobGroup[] {
  const groupMap = new Map<string, Job[]>();

  for (const job of jobs) {
    const existing = groupMap.get(job.groupKey) || [];
    existing.push(job);
    groupMap.set(job.groupKey, existing);
  }

  const groups: JobGroup[] = [];

  for (const [groupKey, groupJobs] of groupMap) {
    const first = groupJobs[0];
    const totalM2 = groupJobs.reduce((sum, j) => sum + j.totalM2, 0);
    const { tier, label } = getPriceTier(totalM2, sabitFiyat);

    const techData = prices.techniques[first.technique];
    const product = techData?.products[first.productKey];
    if (!product) continue;

    const unitPrice = product.prices[tier];
    const normalTotal = totalM2 * unitPrice;

    const discountRate = sadeceBaski ? (prices.discountRate / 100) : 0;
    const discountAmount = normalTotal * discountRate;
    const groupTotal = Math.max(normalTotal - discountAmount, prices.minJobPrice);

    groups.push({
      groupKey,
      technique: first.technique,
      techniqueName: techData.name,
      productKey: first.productKey,
      productName: product.name,
      materialGroup: first.materialGroup,
      materialWidth: first.selectedWidth,
      jobs: groupJobs,
      totalM2,
      priceTier: tier,
      priceTierLabel: label,
      unitPrice,
      normalTotal,
      discountAmount,
      groupTotal,
    });
  }

  return groups.sort((a, b) => {
    if (a.materialGroup !== b.materialGroup) return a.materialGroup.localeCompare(b.materialGroup);
    if (a.materialWidth !== b.materialWidth) return a.materialWidth - b.materialWidth;
    return a.productName.localeCompare(b.productName);
  });
}

export function calcQuote(jobs: Job[], prices: PriceData, sadeceBaski: boolean, sabitFiyat: boolean = false): QuoteSummary {
  const groups = groupJobs(jobs, prices, sadeceBaski, sabitFiyat);

  const subtotal = groups.reduce((sum, g) => sum + g.normalTotal, 0);
  const discountTotal = groups.reduce((sum, g) => sum + g.discountAmount, 0);
  const afterDiscount = subtotal - discountTotal;
  const kdvAmount = afterDiscount * (prices.kdv / 100);
  const grandTotal = afterDiscount + kdvAmount;

  return {
    groups,
    subtotal,
    discountTotal,
    afterDiscount,
    kdvRate: prices.kdv,
    kdvAmount,
    grandTotal,
  };
}

export const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
