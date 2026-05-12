// Tablet Compare Worker v6
// 수정: RAM GB만 추출, 카메라 MP 변환, refreshRate 정확히 파싱

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

const CHIP_DB = {
  // single/multi: Geekbench 6 CPU, gpuScore: Geekbench 6 Metal(Apple) / Vulkan(others)
  'Apple M5':         { single: 4200, multi: 17000, npu: '50 TOPS', gpuScore: 90000 },
  'Apple M4':         { single: 3864, multi: 15119, npu: '38 TOPS', gpuScore: 69000 },
  'Apple M4 Pro':     { single: 4020, multi: 23000, npu: '38 TOPS', gpuScore: 95000 },
  'Apple M3':         { single: 3190, multi: 12640, npu: '18 TOPS', gpuScore: 49500 },
  'Apple M3 Pro':     { single: 3220, multi: 15000, npu: '18 TOPS', gpuScore: 75000 },
  'Apple M2':         { single: 2670, multi: 10600, npu: '15.8 TOPS', gpuScore: 36000 },
  'Apple M2 Pro':     { single: 2700, multi: 13800, npu: '15.8 TOPS', gpuScore: 55000 },
  'Apple M1':         { single: 2370, multi: 8620,  npu: '11 TOPS',  gpuScore: 24000 },
  'Apple A17 Pro':    { single: 2900, multi: 7200,  npu: '35 TOPS',  gpuScore: 28000 },
  'Apple A16 Bionic': { single: 2520, multi: 6360,  npu: '17 TOPS',  gpuScore: 19000 },
  'Apple A16':        { single: 2520, multi: 6360,  npu: '17 TOPS',  gpuScore: 19000 },
  'Apple A15 Bionic': { single: 2370, multi: 5660,  npu: '15.8 TOPS', gpuScore: 14000 },
  'Apple A14 Bionic': { single: 1990, multi: 4900,  npu: '11 TOPS',  gpuScore: 11000 },
  'Snapdragon 8 Elite Gen 5': { single: 3600, multi: 10500, npu: '100 TOPS', gpuScore: 30000 },
  'Snapdragon 8 Elite':   { single: 2900, multi: 9200, npu: '45 TOPS', gpuScore: 22000 },
  'Snapdragon 8s Gen 4':  { single: 2100, multi: 6900, npu: null,      gpuScore: 10000 },
  'Snapdragon 8s Gen 3':  { single: 2100, multi: 6500, npu: '45 TOPS', gpuScore: 9000 },
  'Snapdragon 8 Gen 3':   { single: 2200, multi: 6900, npu: '45 TOPS', gpuScore: 16000 },
  'Snapdragon 8 Gen 2':   { single: 1990, multi: 5500, npu: '26 TOPS', gpuScore: 11000 },
  'Snapdragon 8 Gen 1':   { single: 1470, multi: 4800, npu: '26 TOPS', gpuScore: 7000 },
  'Snapdragon 8+ Gen 1':  { single: 1580, multi: 5000, npu: '26 TOPS', gpuScore: 8000 },
  'Snapdragon 870':       { single: 1120, multi: 3800, npu: null,       gpuScore: 4500 },
  'Snapdragon 7+ Gen 3':  { single: 1800, multi: 5200, npu: null,       gpuScore: 8500 },
  'Snapdragon 7s Gen 1':  { single: 1050, multi: 3200, npu: null,       gpuScore: 3000 },
  'Snapdragon 680':       { single: 620,  multi: 1800, npu: null,       gpuScore: 1200 },
  'Snapdragon 8cx Gen 3': { single: 1450, multi: 6800, npu: null,       gpuScore: 6500 },
  'Dimensity 9400+': { single: 2850, multi: 9100, npu: '35 TOPS', gpuScore: 20000 },
  'Dimensity 9400':  { single: 2780, multi: 8800, npu: '35 TOPS', gpuScore: 19000 },
  'Dimensity 9300+': { single: 2100, multi: 7200, npu: '33 TOPS', gpuScore: 14000 },
  'Dimensity 9300':  { single: 2050, multi: 6900, npu: '33 TOPS', gpuScore: 13000 },
  'Dimensity 9200+': { single: 1800, multi: 5600, npu: '22 TOPS', gpuScore: 10000 },
  'Dimensity 9000':  { single: 1490, multi: 4900, npu: '4.7 TOPS', gpuScore: 8000 },
  'Exynos 2400':     { single: 1900, multi: 7100, npu: '34.4 TOPS', gpuScore: 13000 },
  'Exynos 1580':     { single: 1100, multi: 3800, npu: null,        gpuScore: 4500 },
  'Exynos 1380':     { single: 920,  multi: 3200, npu: null,        gpuScore: 3500 },
  'Exynos 2200':     { single: 1350, multi: 4200, npu: '22 TOPS',   gpuScore: 7000 },
  'Snapdragon X Elite':  { single: 2600, multi: 14000, npu: '45 TOPS', gpuScore: 15000 },
  'Snapdragon X Plus':   { single: 2200, multi: 10000, npu: '45 TOPS', gpuScore: 11000 },
  'Intel Core Ultra 5': { single: 2200, multi: 10500, npu: '34 TOPS', gpuScore: 15000 },
  'Intel Core Ultra 7': { single: 2400, multi: 12000, npu: '34 TOPS', gpuScore: 18000 },
  'Intel Core i5-1235U': { single: 1850, multi: 8000,  npu: null,      gpuScore: 8000 },
  'Intel N200':          { single: 800,  multi: 2400,  npu: null,      gpuScore: 2500 },
  'Ryzen 9 8945HS':      { single: 2500, multi: 14000, npu: '33 TOPS', gpuScore: 28000 },
  'Kirin 9010':  { single: 1200, multi: 4800, npu: '20 TOPS', gpuScore: 5000 },
  'Kirin 9000S': { single: 1050, multi: 3900, npu: '10 TOPS', gpuScore: 4000 },
  'Helio G99':   { single: 820,  multi: 2800, npu: null,       gpuScore: 2000 },
  'Helio G85':   { single: 520,  multi: 1600, npu: null,       gpuScore: 1000 },
  'Snapdragon 778G':  { single: 1050, multi: 3000, npu: null,  gpuScore: 4000 },
  'Snapdragon 6490':  { single: 1100, multi: 2900, npu: null,  gpuScore: 3500 },
  'Snapdragon 660':   { single: 620,  multi: 1900, npu: null,  gpuScore: 1500 },
}

const PRODUCTS_JSON_URL = 'https://raw.githubusercontent.com/Dalbonz/tablet-compare/main/products.json'

const FALLBACK_DB = {
  'Apple': [
    { name: 'iPad Air 13 (2026)',   dsId: 'bd9b668e' },
    { name: 'iPad Air 11 (2026)',   dsId: 'c1b1668c' },
    { name: 'iPad Pro 13 (2025)',   dsId: '92a16520' },
    { name: 'iPad Pro 11 (2025)',   dsId: '1fb3651c' },
    { name: 'iPad Air 13 (2025)',   dsId: 'c5e362c3' },
    { name: 'iPad Air 11 (2025)',   dsId: '0c7062c1' },
    { name: 'iPad (2025)',          dsId: '94b362c6' },
    { name: 'iPad mini (2024)',     dsId: '267461c1' },
    { name: 'iPad Pro 13 (2024)',   dsId: '63a15fdc' },
    { name: 'iPad Pro 11 (2024)',   dsId: '4fc55fda' },
    { name: 'iPad Air 13 (2024)',   dsId: 'dab35fe1' },
    { name: 'iPad Air 11 (2024)',   dsId: '54865fdf' },
    { name: 'iPad Pro 12.9 (2022)', dsId: 'bbab5ae2' },
    { name: 'iPad Pro 11 (2022)',   dsId: 'c7075ae0' },
    { name: 'iPad (2022)',          dsId: 'e70a5ade' },
    { name: 'iPad Air (2022)',      dsId: '706458ec' },
    { name: 'iPad mini (2021)',     dsId: '5906574f' },
  ],
  'Samsung': [
    { name: 'Galaxy Tab S11 Ultra',    dsId: '540864a1' },
    { name: 'Galaxy Tab S11',          dsId: 'd23d649f' },
    { name: 'Galaxy Tab S10 Ultra',    dsId: '577e613d' },
    { name: 'Galaxy Tab S10+',         dsId: '89d0613e' },
    { name: 'Galaxy Tab S10 FE',       dsId: 'ee8362ea' },
    { name: 'Galaxy Tab S9 Ultra',     dsId: 'e5835d57' },
    { name: 'Galaxy Tab S9+',          dsId: '8cd35d55' },
    { name: 'Galaxy Tab S9',           dsId: '3e195d54' },
    { name: 'Galaxy Tab S9 FE',        dsId: 'b0925df5' },
    { name: 'Galaxy Tab A9+',          dsId: '7c7d5e01' },
    { name: 'Galaxy Tab A9',           dsId: '7c385dff' },
    { name: 'Galaxy Tab S8 Ultra',     dsId: '0a455896' },
    { name: 'Galaxy Tab S8+',          dsId: 'b4cc5895' },
    { name: 'Galaxy Tab S8',           dsId: '3a7c5893' },
    { name: 'Galaxy Tab S7 FE',        dsId: '0dc256f6' },
    { name: 'Galaxy Tab S7+',          dsId: '7e6a5424' },
    { name: 'Galaxy Tab S7',           dsId: '62955422' },
    { name: 'Galaxy Tab S6 Lite (2024)', dsId: 'd8525f92' },
    { name: 'Galaxy Tab S6 Lite (2022)', dsId: '89ff5971' },
    { name: 'Galaxy Tab S6 Lite',      dsId: 'b8cd534b' },
    { name: 'Galaxy Tab S10 Lite',     dsId: 'a8fd6467' },
    { name: 'Galaxy Tab S6',           dsId: 'f26451a7' },
    { name: 'Galaxy Tab S5e',           dsId: 'b6364f68' },
    { name: 'Galaxy Tab A11+',          dsId: 'f44d656b' },
    { name: 'Galaxy Tab A11',           dsId: '81f56564' },
    { name: 'Galaxy Tab A8',            dsId: '7ced584b' },
    { name: 'Galaxy Tab A7 Lite',       dsId: '97b45682' },
    { name: 'Galaxy Tab A7 (2020)',     dsId: 'ab7754bb' },
    { name: 'Galaxy Tab A 8.4 (2020)', dsId: 'cb06533c' },
    { name: 'Galaxy Tab A 10.1 (2019)', dsId: '02a14f6a' },
  ],
  'Xiaomi': [
    { name: 'Xiaomi Pad 8 Pro', dsId: '3c5e6516' },
    { name: 'Xiaomi Pad 8',     dsId: 'ae326515' },
    { name: 'Xiaomi Pad 7 Pro', dsId: '182061e1' },
    { name: 'Xiaomi Pad 7',     dsId: '756361e0' },
    { name: 'Xiaomi Pad 6 Pro', dsId: '28b85c73' },
    { name: 'Xiaomi Pad 6',     dsId: 'b0bf5c72' },
    { name: 'Xiaomi Pad 5 Pro', dsId: '791a5700' },
    { name: 'Xiaomi Pad 5',     dsId: '324656fe' },
    { name: 'Redmi Pad Pro',    dsId: 'e1795fa8' },
    { name: 'Redmi Pad SE',     dsId: '9be45d96' },
    { name: 'Redmi Pad 2',      dsId: '09ec63cc' },
  ],
  'Lenovo': [
    { name: 'Legion Tab Gen 5',   dsId: 'caa1669f' },
    { name: 'Idea Tab Pro Gen 2', dsId: 'c197669e' },
    { name: 'Tab Extreme',        dsId: '6d015b88' },
    { name: 'Tab P12 Pro',        dsId: 'e6a1579e' },
    { name: 'Tab P12',            dsId: '86725d62' },
    { name: 'Tab P11 Pro Gen 2',  dsId: 'b74d5a5f' },
    { name: 'Tab P11 Gen 2',      dsId: '30d95a5e' },
    { name: 'Tab M11',            dsId: '7afa5eee' },
    { name: 'Tab M10 Plus Gen 3', dsId: '7bdf5ab3' },
  ],
  'Huawei': [
    { name: 'MatePad Pro 13.2',      dsId: '4a695de4' },
    { name: 'MatePad Pro 11 (2024)', dsId: '13315e81' },
    { name: 'MatePad 11.5 S',        dsId: 'bccc65f0' },
    { name: 'MatePad Air',           dsId: '2d965cc6' },
    { name: 'MatePad 11 (2023)',      dsId: '41f05c3c' },
  ],
  'Google':  [{ name: 'Pixel Tablet (2023)', dsId: '5adf5ca4' }],
  'OnePlus': [
    { name: 'OnePlus Pad 4',  dsId: 'b68f6735' },
    { name: 'OnePlus Pad 2',  dsId: '1f3c60c2' },
    { name: 'OnePlus Pad Go', dsId: '33c25dfd' },
    { name: 'OnePlus Pad',    dsId: 'c80a5bd7' },
  ],
  'Sony': [{ name: 'Xperia Z4 Tablet', dsId: '3f0036f3' }],
  'Samsung (Active)': [
    { name: 'Galaxy Tab Active5 Pro (B2B)', dsId: '5a196310' },
    { name: 'Galaxy Tab Active5 (B2B)',     dsId: '' },
  ],
  'Zebra': [
    { name: 'ET401 8" (B2B)',    dsId: '' },
    { name: 'ET40 8" (B2B)',     dsId: '' },
    { name: 'ET45 8" 5G (B2B)', dsId: '' },
    { name: 'ET60 10" (B2B)',   dsId: '' },
    { name: 'ET65 10" 5G (B2B)', dsId: '' },
  ],
  'Panasonic': [
    { name: 'Toughbook FZ-A3 (B2B)', dsId: '' },
    { name: 'Toughbook FZ-B3 (B2B)', dsId: '' },
  ],
}

