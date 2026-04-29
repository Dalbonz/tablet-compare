const CATEGORIES = [
  {
    name: '기본 정보',
    color: '#6b7280',
    specs: [
      { key: 'releaseDate', label: '출시일' },
      { key: 'price', label: '출시 가격 (Wi-Fi, 기본)' },
    ]
  },
  {
    name: '바디',
    color: '#8b5cf6',
    specs: [
      { key: 'dimensions', label: 'Dimensions' },
      { key: 'weight', label: 'Weight' },
    ]
  },
  {
    name: '디스플레이',
    color: '#3b82f6',
    specs: [
      { key: 'displaySize', label: 'Size' },
      { key: 'displayType', label: 'Type' },
      { key: 'refreshRate', label: 'Refresh Rate', numeric: true, unit: 'Hz' },
      { key: 'resolution', label: 'Resolution' },
      { key: 'ppi', label: 'PPI', numeric: true },
      { key: 'brightness', label: 'Brightness', numeric: true, unit: 'nits' },
    ]
  },
  {
    name: 'AP (성능 비교)',
    color: '#10b981',
    specs: [
      { key: 'chipset', label: 'Chipset' },
      { key: 'singleCore', label: 'Single-Core', numeric: true },
      { key: 'multiCore', label: 'Multi-Core', numeric: true },
      { key: 'gpu', label: 'GPU' },
      { key: 'npu', label: 'NPU (TOPS)', numeric: true },
    ]
  },
  {
    name: '메모리',
    color: '#f59e0b',
    specs: [
      { key: 'ram', label: 'RAM' },
      { key: 'storage', label: 'Storage (기본)' },
    ]
  },
  {
    name: '카메라',
    color: '#ec4899',
    specs: [
      { key: 'rearCamera', label: '후면' },
      { key: 'frontCamera', label: '전면' },
    ]
  },
  {
    name: '사운드',
    color: '#6366f1',
    specs: [
      { key: 'speakers', label: '스피커' },
      { key: 'headphone', label: '3.5mm 잭' },
    ]
  },
  {
    name: '배터리',
    color: '#f97316',
    specs: [
      { key: 'battery', label: '용량', numeric: true, unit: 'mAh' },
      { key: 'charging', label: '충전 (유선)' },
    ]
  },
  {
    name: '통신 사양',
    color: '#14b8a6',
    specs: [
      { key: 'wlan', label: 'WLAN' },
      { key: 'bluetooth', label: 'Bluetooth' },
      { key: 'gps', label: 'GPS' },
      { key: 'nfc', label: 'NFC' },
      { key: 'usb', label: 'USB' },
    ]
  },
  {
    name: '센서',
    color: '#84cc16',
    specs: [
      { key: 'sensors', label: '센서' },
    ]
  },
  {
    name: 'MISC',
    color: '#ef4444',
    specs: [
      { key: 'misc', label: '기타 특장점' },
    ]
  },
]

function getCompareBadge(refVal, val) {
  const ref = parseFloat(String(refVal).replace(/[^0-9.]/g, ''))
  const cur = parseFloat(String(val).replace(/[^0-9.]/g, ''))
  if (isNaN(ref) || isNaN(cur) || ref === 0) return null
  const ratio = (cur / ref) * 100
  const pct = Math.round(ratio)
  if (ratio >= 120) return { cls: 'badge-superior', label: `${pct}% >>` }
  if (ratio >= 105) return { cls: 'badge-slightly-superior', label: `${pct}% >` }
  if (ratio >= 95) return { cls: 'badge-equal', label: `${pct}% =` }
  if (ratio >= 80) return { cls: 'badge-slightly-inferior', label: `${pct}% <` }
  return { cls: 'badge-inferior', label: `${pct}% <<` }
}

function SpecValue({ value, refValue, isReference, numeric, isWebSearch }) {
  const display = value ?? '-'
  if (isReference || !numeric || !refValue || !value) {
    return (
      <span>
        {String(display)}
        {isWebSearch && <span className="web-indicator">🔍web</span>}
      </span>
    )
  }
  const badge = getCompareBadge(refValue, value)
  return (
    <span>
      {String(display)}
      {badge && (
        <span className={`compare-badge ${badge.cls}`} style={{ marginLeft: 6 }}>
          {badge.label}
        </span>
      )}
      {isWebSearch && <span className="web-indicator">🔍web</span>}
    </span>
  )
}

export default function CompareTable({ products }) {
  const ref = products[0]

  return (
    <div className="compare-table-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th>항목</th>
            <th></th>
            {products.map((p, i) => (
              <th key={p.id}>
                <div className="col-header-product">
                  {p.model || '제품 선택 중'}
                  {i === 0 && <span className="reference-tag">기준</span>}
                </div>
              </th>
            ))}
            <th>+</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map(cat => (
            <>
              <tr key={cat.name} className="category-row">
                <td colSpan={3 + products.length}>
                  <span className="category-indicator" style={{ background: cat.color }} />
                  {cat.name}
                </td>
              </tr>
              {cat.specs.map(spec => (
                <tr key={spec.key}>
                  <td className="spec-label-cell">{spec.label}</td>
                  <td></td>
                  {products.map((p, i) => {
                    const val = p.specs?.[spec.key]
                    const refVal = ref?.specs?.[spec.key]
                    const isWeb = p.specs?.[`${spec.key}_web`]
                    return (
                      <td key={p.id} className="spec-value-cell">
                        {p.loading ? (
                          <span style={{ color: '#d1d5db' }}>로딩 중...</span>
                        ) : (
                          <SpecValue
                            value={val}
                            refValue={refVal}
                            isReference={i === 0}
                            numeric={spec.numeric}
                            isWebSearch={isWeb}
                          />
                        )}
                      </td>
                    )
                  })}
                  <td></td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

