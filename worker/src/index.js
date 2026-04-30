// Tablet Compare Worker v5
// 스펙: devicespecifications.com
// AP 성능: 칩셋 하드코딩 DB (Geekbench 6 평균)
// 제품목록: GitHub Actions JSON → fallback DB

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

const CHIP_DB = {
  'Apple M4':         { single: 3864, multi: 15119, npu: '38 TOPS' },
  'Apple M4 Pro':     { single: 4020, multi: 23000, npu: '38 TOPS' },
  'Apple M3':         { single: 3190, multi: 12640, npu: '18 TOPS' },
  'Apple M3 Pro':     { single: 3220, multi: 15000, npu: '18 TOPS' },
  'Apple M2':         { single: 2670, multi: 10600, npu: '15.8 TOPS' },
  'Apple M2 Pro':     { single: 2700, multi: 13800, npu: '15.8 TOPS' },
  'Apple M1':         { single: 2370, multi: 8620,  npu: '11 TOPS' },
  'Apple A17 Pro':    { single: 2900, multi: 7200,  npu: '35 TOPS' },
  'Apple A16 Bionic': { single: 2520, multi: 6360,  npu: '17 TOPS' },
  'Apple A15 Bionic': { single: 2370, multi: 5660,  npu: '15.8 TOPS' },
  'Apple A14 Bionic': { single: 1990, multi: 4900,  npu: '11 TOPS' },
  'Snapdragon 8 Elite':   { single: 2900, multi: 9200, npu: '45 TOPS' },
  'Snapdragon 8 Gen 3':   { single: 2200, multi: 6900, npu: '45 TOPS' },
  'Snapdragon 8 Gen 2':   { single: 1990, multi: 5500, npu: '26 TOPS' },
  'Snapdragon 8cx Gen 3': { single: 1450, multi: 6800, npu: null },
  'Dimensity 9400+':  { single: 2850, multi: 9100, npu: '35 TOPS' },
  'Dimensity 9400':   { single: 2780, multi: 8800, npu: '35 TOPS' },
  'Dimensity 9300+':  { single: 2100, multi: 7200, npu: '33 TOPS' },
  'Dimensity 9300':   { single: 2050, multi: 6900, npu: '33 TOPS' },
  'Dimensity 9200+':  { single: 1800, multi: 5600, npu: '22 TOPS' },
  'Dimensity 9000':   { single: 1490, multi: 4900, npu: '4.7 TOPS' },
  'Exynos 2400':      { single: 1900, multi: 7100, npu: '34.4 TOPS' },
  'Exynos 2200':      { single: 1350, multi: 4200, npu: '22 TOPS' },
  'Intel Core Ultra 5': { single: 2200, multi: 10500, npu: '34 TOPS' },
  'Intel Core Ultra 7': { single: 2400, multi: 12000, npu: '34 TOPS' },
  'Kirin 9010':       { single: 1200, multi: 4800, npu: '20 TOPS' },
  'Kirin 9000S':      { single: 1050, multi: 3900, npu: '10 TOPS' },
}