// 픽셀 해상도 → MP 변환
function pixelsToMP(w, h) {
  const mp = (w * h) / 1000000
  return Math.round(mp) + 'MP'
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })
    const url = new URL(request.url)
    const path = url.pathname
    try {
      if (path === '/products') {
        const mfr = url.searchParams.get('manufacturer')
        return json({ products: await getProductList(mfr) })
      }
      if (path === '/specs') {
        const mfr = url.searchParams.get('manufacturer')
        const model = url.searchParams.get('model')
        return json(await getSpecs(mfr, model))
      }
      if (path === '/pc/products') {
        const mfr = url.searchParams.get('manufacturer')
        return json({ products: await getPCProductList(mfr) })
      }
      if (path === '/pc/specs') {
        const mfr = url.searchParams.get('manufacturer')
        const model = url.searchParams.get('model')
        return json(await getPCSpecs(mfr, model))
      }
      if (path === '/proxy-image') {
        const imgUrl = url.searchParams.get('url')
        if (!imgUrl) return new Response('Missing url', { status: 400 })
        const resp = await fetch(imgUrl)
        const blob = await resp.blob()
        return new Response(blob, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': resp.headers.get('content-type') || 'image/jpeg',
            'Cache-Control': 'public, max-age=86400',
          }
        })
      }
      return json({ error: 'Not found' }, 404)
    } catch (e) {
      return json({ error: e.message }, 500)
    }
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS })
}

async function getProductList(manufacturer) {
  try {
    const res = await fetch(PRODUCTS_JSON_URL)
    if (res.ok) {
      const data = await res.json()
      if (data[manufacturer]) return data[manufacturer].map(p => p.name)
    }
  } catch {}
  return (FALLBACK_DB[manufacturer] || []).map(p => p.name)
}

async function getDsId(manufacturer, model) {
  try {
    const res = await fetch(PRODUCTS_JSON_URL)
    if (res.ok) {
      const data = await res.json()
      const entry = (data[manufacturer] || []).find(p => p.name === model)
      if (entry) return entry.dsId
    }
  } catch {}
  const entry = (FALLBACK_DB[manufacturer] || []).find(p => p.name === model)
  return entry?.dsId || null
}

// Apple 칩셋별 기본 RAM (devicespecifications.com이 MHz만 기재하는 경우 폴백)
const APPLE_RAM_FALLBACK = {
  'Apple M5':         12,
  'Apple M4 Pro':     24,
  'Apple M4':          8,
  'Apple M3 Pro':     18,
  'Apple M3':          8,
  'Apple M2 Pro':     16,
  'Apple M2':          8,
  'Apple M1':          8,
  'Apple A17 Pro':     8,
  'Apple A16 Bionic':  4,
  'Apple A16':         4,
  'Apple A15 Bionic':  4,
  'Apple A14 Bionic':  4,
}

const FALLBACK_TABLET_SPECS = {
  'Microsoft': {
    'Surface Pro 11': {
      launch: '2024.06',
      dimensions: '287.0 x 209.0 x 9.3 mm', weight: '879 g',
      displaySize: '13.0 in', displayType: 'PixelSense Flow LCD, Touch',
      refreshRate: '120', resolution: '2880 x 1920 pixels', ppi: '267',
      chipset: 'Snapdragon X Plus', gpu: 'Qualcomm Adreno X1-45',
      ram: '16 GB', storage: '256 GB',
      rearCamera: '10MP', frontCamera: '5MP',
      speakers: '스테레오', headphone: '없음',
      battery: '53 Wh', charging: '65 W',
      wlan: 'Wi-Fi 7', bluetooth: '5.4', nfc: '없음',
      usb: 'USB4 (x2), USB-A',
      sensors: 'Accelerometer, Gyroscope, Compass',
      imageUrl: 'https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/12-pro-violet-center-render-fy25?fmt=png-alpha&wid=600&hei=450',
    },
    'Surface Pro 10': {
      launch: '2024.03',
      dimensions: '287.0 x 209.0 x 9.3 mm', weight: '879 g',
      displaySize: '13.0 in', displayType: 'PixelSense Flow LCD, Touch',
      refreshRate: '120', resolution: '2880 x 1920 pixels', ppi: '267',
      chipset: 'Intel Core Ultra 7 165U', gpu: 'Intel Arc (integrated)',
      ram: '16 GB', storage: '256 GB',
      rearCamera: '10MP', frontCamera: '1080p',
      speakers: '스테레오', headphone: '없음',
      battery: '53 Wh', charging: '65 W',
      wlan: 'Wi-Fi 6E', bluetooth: '5.3', nfc: '없음',
      usb: 'USB4 (x2), USB-A',
      sensors: 'Accelerometer, Gyroscope, Compass',
      imageUrl: 'https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/MSFT-Hub-3-FOD?fmt=png-alpha&wid=600&hei=450',
    },
    'Surface Pro 9': {
      launch: '2022.10',
      dimensions: '287.0 x 209.0 x 9.3 mm', weight: '879 g',
      displaySize: '13.0 in', displayType: 'PixelSense Flow LCD, Touch',
      refreshRate: '120', resolution: '2880 x 1920 pixels', ppi: '267',
      chipset: 'Intel Core i5-1235U', gpu: 'Intel Iris Xe Graphics',
      ram: '8 GB', storage: '128 GB',
      rearCamera: '10MP', frontCamera: '5MP',
      speakers: '스테레오', headphone: '없음',
      battery: '47.36 Wh', charging: '65 W',
      wlan: 'Wi-Fi 6E', bluetooth: '5.1', nfc: '없음',
      usb: 'USB4 (x2)',
      sensors: 'Accelerometer, Gyroscope, Compass',
      imageUrl: 'https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/13-pro-ocean-center-render-fy25?fmt=png-alpha&wid=600&hei=450',
    },
    'Surface Go 4': {
      launch: '2023.09',
      dimensions: '245.3 x 175.0 x 8.3 mm', weight: '521 g',
      displaySize: '10.5 in', displayType: 'PixelSense LCD, Touch',
      refreshRate: '60', resolution: '1920 x 1280 pixels', ppi: '220',
      chipset: 'Intel N200', gpu: 'Intel UHD Graphics',
      ram: '8 GB', storage: '64 GB',
      rearCamera: '8MP', frontCamera: '5MP',
      speakers: '스테레오', headphone: '없음',
      battery: '26.13 Wh', charging: '45 W',
      wlan: 'Wi-Fi 6', bluetooth: '5.1', nfc: '없음',
      usb: 'USB-C 3.2',
      sensors: 'Accelerometer, Gyroscope, Compass',
      imageUrl: 'https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/13-product-comparison-render1-fy25?fmt=png-alpha&wid=600&hei=450',
    },
  },
  'ASUS': {
    'ROG Flow Z13 (2024)': {
      launch: '2024.01',
      dimensions: '302.0 x 208.1 x 12.5 mm', weight: '1180 g',
      displaySize: '13.4 in', displayType: 'IPS QHD+, Touch',
      refreshRate: '165', resolution: '2560 x 1600 pixels', ppi: '226',
      chipset: 'AMD Ryzen 9 8945HS', gpu: 'AMD Radeon 780M + RTX 4070',
      ram: '16 GB', storage: '1 TB',
      rearCamera: '없음', frontCamera: '720p',
      speakers: '스테레오', headphone: '있음',
      battery: '40 Wh', charging: '100 W',
      wlan: 'Wi-Fi 6E', bluetooth: '5.3', nfc: '없음',
      usb: 'USB4, USB3.2, USB-A, HDMI 2.1',
      sensors: 'Accelerometer, Gyroscope',
    },
  },
}

const FALLBACK_TABLET_SPECS_B2B = {
  'Samsung (Active)': {
    'Galaxy Tab Active5 Pro (B2B)': {
      dimensions: '171.8 x 103.3 x 10.7 mm', weight: '475 g',
      displaySize: '10.1 in', displayType: 'TFT LCD, Gorilla Glass 5',
      refreshRate: '60', resolution: '1920 x 1200 pixels', ppi: '224',
      chipset: 'Exynos 1380', gpu: 'ARM Mali-G68 MP5',
      ram: '6 GB', storage: '128 GB',
      sdCard: 'microSD (최대 1 TB)', waterRating: 'IP68',
      rearCamera: '13MP', frontCamera: '8MP',
      speakers: '스테레오', headphone: '있음',
      battery: '10090 mAh', charging: '45W',
      wlan: 'Wi-Fi 6', bluetooth: 'Bluetooth 5.3', nfc: '있음',
      usb: 'USB-C 3.2', sensors: 'Accelerometer, Gyroscope, Compass, Barometer',
      imageUrl: '',
    },
    'Galaxy Tab Active5 (B2B)': {
      dimensions: '168.1 x 99.6 x 10.6 mm', weight: '392 g',
      displaySize: '8.0 in', displayType: 'TFT LCD, Gorilla Glass 5',
      refreshRate: '60', resolution: '1920 x 1200 pixels', ppi: '283',
      chipset: 'Exynos 1380', gpu: 'ARM Mali-G68 MP5',
      ram: '6 GB', storage: '128 GB',
      sdCard: 'microSD (최대 1 TB)', waterRating: 'IP68',
      rearCamera: '13MP', frontCamera: '5MP',
      speakers: '스테레오', headphone: '있음',
      battery: '5050 mAh', charging: '45W',
      wlan: 'Wi-Fi 6', bluetooth: 'Bluetooth 5.3', nfc: '있음',
      usb: 'USB-C 3.2', sensors: 'Accelerometer, Gyroscope, Compass, Barometer',
      imageUrl: 'https://images.samsung.com/is/image/samsung/assets/us/business/mobile/tablets/galaxy-tab-active/explore/02092024/FT03-FEATURE-FULL-BLEED-Galaxy-TabActive5_SM-X306B_1_RuggedDurabilityintoughenvironment2-D.jpg',
    },
  },
  'Zebra': {
    'ET401 8" (B2B)': {
      dimensions: '218.0 x 137.0 x 17.0 mm', weight: '520 g',
      displaySize: '8.0 in', displayType: 'LCD, Gorilla Glass, Touch',
      refreshRate: '60', resolution: '1920 x 1200 pixels', ppi: '283',
      chipset: 'Snapdragon 6490', gpu: 'Qualcomm Adreno 643',
      ram: '6 GB', storage: '64 GB',
      sdCard: 'microSD (최대 1 TB)', waterRating: 'IP65',
      rearCamera: '13MP', frontCamera: '5MP',
      speakers: '스테레오', headphone: '있음',
      battery: '5000 mAh', charging: '18W',
      wlan: 'Wi-Fi 6E', bluetooth: 'Bluetooth 5.2', nfc: '있음',
      usb: 'USB-C 2.0', sensors: 'Accelerometer, Gyroscope, Compass, Barometer',
      imageUrl: 'https://cdn11.bigcommerce.com/s-ka7ofex/products/5343/images/21952/Zebra_8_Inch_ET40_Enterprise_Rugged_Android_Tablet_Front__19824.1739387457.480.480.jpg?c=2',
    },
    'ET40 8" (B2B)': {
      dimensions: '220.0 x 139.0 x 17.3 mm', weight: '539 g',
      displaySize: '8.0 in', displayType: 'LCD, Gorilla Glass, Touch',
      refreshRate: '60', resolution: '1920 x 1200 pixels', ppi: '283',
      chipset: 'Snapdragon 660', gpu: 'Qualcomm Adreno 512',
      ram: '4 GB', storage: '32 GB',
      sdCard: 'microSD (최대 128 GB)', waterRating: 'IP65',
      rearCamera: '13MP', frontCamera: '5MP',
      speakers: '스테레오', headphone: '있음',
      battery: '4420 mAh', charging: '18W',
      wlan: 'Wi-Fi 6', bluetooth: 'Bluetooth 5.0', nfc: '있음',
      usb: 'USB-C 2.0', sensors: 'Accelerometer, Gyroscope, Compass, Barometer',
      imageUrl: 'https://cdn11.bigcommerce.com/s-ka7ofex/products/5343/images/21952/Zebra_8_Inch_ET40_Enterprise_Rugged_Android_Tablet_Front__19824.1739387457.480.480.jpg?c=2',
    },
    'ET45 8" 5G (B2B)': {
      dimensions: '221.0 x 140.0 x 19.2 mm', weight: '589 g',
      displaySize: '8.0 in', displayType: 'LCD, Gorilla Glass, Touch',
      refreshRate: '60', resolution: '1920 x 1200 pixels', ppi: '283',
      chipset: 'Snapdragon 6490', gpu: 'Qualcomm Adreno 643',
      ram: '6 GB', storage: '64 GB',
      sdCard: 'microSD (최대 128 GB)', waterRating: 'IP65',
      rearCamera: '13MP', frontCamera: '5MP',
      speakers: '스테레오', headphone: '있음',
      battery: '4420 mAh', charging: '18W',
      wlan: 'Wi-Fi 6E', bluetooth: 'Bluetooth 5.2', nfc: '있음',
      usb: 'USB-C 2.0', sensors: 'Accelerometer, Gyroscope, Compass, Barometer',
      imageUrl: 'https://cdn11.bigcommerce.com/s-ka7ofex/products/4146/images/17491/ET40AB-001C1B0-NA__52638.1739388010.480.480.jpg?c=2',
    },
    'ET60 10" (B2B)': {
      dimensions: '268.0 x 183.0 x 18.5 mm', weight: '820 g',
      displaySize: '10.1 in', displayType: 'LCD, Gorilla Glass, Touch',
      refreshRate: '60', resolution: '1920 x 1200 pixels', ppi: '224',
      chipset: 'Snapdragon 6490', gpu: 'Qualcomm Adreno 643',
      ram: '8 GB', storage: '128 GB',
      sdCard: 'microSD (최대 128 GB)', waterRating: 'IP65',
      rearCamera: '13MP', frontCamera: '5MP',
      speakers: '스테레오', headphone: '있음',
      battery: '7200 mAh', charging: '18W',
      wlan: 'Wi-Fi 6E', bluetooth: 'Bluetooth 5.2', nfc: '있음',
      usb: 'USB-C 2.0', sensors: 'Accelerometer, Gyroscope, Compass, Barometer',
      imageUrl: 'https://cdn11.bigcommerce.com/s-ka7ofex/products/4784/images/19760/cq5dam.web.1280.1280_31__20276.1717682239.480.480.jpg?c=2',
    },
    'ET65 10" 5G (B2B)': {
      dimensions: '268.0 x 183.0 x 19.5 mm', weight: '870 g',
      displaySize: '10.1 in', displayType: 'LCD, Gorilla Glass, Touch',
      refreshRate: '60', resolution: '1920 x 1200 pixels', ppi: '224',
      chipset: 'Snapdragon 6490', gpu: 'Qualcomm Adreno 643',
      ram: '8 GB', storage: '128 GB',
      sdCard: 'microSD (최대 128 GB)', waterRating: 'IP65',
      rearCamera: '13MP', frontCamera: '5MP',
      speakers: '스테레오', headphone: '있음',
      battery: '7200 mAh', charging: '18W',
      wlan: 'Wi-Fi 6E', bluetooth: 'Bluetooth 5.2', nfc: '있음',
      usb: 'USB-C 2.0', sensors: 'Accelerometer, Gyroscope, Compass, Barometer',
      imageUrl: 'https://cdn11.bigcommerce.com/s-ka7ofex/products/4793/images/19802/cq5dam.web.1280.1280_43__43356.1718030337.480.480.jpg?c=2',
    },
  },
  'Panasonic': {
    'Toughbook FZ-A3 (B2B)': {
      dimensions: '261.0 x 185.0 x 19.8 mm', weight: '720 g',
      displaySize: '10.1 in', displayType: 'IPS LCD, Anti-Reflective, Touch',
      refreshRate: '60', resolution: '1920 x 1200 pixels', ppi: '224',
      chipset: 'Snapdragon 660', gpu: 'Qualcomm Adreno 512',
      ram: '4 GB', storage: '32 GB',
      sdCard: 'microSD (최대 512 GB)', waterRating: 'IP65',
      rearCamera: '13MP', frontCamera: '5MP',
      speakers: '스테레오', headphone: '있음',
      battery: '6200 mAh', charging: '30W',
      wlan: 'Wi-Fi 6', bluetooth: 'Bluetooth 5.0', nfc: '있음',
      usb: 'USB-A, USB-C', sensors: 'Accelerometer, Gyroscope, Compass, Barometer',
      imageUrl: 'https://mooringtech.com/cdn/shop/products/FZ-A3_front01_os_600x.jpg?v=1738680697',
    },
    'Toughbook FZ-B3 (B2B)': {
      dimensions: '202.0 x 130.0 x 18.0 mm', weight: '390 g',
      displaySize: '7.0 in', displayType: 'IPS LCD, Touch',
      refreshRate: '60', resolution: '1200 x 800 pixels', ppi: '200',
      chipset: 'Snapdragon 660', gpu: 'Qualcomm Adreno 512',
      ram: '4 GB', storage: '32 GB',
      sdCard: 'microSD (최대 512 GB)', waterRating: 'IP65',
      rearCamera: '8MP', frontCamera: '5MP',
      speakers: '모노', headphone: '있음',
      battery: '4200 mAh', charging: '18W',
      wlan: 'Wi-Fi 5', bluetooth: 'Bluetooth 5.0', nfc: '있음',
      usb: 'USB-C', sensors: 'Accelerometer, Gyroscope, Compass',
      imageUrl: '',
    },
  },
}

