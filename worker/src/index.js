// Tablet Compare Worker v6
// 수정: RAM GB만 추출, 카메라 MP 변환, refreshRate 정확히 파싱

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

const CHIP_DB = {
  'Apple M5':         { single: 4200, multi: 17000, npu: '50 TOPS' },
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
  'Snapdragon 8s Gen 3':  { single: 2100, multi: 6500, npu: '45 TOPS' },
  'Snapdragon 8 Gen 3':   { single: 2200, multi: 6900, npu: '45 TOPS' },
  'Snapdragon 8 Gen 2':   { single: 1990, multi: 5500, npu: '26 TOPS' },
  'Snapdragon 8 Gen 1':   { single: 1470, multi: 4800, npu: '26 TOPS' },
  'Snapdragon 8+ Gen 1':  { single: 1580, multi: 5000, npu: '26 TOPS' },
  'Snapdragon 870':       { single: 1120, multi: 3800, npu: null },
  'Snapdragon 7+ Gen 3':  { single: 1800, multi: 5200, npu: null },
  'Snapdragon 7s Gen 1':  { single: 1050, multi: 3200, npu: null },
  'Snapdragon 680':       { single: 620,  multi: 1800, npu: null },
  'Snapdragon 8cx Gen 3': { single: 1450, multi: 6800, npu: null },
  'Dimensity 9400+': { single: 2850, multi: 9100, npu: '35 TOPS' },
  'Dimensity 9400':  { single: 2780, multi: 8800, npu: '35 TOPS' },
  'Dimensity 9300+': { single: 2100, multi: 7200, npu: '33 TOPS' },
  'Dimensity 9300':  { single: 2050, multi: 6900, npu: '33 TOPS' },
  'Dimensity 9200+': { single: 1800, multi: 5600, npu: '22 TOPS' },
  'Dimensity 9000':  { single: 1490, multi: 4900, npu: '4.7 TOPS' },
  'Exynos 2400':     { single: 1900, multi: 7100, npu: '34.4 TOPS' },
  'Exynos 1580':     { single: 1100, multi: 3800, npu: null },
  'Exynos 1380':     { single: 920,  multi: 3200, npu: null },
  'Exynos 2200':     { single: 1350, multi: 4200, npu: '22 TOPS' },
  'Intel Core Ultra 5': { single: 2200, multi: 10500, npu: '34 TOPS' },
  'Intel Core Ultra 7': { single: 2400, multi: 12000, npu: '34 TOPS' },
  'Kirin 9010':  { single: 1200, multi: 4800, npu: '20 TOPS' },
  'Kirin 9000S': { single: 1050, multi: 3900, npu: '10 TOPS' },
  'Helio G99':   { single: 820,  multi: 2800, npu: null },
  'Helio G85':   { single: 520,  multi: 1600, npu: null },
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
    { name: 'Galaxy Tab S11 Ultra', dsId: '540864a1' },
    { name: 'Galaxy Tab S11',       dsId: 'd23d649f' },
    { name: 'Galaxy Tab S10 Ultra', dsId: '577e613d' },
    { name: 'Galaxy Tab S10+',      dsId: '89d0613e' },
    { name: 'Galaxy Tab S10 FE',    dsId: 'ee8362ea' },
    { name: 'Galaxy Tab S9 Ultra',  dsId: 'e5835d57' },
    { name: 'Galaxy Tab S9+',       dsId: '8cd35d55' },
    { name: 'Galaxy Tab S9',        dsId: '3e195d54' },
    { name: 'Galaxy Tab S9 FE',     dsId: 'b0925df5' },
    { name: 'Galaxy Tab A9+',       dsId: '7c7d5e01' },
    { name: 'Galaxy Tab A9',        dsId: '7c385dff' },
    { name: 'Galaxy Tab S8 Ultra',  dsId: '0a455896' },
    { name: 'Galaxy Tab S8+',       dsId: 'b4cc5895' },
    { name: 'Galaxy Tab S8',        dsId: '3a7c5893' },
  ],
  'Xiaomi': [
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
    { name: 'OnePlus Pad 2',  dsId: '1f3c60c2' },
    { name: 'OnePlus Pad Go', dsId: '33c25dfd' },
    { name: 'OnePlus Pad',    dsId: 'c80a5bd7' },
  ],
  'Sony': [{ name: 'Xperia Z4 Tablet', dsId: '3f0036f3' }],
}

// 픽셀 해상도 → MP 변환
function pixelsToMP(w, h) {
  const mp = (w * h) / 1000000
  return Math.round(mp) + 'MP'
}