const FALLBACK_DB = {
  'Apple': [
    { name: 'iPad Air 13 (2026)', dsId: 'apple-ipad-air-13-wi-fi-2026' },
    { name: 'iPad Air 11 (2026)', dsId: 'apple-ipad-air-11-wi-fi-2026' },
    { name: 'iPad Pro 13 (2025)', dsId: 'apple-ipad-pro-13-wi-fi-2025' },
    { name: 'iPad Pro 11 (2025)', dsId: 'apple-ipad-pro-11-wi-fi-2025' },
    { name: 'iPad Air 13 (2025)', dsId: 'c5e362c3' },
    { name: 'iPad Air 11 (2025)', dsId: 'apple-ipad-air-11-2025' },
    { name: 'iPad (2025)',        dsId: 'apple-ipad-2025' },
    { name: 'iPad mini (2024)',   dsId: 'apple-ipad-mini-2024' },
    { name: 'iPad Pro 13 (2024)', dsId: 'apple-ipad-pro-13-2024' },
    { name: 'iPad Pro 11 (2024)', dsId: 'apple-ipad-pro-11-2024' },
    { name: 'iPad Air 13 (2024)', dsId: 'dab35fe1' },
    { name: 'iPad Air 11 (2024)', dsId: 'apple-ipad-air-11-2024' },
    { name: 'iPad Pro 12.9 (2022)', dsId: 'apple-ipad-pro-12-9-2022' },
    { name: 'iPad Pro 11 (2022)', dsId: 'apple-ipad-pro-11-2022' },
    { name: 'iPad (2022)',        dsId: 'apple-ipad-2022' },
    { name: 'iPad Air (2022)',    dsId: 'apple-ipad-air-2022' },
    { name: 'iPad mini (2021)',   dsId: 'apple-ipad-mini-2021' },
  ],
  'Samsung': [
    { name: 'Galaxy Tab S11 Ultra', dsId: '540864a1' },
    { name: 'Galaxy Tab S11',       dsId: 'samsung-galaxy-tab-s11' },
    { name: 'Galaxy Tab S10 Ultra', dsId: 'samsung-galaxy-tab-s10-ultra' },
    { name: 'Galaxy Tab S10+',      dsId: 'samsung-galaxy-tab-s10-plus' },
    { name: 'Galaxy Tab S10',       dsId: 'samsung-galaxy-tab-s10' },
    { name: 'Galaxy Tab S10 FE',    dsId: 'samsung-galaxy-tab-s10-fe' },
    { name: 'Galaxy Tab S9 Ultra',  dsId: 'samsung-galaxy-tab-s9-ultra' },
    { name: 'Galaxy Tab S9+',       dsId: 'samsung-galaxy-tab-s9-plus' },
    { name: 'Galaxy Tab S9',        dsId: 'samsung-galaxy-tab-s9' },
    { name: 'Galaxy Tab S9 FE',     dsId: 'samsung-galaxy-tab-s9-fe' },
    { name: 'Galaxy Tab A9+',       dsId: 'samsung-galaxy-tab-a9-plus' },
    { name: 'Galaxy Tab A9',        dsId: 'samsung-galaxy-tab-a9' },
    { name: 'Galaxy Tab S8 Ultra',  dsId: 'samsung-galaxy-tab-s8-ultra' },
    { name: 'Galaxy Tab S8+',       dsId: 'samsung-galaxy-tab-s8-plus' },
    { name: 'Galaxy Tab S8',        dsId: 'samsung-galaxy-tab-s8' },
  ],
  'Xiaomi': [
    { name: 'Xiaomi Pad 7 Ultra',     dsId: 'xiaomi-pad-7-ultra' },
    { name: 'Xiaomi Pad 7 Pro',       dsId: 'xiaomi-pad-7-pro' },
    { name: 'Xiaomi Pad 7',           dsId: 'xiaomi-pad-7' },
    { name: 'Xiaomi Pad 6S Pro 12.4', dsId: 'xiaomi-pad-6s-pro-12-4' },
    { name: 'Xiaomi Pad 6 Pro',       dsId: 'xiaomi-pad-6-pro' },
    { name: 'Xiaomi Pad 6',           dsId: 'xiaomi-pad-6' },
    { name: 'Xiaomi Pad 5 Pro',       dsId: 'xiaomi-pad-5-pro' },
    { name: 'Xiaomi Pad 5',           dsId: 'xiaomi-pad-5' },
    { name: 'Redmi Pad Pro',          dsId: 'xiaomi-redmi-pad-pro' },
    { name: 'Redmi Pad SE',           dsId: 'xiaomi-redmi-pad-se' },
    { name: 'Redmi Pad 2',            dsId: 'xiaomi-redmi-pad-2' },
  ],
  'Lenovo': [
    { name: 'Tab Extreme',        dsId: 'lenovo-tab-extreme' },
    { name: 'Tab P12 Pro',        dsId: 'lenovo-tab-p12-pro' },
    { name: 'Tab P12',            dsId: 'lenovo-tab-p12' },
    { name: 'Tab P11 Pro Gen 2',  dsId: 'lenovo-tab-p11-pro-gen-2' },
    { name: 'Tab P11 Gen 2',      dsId: 'lenovo-tab-p11-gen-2' },
    { name: 'Tab M11',            dsId: 'lenovo-tab-m11' },
    { name: 'Tab M10 Plus Gen 3', dsId: 'lenovo-tab-m10-plus-gen-3' },
  ],
  'Huawei': [
    { name: 'MatePad Pro 13.2',      dsId: 'huawei-matepad-pro-13-2' },
    { name: 'MatePad Pro 11 (2024)', dsId: 'huawei-matepad-pro-11-2024' },
    { name: 'MatePad 11.5 S',        dsId: 'huawei-matepad-11-5-s' },
    { name: 'MatePad Air',           dsId: 'huawei-matepad-air' },
    { name: 'MatePad 11 (2023)',      dsId: 'huawei-matepad-11-2023' },
  ],
  'Microsoft': [
    { name: 'Surface Pro 11', dsId: 'microsoft-surface-pro-11' },
    { name: 'Surface Pro 10', dsId: 'microsoft-surface-pro-10' },
    { name: 'Surface Pro 9',  dsId: 'microsoft-surface-pro-9' },
    { name: 'Surface Go 4',   dsId: 'microsoft-surface-go-4' },
  ],
  'Google':  [{ name: 'Pixel Tablet (2023)', dsId: 'google-pixel-tablet-2023' }],
  'ASUS':    [{ name: 'ROG Flow Z13 (2024)', dsId: 'asus-rog-flow-z13-2024' }],
  'OnePlus': [
    { name: 'OnePlus Pad 2',  dsId: 'oneplus-pad-2' },
    { name: 'OnePlus Pad Go', dsId: 'oneplus-pad-go' },
    { name: 'OnePlus Pad',    dsId: 'oneplus-pad' },
  ],
  'Sony': [{ name: 'Xperia Z4 Tablet', dsId: 'sony-xperia-z4-tablet' }],
}