const TABLET_LAUNCH_PRICE_DB = {
  'Apple': {
    'iPad Pro 13 (2025)':   { launch: '2025.10', price: '$1,299' },
    'iPad Air 13 (2026)':   { launch: '2026.03', price: '$799' },
    'iPad Air 11 (2026)':   { launch: '2026.03', price: '$599' },
    'iPad Air 13 (2025)':   { launch: '2025.03', price: '$799' },
    'iPad Air 11 (2025)':   { launch: '2025.03', price: '$599' },
    'iPad Pro 12.9 (2021)': { launch: '2021.04', price: '$1,099' },
    'iPad Pro 11 (2021)':   { launch: '2021.04', price: '$799' },
    'iPad (2021)':          { launch: '2021.09', price: '$329' },
    'iPad Air (2020)':      { launch: '2020.10', price: '$599' },
    'iPad Pro 12.9 (2020)': { launch: '2020.03', price: '$999' },
    'iPad Pro 11 (2020)':   { launch: '2020.03', price: '$799' },
    'iPad (2020)':          { launch: '2020.09', price: '$329' },
    'iPad Air (2019)':      { launch: '2019.03', price: '$499' },
    'iPad mini (2019)':     { launch: '2019.03', price: '$399' },
    'iPad Pro 11 (2025)':   { launch: '2025.10', price: '$999' },
    'iPad Air 13 (2026)':   { launch: '2026.03', price: '$799' },
    'iPad Air 11 (2026)':   { launch: '2026.03', price: '$599' },
    'iPad (2025)':          { launch: '2025.03', price: '$349' },
    'iPad mini (2024)':     { launch: '2024.10', price: '$499' },
    'iPad Pro 13 (2024)':   { launch: '2024.05', price: '$1,299' },
    'iPad Pro 11 (2024)':   { launch: '2024.05', price: '$999' },
    'iPad Air 13 (2024)':   { launch: '2024.05', price: '$799' },
    'iPad Air 11 (2024)':   { launch: '2024.05', price: '$599' },
    'iPad Pro 12.9 (2022)': { launch: '2022.10', price: '$1,099' },
    'iPad Pro 11 (2022)':   { launch: '2022.10', price: '$799' },
    'iPad (2022)':          { launch: '2022.10', price: '$449' },
    'iPad Air (2022)':      { launch: '2022.03', price: '$599' },
    'iPad mini (2021)':     { launch: '2021.09', price: '$499' },
  },
  'Samsung': {
    'Galaxy Tab S11 Ultra': { launch: '2025.09', price: '$1,199' },
    'Galaxy Tab S11':       { launch: '2025.09', price: '$799' },
    'Galaxy Tab S10 Ultra': { launch: '2024.10', price: '$1,199' },
    'Galaxy Tab S10+':      { launch: '2024.10', price: '$999' },
    'Galaxy Tab S10 FE':    { launch: '2025.04', price: '$499' },
    'Galaxy Tab S9 Ultra':  { launch: '2023.08', price: '$1,199' },
    'Galaxy Tab S9+':       { launch: '2023.08', price: '$999' },
    'Galaxy Tab S9':        { launch: '2023.08', price: '$799' },
    'Galaxy Tab S9 FE':     { launch: '2023.10', price: '$449' },
    'Galaxy Tab A9+':       { launch: '2024.01', price: '$219' },
    'Galaxy Tab A9':        { launch: '2023.10', price: '$159' },
    'Galaxy Tab S8 Ultra':  { launch: '2022.02', price: '$1,099' },
    'Galaxy Tab S8+':       { launch: '2022.02', price: '$899' },
    'Galaxy Tab S8':        { launch: '2022.02', price: '$699' },
    'Galaxy Tab S7 FE':     { launch: '2021.06' },
    'Galaxy Tab S7+':       { launch: '2020.08', price: '$849' },
    'Galaxy Tab S7':        { launch: '2020.08', price: '$649' },
    'Galaxy Tab S6 Lite (2024)': { launch: '2024.04' },
    'Galaxy Tab S6 Lite (2022)': { launch: '2022.03' },
    'Galaxy Tab S6 Lite':   { launch: '2020.04' },
    'Galaxy Tab A8':        { launch: '2021.12' },
    'Galaxy Tab A7 Lite':   { launch: '2021.06' },
    'Galaxy Tab A11+':      { launch: '2025.03' },
    'Galaxy Tab A11':       { launch: '2025.03' },
    'Galaxy Tab A7 (2020)': { launch: '2020.09' },
    'Galaxy Tab A 8.4 (2020)': { launch: '2020.09' },
    'Galaxy Tab A 10.1 (2019)': { launch: '2019.04' },
    'Galaxy Tab S10 Lite': { launch: '2025.01' },
    'Galaxy Tab S6': { launch: '2019.08', price: '$649' },
    'Galaxy Tab S5e': { launch: '2019.04', price: '$399' },
  },
  'Xiaomi': {
    'Xiaomi Pad 8 Pro':    { launch: '2025.10' },
    'Xiaomi Pad 8':        { launch: '2025.10' },
    'Xiaomi Pad 7 Ultra':  { launch: '2025.03' },
    'Xiaomi Pad 7 Pro':    { launch: '2025.03' },
    'Xiaomi Pad 7':        { launch: '2025.03' },
    'Xiaomi Pad 6 Pro':    { launch: '2023.04' },
    'Xiaomi Pad 6':        { launch: '2023.07' },
    'Xiaomi Pad 5 Pro 12.4': { launch: '2022.03' },
    'Xiaomi Pad 5 Pro':    { launch: '2021.08' },
    'Xiaomi Pad 5':        { launch: '2021.09' },
    'Redmi Pad Pro':       { launch: '2024.05' },
    'Redmi Pad SE':        { launch: '2023.09' },
    'Redmi Pad 2':         { launch: '2025.06' },
  },
  'Lenovo': {
    'Legion Tab Gen 5':   { launch: '2025.08' },
    'Idea Tab Pro Gen 2': { launch: '2025.06' },
    'Tab Extreme':        { launch: '2023.06', price: '$949' },
    'Tab P12 Pro':        { launch: '2022.01', price: '$629' },
    'Tab P12':            { launch: '2023.07', price: '$350' },
    'Tab P11 Pro Gen 2':  { launch: '2022.09', price: '$400' },
    'Tab P11 Gen 2':      { launch: '2022.11', price: '$300' },
    'Tab P11 Pro (2021)': { launch: '2021.01' },
    'Tab P11 Plus':       { launch: '2021.09' },
    'Tab P11 (2021)':     { launch: '2021.01' },
    'Tab M11':            { launch: '2024.04', price: '$179' },
    'Tab M10 Plus Gen 3': { launch: '2022.06', price: '$189' },
  },
  'Huawei': {
    'MatePad Pro 13.2':      { launch: '2023.09' },
    'MatePad Pro 12.2':      { launch: '2024.09' },
    'MatePad Pro 11 (2024)': { launch: '2023.11' },
    'MatePad 11.5 S':        { launch: '2024.05' },
    'MatePad 11.5 (2024)':   { launch: '2024.09' },
    'MatePad Air (2024)':    { launch: '2024.09' },
    'MatePad Air':           { launch: '2023.07' },
    'MatePad 11 (2023)':     { launch: '2023.03' },
    'MatePad SE 11':         { launch: '2023.11' },
  },
  'Google': {
    'Pixel Tablet (2023)': { launch: '2023.06', price: '$499' },
  },
  'OnePlus': {
    'OnePlus Pad 4':   { launch: '2025.10' },
    'OnePlus Pad 3':   { launch: '2025.04' },
    'OnePlus Pad Pro': { launch: '2024.05', price: '$549' },
    'OnePlus Pad 2':   { launch: '2024.07', price: '$549' },
    'OnePlus Pad Go':  { launch: '2023.10' },
    'OnePlus Pad':     { launch: '2023.04', price: '$479' },
    'OnePlus Pad Lite': { launch: '2025.06' },
  },
  'Sony': {
    'Xperia Z4 Tablet': { launch: '2015.06' },
  },
  'Microsoft': {
    'Surface Pro 11': { launch: '2024.06', price: '$1,299' },
    'Surface Pro 10': { launch: '2024.03', price: '$1,599' },
    'Surface Pro 9':  { launch: '2022.10', price: '$999' },
    'Surface Go 4':   { launch: '2023.09', price: '$579' },
  },
  'Samsung (Active)': {
    'Galaxy Tab Active5 (B2B)':    { launch: '2024.02' },
    'Galaxy Tab Active4 Pro (B2B)': { launch: '2022.08' },
  },
  'Zebra': {
    'ET40 8" (B2B)':    { launch: '2022.09' },
    'ET45 8" 5G (B2B)': { launch: '2023.04' },
    'ET60 10" (B2B)':   { launch: '2022.09' },
    'ET65 10" 5G (B2B)': { launch: '2023.04' },
  },
  'Panasonic': {
    'Toughbook FZ-A3 (B2B)': { launch: '2022.01' },
    'Toughbook FZ-B3 (B2B)': { launch: '2023.09' },
  },
}

async function getSpecs(manufacturer, model) {
  const dsId = await getDsId(manufacturer, model)
  const specs = {}
  if (dsId) {
    const html = await fetchHtml(`https://www.devicespecifications.com/en/model/${dsId}`)
    if (html) {
      parseDeviceSpecs(html, specs)
      const imgMatch = html.match(/property="og:image"[^>]+content="([^"]+)"/)
      if (imgMatch && !imgMatch[1].includes('logo')) specs.imageUrl = imgMatch[1]
    }
  } else if (FALLBACK_TABLET_SPECS[manufacturer]?.[model]) {
    Object.assign(specs, FALLBACK_TABLET_SPECS[manufacturer][model])
  } else if (FALLBACK_TABLET_SPECS_B2B[manufacturer]?.[model]) {
    Object.assign(specs, FALLBACK_TABLET_SPECS_B2B[manufacturer][model])
  }
  if (specs.chipset) {
    const chipKey = Object.keys(CHIP_DB).find(k =>
      specs.chipset.toLowerCase().includes(k.toLowerCase())
    )
    if (chipKey) {
      const perf = CHIP_DB[chipKey]
      specs.singleCore = String(perf.single)
      specs.multiCore  = String(perf.multi)
      if (perf.npu) specs.npu = perf.npu
      if (perf.gpuScore) specs.gpuScore = String(perf.gpuScore)
      specs.benchmarkSource = 'Geekbench 6'
    }
    // Apple RAM 폴백: devicespecifications.com이 GB 대신 MHz만 기재하는 경우
    if (!specs.ram) {
      const appleKey = Object.keys(APPLE_RAM_FALLBACK).find(k =>
        specs.chipset.toLowerCase().includes(k.toLowerCase())
      )
      if (appleKey) specs.ram = APPLE_RAM_FALLBACK[appleKey] + ' GB'
    }
  }
  // 방수 등급 표시 정규화: 'IP68' → '○ (IP68)'
  if (specs.waterRating) {
    const ipNorm = specs.waterRating.match(/IP\d+[A-Z]*/i)
    if (ipNorm && !specs.waterRating.startsWith('○')) specs.waterRating = '○ (' + ipNorm[0].toUpperCase() + ')'
  }
  // 출시일/가격 하드코딩 DB로 덮어씀 (devicespecifications.com은 가격 미제공)
  const info = TABLET_LAUNCH_PRICE_DB[manufacturer]?.[model]
  if (info) {
    specs.launch = info.price ? `${info.launch} / ${info.price}~` : info.launch
  }
  return specs
}