// 카메라 해상도 문자열 → MP
function parseCamera(raw) {
  if (!raw) return null
  // "4032 x 3024 pixels" 패턴
  const m = raw.match(/(\d+)\s*x\s*(\d+)\s*pixels/i)
  if (m) return pixelsToMP(parseInt(m[1]), parseInt(m[2]))
  // 이미 MP면 그대로
  if (raw.includes('MP')) return raw
  return raw
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

    // RAM - GB 단위만 추출 (MHz 제외)
    const ramMatch = desc.match(/RAM:\s*(\d+)\s*GB/i)
    if (ramMatch) specs.ram = ramMatch[1] + ' GB'

    // 디스플레이
    const dispMatch = desc.match(/Display:\s*([\d.]+\s*in),\s*([^,]+),\s*([\d]+\s*x\s*[\d]+\s*pixels)/i)
    if (dispMatch) {
      specs.displaySize = dispMatch[1]
      specs.displayType = dispMatch[2].trim()
      specs.resolution  = dispMatch[3].trim()
    }

    // OS
    const osMatch = desc.match(/OS:\s*([^\.\"]+)/i)
    if (osMatch) specs.os = osMatch[1].trim()

    // 카메라 (meta에서) → MP 변환
    const camMatch = desc.match(/Camera:\s*([\d]+\s*x\s*[\d]+)\s*pixels/i)
    if (camMatch) {
      const parts = camMatch[1].split('x').map(s => parseInt(s.trim()))
      specs.rearCamera = pixelsToMP(parts[0], parts[1])
    }
  }

  // b태그 파싱
  const bGet = (key) => {
    const re = new RegExp(`<b>${key}<\\/b>:\\s*([^<]+)`, 'i')
    const m = html.match(re)
    return m ? m[1].trim() : null
  }

  specs.wlan      = bGet('Wi-Fi')
  const bt = bGet('Bluetooth')
  if (bt) specs.bluetooth = 'Bluetooth ' + bt
  specs.usb       = bGet('USB')
  specs.gps       = bGet('Positioning') || bGet('GPS')
  specs.sim       = bGet('SIM card')

  // 카메라 - b태그에서 더 자세히
  const camRaw = bGet('Camera')
  if (camRaw) {
    // "4032 x 3024 pixels, 3840 x 2160 pixels, 30 fps" 패턴
    const camParts = camRaw.split(',')
    const rearMatch = camParts[0]?.match(/(\d+)\s*x\s*(\d+)\s*pixels/i)
    if (rearMatch) specs.rearCamera = pixelsToMP(parseInt(rearMatch[1]), parseInt(rearMatch[2]))
  }

  // 전면 카메라 - 두 번째 해상도 값은 영상이므로 제외
  // devicespecifications에 전면 카메라 별도 태그 없음 → 생략

  // 주사율 - displayType에서만
  if (specs.displayType) {
    const hzMatch = specs.displayType.match(/(\d+)\s*Hz/i)
    if (hzMatch && parseInt(hzMatch[1]) > 30) specs.refreshRate = hzMatch[1] + ' Hz'
  }
  if (!specs.refreshRate) {
    const hzMatch = html.match(/(\d+)Hz\s*refresh/i) || html.match(/refresh[^<]{0,20}(\d+)Hz/i)
    if (hzMatch && parseInt(hzMatch[1]) > 30) specs.refreshRate = hzMatch[1] + ' Hz'
  }

  // 밝기
  const nitsMatch = html.match(/([\d,]+)\s*nits/i)
  if (nitsMatch) specs.brightness = nitsMatch[1].replace(',','') + ' nits'

  // 충전
  const wattMatch = html.match(/(\d+)W\s*(?:fast\s*)?charg/i)
    || html.match(/charg[^<]{0,30}(\d+)\s*W/i)
  if (wattMatch) specs.charging = wattMatch[1] + 'W'

  // PPI
  const ppiMatch = html.match(/([\d]+)\s*ppi/i)
  if (ppiMatch) specs.ppi = ppiMatch[1] + ' ppi'

  // 가격
  const priceMatch = html.match(/\$[\d,]+/)
  if (priceMatch) specs.price = priceMatch[0]

  // NFC
  specs.nfc = html.match(/<b>NFC<\/b>/i) ? '있음' : '없음'

  // 3.5mm - 명확한 패턴만
  specs.headphone = html.match(/3\.5\s*mm\s*(?:jack|headphone|audio)/i) ? '있음' : '없음'

  // 스피커
  if (html.match(/4\s*speakers|quad\s*speaker/i)) specs.speakers = '4채널'
  else if (html.match(/[Ss]tereo\s*speakers/i)) specs.speakers = '스테레오'
  else if (html.match(/[Ss]ingle\s*speaker/i)) specs.speakers = '모노'

  // 센서
  const sensorMatch = bGet('Sensors')
  if (sensorMatch) specs.sensors = sensorMatch
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