import type { QuoteSummary } from '../types';
import { fmt } from '../lib/calcEngine';

export function generateQuoteHtml(quote: QuoteSummary, companyName: string, sadeceBaski: boolean): string {
  const date = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

  const groupRows = quote.groups.map((g, i) => {
    const avgWaste = g.jobs.reduce((s, j) => s + j.wastePercent, 0) / g.jobs.length;
    return `
      <tr>
        <td style="padding:10px 14px;color:#6b7280;font-size:12px;text-align:center;">${i + 1}</td>
        <td style="padding:10px 14px;font-size:12px;color:#111;font-weight:500;">
          ${g.productName}
          <div style="font-size:10px;color:#9ca3af;margin-top:2px;">${g.techniqueName} · ${g.materialWidth}cm ${g.materialType}</div>
        </td>
        <td style="padding:10px 14px;font-size:12px;color:#374151;text-align:center;">
          ${g.jobs.length}
        </td>
        <td style="padding:10px 14px;font-size:12px;color:#374151;text-align:center;">
          ${fmt(g.totalM2)} m²
        </td>
        <td style="padding:10px 14px;font-size:12px;color:#374151;text-align:center;">
          %${fmt(avgWaste)}
        </td>
        <td style="padding:10px 14px;font-size:12px;color:#374151;text-align:center;">
          <span style="background:${g.priceTier === 'above20' ? '#dcfce7' : g.priceTier === 'above5' ? '#dbeafe' : '#fef3c7'};color:${g.priceTier === 'above20' ? '#166534' : g.priceTier === 'above5' ? '#1e40af' : '#92400e'};padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;">
            ${g.priceTierLabel}
          </span>
        </td>
        <td style="padding:10px 14px;font-size:12px;color:#374151;text-align:right;">
          ${fmt(g.unitPrice)} ₺/m²
        </td>
        <td style="padding:10px 14px;font-size:12px;color:#111;font-weight:700;text-align:right;">
          ${fmt(g.groupTotal)} ₺
        </td>
      </tr>`;
  }).join('');

  const jobDetailRows = quote.groups.flatMap((g) =>
    g.jobs.map((j, i) => `
      <tr style="font-size:11px;">
        <td style="padding:6px 14px;color:#9ca3af;">${j.fileName}</td>
        <td style="padding:6px 14px;color:#6b7280;text-align:center;">${j.width}×${j.height} cm</td>
        <td style="padding:6px 14px;color:#6b7280;text-align:center;">${j.selectedWidth}cm ${j.material}${j.rotated ? ' ↻' : ''}</td>
        <td style="padding:6px 14px;color:#6b7280;text-align:center;">${fmt(j.totalM2)} m²</td>
        <td style="padding:6px 14px;color:#6b7280;text-align:center;">%${fmt(j.wastePercent)}</td>
      </tr>`)
  ).join('');

  return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"/><title>Matbaa Teklif</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:-apple-system,'Helvetica Neue','Segoe UI',Arial,sans-serif;background:#f0f0f0;color:#1a1a1a;}
.page{max-width:900px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 50px rgba(0,0,0,.12);}
.header{background:linear-gradient(135deg,#ea580c,#f97316);padding:36px 40px;}
.header h1{color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;}
.header p{color:rgba(255,255,255,.7);font-size:13px;margin-top:4px;}
.section{padding:30px 40px;}
.section-title{font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:12px;}
table{width:100%;border-collapse:collapse;}
th{background:#f9fafb;padding:8px 14px;text-align:left;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;}
th:last-child{text-align:right;}
tr:nth-child(even) td{background:#fafafa;}
.totals{background:#fafafa;padding:24px 40px;}
.total-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;}
.total-label{font-size:13px;color:#6b7280;}
.total-value{font-size:13px;font-weight:600;color:#374151;}
.grand-box{background:linear-gradient(135deg,#fff7ed,#fff);border:2px solid #fed7aa;border-radius:12px;padding:20px 24px;margin-top:16px;}
.grand-label{font-size:10px;color:#9a3412;font-weight:700;text-transform:uppercase;letter-spacing:.06em;}
.grand-value{font-size:36px;font-weight:900;color:#ea580c;letter-spacing:-1.5px;line-height:1;margin-top:6px;}
.footer{background:#f9fafb;padding:18px 40px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e5e7eb;}
.discount-row{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin:8px 0;}
@media print{body{background:#fff;}.page{box-shadow:none;margin:0;border-radius:0;}}
</style>
</head><body>
<div class="page">
  <div class="header">
    <h1>Baskı Fiyat Teklifi</h1>
    <p>${companyName ? `${companyName} · ` : ''}${date} · ${quote.groups.reduce((s, g) => s + g.jobs.length, 0)} iş kalemi</p>
  </div>

  <div class="section">
    <div class="section-title">Grup Özeti</div>
    <table>
      <thead><tr>
        <th style="text-align:center">#</th>
        <th>Ürün</th>
        <th style="text-align:center">İş</th>
        <th style="text-align:center">m²</th>
        <th style="text-align:center">Fire</th>
        <th style="text-align:center">Kademe</th>
        <th style="text-align:right">Birim</th>
        <th style="text-align:right">Toplam</th>
      </tr></thead>
      <tbody>${groupRows}</tbody>
    </table>
  </div>

  <div class="section" style="padding-top:0;">
    <div class="section-title">İş Detayları</div>
    <table>
      <thead><tr>
        <th>Dosya</th>
        <th style="text-align:center">Ölçü</th>
        <th style="text-align:center">Malzeme</th>
        <th style="text-align:center">Alan</th>
        <th style="text-align:center">Fire</th>
      </tr></thead>
      <tbody>${jobDetailRows}</tbody>
    </table>
  </div>

  <div class="totals">
    ${sadeceBaski && quote.discountTotal > 0 ? `
      <div class="total-row">
        <span class="total-label">Ara Toplam</span>
        <span class="total-value" style="text-decoration:line-through;color:#9ca3af;">${fmt(quote.subtotal)} ₺</span>
      </div>
      <div class="discount-row">
        <span style="font-size:12px;color:#166534;font-weight:600;">Sadece Baskı İndirimi (%20)</span>
        <span style="font-size:13px;color:#166534;font-weight:700;">-${fmt(quote.discountTotal)} ₺</span>
      </div>
    ` : ''}
    <div class="grand-box">
      <div class="grand-label">KDV Hariç Toplam</div>
      <div class="grand-value">${fmt(quote.afterDiscount)} ₺</div>
    </div>
    ${quote.kdvRate > 0 ? `
      <div class="total-row" style="margin-top:12px;">
        <span class="total-label">KDV (%${quote.kdvRate})</span>
        <span class="total-value">+${fmt(quote.kdvAmount)} ₺</span>
      </div>
      <div class="total-row" style="padding:12px 0;border-top:2px solid #e5e7eb;">
        <span style="font-size:14px;font-weight:700;color:#111;">KDV Dahil Toplam</span>
        <span style="font-size:20px;font-weight:900;color:#ea580c;">${fmt(quote.grandTotal)} ₺</span>
      </div>
    ` : ''}
  </div>

  <div class="footer">
    <span style="font-size:11px;color:#9ca3af;">Teklif Tarihi: ${date}</span>
    <span style="font-size:12px;font-weight:800;color:#ea580c;">MATBAA PRO</span>
  </div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print();},500);}</script>
</body></html>`;
}

export function openQuotePdf(quote: QuoteSummary, companyName: string, sadeceBaski: boolean) {
  const html = generateQuoteHtml(quote, companyName, sadeceBaski);
  const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