function parseDeviceSpecs(html, specs) {
  // ── 테이블 행 파싱 헬퍼 ──────────────────────────────────────
  const tdGet = (key) => {
    const re = new RegExp(`<td[^>]*>${key}(?:<p>[^<]*</p>)?</td>\\s*<td[^>]*>([\\s\\S]*?)</td>`, 'i')
    const m = html.match(re)
    return m ? m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : null
  }
  const tdGetAll = (key) => {
    const re = new RegExp(`<td[^>]*>${key}(?:<p>[^<]*</p>)?</td>\\s*<td[^>]*>([\\s\\S]*?)</td>`, 'gi')
    return [...html.matchAll(re)].map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
  }

  // ── b태그 파싱 헬퍼 (상단 요약 박스) ────────────────────────
  const bGet = (key) => {
    const re = new RegExp(`<b>${key}<\\/b>:\\s*([^<]+)`, 'i')
    const m = html.match(re)
    return m ? m[1].trim() : null
  }

  // ── meta 설명 파싱 ───────────────────────────────────────────
  const metaMatch = html.match(/name="description"\s+content="([^"]+)"/i)
    || html.match(/content="([^"]+)"\s+name="description"/i)

  if (metaMatch) {
    const desc = metaMatch[1]
    const get = (key) => {
      const re = new RegExp(`${key}:\\s*([^,]+(?:mm|g|mAh|in)[^,]*)`, 'i')
      const m = desc.match(re)
      if (m) return m[1].trim()
      const re2 = new RegExp(`${key}:\\s*([^,\\.\"]+)`, 'i')
      const m2 = desc.match(re2)
      return m2 ? m2[1].trim() : null
    }
    specs.dimensions = get('Dimensions')
    specs.weight     = get('Weight')
    specs.chipset    = get('SoC')
    specs.cpu        = get('CPU')
    specs.gpu        = get('GPU')
    specs.storage    = get('Storage')
    specs.battery    = get('Battery')

    const dispMatch = desc.match(/Display:\s*([\d.]+\s*in),\s*([^,]+),\s*([\d]+\s*x\s*[\d]+\s*pixels)/i)
    if (dispMatch) {
      specs.displaySize = dispMatch[1]
      specs.displayType = dispMatch[2].trim()
      specs.resolution  = dispMatch[3].trim()
    }
    const osMatch = desc.match(/OS:\s*([^\.\"]+)/i)
    if (osMatch) specs.os = osMatch[1].trim()
  }

  // ── RAM: 테이블 우선, 없으면 meta GB 파싱 ───────────────────
  const ramCapRow = tdGet('RAM capacity')
  if (ramCapRow) {
    const gbM = ramCapRow.match(/(\d+)\s*GB/i)
    if (gbM) specs.ram = gbM[1] + ' GB'
  }
  if (!specs.ram && metaMatch) {
    const gbM = metaMatch[1].match(/RAM:\s*(\d+)\s*GB/i)
    if (gbM) specs.ram = gbM[1] + ' GB'
  }

  // ── 카메라: 테이블의 Image resolution 행 순서대로 후면/전면 ─
  const imgResRows = tdGetAll('Image resolution')
  if (imgResRows[0]) {
    const m = imgResRows[0].match(/([\d.]+)\s*MP/i)
    if (m) specs.rearCamera = Math.round(parseFloat(m[1])) + 'MP'
  }
  if (imgResRows[1]) {
    const m = imgResRows[1].match(/([\d.]+)\s*MP/i)
    if (m) specs.frontCamera = Math.round(parseFloat(m[1])) + 'MP'
  }
  // 테이블에 없으면 b태그 fallback
  if (!specs.rearCamera) {
    const camRaw = bGet('Camera')
    if (camRaw) {
      const rearM = camRaw.match(/(\d+)\s*x\s*(\d+)\s*pixels/i)
      if (rearM) specs.rearCamera = pixelsToMP(parseInt(rearM[1]), parseInt(rearM[2]))
    }
  }

  // ── 통신 ─────────────────────────────────────────────────────
  specs.wlan = bGet('Wi-Fi')
  const bt = bGet('Bluetooth')
  if (bt) specs.bluetooth = 'Bluetooth ' + bt
  specs.usb  = bGet('USB')
  specs.gps  = bGet('Positioning') || bGet('GPS')
  specs.sim  = bGet('SIM card')

  // ── 주사율: "60 Hz - 120 Hz refresh rate" 패턴 처리 ─────────
  if (specs.displayType) {
    const hzM = specs.displayType.match(/(\d+)\s*Hz/i)
    if (hzM && parseInt(hzM[1]) > 30) specs.refreshRate = hzM[1] + ' Hz'
  }
  if (!specs.refreshRate) {
    const hzText = html.match(/[\d\s\-Hz]+refresh rate/i)?.[0] || ''
    const allHz = [...hzText.matchAll(/(\d+)\s*Hz/gi)].map(m => parseInt(m[1])).filter(h => h > 30)
    if (allHz.length) {
      specs.refreshRate = Math.max(...allHz) + ' Hz'
    } else {
      const hzM = html.match(/(\d+)\s*Hz\s*refresh/i) || html.match(/refresh[^<]{0,20}(\d+)\s*Hz/i)
      if (hzM && parseInt(hzM[1]) > 30) specs.refreshRate = hzM[1] + ' Hz'
    }
  }

  // ── 충전: Charger output power V×A → W ───────────────────────
  const chargerRow = tdGet('Charger output power')
  if (chargerRow) {
    const vM = chargerRow.match(/([\d.]+)\s*V/)
    const aM = chargerRow.match(/([\d.]+)\s*A/)
    if (vM && aM) {
      const watts = Math.round(parseFloat(vM[1]) * parseFloat(aM[1]))
      if (watts > 5) specs.charging = watts + 'W'
    }
  }
  if (!specs.charging) {
    const wM = html.match(/(\d+)W\s*(?:fast\s*)?charg/i) || html.match(/charg[^<]{0,30}(\d+)\s*W/i)
    if (wM) specs.charging = wM[1] + 'W'
  }

  // ── PPI ──────────────────────────────────────────────────────
  const ppiRow = tdGet('Pixel density')
  if (ppiRow) {
    const ppiM = ppiRow.match(/(\d+)\s*ppi/i)
    if (ppiM) specs.ppi = ppiM[1] + ' ppi'
  }
  if (!specs.ppi) {
    const ppiM = html.match(/(\d+)\s*ppi/i)
    if (ppiM) specs.ppi = ppiM[1] + ' ppi'
  }

  // ── 밝기 ─────────────────────────────────────────────────────
  const brightnessRow = tdGet('Brightness') || tdGet('Display brightness') || tdGet('Peak brightness')
  if (brightnessRow) {
    const bM = brightnessRow.match(/([\d,]+)\s*(?:nits|cd\/m)/i)
    if (bM) specs.brightness = bM[1].replace(',', '') + ' nits'
  }
  if (!specs.brightness) {
    const nitsM = html.match(/([\d,]+)\s*nits/i) || html.match(/([\d,]+)\s*cd\/m/i)
    if (nitsM) specs.brightness = nitsM[1].replace(',', '') + ' nits'
  }

  // ── NFC ──────────────────────────────────────────────────────
  const connRow = tdGet('Connectivity')
  const addRow  = tdGet('Additional features')
  specs.nfc = (
    (connRow && /\bNFC\b/i.test(connRow)) ||
    (addRow  && /\bNFC\b/i.test(addRow))  ||
    html.match(/<b>NFC<\/b>/i)
  ) ? '있음' : '없음'

  // ── 3.5mm 잭 ─────────────────────────────────────────────────
  const jackRow = tdGet('Headphone jack')
  if (jackRow) {
    specs.headphone = /no/i.test(jackRow) ? '없음' : '있음'
  } else {
    specs.headphone = html.match(/3\.5\s*mm\s*(?:jack|headphone|audio)/i) ? '있음' : '없음'
  }

  // ── 스피커 ───────────────────────────────────────────────────
  const speakerRow = tdGet('Speaker')
  const speakerSrc = speakerRow || ''
  if (/4\s*speakers|quad\s*speaker/i.test(speakerSrc) || html.match(/4\s*speakers|quad\s*speaker/i))
    specs.speakers = '4채널'
  else if (/[Ss]tereo\s*speakers?/i.test(speakerSrc) || html.match(/[Ss]tereo\s*speakers?/i))
    specs.speakers = '스테레오'
  else if (/[Ss]ingle\s*speaker/i.test(speakerSrc) || html.match(/[Ss]ingle\s*speaker/i))
    specs.speakers = '모노'

  // ── 센서 (br/p 태그 → 쉼표 구분) ────────────────────────────
  const sensorsRe = /<td[^>]*>Sensors(?:<p>[^<]*<\/p>)?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i
  const sensorsMatch = html.match(sensorsRe)
  if (sensorsMatch) {
    specs.sensors = sensorsMatch[1]
      .replace(/<br\s*\/?>/gi, ', ')
      .replace(/<\/p>\s*<p[^>]*>/gi, ', ')
      .replace(/<p[^>]*>|<\/p>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s*,\s*/g, ', ')
      .replace(/,\s*,/g, ',')
      .trim()
  }

  // ── SD Card ──────────────────────────────────────────────────
  const sdRow = tdGet('Memory card slot') || tdGet('External storage') || tdGet('Memory card')
    || tdGet('SD card') || tdGet('MicroSD') || tdGet('Memory slot')
  if (sdRow) {
    if (/no|not supported|none/i.test(sdRow)) specs.sdCard = '없음'
    else {
      const sdM = sdRow.match(/microSD[^,<]*/i)
      specs.sdCard = sdM ? sdM[0].trim() : '지원'
    }
  }
  if (!specs.sdCard) {
    const sdHtml = html.match(/microSD[^<]{0,40}/i)
    if (sdHtml) specs.sdCard = sdHtml[0].replace(/<[^>]+>/g, '').trim().substring(0, 40)
  }

  // ── 방수 등급 ────────────────────────────────────────────────
  const ipRow = tdGet('Ingress protection') || tdGet('Water resistance') || tdGet('Protection')
    || tdGet('Protection class') || tdGet('IP rating') || tdGet('Waterproof')
  if (ipRow) {
    const ipM = ipRow.match(/IP\d+[A-Z]*/i)
    if (ipM) specs.waterRating = '○ (' + ipM[0].toUpperCase() + ')'
    else if (/no|not|없음/i.test(ipRow)) specs.waterRating = '없음'
    else specs.waterRating = ipRow.replace(/<[^>]+>/g, '').trim()
  }
  if (!specs.waterRating) {
    const ipHtml = html.match(/\bIP\d+[A-Z]*\b/)
    if (ipHtml) specs.waterRating = '○ (' + ipHtml[0].toUpperCase() + ')'
  }

  // ── 배터리 사용 시간 ─────────────────────────────────────────
  const batteryLifeRow = tdGet('Video playback time') || tdGet('Battery life') || tdGet('Music playback time')
  if (batteryLifeRow) {
    const hM = batteryLifeRow.match(/up to\s*(\d+)\s*h/i) || batteryLifeRow.match(/(\d+)\s*h/i)
    if (hM) specs.batteryLife = hM[1] + 'h'
  }

  // ── 출시일 ───────────────────────────────────────────────────
  const announcedRow = tdGet('Announced') || tdGet('Release date') || tdGet('Release Date')
  if (announcedRow) {
    specs.launch = announcedRow.replace(/^Available\.\s*Released?\s*/i, '').trim()
  }
}

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    if (!res.ok) return null
    return await res.text()
  } catch { return null }
}

// ══════════════════════════════════════════════════════════
// PC / Laptop 섹션
// ══════════════════════════════════════════════════════════

const PC_PRODUCTS_JSON_URL = 'https://raw.githubusercontent.com/Dalbonz/tablet-compare/main/products_pc.json'

