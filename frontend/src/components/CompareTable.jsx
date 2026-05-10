import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'

const ALL_CATEGORIES = [
  { name: '기본 정보', color: '#6b7280', specs: [
    { key: '_image', label: '이미지', isImage: true },
    { key: 'launch', label: '출시일/가격' },
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
  { name: 'AP', color: '#10b981', specs: [
    { key: 'chipset', label: 'Chipset' },
    { key: 'singleCore', label: 'Single-Core', numeric: true },
    { key: 'multiCore', label: 'Multi-Core', numeric: true },
    { key: 'gpu', label: 'GPU' },
    { key: 'npu', label: 'NPU (TOPS)', numeric: true },
    { key: 'benchmarkSource', label: 'Source' },
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
    { key: 'battery', label: '용량 (mAh/Wh)', numeric: true },
    { key: 'batteryLife', label: '사용 시간 (h)', numeric: true },
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
]

function getCompareBadge(refVal, val, thresholds, lowerIsBetter = false) {
  const ref = parseFloat(String(refVal).replace(/[^0-9.]/g, ''))
  const cur = parseFloat(String(val).replace(/[^0-9.]/g, ''))
  if (isNaN(ref) || isNaN(cur) || ref === 0) return null
  const ratio = lowerIsBetter ? ref / cur : cur / ref
  const sup = (thresholds?.superior ?? 20) / 100
  const slight = (thresholds?.slightlySuper ?? 5) / 100
  if (ratio >= 1 + sup) return { cls: 'badge-superior', label: '<<' }
  if (ratio >= 1 + slight) return { cls: 'badge-slightly-superior', label: '<' }
  if (ratio >= 1 - slight) return { cls: 'badge-equal', label: '=' }
  if (ratio >= 1 - sup) return { cls: 'badge-slightly-inferior', label: '>' }
  return { cls: 'badge-inferior', label: '>>' }
}

function getBadgeForSpec(refProduct, compareProduct, spec, thresholds) {
  if (!spec.numeric) return null
  const refVal = refProduct?.specs?.[spec.key]
  const curVal = compareProduct?.specs?.[spec.key]
  if (!refVal || !curVal) return null
  return getCompareBadge(refVal, curVal, thresholds, spec.lowerIsBetter)
}

function mirrorBadgeLabel(label) {
  if (!label) return null
  return { '<<': '>>', '<': '>', '=': '=', '>': '<', '>>': '<<' }[label] ?? null
}

function valueCellClass(badge, isImage, extra = '') {
  const base = (isImage ? 'spec-value-cell image-cell' : 'spec-value-cell') + (extra ? ' ' + extra : '')
  if (!badge) return base
  if (badge.cls === 'badge-superior' || badge.cls === 'badge-slightly-superior') return base + ' value-superior'
  if (badge.cls === 'badge-inferior' || badge.cls === 'badge-slightly-inferior') return base + ' value-inferior'
  return base
}

function ImageCell({ product, spec }) {
  if (product?.loading) return <span style={{ color: '#d1d5db' }}>로딩 중...</span>
  if (!spec.isImage) return null
  return product?.imageUrl
    ? <img src={product.imageUrl} alt={product.model} className="table-product-image" />
    : <div className="table-image-placeholder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/></svg></div>
}

function SpecValue({ value, isWebSearch }) {
  return (
    <span>
      {value ?? '-'}
      {isWebSearch && <span className="web-indicator">🔍</span>}
    </span>
  )
}

function ProductCell({ product, spec, badge, extra }) {
  return (
    <td className={valueCellClass(badge, spec.isImage, extra)}>
      {product?.loading
        ? <span style={{ color: '#d1d5db' }}>로딩 중...</span>
        : spec.isImage
          ? <ImageCell product={product} spec={spec} />
          : <SpecValue value={product?.specs?.[spec.key]} isWebSearch={product?.specs?.[`${spec.key}_web`]} />
      }
    </td>
  )
}

function SetRefButton({ onClick }) {
  return (
    <button className="set-ref-btn" onClick={e => { e.stopPropagation(); onClick() }}>
      기준 설정
    </button>
  )
}

export default function CompareTable({ products, settings, categories: categoriesProp, onSetReference, layoutMode, onToggleLayout }) {
  const tableRef = useRef(null)
  const [copying, setCopying] = useState(false)

  const ref = products[0]
  const compareProducts = products.slice(1)
  const allCats = categoriesProp || ALL_CATEGORIES
  const visibleCats = settings?.visibleCategories ?? allCats.map(c => c.name)
  const categories = allCats.filter(c => visibleCats.includes(c.name))

  const isCenterMode = layoutMode === 'center' && compareProducts.length === 2
  const leftCmp = isCenterMode ? compareProducts[0] : null
  const rightCmp = isCenterMode ? compareProducts[1] : null
  const totalCols = 2 + 1 + compareProducts.length * 2
  const tableMaxWidth = 384 + Math.min(compareProducts.length, 2) * 214

  const handleCopyImage = async () => {
    if (!tableRef.current || copying) return
    setCopying(true)
    try {
      const canvas = await html2canvas(tableRef.current, {
        scale: 2, allowTaint: true, useCORS: false, backgroundColor: '#ffffff', logging: false,
      })
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    } catch {
      // Fallback: download as file
      const canvas = await html2canvas(tableRef.current, { scale: 2, backgroundColor: '#ffffff', logging: false })
      const link = document.createElement('a')
      link.download = 'compare.png'
      link.href = canvas.toDataURL()
      link.click()
    }
    setTimeout(() => setCopying(false), 1500)
  }

  return (
    <div>
      {/* ── Toolbar (not captured in image) ── */}
      <div className="compare-toolbar">
        {compareProducts.length === 2 && (
          <button className="toolbar-btn" onClick={onToggleLayout} title={isCenterMode ? '좌측 기준 모드로 전환' : '중앙 기준 모드로 전환'}>
            {isCenterMode ? '◀ 좌측 기준' : '↔ 중앙 기준'}
          </button>
        )}
        <button
          className={`toolbar-btn toolbar-btn-image${copying ? ' toolbar-btn-done' : ''}`}
          onClick={handleCopyImage}
          title="표를 이미지로 클립보드에 복사 (PPT/Excel 붙여넣기용)"
        >
          {copying ? '✓ 복사됨' : '📸 이미지 복사'}
        </button>
      </div>

      {/* ── Table (captured in image) ── */}
      <div className="compare-table-wrap" ref={tableRef}>
        <table className="compare-table">
          <thead>
            <tr>
              <th>카테고리</th>
              <th>항목</th>

              {isCenterMode ? (
                /* Center mode: [Cmp1] vs [Ref] vs [Cmp2] */
                <>
                  <th className="col-product" style={{ textAlign: 'center' }}>
                    <div className="col-header-product" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                      {leftCmp?.manufacturer && <span className="manufacturer-label">{leftCmp.manufacturer}</span>}
                      <span>{leftCmp?.model || '-'}</span>
                      {onSetReference && <SetRefButton onClick={() => onSetReference(leftCmp.id)} />}
                    </div>
                  </th>
                  <th className="col-comparison">vs</th>
                  <th className="col-product ref-center-header" style={{ textAlign: 'center' }}>
                    <div className="col-header-product" style={{ justifyContent: 'center' }}>
                      <div>
                        {ref?.manufacturer && <span className="manufacturer-label">{ref.manufacturer}</span>}
                        <span>{ref?.model || '-'}</span>
                      </div>
                      <span className="reference-tag">기준</span>
                    </div>
                  </th>
                  <th className="col-comparison">vs</th>
                  <th className="col-product" style={{ textAlign: 'center' }}>
                    <div className="col-header-product" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                      {rightCmp?.manufacturer && <span className="manufacturer-label">{rightCmp.manufacturer}</span>}
                      <span>{rightCmp?.model || '-'}</span>
                      {onSetReference && <SetRefButton onClick={() => onSetReference(rightCmp.id)} />}
                    </div>
                  </th>
                </>
              ) : (
                /* Left mode */
                <>
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
                        <div className="col-header-product" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                          {p.manufacturer && <span className="manufacturer-label">{p.manufacturer}</span>}
                          <span>{p.model || '-'}</span>
                          {onSetReference && <SetRefButton onClick={() => onSetReference(p.id)} />}
                        </div>
                      </th>
                    </>
                  ))}
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {categories.map((cat, catIdx) => (
              <>
                {catIdx > 0 && (
                  <tr key={`divider-${cat.name}`} className="category-divider">
                    <td colSpan={totalCols} />
                  </tr>
                )}
                {cat.specs.map((spec, specIdx) => {
                  const leftBadge = isCenterMode ? getBadgeForSpec(ref, leftCmp, spec, settings?.thresholds) : null
                  const leftMirrorLabel = mirrorBadgeLabel(leftBadge?.label)
                  const rightBadge = isCenterMode
                    ? getBadgeForSpec(ref, rightCmp, spec, settings?.thresholds)
                    : null

                  return (
                    <tr key={`${cat.name}-${spec.key}`} className={spec.isImage ? 'image-row' : ''}>
                      {specIdx === 0 && (
                        <td className="category-group-cell" rowSpan={cat.specs.length} style={{ borderLeft: `3px solid ${cat.color}` }}>
                          {cat.name}
                        </td>
                      )}
                      <td className="spec-label-cell">{spec.label}</td>

                      {isCenterMode ? (
                        <>
                          {/* Left compare */}
                          <ProductCell product={leftCmp} spec={spec} badge={leftBadge} />
                          <td className="comparison-cell">
                            {leftMirrorLabel && <span className="compare-badge">{leftMirrorLabel}</span>}
                          </td>
                          {/* Reference (center) */}
                          <ProductCell product={ref} spec={spec} badge={null} extra="ref-center-col" />
                          {/* Right compare */}
                          <td className="comparison-cell">
                            {rightBadge && <span className="compare-badge">{rightBadge.label}</span>}
                          </td>
                          <ProductCell product={rightCmp} spec={spec} badge={rightBadge} />
                        </>
                      ) : (
                        <>
                          {/* Reference */}
                          <td className={spec.isImage ? 'spec-value-cell image-cell' : 'spec-value-cell'}>
                            {ref?.loading
                              ? <span style={{ color: '#d1d5db' }}>로딩 중...</span>
                              : spec.isImage
                                ? <ImageCell product={ref} spec={spec} />
                                : <SpecValue value={ref?.specs?.[spec.key]} isWebSearch={ref?.specs?.[`${spec.key}_web`]} />
                            }
                          </td>
                          {/* Compare products */}
                          {compareProducts.map((p) => {
                            const badge = getBadgeForSpec(ref, p, spec, settings?.thresholds)
                            return (
                              <>
                                <td key={`cmp-${p.id}-${spec.key}`} className="comparison-cell">
                                  {badge && <span className="compare-badge">{badge.label}</span>}
                                </td>
                                <ProductCell key={`val-${p.id}-${spec.key}`} product={p} spec={spec} badge={badge} />
                              </>
                            )
                          })}
                        </>
                      )}
                    </tr>
                  )
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
