import type { PriceData, Job, MaterialType } from '../types';

function findBestOrientation(widths: number[], width: number, height: number) {
  const normalFit = widths.find((w) => w >= width);
  const rotatedFit = widths.find((w) => w >= height);

  if (!normalFit && !rotatedFit) {
    return { selectedWidth: widths[widths.length - 1], cutLength: height, rotated: false };
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

export function calcJob(
  id: string,
  width: number,
  height: number,
  technique: 'uv' | 'solvent',
  printType: string,
  extras: string[],
  prices: PriceData
): Job | null {
  if (!width || !height || !printType || width <= 0 || height <= 0) return null;

  const selectedOption = prices[technique][printType];
  if (!selectedOption) return null;

  const material = selectedOption.material as MaterialType;
  const availableWidths = prices.materials[material].widths;

  const { selectedWidth, cutLength, rotated } = findBestOrientation(availableWidths, width, height);

  const totalM2 = (selectedWidth / 100) * (cutLength / 100);
  const exactM2 = (width / 100) * (height / 100);
  const firePercent = ((totalM2 - exactM2) / exactM2) * 100;

  const unitPrice = selectedOption.price;
  const basePrice = totalM2 * unitPrice;

  let extrasPrice = 0;
  extras.forEach((extra) => {
    if (prices.extras[extra]) extrasPrice += prices.extras[extra].price * totalM2;
  });

  const subtotal = basePrice + extrasPrice;
  const kdvAmount = subtotal * (prices.kdv / 100);
  const totalWithKdv = subtotal + kdvAmount;

  return {
    id,
    width,
    height,
    technique,
    printType,
    extras,
    selectedMaterial: material,
    selectedWidth,
    cutLength,
    rotated,
    totalM2,
    firePercent,
    unitPrice,
    basePrice,
    extrasPrice,
    subtotal,
    kdvAmount,
    totalWithKdv,
    printTypeName: selectedOption.name,
  };
}

export function calcSummary(jobs: Job[], balance: number) {
  const totalSubtotal = jobs.reduce((s, j) => s + j.subtotal, 0);
  const totalKdv = jobs.reduce((s, j) => s + j.kdvAmount, 0);
  const totalWithKdv = jobs.reduce((s, j) => s + j.totalWithKdv, 0);
  const finalPrice = Math.max(0, totalWithKdv - balance);
  return { totalSubtotal, totalKdv, totalWithKdv, balance, finalPrice };
}