const FALLBACK_PC_DB = {
  'Apple':   [
    { name: 'MacBook Air 13" (M5, 2026)' }, { name: 'MacBook Air 15" (M5, 2026)' },
    { name: 'MacBook Pro 14" M5 Pro (2026)' }, { name: 'MacBook Pro 14" M5 Max (2026)' },
    { name: 'MacBook Pro 16" M5 Pro (2026)' }, { name: 'MacBook Pro 16" M5 Max (2026)' },
    { name: 'MacBook Neo (2026)' },
    { name: 'MacBook Air 13" (M4, 2025)' }, { name: 'MacBook Air 15" (M4, 2025)' },
    { name: 'MacBook Air 13" (M3, 2024)' }, { name: 'MacBook Air 15" (M3, 2024)' },
    { name: 'MacBook Pro 14" M4 (2024)' }, { name: 'MacBook Pro 14" M4 Pro (2024)' },
    { name: 'MacBook Pro 14" M4 Max (2024)' },
    { name: 'MacBook Pro 16" M4 Pro (2024)' }, { name: 'MacBook Pro 16" M4 Max (2024)' },
  ],
  'LG': [
    { name: 'Gram Pro 16 (2026)' }, { name: 'Gram Pro 17 (2026)' },
    { name: 'Gram 14 (2025)' }, { name: 'Gram 16 (2025)' }, { name: 'Gram 17 (2025)' },
    { name: 'Gram Pro 14 (2025)' }, { name: 'Gram Pro 16 (2025)' },
    { name: 'Gram Style 14 (2024)' }, { name: 'Gram Style 16 (2024)' },
  ],
  'Lenovo': [
    { name: 'ThinkPad X1 Carbon Gen 14 (2026)' },
    { name: 'ThinkPad X1 Carbon Gen 13 (2025)' }, { name: 'ThinkPad X1 Yoga Gen 9 (2025)' },
    { name: 'Yoga Slim 9i Gen 9 (2025)' }, { name: 'Yoga Pro 9i Gen 9 (2024)' },
    { name: 'ThinkPad T14s Gen 6 (2024)' }, { name: 'IdeaPad Slim 5i Gen 9 (2024)' },
    { name: 'Legion Slim 5i Gen 9 (2024)' },
  ],
  'Dell': [
    { name: 'XPS 14 (2026)' }, { name: 'XPS 16 (2026)' },
    { name: 'XPS 13 9340 (2024)' }, { name: 'XPS 14 9440 (2024)' },
    { name: 'XPS 16 9640 (2024)' }, { name: 'Inspiron 14 Plus 7441 (2024)' },
    { name: 'Latitude 7450 (2024)' }, { name: 'Alienware m16 R2 (2024)' },
  ],
  'HP': [
    { name: 'Spectre x360 14 (2024)' }, { name: 'Spectre x360 16 (2024)' },
    { name: 'Envy x360 14 (2024)' }, { name: 'OmniBook X 14 (2024)' },
    { name: 'EliteBook 840 G11 (2024)' }, { name: 'OMEN 16 (2024)' },
  ],
  'ASUS': [
    { name: 'ZenBook 14 OLED UX3405 (2024)' }, { name: 'ZenBook Pro 14 OLED UX6404 (2024)' },
    { name: 'Vivobook Pro 16 OLED K6604 (2024)' }, { name: 'ROG Zephyrus G16 GU605 (2024)' },
    { name: 'ProArt Studiobook 16 OLED H7604 (2024)' }, { name: 'ExpertBook B9 B9403 (2024)' },
  ],
  'Huawei': [
    { name: 'MateBook X Pro (2024)' }, { name: 'MateBook 16s (2024)' },
    { name: 'MateBook D16 (2024)' }, { name: 'MateBook D14 (2024)' },
    { name: 'MateBook 14 (2024)' },
  ],
  'Xiaomi': [
    { name: 'Book Pro 14 (2024)' }, { name: 'Book Pro 16 (2024)' },
    { name: 'RedmiBook Pro 15 (2024)' }, { name: 'RedmiBook 16 (2024)' },
    { name: 'RedmiBook 14 (2024)' },
  ],
  'Samsung': [
    { name: 'Galaxy Book6 Ultra 16" (2026)' }, { name: 'Galaxy Book6 Pro 16" (2026)' },
    { name: 'Galaxy Book6 Pro 14" (2026)' },
    { name: 'Galaxy Book5 Pro 360 16" (2025)' }, { name: 'Galaxy Book5 Pro 16" (2025)' },
    { name: 'Galaxy Book5 Pro 14" (2025)' }, { name: 'Galaxy Book4 Ultra (2024)' },
    { name: 'Galaxy Book4 Pro 360 16" (2024)' }, { name: 'Galaxy Book4 Pro 16" (2024)' },
    { name: 'Galaxy Book4 Pro 14" (2024)' }, { name: 'Galaxy Book4 Edge 16" (2024)' },
    { name: 'Galaxy Book4 Edge 14" (2024)' },
  ],
}

