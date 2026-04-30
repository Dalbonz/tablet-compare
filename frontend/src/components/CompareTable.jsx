const ALL_CATEGORIES = [
  { name: '기본 정보', color: '#6b7280', specs: [
    { key: '_image', label: '이미지', isImage: true },
  ]},
  { name: '바디', color: '#8b5cf6', specs: [
    { key: 'dimensions', label: 'Dimensions' },
    { key: 'weight', label: 'Weight' },
  ]},
  { name: '디스플레이', color: '#3b82f6', specs: [
    { key: 'displaySize', label: 'Size' },
    { key: 'displayType', label: 'Type' },
    { key: 'refreshRate', label: 'Refresh Rate', numeric: true },
    { key: 'resolution', label: 'Resolution' },
    { key: 'ppi', label: 'PPI', numeric: true },
    { key: 'brightness', label: 'Brightness', numeric: true },
  ]},
  { name: 'AP (성능)', color: '#10b981', specs: [
    { key: 'chipset', label: 'Chipset' },
    { key: 'singleCore', label: 'Single-Core', numeric: true },
    { key: 'multiCore', label: 'Multi-Core', numeric: true },
    { key: 'gpu', label: 'GPU' },
    { key: 'npu', label: 'NPU (TOPS)', numeric: true },
  ]},
  { name: '메모리', color: '#f59e0b', specs: [
    { key: 'ram', label: 'RAM' },
    { key: 'storage', label: 'Storage (기본)' },
  ]},
  { name: '카메라', color: '#ec4899', specs: [
    { key: 'rearCamera', label: '후면' },
    { key: 'frontCamera', label: '전면' },
  ]},
  { name: '사운드', color: '#6366f1', specs: [
    { key: 'speakers', label: '스피커' },
    { key: 'headphone', label: '3.5mm 잭' },
  ]},
  { name: '배터리', color: '#f97316', specs: [
    { key: 'battery', label: '용량', numeric: true },
    { key: 'charging', label: '충전 (유선)' },
  ]},
  { name: '통신 사양', color: '#14b8a6', specs: [
    { key: 'wlan', label: 'WLAN' },
    { key: 'bluetooth', label: 'Bluetooth' },
    { key: 'gps', label: 'GPS' },
    { key: 'nfc', label: 'NFC' },
    { key: 'usb', label: 'USB' },
  ]},
  { name: '센서', color: '#84cc16', specs: [
    { key: 'sensors', label: '센서' },
  ]},
  { name: 'MISC', color: '#ef4444', specs: [
    { key: 'misc', label: '기타 특장점' },
  ]},
]

function getCompareBadge(refVal, val, thresholds) {
  const ref = parseFloat(String(refVal).replace(/[^0-9.]/g, ''))
  const cur = parseFloat(String(val).replace(/[^0-9.]/g, ''))
  if (isNaN(ref) || isNaN(cur) || ref === 0) return null
  const ratio = cur / ref
  const sup = (thresholds?.superior ?? 20) / 100
  const slight = (thresholds?.slightlySuper ?? 5) / 100
  if (ratio >= 1 + sup) return { cls: 'badge-superior', label: '>>' }
  if (ratio >= 1 + slight) return { cls: 'badge-slightly-superior', label: '>' }
  if (ratio >= 1 - slight) return { cls: 'badge-equal', label: '=' }
  if (ratio >= 1 - sup) return { cls: 'badge-slightly-inferior', label: '<' }
  return { cls: 'badge-inferior', label: '<<' }
}

function ComparisonCell({ refProduct, compareProduct, spec, thresholds }) {
  if (!spec.numeric) return <td className="comparison-cell" />
  const refVal = refProduct?.specs?.[spec.key]
  const curVal = compareProduct?.specs?.[spec.key]
  if (!refVal || !curVal) return <td className="comparison-cell" />
  const badge = getCompareBadge(refVal, curVal, thresholds)
  if (!badge) return <td className="comparison-cell" />
  return (
    <td className="comparison-cell">
      <span className={`compare-badge ${badge.cls}`}>{badge.label}</span>
    </td>
  )
}

