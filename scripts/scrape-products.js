const fs = require('fs')

const TABLET_KEYWORDS = /tab|pad|ipad|surface|matebook|mediapad|tablet/i

const MANUFACTURER_URLS = {
  'Apple':     'https://www.devicespecifications.com/en/brand/4c4d0a',
  'Samsung':   'https://www.devicespecifications.com/en/brand/b4130a',
  'Xiaomi':    'https://www.devicespecifications.com/en/brand/b5180a',
  'Lenovo':    'https://www.devicespecifications.com/en/brand/3d410a',
  'Huawei':    'https://www.devicespecifications.com/en/brand/2f360a',
  'Microsoft': 'https://www.devicespecifications.com/en/brand/c32b0a',
  'Google':    'https://www.devicespecifications.com/en/brand/7e550a',
  'ASUS':      'https://www.devicespecifications.com/en/brand/1c020a',
  'OnePlus':   'https://www.devicespecifications.com/en/brand/d85e0a',
  'Sony':      'https://www.devicespecifications.com/en/brand/95080a',
}

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TabletCompareBot/1.0)' }
  })
  if (!res.ok) return null
  return await res.text()
}

function extractProducts(html) {
  const products = []
  const re = /href="\/en\/model\/([a-z0-9]+)"[^>]*>([^<]+)<\/a>/g
  let match
  const seen = new Set()
  while ((match = re.exec(html)) !== null) {
    const dsId = match[1]
    const name = match[2].trim()
    if (TABLET_KEYWORDS.test(name) && name.length > 3 && !seen.has(name)) {
      seen.add(name)
      products.push({ name, dsId })
    }
  }
  return products
}

async function main() {
  console.log('태블릿 제품 목록 업데이트 시작...')
  let existing = {}
  try { existing = JSON.parse(fs.readFileSync('products.json', 'utf8')) } catch {}
  const result = { ...existing }

  for (const [mfr, url] of Object.entries(MANUFACTURER_URLS)) {
    console.log(`  ${mfr} 크롤링 중...`)
    try {
      const html = await fetchPage(url)
      if (html) {
        const products = extractProducts(html)
        if (products.length > 0) {
          result[mfr] = products
          console.log(`  ✅ ${mfr}: ${products.length}개`)
        }
      }
    } catch (e) {
      console.log(`  ❌ ${mfr}: ${e.message}`)
    }
    await new Promise(r => setTimeout(r, 1000))
  }

  fs.writeFileSync('products.json', JSON.stringify(result, null, 2))
  console.log('완료!')
}

main().catch(console.error)
