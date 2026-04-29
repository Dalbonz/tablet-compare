// Tablet Compare Worker
// Routes: GET /products?manufacturer=Apple
//         GET /specs?manufacturer=Apple&model=iPad+Pro+11+%28M4%2C+2024%29

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

// GSMArena brand slugs
const BRAND_SLUGS = {
  'Apple': 'apple-phones-48.php',
  'Samsung': 'samsung-phones-9.php',
  'Xiaomi': 'xiaomi-phones-80.php',
  'Lenovo': 'lenovo-phones-73.php',
  'Huawei': 'huawei-phones-58.php',
  'Microsoft': 'microsoft-phones-64.php',
  'Google': 'google-phones-107.php',
  'Sony': 'sony-phones-7.php',
  'ASUS': 'asus-phones-46.php',
  'OnePlus': 'oneplus-phones-95.php',
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    const url = new URL(request.url)
    const path = url.pathname

    try {
      if (path === '/products') {
        const manufacturer = url.searchParams.get('manufacturer')
        const products = await fetchProductList(manufacturer)
        return json({ products })
      }

      if (path === '/specs') {
        const manufacturer = url.searchParams.get('manufacturer')
        const model = url.searchParams.get('model')
        const specs = await fetchSpecs(manufacturer, model)
        return json(specs)
      }

      return json({ error: 'Not found' }, 404)
    } catch (e) {
      return json({ error: e.message }, 500)
    }
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS })
}

// ─────────────────────────────────────────
// Fetch product list from GSMArena brand page
// ─────────────────────────────────────────
async function fetchProductList(manufacturer) {
  const slug = BRAND_SLUGS[manufacturer]
  if (!slug) return []

  const url = `https://www.gsmarena.com/${slug}`
  const html = await fetchHtml(url)
  if (!html) return []

  // Parse product names — filter to tablets only
  const tabletKeywords = /tab|pad|ipad|surface|matebook|mediapad|lenovo tab|xiaomi pad|galaxy tab/i
  const products = []
  const re = /class="makers"[\s\S]*?<ul>([\s\S]*?)<\/ul>/i
  const match = html.match(re)
  if (match) {
    const items = match[1].matchAll(/<a href="([^"]+)"[\s\S]*?<strong[^>]*><span[^>]*>([^<]+)<\/span>/g)
    for (const item of items) {
      const name = item[2].trim()
      if (tabletKeywords.test(name)) {
        products.push(name)
      }
    }
  }

  // Fallback: generic name parse if above fails
  if (products.length === 0) {
    const items = html.matchAll(/<li>[\s\S]*?<strong[^>]*><span[^>]*>([^<]+)<\/span>/g)
    for (const item of items) {
      const name = item[1].trim()
      if (tabletKeywords.test(name)) products.push(name)
      if (products.length >= 30) break
    }
  }

  return products.slice(0, 30)
}

// ─────────────────────────────────────────
// Fetch specs: GSMArena first, then nanoreview for AP
// ─────────────────────────────────────────
async function fetchSpecs(manufacturer, model) {
  const specs = {}
  let webFlags = {}

  // 1. Try GSMArena search
  const searchUrl = `https://www.gsmarena.com/results.php3?fDisplayInchesMin=7&fDisplayInchesMax=15&chk_tablet=selected&sQuickSearch=${encodeURIComponent(model)}`
  const searchHtml = await fetchHtml(searchUrl)
  let deviceUrl = null

  if (searchHtml) {
    const linkMatch = searchHtml.match(/href="([\w-]+-\d+\.php)"/)
    if (linkMatch) deviceUrl = `https://www.gsmarena.com/${linkMatch[1]}`
  }

  if (!deviceUrl) {
    // Try direct slug guess
    const slug = model.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
    deviceUrl = `https://www.gsmarena.com/${manufacturer.toLowerCase()}_${slug}-1.php`
  }

  const deviceHtml = await fetchHtml(deviceUrl)
  if (deviceHtml) {
    parseGSMArena(deviceHtml, specs)

    // Image
    const imgMatch = deviceHtml.match(/<div class="specs-photo-main">[\s\S]*?<img src="([^"]+)"/)
    if (imgMatch) specs.imageUrl = imgMatch[1]
  } else {
    webFlags = { ...webFlags, releaseDate: true, price: true }
  }

  // 2. Nanoreview for AP benchmark
  if (specs.chipset) {
    const nrSpecs = await fetchNanoreview(specs.chipset)
    if (nrSpecs) {
      if (nrSpecs.singleCore) { specs.singleCore = nrSpecs.singleCore; webFlags.singleCore = true }
      if (nrSpecs.multiCore) { specs.multiCore = nrSpecs.multiCore; webFlags.multiCore = true }
      if (nrSpecs.npu) { specs.npu = nrSpecs.npu; webFlags.npu = true }
    }
  }

  // Mark web-sourced fields
  for (const key of Object.keys(webFlags)) {
    specs[`${key}_web`] = true
  }

  return specs
}