const FALLBACK_PC_SPECS = {
  'Apple': {
    'MacBook Air 13" (M5, 2026)': {
      launch: '2026.03 / $1,099~', thicknessWeight: '11.3mm / 1.24kg',
      cmfColor: 'Aluminum / Sky Blue, Starlight, Midnight, Silver',
      display: '13.6", Liquid Retina, 2560x1664, 60Hz, 500nits',
      audio: 'Four Speaker (Spatial Audio)', webcam: '12MP, Center Stage',
      ap: 'Apple M5 (10-core CPU)', graphics: 'Apple M5 (10-core GPU)',
      memory: '16/24/32GB LPDDR5', storage: '512GB/1/2/4TB SSD',
      battery: '52.6Wh / 18h', adapter: '30W / 35W / 70W MagSafe 3',
      ports: 'TBT4(2), MagSafe 3, 3.5mm', security: 'Touch ID',
    },
    'MacBook Air 15" (M5, 2026)': {
      launch: '2026.03 / $1,299~', thicknessWeight: '11.5mm / 1.51kg',
      cmfColor: 'Aluminum / Sky Blue, Starlight, Midnight, Silver',
      display: '15.3", Liquid Retina, 2880x1864, 60Hz, 500nits',
      audio: 'Six Speaker (Spatial Audio)', webcam: '12MP, Center Stage',
      ap: 'Apple M5 (10-core CPU)', graphics: 'Apple M5 (10-core GPU)',
      memory: '16/24/32GB LPDDR5', storage: '512GB/1/2/4TB SSD',
      battery: '66.5Wh / 18h', adapter: '35W / 70W MagSafe 3',
      ports: 'TBT4(2), MagSafe 3, 3.5mm', security: 'Touch ID',
    },
    'MacBook Pro 14" M5 Pro (2026)': {
      launch: '2026.03 / $2,199~', thicknessWeight: '15.5mm / 1.62kg',
      cmfColor: 'Aluminum / Space Black, Silver',
      display: '14.2", Liquid Retina XDR, 3024x1964, 120Hz, 1000nits(SDR), 1600nits(HDR)',
      audio: 'Six Speaker (Spatial Audio)', webcam: '12MP, Center Stage',
      ap: 'Apple M5 Pro (14-core CPU)', graphics: 'Apple M5 Pro (20-core GPU)',
      memory: '24/48GB LPDDR5X', storage: '512GB/1/2/4TB SSD',
      battery: '72.4Wh / 24h', adapter: '96W / 140W MagSafe 3',
      ports: 'TBT5(3), HDMI 2.1, SDXC, MagSafe 3, 3.5mm', security: 'Touch ID',
    },
    'MacBook Pro 14" M5 Max (2026)': {
      launch: '2026.03 / $3,599~', thicknessWeight: '15.5mm / 1.62kg',
      cmfColor: 'Aluminum / Space Black, Silver',
      display: '14.2", Liquid Retina XDR, 3024x1964, 120Hz, 1000nits(SDR), 1600nits(HDR)',
      audio: 'Six Speaker (Spatial Audio)', webcam: '12MP, Center Stage',
      ap: 'Apple M5 Max (16-core CPU)', graphics: 'Apple M5 Max (40-core GPU)',
      memory: '36/64/96/128GB LPDDR5X', storage: '1/2/4/8TB SSD',
      battery: '72.4Wh / 18h', adapter: '140W MagSafe 3',
      ports: 'TBT5(3), HDMI 2.1, SDXC, MagSafe 3, 3.5mm', security: 'Touch ID',
    },
    'MacBook Pro 16" M5 Pro (2026)': {
      launch: '2026.03 / $2,699~', thicknessWeight: '16.8mm / 2.14kg',
      cmfColor: 'Aluminum / Space Black, Silver',
      display: '16.2", Liquid Retina XDR, 3456x2234, 120Hz, 1000nits(SDR), 1600nits(HDR)',
      audio: 'Six Speaker (Spatial Audio)', webcam: '12MP, Center Stage',
      ap: 'Apple M5 Pro (14-core CPU)', graphics: 'Apple M5 Pro (20-core GPU)',
      memory: '24/48GB LPDDR5X', storage: '512GB/1/2/4TB SSD',
      battery: '100Wh / 24h', adapter: '140W MagSafe 3',
      ports: 'TBT5(3), HDMI 2.1, SDXC, MagSafe 3, 3.5mm', security: 'Touch ID',
    },
    'MacBook Pro 16" M5 Max (2026)': {
      launch: '2026.03 / $3,899~', thicknessWeight: '16.8mm / 2.15kg',
      cmfColor: 'Aluminum / Space Black, Silver',
      display: '16.2", Liquid Retina XDR, 3456x2234, 120Hz, 1000nits(SDR), 1600nits(HDR)',
      audio: 'Six Speaker (Spatial Audio)', webcam: '12MP, Center Stage',
      ap: 'Apple M5 Max (16-core CPU)', graphics: 'Apple M5 Max (40-core GPU)',
      memory: '48/64/96/128GB LPDDR5X', storage: '1/2/4/8TB SSD',
      battery: '100Wh / 21h', adapter: '140W MagSafe 3',
      ports: 'TBT5(3), HDMI 2.1, SDXC, MagSafe 3, 3.5mm', security: 'Touch ID',
    },
    'MacBook Neo (2026)': {
      launch: '2026.03 / $599~', thicknessWeight: '~13.4mm / ~1.24kg',
      cmfColor: 'Aluminum / Silver, Blush, Citrus, Indigo',
      display: '13.6", Liquid Retina, 2408x1506, 60Hz',
      audio: 'Stereo Speaker', webcam: '1080p FaceTime HD',
      ap: 'Apple A18 Pro (6-core CPU)', graphics: 'Apple A18 Pro (5-core GPU)',
      memory: '8GB', storage: '256GB/512GB SSD',
      battery: '~16h', adapter: '30W USB-C',
      ports: 'USB-C(2), MagSafe, 3.5mm', security: 'Touch ID',
    },
    'MacBook Air 13" (M4, 2025)': {
      launch: '2025.03 / $1,099~', thicknessWeight: '11.3mm / 1.24kg',
      cmfColor: 'Aluminum / Sky Blue, Starlight, Midnight, Rose',
      display: '13.6", Liquid Retina, 2560x1664, 60Hz, 500nits',
      audio: 'Four Speaker (Spatial Audio)', webcam: '12MP, Center Stage',
      ap: 'Apple M4 (10-core CPU)', graphics: 'Apple M4 (10-core GPU)',
      memory: '16/24/32GB LPDDR5', storage: '256GB/512GB/1/2TB SSD',
      battery: '52.6Wh / 18h', adapter: '30W / 35W / 70W MagSafe 3',
      ports: 'TBT4(2), MagSafe 3, 3.5mm', security: 'Touch ID',
    },
    'MacBook Air 15" (M4, 2025)': {
      launch: '2025.03 / $1,299~', thicknessWeight: '11.5mm / 1.51kg',
      cmfColor: 'Aluminum / Sky Blue, Starlight, Midnight, Rose',
      display: '15.3", Liquid Retina, 2880x1864, 60Hz, 500nits',
      audio: 'Six Speaker (Spatial Audio)', webcam: '12MP, Center Stage',
      ap: 'Apple M4 (10-core CPU)', graphics: 'Apple M4 (10-core GPU)',
      memory: '16/24/32GB LPDDR5', storage: '256GB/512GB/1/2TB SSD',
      battery: '66.5Wh / 18h', adapter: '35W / 70W MagSafe 3',
      ports: 'TBT4(2), MagSafe 3, 3.5mm', security: 'Touch ID',
    },
    'MacBook Air 13" (M3, 2024)': {
      launch: '2024.03 / $1,099~', thicknessWeight: '11.3mm / 1.24kg',
      cmfColor: 'Aluminum / Midnight, Starlight, Space Gray, Silver',
      display: '13.6", Liquid Retina, 2560x1664, 60Hz, 500nits',
      audio: 'Four Speaker (Spatial Audio)', webcam: '1080p FaceTime HD',
      ap: 'Apple M3 (8-core CPU)', graphics: 'Apple M3 (10-core GPU)',
      memory: '8/16/24GB LPDDR5', storage: '256GB/512GB/1/2TB SSD',
      battery: '52.6Wh / 18h', adapter: '30W / 35W / 70W MagSafe 3',
      ports: 'TBT3(2), MagSafe 3, 3.5mm', security: 'Touch ID',
    },
    'MacBook Air 15" (M3, 2024)': {
      launch: '2024.03 / $1,299~', thicknessWeight: '11.5mm / 1.51kg',
      cmfColor: 'Aluminum / Midnight, Starlight, Space Gray, Silver',
      display: '15.3", Liquid Retina, 2880x1864, 60Hz, 500nits',
      audio: 'Six Speaker (Spatial Audio)', webcam: '1080p FaceTime HD',
      ap: 'Apple M3 (8-core CPU)', graphics: 'Apple M3 (10-core GPU)',
      memory: '8/16/24GB LPDDR5', storage: '256GB/512GB/1/2TB SSD',
      battery: '66.5Wh / 18h', adapter: '35W / 70W MagSafe 3',
      ports: 'TBT3(2), MagSafe 3, 3.5mm', security: 'Touch ID',
    },
    'MacBook Pro 14" M4 (2024)': {
      launch: '2024.11 / $1,599~', thicknessWeight: '15.5mm / 1.55kg',
      cmfColor: 'Aluminum / Space Black, Silver',
      display: '14.2", Liquid Retina XDR, 3024x1964, 120Hz, 1000nits(SDR), 1600nits(HDR)',
      audio: 'Six Speaker (Spatial Audio)', webcam: '12MP, Center Stage',
      ap: 'Apple M4 (10-core CPU)', graphics: 'Apple M4 (10-core GPU)',
      memory: '16/24/32GB LPDDR5X', storage: '512GB/1/2TB SSD',
      battery: '72.4Wh / 24h', adapter: '70W / 140W MagSafe 3',
      ports: 'TBT5(3), HDMI 2.1, SDXC, MagSafe 3, 3.5mm', security: 'Touch ID',
    },
    'MacBook Pro 14" M4 Pro (2024)': {
      launch: '2024.11 / $1,999~', thicknessWeight: '15.5mm / 1.62kg',
      cmfColor: 'Aluminum / Space Black, Silver',
      display: '14.2", Liquid Retina XDR, 3024x1964, 120Hz, 1000nits(SDR), 1600nits(HDR)',
      audio: 'Six Speaker (Spatial Audio)', webcam: '12MP, Center Stage',
      ap: 'Apple M4 Pro (14-core CPU)', graphics: 'Apple M4 Pro (20-core GPU)',
      memory: '24/48GB LPDDR5X', storage: '512GB/1/2/4TB SSD',
      battery: '72.4Wh / 22h', adapter: '96W / 140W MagSafe 3',
      ports: 'TBT5(3), HDMI 2.1, SDXC, MagSafe 3, 3.5mm', security: 'Touch ID',
    },
    'MacBook Pro 14" M4 Max (2024)': {
      launch: '2024.11 / $2,499~', thicknessWeight: '15.5mm / 1.62kg',
      cmfColor: 'Aluminum / Space Black, Silver',
      display: '14.2", Liquid Retina XDR, 3024x1964, 120Hz, 1000nits(SDR), 1600nits(HDR)',
      audio: 'Six Speaker (Spatial Audio)', webcam: '12MP, Center Stage',
      ap: 'Apple M4 Max (16-core CPU)', graphics: 'Apple M4 Max (40-core GPU)',
      memory: '36/48/64/96/128GB LPDDR5X', storage: '512GB/1/2/4/8TB SSD',
      battery: '72.4Wh / 18h', adapter: '140W MagSafe 3',
      ports: 'TBT5(3), HDMI 2.1, SDXC, MagSafe 3, 3.5mm', security: 'Touch ID',
    },
    'MacBook Pro 16" M4 Pro (2024)': {
      launch: '2024.11 / $2,499~', thicknessWeight: '16.8mm / 2.14kg',
      cmfColor: 'Aluminum / Space Black, Silver',
      display: '16.2", Liquid Retina XDR, 3456x2234, 120Hz, 1000nits(SDR), 1600nits(HDR)',
      audio: 'Six Speaker (Spatial Audio)', webcam: '12MP, Center Stage',
      ap: 'Apple M4 Pro (14-core CPU)', graphics: 'Apple M4 Pro (20-core GPU)',
      memory: '24/48GB LPDDR5X', storage: '512GB/1/2/4TB SSD',
      battery: '100Wh / 24h', adapter: '140W MagSafe 3',
      ports: 'TBT5(3), HDMI 2.1, SDXC, MagSafe 3, 3.5mm', security: 'Touch ID',
    },
    'MacBook Pro 16" M4 Max (2024)': {
      launch: '2024.11 / $3,499~', thicknessWeight: '16.8mm / 2.15kg',
      cmfColor: 'Aluminum / Space Black, Silver',
      display: '16.2", Liquid Retina XDR, 3456x2234, 120Hz, 1000nits(SDR), 1600nits(HDR)',
      audio: 'Six Speaker (Spatial Audio)', webcam: '12MP, Center Stage',
      ap: 'Apple M4 Max (16-core CPU)', graphics: 'Apple M4 Max (40-core GPU)',
      memory: '48/64/96/128GB LPDDR5X', storage: '512GB/1/2/4/8TB SSD',
      battery: '100Wh / 21h', adapter: '140W MagSafe 3',
      ports: 'TBT5(3), HDMI 2.1, SDXC, MagSafe 3, 3.5mm', security: 'Touch ID',
    },
  },
  'LG': {
    'Gram Pro 16 (2026)': {
      launch: '2026.04 / $1,499~', thicknessWeight: '15.8mm / 1.19kg',
      cmfColor: 'Aerominum / White, Titan Black',
      display: '16", OLED, 2880x1800, 120Hz, 400nits',
      audio: 'Stereo Speaker, DTS:X Ultra', webcam: '1080p FHD',
      ap: 'Intel Core Ultra 7 Series 3', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB LPDDR5X', storage: '1TB NVMe SSD',
      battery: '80Wh / 18h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
    'Gram Pro 17 (2026)': {
      launch: '2026.04 / $1,699~', thicknessWeight: '17.3mm / 1.35kg',
      cmfColor: 'Aerominum / White, Titan Black',
      display: '17", WQXGA, 2560x1600, 60Hz, 400nits',
      audio: 'Stereo Speaker, DTS:X Ultra', webcam: '1080p FHD',
      ap: 'Intel Core Ultra 7 Series 3', graphics: 'NVIDIA GeForce RTX 5050',
      memory: '16/32GB LPDDR5X', storage: '512GB/1TB NVMe SSD',
      battery: '90Wh / 16h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
    'Gram 14 (2025)': {
      launch: '2025.01 / $1,099~', thicknessWeight: '16.5mm / 0.98kg',
      cmfColor: 'Magnesium Alloy / White, Charcoal Gray',
      display: '14", IPS Anti-Glare, 1920x1200, 60Hz, 400nits',
      audio: 'Stereo Speaker, DTS:X Ultra', webcam: '1080p FHD',
      ap: 'Intel Core Ultra 7 258V', graphics: 'Intel Arc 140V',
      memory: '16/32GB LPDDR5X', storage: '512GB/1TB NVMe SSD',
      battery: '72Wh / 24h', adapter: '65W USB-C',
      ports: 'TBT4(1), USB-C(1), USB-A(2), HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
    'Gram 16 (2025)': {
      launch: '2025.01 / $1,299~', thicknessWeight: '16.3mm / 1.19kg',
      cmfColor: 'Magnesium Alloy / White, Charcoal Gray',
      display: '16", IPS Anti-Glare, 2560x1600, 120Hz, 400nits',
      audio: 'Stereo Speaker, DTS:X Ultra', webcam: '1080p FHD',
      ap: 'Intel Core Ultra 7 258V', graphics: 'Intel Arc 140V',
      memory: '16/32GB LPDDR5X', storage: '512GB/1TB NVMe SSD',
      battery: '80Wh / 22h', adapter: '65W USB-C',
      ports: 'TBT4(1), USB-C(1), USB-A(2), HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
    'Gram 17 (2025)': {
      launch: '2025.01 / $1,499~', thicknessWeight: '17.3mm / 1.35kg',
      cmfColor: 'Magnesium Alloy / White, Charcoal Gray',
      display: '17", IPS Anti-Glare, 2560x1600, 60Hz, 400nits',
      audio: 'Stereo Speaker, DTS:X Ultra', webcam: '1080p FHD',
      ap: 'Intel Core Ultra 7 258V', graphics: 'Intel Arc 140V',
      memory: '16/32GB LPDDR5X', storage: '512GB/1TB NVMe SSD',
      battery: '90Wh / 19h', adapter: '65W USB-C',
      ports: 'TBT4(1), USB-C(1), USB-A(2), HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
    'Gram Pro 14 (2025)': {
      launch: '2025.01 / $1,499~', thicknessWeight: '15.8mm / 1.09kg',
      cmfColor: 'Magnesium Alloy / White, Titan Black',
      display: '14", OLED, 2880x1800, 120Hz, 400nits',
      audio: 'Stereo Speaker, DTS:X Ultra', webcam: '1080p FHD',
      ap: 'Intel Core Ultra 7 258V', graphics: 'Intel Arc 140V',
      memory: '16/32GB LPDDR5X', storage: '1TB NVMe SSD',
      battery: '72Wh / 20h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
    'Gram Pro 16 (2025)': {
      launch: '2025.01 / $1,799~', thicknessWeight: '15.8mm / 1.24kg',
      cmfColor: 'Magnesium Alloy / White, Titan Black',
      display: '16", OLED, 2880x1800, 120Hz, 400nits',
      audio: 'Stereo Speaker, DTS:X Ultra', webcam: '1080p FHD',
      ap: 'Intel Core Ultra 7 258V', graphics: 'Intel Arc 140V',
      memory: '16/32GB LPDDR5X', storage: '1TB NVMe SSD',
      battery: '80Wh / 18h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
    'Gram Style 14 (2024)': {
      launch: '2024.01 / $1,499~', thicknessWeight: '12.4mm / 0.999kg',
      cmfColor: 'Aluminum / White, Opal, Black',
      display: '14", OLED, 2880x1800, 90Hz, 400nits',
      audio: 'Stereo Speaker', webcam: '1080p FHD',
      ap: 'Intel Core Ultra 7 155H', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB LPDDR5', storage: '512GB/1TB NVMe SSD',
      battery: '72Wh / 14h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
    'Gram Style 16 (2024)': {
      launch: '2024.01 / $1,699~', thicknessWeight: '12.4mm / 1.19kg',
      cmfColor: 'Aluminum / White, Opal, Black',
      display: '16", OLED 3K, 2880x1800, 120Hz, 400nits',
      audio: 'Stereo Speaker', webcam: '1080p FHD',
      ap: 'Intel Core Ultra 7 155H', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB LPDDR5', storage: '512GB/1TB NVMe SSD',
      battery: '80Wh / 12h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
  },
  'Lenovo': {
    'ThinkPad X1 Carbon Gen 14 (2026)': {
      launch: '2026.03 / $1,999~', thicknessWeight: '14.9mm / 0.996kg',
      cmfColor: 'Carbon Fiber + Magnesium / Black',
      display: '14", IPS/OLED 2.8K, 120Hz, 400-600nits',
      audio: 'Four Speaker, Dolby Atmos', webcam: '10MP + IR',
      ap: 'Intel Core Ultra X7 Series 3', graphics: 'Intel Arc (integrated)',
      memory: '16/32/64GB LPDDR5X', storage: '256GB/512GB/1/2TB SSD',
      battery: '57Wh / 15h', adapter: '65W / 140W USB-C',
      ports: 'TBT5(2), USB-A(2), HDMI 2.1, SD, 3.5mm',
      security: 'Fingerprint, IR Camera, TPM 2.0',
    },
    'ThinkPad X1 Carbon Gen 13 (2025)': {
      launch: '2025.01 / $1,699~', thicknessWeight: '14.9mm / 1.09kg',
      cmfColor: 'Carbon Fiber + Magnesium / Black',
      display: '14", IPS/OLED 2.8K, 90-120Hz, 400-1000nits',
      audio: 'Four Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 268V', graphics: 'Intel Arc 140V',
      memory: '16/32/64GB LPDDR5X', storage: '256GB/512GB/1/2TB SSD',
      battery: '57Wh / 15h', adapter: '65W / 140W USB-C',
      ports: 'TBT5(2), USB-A(2), HDMI 2.1, SD, 3.5mm',
      security: 'Fingerprint, IR Camera, TPM 2.0',
    },
    'ThinkPad X1 Yoga Gen 9 (2025)': {
      launch: '2025.01 / $1,799~', thicknessWeight: '15.9mm / 1.31kg',
      cmfColor: 'Aluminum + Magnesium / Black',
      display: '14", OLED 2.8K Touch, 90Hz, 500nits(SDR), 1000nits(HDR)',
      audio: 'Four Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 268V', graphics: 'Intel Arc 140V',
      memory: '16/32/64GB LPDDR5X', storage: '256GB/512GB/1/2TB SSD',
      battery: '57Wh / 13h', adapter: '65W / 140W USB-C',
      ports: 'TBT5(2), USB-A(2), HDMI 2.1, SD, 3.5mm',
      security: 'Fingerprint, IR Camera, TPM 2.0',
    },
    'Yoga Slim 9i Gen 9 (2025)': {
      launch: '2025.01 / $1,499~', thicknessWeight: '14.9mm / 1.28kg',
      cmfColor: 'Glass + Aluminum / Luna Grey, Cosmic Blue',
      display: '14.5", OLED 2.8K, 120Hz, 500nits(SDR), 1000nits(HDR)',
      audio: 'Four Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 258V', graphics: 'Intel Arc 140V',
      memory: '32/64GB LPDDR5X', storage: '1/2TB SSD',
      battery: '75Wh / 14h', adapter: '65W USB-C',
      ports: 'TBT5(2), USB-A, HDMI, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'Yoga Pro 9i Gen 9 (2024)': {
      launch: '2024.05 / $1,899~', thicknessWeight: '17.6mm / 2.0kg',
      cmfColor: 'Aluminum / Luna Grey',
      display: '16", Mini-LED, 3200x2000, 165Hz, 1200nits(SDR), 1600nits(HDR)',
      audio: 'Four Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 9 185H', graphics: 'NVIDIA GeForce RTX 4060',
      memory: '32/64GB DDR5', storage: '1/2TB SSD',
      battery: '99.5Wh / 10h', adapter: '140W USB-C',
      ports: 'TBT4(2), USB-A(2), USB-C, HDMI 2.1, SD, 3.5mm',
      security: 'Fingerprint, IR Camera',
    },
    'ThinkPad T14s Gen 6 (2024)': {
      launch: '2024.04 / $1,299~', thicknessWeight: '16.9mm / 1.21kg',
      cmfColor: 'Magnesium + Aluminum / Black',
      display: '14", IPS, 2560x1600, 60Hz, 400nits',
      audio: 'Stereo Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 165H', graphics: 'Intel Arc (integrated)',
      memory: '16/32/64GB LPDDR5X', storage: '256GB/512GB/1/2TB SSD',
      battery: '58Wh / 14h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI 2.1, MicroSD, 3.5mm',
      security: 'Fingerprint, IR Camera, TPM 2.0',
    },
    'IdeaPad Slim 5i Gen 9 (2024)': {
      launch: '2024.07 / $799~', thicknessWeight: '17.9mm / 1.46kg',
      cmfColor: 'Aluminum / Cosmic Blue, Platinum Grey',
      display: '14", OLED 2.8K, 90Hz, 400nits',
      audio: 'Stereo Speaker, Dolby Atmos', webcam: '1080p',
      ap: 'Intel Core Ultra 5 125H', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB LPDDR5', storage: '512GB/1TB SSD',
      battery: '75Wh / 13h', adapter: '65W USB-C',
      ports: 'TBT4(1), USB-A(2), USB-C, HDMI, SD, 3.5mm',
      security: 'Fingerprint',
    },
    'Legion Slim 5i Gen 9 (2024)': {
      launch: '2024.05 / $1,199~', thicknessWeight: '19.9mm / 2.0kg',
      cmfColor: 'Aluminum / Misty Grey',
      display: '16", IPS, 2560x1600, 165Hz, 500nits',
      audio: 'Four Speaker, Nahimic', webcam: '1080p',
      ap: 'Intel Core Ultra 7 155H', graphics: 'NVIDIA GeForce RTX 4060',
      memory: '16/32GB DDR5', storage: '512GB/1/2TB SSD',
      battery: '99.9Wh / 7h', adapter: '230W USB-C/barrel',
      ports: 'TBT4(1), USB-A(3), USB-C, HDMI 2.1, SD, 3.5mm',
      security: 'Fingerprint',
    },
  },
  'Dell': {
    'XPS 14 (2026)': {
      launch: '2026.01 / $2,049~', thicknessWeight: '14.6mm / 1.36kg',
      cmfColor: 'CNC Aluminum / Platinum',
      display: '14.5", OLED 2.8K or 2K LCD, 120Hz, 500nits',
      audio: 'Four Speaker, Waves MaxxAudio', webcam: '1080p + IR',
      ap: 'Intel Core Ultra X7 Series 3', graphics: 'Intel Arc (integrated)',
      memory: '32/64GB LPDDR5X', storage: '512GB/1/2/4TB SSD',
      battery: '70Wh / 27h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A, SDXC, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'XPS 16 (2026)': {
      launch: '2026.01 / $2,199~', thicknessWeight: '14.6mm / 1.63kg',
      cmfColor: 'CNC Aluminum / Platinum',
      display: '16.3", OLED 3.2K or 2K LCD, 120Hz, 500nits',
      audio: 'Six Speaker, Waves MaxxAudio', webcam: '1080p + IR',
      ap: 'Intel Core Ultra X9 Series 3', graphics: 'Intel Arc (integrated)',
      memory: '32/64GB LPDDR5X', storage: '512GB/1/2/4TB SSD',
      battery: '70Wh / 27h', adapter: '90W USB-C',
      ports: 'TBT4(2), USB-A, SDXC, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'XPS 13 9340 (2024)': {
      launch: '2024.01 / $1,299~', thicknessWeight: '14.8mm / 1.17kg',
      cmfColor: 'Machined Aluminum / Sky, Platinum, Graphite',
      display: '13.4", OLED 2.8K, 60Hz, 400nits',
      audio: 'Four Speaker, Waves MaxxAudio', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 165H', graphics: 'Intel Arc (integrated)',
      memory: '16/32/64GB LPDDR5X', storage: '512GB/1/2TB SSD',
      battery: '54.7Wh / 13h', adapter: '60W USB-C',
      ports: 'TBT4(2), 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'XPS 14 9440 (2024)': {
      launch: '2024.01 / $1,699~', thicknessWeight: '18.0mm / 1.63kg',
      cmfColor: 'Machined Aluminum / Platinum',
      display: '14.5", OLED 2.8K, 120Hz, 500nits(SDR), 1000nits(HDR)',
      audio: 'Four Speaker, Waves MaxxAudio', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 155H', graphics: 'NVIDIA GeForce RTX 4050',
      memory: '16/32/64GB LPDDR5X', storage: '512GB/1/2TB SSD',
      battery: '69.5Wh / 13h', adapter: '90W USB-C',
      ports: 'TBT4(2), USB-A, SDXC, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'XPS 16 9640 (2024)': {
      launch: '2024.01 / $1,999~', thicknessWeight: '20.9mm / 1.84kg',
      cmfColor: 'Machined Aluminum / Platinum',
      display: '16.3", OLED 3.2K, 120Hz, 500nits(SDR), 1000nits(HDR)',
      audio: 'Six Speaker, Waves MaxxAudio', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 9 185H', graphics: 'NVIDIA GeForce RTX 4060',
      memory: '32/64GB DDR5', storage: '1/2/4TB SSD',
      battery: '99.5Wh / 13h', adapter: '130W USB-C',
      ports: 'TBT4(2), USB-A, SDXC, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'Inspiron 14 Plus 7441 (2024)': {
      launch: '2024.06 / $999~', thicknessWeight: '16.8mm / 1.36kg',
      cmfColor: 'Aluminum / Ice Blue, Platinum Silver',
      display: '14", IPS 2K, 60Hz, 300nits',
      audio: 'Stereo Speaker', webcam: '1080p',
      ap: 'Snapdragon X Plus', graphics: 'Qualcomm Adreno X1-45',
      memory: '16/32/64GB LPDDR5X', storage: '512GB/1TB SSD',
      battery: '54Wh / 22h', adapter: '65W USB-C',
      ports: 'USB4(2), USB-A, SD, 3.5mm', security: 'Fingerprint',
    },
    'Latitude 7450 (2024)': {
      launch: '2024.04 / $1,499~', thicknessWeight: '16.6mm / 1.21kg',
      cmfColor: 'Aluminum / Titan Gray',
      display: '14", IPS, 1920x1200, 60Hz, 400nits',
      audio: 'Stereo Speaker, Waves MaxxAudio', webcam: '2MP 1080p + IR',
      ap: 'Intel Core Ultra 7 165H', graphics: 'Intel Arc (integrated)',
      memory: '16/32/64GB LPDDR5', storage: '256GB/512GB/1/2TB SSD',
      battery: '64Wh / 14h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI 2.1, SD, 3.5mm',
      security: 'Fingerprint, IR Camera, Smart Card, TPM 2.0',
    },
    'Alienware m16 R2 (2024)': {
      launch: '2024.01 / $2,299~', thicknessWeight: '25.4mm / 3.28kg',
      cmfColor: 'Aluminum / Dark Metallic Moon',
      display: '16", IPS QHD+, 165Hz, 500nits',
      audio: 'Four Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 9 185H', graphics: 'NVIDIA GeForce RTX 4090',
      memory: '16/32/64GB DDR5', storage: '1/2TB SSD',
      battery: '90Wh / 6h', adapter: '330W barrel',
      ports: 'TBT4(1), USB-A(4), USB-C, HDMI 2.1, RJ45, 3.5mm',
      security: 'Fingerprint',
    },
  },
  'HP': {
    'Spectre x360 14 (2024)': {
      launch: '2024.03 / $1,499~', thicknessWeight: '16.5mm / 1.41kg',
      cmfColor: 'Aluminum / Nightfall Black, Ceramic White',
      display: '14", OLED 2.8K Touch, 120Hz, 500nits(SDR), 1000nits(HDR)',
      audio: 'Four Speaker, Bang & Olufsen', webcam: '5MP 2K + IR',
      ap: 'Intel Core Ultra 7 165U', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB LPDDR5', storage: '512GB/1/2TB SSD',
      battery: '64Wh / 17h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'Spectre x360 16 (2024)': {
      launch: '2024.03 / $1,799~', thicknessWeight: '19.6mm / 1.93kg',
      cmfColor: 'Aluminum / Nightfall Black, Ceramic White',
      display: '16", OLED 2.8K Touch, 120Hz, 500nits(SDR), 1000nits(HDR)',
      audio: 'Four Speaker, Bang & Olufsen', webcam: '9MP 4K + IR',
      ap: 'Intel Core Ultra 7 165H', graphics: 'Intel Arc (integrated)',
      memory: '16/32/64GB LPDDR5', storage: '512GB/1/2TB SSD',
      battery: '83Wh / 14h', adapter: '95W USB-C',
      ports: 'TBT4(2), USB-A, HDMI, SD, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'Envy x360 14 (2024)': {
      launch: '2024.05 / $999~', thicknessWeight: '17.4mm / 1.57kg',
      cmfColor: 'Aluminum / Meteor Silver',
      display: '14", OLED 2.8K Touch, 120Hz, 500nits',
      audio: 'Stereo Speaker, Bang & Olufsen', webcam: '5MP 1080p + IR',
      ap: 'AMD Ryzen 7 8840HS', graphics: 'AMD Radeon 780M',
      memory: '16/32GB LPDDR5', storage: '512GB/1TB SSD',
      battery: '59.5Wh / 13h', adapter: '65W USB-C',
      ports: 'USB4(1), USB-A(2), USB-C, HDMI, SD, 3.5mm',
      security: 'Fingerprint, IR Camera',
    },
    'OmniBook X 14 (2024)': {
      launch: '2024.07 / $1,099~', thicknessWeight: '14.4mm / 1.34kg',
      cmfColor: 'Aluminum / Meteor Silver',
      display: '14", IPS 2.2K, 60Hz, 300nits',
      audio: 'Stereo Speaker, Bang & Olufsen', webcam: '5MP 1080p + IR',
      ap: 'Snapdragon X Elite', graphics: 'Qualcomm Adreno X1-85',
      memory: '16/32/64GB LPDDR5X', storage: '512GB/1TB SSD',
      battery: '59Wh / 26h', adapter: '65W USB-C',
      ports: 'USB4(2), USB-A, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'EliteBook 840 G11 (2024)': {
      launch: '2024.04 / $1,299~', thicknessWeight: '16.7mm / 1.28kg',
      cmfColor: 'Aluminum / Silver',
      display: '14", IPS WUXGA, 60Hz, 400nits',
      audio: 'Stereo Speaker, Bang & Olufsen', webcam: '9MP 4K + IR',
      ap: 'Intel Core Ultra 7 165U', graphics: 'Intel Arc (integrated)',
      memory: '16/32/64GB DDR5', storage: '256GB/512GB/1/2TB SSD',
      battery: '51Wh / 14h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI, SD, 3.5mm',
      security: 'Fingerprint, IR Camera, Smart Card, TPM 2.0',
    },
    'OMEN 16 (2024)': {
      launch: '2024.05 / $1,399~', thicknessWeight: '22.4mm / 2.4kg',
      cmfColor: 'Aluminum / Mica Silver',
      display: '16.1", IPS QHD, 240Hz, 500nits',
      audio: 'Four Speaker, Bang & Olufsen', webcam: '5MP 1080p + IR',
      ap: 'Intel Core Ultra 7 155H', graphics: 'NVIDIA GeForce RTX 4070',
      memory: '16/32GB DDR5', storage: '512GB/1/2TB SSD',
      battery: '83Wh / 7h', adapter: '200W barrel',
      ports: 'TBT4(1), USB-A(3), USB-C, HDMI 2.1, SD, RJ45, 3.5mm',
      security: 'Fingerprint',
    },
  },
  'ASUS': {
    'ZenBook 14 OLED UX3405 (2024)': {
      launch: '2024.05 / $999~', thicknessWeight: '14.9mm / 1.2kg',
      cmfColor: 'Aluminum / Ponder Blue, Jasper Grey, Platinum White',
      display: '14", OLED 2.8K, 120Hz, 550nits',
      audio: 'Stereo Speaker, Harman Kardon', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 155H', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB LPDDR5X', storage: '512GB/1TB SSD',
      battery: '75Wh / 15h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI 2.1, SD, 3.5mm',
      security: 'Fingerprint, IR Camera',
    },
    'ZenBook Pro 14 OLED UX6404 (2024)': {
      launch: '2024.03 / $1,499~', thicknessWeight: '18.9mm / 1.65kg',
      cmfColor: 'Aluminum / Tech Black',
      display: '14.5", OLED 2.8K Touch, 120Hz, 550nits',
      audio: 'Stereo Speaker, Harman Kardon, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 9 185H', graphics: 'NVIDIA GeForce RTX 4060',
      memory: '32GB DDR5', storage: '1TB SSD',
      battery: '76Wh / 10h', adapter: '120W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI 2.1, SD, 3.5mm',
      security: 'Fingerprint, IR Camera',
    },
    'Vivobook Pro 16 OLED K6604 (2024)': {
      launch: '2024.07 / $1,299~', thicknessWeight: '18.9mm / 1.88kg',
      cmfColor: 'Aluminum / Cool Silver, Quiet Blue',
      display: '16", OLED 3.2K, 120Hz, 550nits',
      audio: 'Four Speaker, Harman Kardon, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 9 185H', graphics: 'NVIDIA GeForce RTX 4060',
      memory: '16/32GB DDR5', storage: '512GB/1TB SSD',
      battery: '96Wh / 9h', adapter: '150W USB-C',
      ports: 'TBT4(1), USB-A(3), USB-C, HDMI 2.1, SD, 3.5mm',
      security: 'Fingerprint',
    },
    'ROG Zephyrus G16 GU605 (2024)': {
      launch: '2024.03 / $1,999~', thicknessWeight: '19.9mm / 1.85kg',
      cmfColor: 'Aluminum / Eclipse Gray, Platinum White',
      display: '16", OLED 2.5K, 240Hz, 500nits(SDR), 1000nits(HDR)',
      audio: 'Quad Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 9 185H', graphics: 'NVIDIA GeForce RTX 4090',
      memory: '32/64GB DDR5', storage: '1/2TB SSD',
      battery: '90Wh / 10h', adapter: '240W barrel',
      ports: 'TBT4(1), USB-A(4), USB-C, HDMI 2.1, SD, 3.5mm',
      security: 'Fingerprint',
    },
    'ProArt Studiobook 16 OLED H7604 (2024)': {
      launch: '2024.01 / $2,999~', thicknessWeight: '18.9mm / 1.85kg',
      cmfColor: 'Aluminum / Tech Black',
      display: '16", OLED 3.2K Touch, 120Hz, 550nits(SDR), 1000nits(HDR)',
      audio: 'Four Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 9 185H', graphics: 'NVIDIA GeForce RTX 4090',
      memory: '32/64GB DDR5', storage: '1/2TB SSD',
      battery: '96Wh / 8h', adapter: '240W barrel',
      ports: 'TBT4(2), USB-A(3), USB-C, HDMI 2.1, SD, 3.5mm',
      security: 'Fingerprint, IR Camera',
    },
    'ExpertBook B9 B9403 (2024)': {
      launch: '2024.01 / $1,699~', thicknessWeight: '14.9mm / 0.99kg',
      cmfColor: 'Magnesium-Aluminum Alloy / Star Black',
      display: '14", OLED 2.8K, 60Hz, 500nits',
      audio: 'Stereo Speaker, Harman Kardon', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 165U', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB LPDDR5', storage: '512GB/1TB SSD',
      battery: '75Wh / 16h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI 2.1, 3.5mm',
      security: 'Fingerprint, IR Camera, TPM 2.0',
    },
  },
  'Huawei': {
    'MateBook X Pro (2024)': {
      launch: '2024.04 / $1,799~', thicknessWeight: '15.6mm / 1.26kg',
      cmfColor: 'Aluminum / Space Gray, Space White, Ink Blue',
      display: '14.2", OLED 3.1K Touch, 90Hz, 600nits',
      audio: 'Six Speaker, Huawei Sound', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 155H', graphics: 'Intel Arc (integrated)',
      memory: '16/32/64GB LPDDR5', storage: '1/2TB SSD',
      battery: '70Wh / 16h', adapter: '90W USB-C',
      ports: 'TBT4(2), USB-C, 3.5mm', security: 'Fingerprint',
    },
    'MateBook 16s (2024)': {
      launch: '2024.04 / $1,599~', thicknessWeight: '17.4mm / 1.75kg',
      cmfColor: 'Aluminum / Space Gray',
      display: '16", IPS 2.5K Touch, 165Hz, 500nits',
      audio: 'Six Speaker, Huawei Sound', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 9 185H', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB DDR5', storage: '1TB SSD',
      battery: '84Wh / 12h', adapter: '135W USB-C',
      ports: 'TBT4(2), USB-A(3), HDMI 2.1, SD, 3.5mm', security: 'Fingerprint',
    },
    'MateBook D16 (2024)': {
      launch: '2024.01 / $899~', thicknessWeight: '17.9mm / 1.68kg',
      cmfColor: 'Aluminum / Space Gray',
      display: '16", IPS 1920x1200, 60Hz, 300nits',
      audio: 'Stereo Speaker', webcam: '1080p',
      ap: 'Intel Core Ultra 5 125H', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB DDR5', storage: '512GB/1TB SSD',
      battery: '60Wh / 12h', adapter: '65W USB-C',
      ports: 'TBT4(1), USB-A(3), HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
    'MateBook D14 (2024)': {
      launch: '2024.01 / $799~', thicknessWeight: '15.9mm / 1.38kg',
      cmfColor: 'Aluminum / Space Gray',
      display: '14", IPS 1920x1080, 60Hz, 300nits',
      audio: 'Stereo Speaker', webcam: '1080p',
      ap: 'Intel Core Ultra 5 125H', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB DDR5', storage: '512GB SSD',
      battery: '56Wh / 11h', adapter: '65W USB-C',
      ports: 'TBT4(1), USB-A(3), HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
    'MateBook 14 (2024)': {
      launch: '2024.04 / $1,099~', thicknessWeight: '15.4mm / 1.44kg',
      cmfColor: 'Aluminum / Space Gray, Space White',
      display: '14.2", IPS 2.5K, 60Hz, 400nits',
      audio: 'Stereo Speaker', webcam: '1080p',
      ap: 'Intel Core Ultra 5 125H', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB DDR5', storage: '512GB/1TB SSD',
      battery: '70Wh / 14h', adapter: '90W USB-C',
      ports: 'TBT4(1), USB-A(2), HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
  },
  'Xiaomi': {
    'Book Pro 14 (2024)': {
      launch: '2024.04 / $1,099~', thicknessWeight: '14.5mm / 1.26kg',
      cmfColor: 'Aluminum / Silver',
      display: '14.5", OLED 2.8K, 144Hz, 600nits',
      audio: 'Four Speaker, Dolby Atmos', webcam: '1080p',
      ap: 'Intel Core Ultra 7 155H', graphics: 'Intel Arc (integrated)',
      memory: '32GB LPDDR5', storage: '1TB SSD',
      battery: '70Wh / 15h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A, HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
    'Book Pro 16 (2024)': {
      launch: '2024.04 / $1,299~', thicknessWeight: '16.9mm / 1.6kg',
      cmfColor: 'Aluminum / Silver',
      display: '16", OLED 3.2K, 120Hz, 600nits',
      audio: 'Four Speaker, Dolby Atmos', webcam: '1080p',
      ap: 'Intel Core Ultra 7 155H', graphics: 'Intel Arc (integrated)',
      memory: '32GB LPDDR5', storage: '1TB SSD',
      battery: '80Wh / 13h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
    'RedmiBook Pro 15 (2024)': {
      launch: '2024.04 / $899~', thicknessWeight: '17.9mm / 1.6kg',
      cmfColor: 'Aluminum / Silver',
      display: '15.6", OLED 2.8K, 120Hz, 600nits',
      audio: 'Four Speaker, Dolby Atmos', webcam: '1080p',
      ap: 'Intel Core Ultra 5 125H', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB DDR5', storage: '512GB/1TB SSD',
      battery: '70Wh / 12h', adapter: '65W USB-C',
      ports: 'TBT4(1), USB-A(2), USB-C, HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
    'RedmiBook 16 (2024)': {
      launch: '2024.04 / $699~', thicknessWeight: '17.9mm / 1.78kg',
      cmfColor: 'Aluminum / Silver, Gray',
      display: '16", IPS 2.5K, 120Hz, 400nits',
      audio: 'Stereo Speaker', webcam: '720p',
      ap: 'Intel Core Ultra 5 125H', graphics: 'Intel Arc (integrated)',
      memory: '16GB DDR5', storage: '512GB SSD',
      battery: '72Wh / 12h', adapter: '65W USB-C',
      ports: 'USB-C(2), USB-A(2), HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
    'RedmiBook 14 (2024)': {
      launch: '2024.01 / $599~', thicknessWeight: '16.9mm / 1.45kg',
      cmfColor: 'Aluminum / Silver',
      display: '14", IPS 2K, 120Hz, 400nits',
      audio: 'Stereo Speaker', webcam: '720p',
      ap: 'Intel Core 5 120U / Ryzen 5 8500U', graphics: 'Intel Graphics / AMD Radeon',
      memory: '16GB DDR5', storage: '512GB SSD',
      battery: '56Wh / 12h', adapter: '65W USB-C',
      ports: 'USB-C(2), USB-A(2), HDMI, SD, 3.5mm', security: 'Fingerprint',
    },
  },
  'Samsung': {
    'Galaxy Book6 Ultra 16" (2026)': {
      launch: '2026.03 / $2,449~', thicknessWeight: '~14mm / ~1.80kg',
      cmfColor: 'Aluminum / Gray',
      display: '16", Dynamic AMOLED 2x, 2880x1800, 120Hz, 1000nits',
      audio: 'AKG Four Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra X9 Series 3', graphics: 'NVIDIA GeForce RTX 5050',
      memory: '32GB LPDDR5X', storage: '1TB NVMe SSD',
      battery: '76Wh / 30h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI 2.1, microSD, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'Galaxy Book6 Pro 16" (2026)': {
      launch: '2026.03 / $1,599~', thicknessWeight: '14.9mm / 1.59kg',
      cmfColor: 'Aluminum / Gray',
      display: '16", Dynamic AMOLED 2x, 2880x1800, 120Hz, 1000nits',
      audio: 'AKG Four Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 Series 3', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB LPDDR5X', storage: '512GB/1TB NVMe SSD',
      battery: '78Wh / 30h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI 2.1, microSD, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'Galaxy Book6 Pro 14" (2026)': {
      launch: '2026.03 / $1,399~', thicknessWeight: '12.5mm / 1.23kg',
      cmfColor: 'Aluminum / Gray',
      display: '14", Dynamic AMOLED 2x, 2880x1800, 120Hz, 1000nits',
      audio: 'AKG Stereo Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 Series 3', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB LPDDR5X', storage: '512GB/1TB NVMe SSD',
      battery: '67Wh / 30h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI 2.1, microSD, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'Galaxy Book5 Pro 360 16" (2025)': {
      launch: '2025.01 / $1,699~', thicknessWeight: '12.3mm / 1.70kg',
      cmfColor: 'Aluminum + Glass / Moonstone Gray',
      display: '16", AMOLED 2.8K, 2880x1800, 120Hz, 500nits Touch',
      audio: 'AKG Stereo Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Snapdragon X Elite X1E-80-100', graphics: 'Qualcomm Adreno X1-85',
      memory: '16/32GB LPDDR5X', storage: '512GB/1TB NVMe SSD',
      battery: '76Wh / 22h', adapter: '65W USB-C',
      ports: 'USB4(2), USB-A(2), HDMI 2.1, microSD, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'Galaxy Book5 Pro 16" (2025)': {
      launch: '2025.01 / $1,599~', thicknessWeight: '14.9mm / 1.73kg',
      cmfColor: 'Aluminum / Moonstone Gray, Silver Blue',
      display: '16", AMOLED 2.8K, 2880x1800, 120Hz, 500nits',
      audio: 'AKG Stereo Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 258V', graphics: 'Intel Arc 140V',
      memory: '16/32GB LPDDR5X', storage: '512GB/1TB NVMe SSD',
      battery: '76Wh / 25h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI 2.1, microSD, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'Galaxy Book5 Pro 14" (2025)': {
      launch: '2025.01 / $1,399~', thicknessWeight: '12.3mm / 1.23kg',
      cmfColor: 'Aluminum / Moonstone Gray, Silver Blue',
      display: '14", AMOLED 2.8K, 2880x1800, 120Hz, 500nits',
      audio: 'AKG Stereo Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 258V / Snapdragon X Elite', graphics: 'Intel Arc 140V / Adreno X1-85',
      memory: '16/32GB LPDDR5X', storage: '512GB/1TB NVMe SSD',
      battery: '63Wh / 25h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A, HDMI 2.1, microSD, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'Galaxy Book4 Ultra (2024)': {
      launch: '2024.03 / $2,499~', thicknessWeight: '16.5mm / 1.86kg',
      cmfColor: 'Aluminum / Moonstone Gray, Platinum Silver',
      display: '16", AMOLED 3.2K, 2880x1800, 120Hz, 500nits',
      audio: 'AKG Four Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 9 185H', graphics: 'NVIDIA GeForce RTX 4050',
      memory: '16/32/64GB DDR5', storage: '512GB/1TB/2TB NVMe SSD',
      battery: '76Wh / 13h', adapter: '140W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI 2.1, microSD, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'Galaxy Book4 Pro 360 16" (2024)': {
      launch: '2024.03 / $1,699~', thicknessWeight: '13.2mm / 1.75kg',
      cmfColor: 'Aluminum + Glass / Moonstone Gray, Platinum Silver',
      display: '16", AMOLED 2.8K, 2880x1800, 120Hz, 500nits Touch',
      audio: 'AKG Four Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 165H', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB LPDDR5', storage: '512GB/1TB NVMe SSD',
      battery: '76Wh / 21h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI 2.1, microSD, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'Galaxy Book4 Pro 16" (2024)': {
      launch: '2024.03 / $1,499~', thicknessWeight: '14.9mm / 1.78kg',
      cmfColor: 'Aluminum / Moonstone Gray, Platinum Silver',
      display: '16", AMOLED 2.8K, 2880x1800, 120Hz, 500nits',
      audio: 'AKG Four Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 165H', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB LPDDR5', storage: '512GB/1TB NVMe SSD',
      battery: '76Wh / 22h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI 2.1, microSD, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'Galaxy Book4 Pro 14" (2024)': {
      launch: '2024.03 / $1,349~', thicknessWeight: '12.5mm / 1.23kg',
      cmfColor: 'Aluminum / Moonstone Gray, Platinum Silver',
      display: '14", AMOLED 2.8K, 2880x1800, 120Hz, 500nits',
      audio: 'AKG Stereo Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Intel Core Ultra 7 155H', graphics: 'Intel Arc (integrated)',
      memory: '16/32GB LPDDR5', storage: '512GB/1TB NVMe SSD',
      battery: '63Wh / 22h', adapter: '65W USB-C',
      ports: 'TBT4(2), USB-A(2), HDMI 2.1, microSD, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'Galaxy Book4 Edge 16" (2024)': {
      launch: '2024.07 / $1,399~', thicknessWeight: '11.5mm / 1.55kg',
      cmfColor: 'Aluminum / Sapphire Blue',
      display: '16", AMOLED 2.8K, 2880x1800, 120Hz, 500nits',
      audio: 'AKG Four Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Snapdragon X Plus X1P-64-100', graphics: 'Qualcomm Adreno X1-45',
      memory: '16/32/64GB LPDDR5X', storage: '512GB/1TB NVMe SSD',
      battery: '61Wh / 22h', adapter: '65W USB-C',
      ports: 'USB4(2), USB-A, HDMI 2.1, microSD, 3.5mm', security: 'Fingerprint, IR Camera',
    },
    'Galaxy Book4 Edge 14" (2024)': {
      launch: '2024.07 / $1,349~', thicknessWeight: '11.5mm / 1.17kg',
      cmfColor: 'Aluminum / Sapphire Blue',
      display: '14", AMOLED 2.8K, 2880x1800, 120Hz, 500nits',
      audio: 'AKG Stereo Speaker, Dolby Atmos', webcam: '1080p + IR',
      ap: 'Snapdragon X Elite X1E-80-100', graphics: 'Qualcomm Adreno X1-85',
      memory: '16/32/64GB LPDDR5X', storage: '512GB/1TB NVMe SSD',
      battery: '55Wh / 22h', adapter: '65W USB-C',
      ports: 'USB4(2), USB-A, HDMI 2.1, microSD, 3.5mm', security: 'Fingerprint, IR Camera',
    },
  },
}

async function getPCProductList(manufacturer) {
  try {
    const res = await fetch(PC_PRODUCTS_JSON_URL)
    if (res.ok) {
      const data = await res.json()
      if (data[manufacturer]) return data[manufacturer].map(p => p.name)
    }
  } catch {}
  return (FALLBACK_PC_DB[manufacturer] || []).map(p => p.name)
}

function getPCImageUrl(manufacturer, model) {
  if (manufacturer === 'Apple') {
    if (model.includes('Air')) return 'https://www.apple.com/v/macbook-air/z/images/meta/macbook_air_mx__ez5y0k5yy7au_og.png'
    if (model.includes('Pro')) return 'https://www.apple.com/v/macbook-pro/ax/images/meta/macbook-pro__difvbgz1plsi_og.png'
  }
  if (manufacturer === 'Samsung') return 'https://images.samsung.com/is/content/samsung/p6pim/us/np960xha-kg2us/gallery/us-galaxy-book5-pro-14-inch-np940-578328-np960xha-kg2us-551312392.webp'
  if (manufacturer === 'LG') return 'https://media.us.lg.com/transform/ecomm-PDPGalleryThumbnail-350x350/298b0212-786a-4586-ad34-d88a66d459a1/16Z90S-H-ADB9U1_gallery_01_5000x5000'
  if (manufacturer === 'ASUS' && model.includes('ZenBook')) return 'https://dlcdnwebimgs.asus.com/gain/282fa6b1-5d9e-4950-ab46-1da2defbe6a3/'
  return null
}

async function getPCSpecs(manufacturer, model) {
  const specs = FALLBACK_PC_SPECS[manufacturer]?.[model]
    ? { ...FALLBACK_PC_SPECS[manufacturer][model] }
    : {}
  const imgUrl = getPCImageUrl(manufacturer, model)
  if (imgUrl) specs.imageUrl = imgUrl
  return specs
}