const PRODUCTS_JSON_URL = 'https://raw.githubusercontent.com/Dalbonz/tablet-compare/main/products.json'

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
    const res = await fetch(PRODUCTS_JSON_URL, { cf: { cacheTtl: 3600, cacheEverything: true } })
    if (res.ok) {
      const data = await res.json()
      if (data[manufacturer]) return data[manufacturer].map(p => p.name)
    }
  } catch {}
  return (FALLBACK_DB[manufacturer] || []).map(p => p.name)
}

async function getDsId(manufacturer, model) {
  try {
    const res = await fetch(PRODUCTS_JSON_URL, { cf: { cacheTtl: 3600, cacheEverything: true } })
    if (res.ok) {
      const data = await res.json()
      const entry = (data[manufacturer] || []).find(p => p.name === model)
      if (entry) return entry.dsId
    }
  } catch {}
  const entry = (FALLBACK_DB[manufacturer] || []).find(p => p.name === model)
  return entry?.dsId || null
}

async function getSpecs(manufacturer, model) {
  const dsId = await getDsId(manufacturer, model)
  const specs = {}
  if (dsId) {
    const html = await fetchHtml(`https://www.devicespecifications.com/en/model/${dsId}`)
    if (html) {
      parseDeviceSpecs(html, specs)
      const imgMatch = html.match(/property="og:image"[^>]+content="([^"]+)"/)
      if (imgMatch) specs.imageUrl = imgMatch[1]
    }
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
    }
  }
  return specs
}

function parseDeviceSpecs(html, specs) {
  const metaMatch = html.match(/name="description"\s+content="([^"]+)"/i)
    || html.match(/content="([^"]+)"\s+name="description"/i)
  if (!metaMatch) return
  const desc = metaMatch[1]
  const get = (key) => {
    const re = new RegExp(`${key}:\\s*([^,]+(?:mm|g|GB|mAh|in)[^,]*)`, 'i')
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
  specs.ram        = get('RAM')
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
  const bGet = (key) => {
    const re = new RegExp(`<b>${key}<\\/b>:\\s*([^<]+)`, 'i')
    const m = html.match(re)
    return m ? m[1].trim() : null
  }
  specs.wlan      = bGet('Wi-Fi')
  specs.bluetooth = bGet('Bluetooth')
  specs.usb       = bGet('USB')
  specs.gps       = bGet('Positioning') || bGet('GPS')
  const camRaw = bGet('Camera')
  if (camRaw) specs.rearCamera = camRaw.split(',')[0]?.trim()
  const hzMatch = html.match(/(\d+)\s*Hz/i)
  if (hzMatch) specs.refreshRate = hzMatch[1] + ' Hz'
  const nitsMatch = html.match(/([\d,]+)\s*nits/i)
  if (nitsMatch) specs.brightness = nitsMatch[1].replace(',','') + ' nits'
  const wattMatch = html.match(/(\d+)\s*W\s*(?:charging|fast)/i)
  if (wattMatch) specs.charging = wattMatch[1] + 'W'
  const ppiMatch = html.match(/([\d]+)\s*ppi/i)
  if (ppiMatch) specs.ppi = ppiMatch[1] + ' ppi'
  const priceMatch = desc.match(/\$[\d,]+/)
  if (priceMatch) specs.price = priceMatch[0]
  specs.nfc       = html.match(/\bNFC\b/i) ? '있음' : '없음'
  specs.headphone = html.match(/3\.5\s*mm/i) ? '있음' : '없음'
  if (html.match(/4\s*speakers|quad\s*speaker/i)) specs.speakers = '4채널'
  else if (html.match(/[Ss]tereo\s*speakers/i)) specs.speakers = '스테레오'
  else if (html.match(/[Ss]ingle\s*speaker/i)) specs.speakers = '모노'
}

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      cf: { cacheTtl: 3600, cacheEverything: true },
    })
    if (!res.ok) return null
    return await res.text()
  } catch { return null }
}