function SpecValue({ value, isWebSearch }) {
  return (
    <span>
      {value ?? '-'}
      {isWebSearch && <span className="web-indicator">🔍</span>}
    </span>
  )
}

export default function CompareTable({ products, settings }) {
  const ref = products[0]
  const compareProducts = products.slice(1)
  const visibleCats = settings?.visibleCategories ?? ALL_CATEGORIES.map(c => c.name)
  const categories = ALL_CATEGORIES.filter(c => visibleCats.includes(c.name))
  const totalCols = 2 + 1 + compareProducts.length * 2

  return (
    <div className="compare-table-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th>카테고리</th>
            <th>항목</th>
            <th className="col-product" style={{ textAlign: 'center' }}>
              <div className="col-header-product" style={{ justifyContent: 'center' }}>
                <div>
                  {ref?.manufacturer && <span className="manufacturer-label">{ref.manufacturer}</span>}
                  <span>{ref?.model || '-'}</span>
                </div>
                <span className="reference-tag">기준</span>
              </div>
            </th>
            {compareProducts.map((p) => (
              <>
                <th key={`cmp-h-${p.id}`} className="col-comparison">vs</th>
                <th key={`prod-h-${p.id}`} className="col-product" style={{ textAlign: 'center' }}>
                  <div className="col-header-product" style={{ justifyContent: 'center' }}>
                    {p.manufacturer && <span className="manufacturer-label">{p.manufacturer}</span>}
                    <span>{p.model || '-'}</span>
                  </div>
                </th>
              </>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* ── 스펙 행들 ── */}
          {categories.map((cat, catIdx) => (
            <>
              {catIdx > 0 && (
                <tr key={`divider-${cat.name}`} className="category-divider">
                  <td colSpan={totalCols} />
                </tr>
              )}
              {cat.specs.map((spec, specIdx) => (
                <tr key={`${cat.name}-${spec.key}`} className={spec.isImage ? 'image-row' : ''}>
                  {specIdx === 0 && (
                    <td className="category-group-cell" rowSpan={cat.specs.length} style={{ borderLeft: `3px solid ${cat.color}` }}>
                      {cat.name}
                    </td>
                  )}
                  <td className="spec-label-cell">{spec.label}</td>
                  {/* 기준 제품 */}
                  <td className={spec.isImage ? 'spec-value-cell image-cell' : 'spec-value-cell'}>
                    {ref?.loading ? <span style={{ color: '#d1d5db' }}>로딩 중...</span> : spec.isImage ? (
                      ref?.imageUrl
                        ? <img src={ref.imageUrl} alt={ref.model} className="table-product-image" />
                        : <div className="table-image-placeholder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/></svg></div>
                    ) : (
                      <SpecValue value={ref?.specs?.[spec.key]} isWebSearch={ref?.specs?.[`${spec.key}_web`]} />
                    )}
                  </td>
                  {compareProducts.map((p) => (
                    <>
                      <ComparisonCell key={`cmp-${p.id}-${spec.key}`} refProduct={ref} compareProduct={p} spec={spec} thresholds={settings?.thresholds} />
                      <td key={`val-${p.id}-${spec.key}`} className={spec.isImage ? 'spec-value-cell image-cell' : 'spec-value-cell'}>
                        {p.loading ? <span style={{ color: '#d1d5db' }}>로딩 중...</span> : spec.isImage ? (
                          p.imageUrl
                            ? <img src={p.imageUrl} alt={p.model} className="table-product-image" />
                            : <div className="table-image-placeholder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/></svg></div>
                        ) : (
                          <SpecValue value={p.specs?.[spec.key]} isWebSearch={p.specs?.[`${spec.key}_web`]} />
                        )}
                      </td>
                    </>
                  ))}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

