# MATBAA HESAP

Matbaa ve dijital baski atolyeleri icin gelistirilmis **fiyat hesaplama, teklif olusturma ve musteri yonetim sistemi**. UV ve Solvent baski tekniklerinin metrekare bazli fiyatlandirmasini otomatik yapar, malzeme eni optimizasyonu ile fire oranini minimize eder.

**Canli:** [matbaa-hesap-five.vercel.app](https://matbaa-hesap-five.vercel.app)

---

## Ozellikler

### Baski Fiyat Hesaplama
- **UV ve Solvent** baski teknikleri icin ayri fiyat tablolari
- Vinil (arkasi beyaz/siyah), Folyo, Folyo Bas-Kes, Oneway Vision gibi baski turleri
- **Akilli malzeme eni secimi:** Girilen olculere gore mevcut rulo enlerinden (folyo: 105/126/137/160 cm, vinil: 110/220/250/320 cm) en az fire olusturani otomatik secer
- **90 derece dondurme optimizasyonu:** Isi dondurerek daha dar rulo enine sigdirilabiliyorsa otomatik dondurur
- Fire orani hesaplama ve gosterimi
- Adet carpani destegi (ayni isten birden fazla)
- Dikis/Kusgozua gibi ekstra hizmetler icin ek fiyatlandirma

### PDF'ten Olcu Okuma
- PDF dosyalari yukleyerek sayfa boyutlarini otomatik cm'ye cevirir
- Birden fazla PDF topluca yuklenebilir, her birinden olcu alinir
- Okunan olculer secili baski turuyle aninda is olarak eklenir

### Musteri Yonetimi
- Musteri ekleme, duzenleme ve silme
- Her musteri icin **borc/odeme takibi** (hesap ekstresi)
- Borc kaydi eklenen islerden otomatik olusur
- Odeme alma islemi ile bakiye dusurme
- Musteri arama ve filtreleme
- **Toplu KDV donusumu:** Tum borc kayitlarini topluca KDV dahil veya KDV haric'e cevirme
- **Hesap ekstresi PDF:** Her musteri icin islem gecmisini PDF olarak indirme
- **WhatsApp borc bildirimi:** Tek tikla musteriye borc hatirlatma mesaji gonderme

### Teklif Ciktilari
- **PDF Teklif:** Is kalemlerini, KDV hesabini ve musteri bakiyesini iceren profesyonel gorunumlu PDF teklif ciktisi
- **WhatsApp Mesaji:** Teklifi duzenlenebilir WhatsApp mesaji olarak hazirlama ve gonderme
  - Is detaylari, KDV satiri, KDV dahil toplam, bakiye gibi bilgilerin mesaja dahil edilip edilmeyecegi toggle ile secilir
  - Mesaj gonderilmeden once serbest duzenlenebilir

### Admin Paneli
- Sifre korumali yonetici paneli
- UV ve Solvent baski fiyatlarini guncelleme
- Ekstra hizmet fiyatlarini duzenleme
- KDV oranini degistirme
- Fiyatlari varsayilana sifirlama

---

## Teknik Yapi

### Teknoloji Yigini
| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Dil | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| Ikonlar | Lucide React |
| Veritabani | Upstash Redis (Vercel KV) |
| PDF Okuma | pdfjs-dist |
| Deploy | Vercel |

### Proje Yapisi

```
app/
├── api/
│   ├── auth/route.ts          # Sifre dogrulama API (cookie-based)
│   └── customers/route.ts     # Musteri CRUD API (Upstash Redis)
├── components/
│   ├── AdminPanel.tsx          # Fiyat yonetim paneli (sifre korumali)
│   ├── CustomerPanel.tsx       # Musteri listesi, odeme alma, hesap ekstresi
│   ├── CustomerSelector.tsx    # Musteri secici dropdown (arama + yeni ekleme)
│   ├── InputForm.tsx           # Olcu, teknik, baski turu, ekstra secim formu
│   ├── JobList.tsx             # Eklenen islerin listesi (detay acilir)
│   ├── PdfDimensionReader.tsx  # PDF'ten olcu okuyucu
│   ├── SummaryCard.tsx         # Hesap ozeti karti (KDV, bakiye, toplam)
│   └── WhatsAppMessagePanel.tsx # WP mesaj hazirlama ve gonderme
├── data/
│   └── prices.json             # Varsayilan fiyat tablosu
├── hooks/
│   ├── useCustomers.ts         # Musteri state yonetimi (KV + localStorage fallback)
│   └── usePrices.ts            # Fiyat state yonetimi (localStorage)
├── lib/
│   └── calcJob.ts              # Hesaplama motoru (malzeme secimi, fire, fiyat)
├── types/
│   └── index.ts                # TypeScript tipleri
├── globals.css
├── layout.tsx
├── login/page.tsx              # Giris sayfasi
└── page.tsx                    # Ana sayfa (tum bilesenler burada birlesir)
```

### Veri Akisi

1. **Fiyatlar:** `prices.json` varsayilan olarak yuklenir → Admin panelinden guncellenen fiyatlar `localStorage`'a kaydedilir
2. **Musteriler:** Ilk yuklemede Upstash Redis'ten cekilir → Basarisiz olursa `localStorage` fallback → Her degisiklik debounced (500ms) olarak KV'ye ve aninda localStorage'a yazilir
3. **Hesaplama:** `calcJob()` fonksiyonu girilen olculere gore en uygun malzeme enini secer, fire hesaplar ve KDV dahil/haric fiyat uretir

### Hesaplama Mantigi (`calcJob.ts`)

```
Girdi: en x boy (cm) + teknik + baski turu + ekstralar + adet

1. Secilen baski turune gore malzeme tipini belirle (folyo veya vinil)
2. Normal ve 90 derece dondurulmus yerlestirme icin en uygun rulo enini bul
3. Hangisi daha az m2 harcarsa onu sec
4. Alan = rulo_eni x kesim_boyu (m2)
5. Fire = (alan - gercek_alan) / gercek_alan x 100
6. Fiyat = alan x birim_fiyat x adet + ekstra_hizmetler
7. KDV hesapla ve toplam uret
```

---

## Kurulum

### Gereksinimler
- Node.js 18+
- Upstash Redis hesabi (musteri verisi icin, opsiyonel)

### Yerel Calistirma

```bash
git clone https://github.com/darkcaptain12/matbaa-hesap.git
cd matbaa-hesap
npm install
npm run dev
```

Uygulama `http://localhost:3000` adresinde calisir.

### Ortam Degiskenleri

Musteri verisinin sunucu tarafinda saklanmasi icin (opsiyonel — yoksa localStorage fallback kullanilir):

```env
KV_REST_API_URL=https://...upstash.io
KV_REST_API_TOKEN=...
APP_PASSWORD=145323
```

### Vercel'e Deploy

```bash
npm run build
vercel --prod
```

Vercel projesinde `KV_REST_API_URL` ve `KV_REST_API_TOKEN` ortam degiskenlerini tanimlayin.

---

## Fiyat Tablosu (Varsayilan)

| Baski Turu | UV (TL/m2) | Solvent (TL/m2) |
|------------|-----------|----------------|
| Vinil (Arkasi Beyaz) | 220 | 120 |
| Vinil (Arkasi Siyah) | 220 | 140 |
| Folyo | 200 | 145 |
| Folyo Bas Kes | 300 | 280 |
| Oneway Vision | 250 | 175 |
| **Ekstra:** Dikis/Kusgozua | +50 TL/m2 | +50 TL/m2 |
| **KDV** | %20 | %20 |

Tum fiyatlar Admin Paneli uzerinden guncellenebilir.

---

## Lisans

Ozel proje — tum haklari saklidir.