// ─────────────────────────────────────────
// GSMArena spec page parser
// ─────────────────────────────────────────
function parseGSMArena(html, specs) {
  const extract = (label) => {
    const re = new RegExp(`<td[^>]*data-spec="${label}"[^>]*>([\\s\\S]*?)<\\/td>`, 'i')
    const m = html.match(re)
    if (!m) return null
    return m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  }

  const extractByLabel = (labelText) => {
    const re = new RegExp(`<td[^>]*class="[^"]*ttl[^"]*"[^>]*>[^<]*${labelText}[^<]*<\\/td>[\\s\\S]*?<td[^>]*class="[^"]*nfo[^"]*"[^>]*>([\\s\\S]*?)<\\/td>`, 'i')
    const m = html.match(re)
    if (!m) return null
    return m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  }

  specs.releaseDate   = extract('year') || extractByLabel('Announced') || null
  specs.price         = extract('price') || null
  specs.dimensions    = extract('dimensions') || null
  specs.weight        = extract('weight') || null
  specs.displaySize   = extract('displaysize') || null
  specs.displayType   = extract('displaytype') || null
  specs.resolution    = extract('displayresolution') || null
  specs.chipset       = extract('chipset') || null
  specs.gpu           = extract('gpu') || null
  specs.ram           = extract('internalmemory') ? extract('internalmemory').split(' ')[0] + ' RAM' : null
  specs.storage       = extract('internalmemory') || null
  specs.rearCamera    = extract('cam1modules') || null
  specs.frontCamera   = extract('cam2modules') || null
  specs.battery       = extract('batdescription1') || null
  specs.wlan          = extract('wlan') || null
  specs.bluetooth     = extract('bluetooth') || null
  specs.gps           = extract('gps') || null
  specs.nfc           = extract('nfc') || null
  specs.usb           = extract('usb') || null
  specs.sensors       = extract('sensors') || null
  specs.misc          = extract('optionalother') || null

  // Refresh rate: extract from displaytype
  if (specs.displayType) {
    const hz = specs.displayType.match(/(\d+)Hz/)
    if (hz) specs.refreshRate = hz[1]
  }

  // PPI from resolution field
  if (specs.resolution) {
    const ppi = specs.resolution.match(/~?(\d+)\s*ppi/)
    if (ppi) specs.ppi = ppi[1]
  }

  // Brightness
  if (specs.displayType) {
    const nits = specs.displayType.match(/(\d+)\s*nits/)
    if (nits) specs.brightness = nits[1]
  }

  // Charging wattage
  if (specs.battery) {
    const watt = specs.battery.match(/(\d+)W/)
    if (watt) specs.charging = watt[0]
  }

  // Speaker info
  if (html.includes('Stereo speakers')) specs.speakers = '스테레오'
  else if (html.includes('Single speaker')) specs.speakers = '모노'

  // 3.5mm jack
  if (html.match(/3\.5mm/i)) specs.headphone = '있음'
  else specs.headphone = '없음'
}

// ─────────────────────────────────────────
// Nanoreview benchmark parser
// ─────────────────────────────────────────
async function fetchNanoreview(chipset) {
  if (!chipset) return null
  const query = chipset.replace(/Apple\s+/i, '').replace(/\s+/g, '-').toLowerCase()
  const url = `https://nanoreview.net/en/soc/${query}`
  const html = await fetchHtml(url)
  if (!html) return null

  const result = {}

  const single = html.match(/Single-core[^<]*<\/[^>]+>\s*<[^>]+>\s*([\d,]+)/)
  if (single) result.singleCore = single[1].replace(/,/g, '')

  const multi = html.match(/Multi-core[^<]*<\/[^>]+>\s*<[^>]+>\s*([\d,]+)/)
  if (multi) result.multiCore = multi[1].replace(/,/g, '')

  const npu = html.match(/NPU[^<]*<\/[^>]+>\s*<[^>]+>\s*([\d.]+\s*TOPS)/)
  if (npu) result.npu = npu[1]

  return result
}

// ─────────────────────────────────────────
// HTML fetcher with headers to avoid blocks
// ─────────────────────────────────────────
async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
      },
      cf: { cacheTtl: 3600, cacheEverything: true }
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}
