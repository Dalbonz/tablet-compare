import { useState, useRef } from 'react'
import CompareTable from './components/CompareTable'
import SettingsPanel from './components/SettingsPanel'

const WORKER_URL = import.meta.env.VITE_WORKER_URL || '/api'

const TABLET_CONSUMER_MFR = ['Samsung', 'Apple', 'Xiaomi', 'Lenovo', 'Huawei', 'Microsoft', 'Google', 'Sony', 'ASUS', 'OnePlus']
const TABLET_B2B_MFR = ['Samsung (Active)', 'Zebra', 'Panasonic']
const TABLET_MANUFACTURERS = [...TABLET_CONSUMER_MFR, ...TABLET_B2B_MFR]

const PC_MANUFACTURERS = [
  'Samsung', 'Apple', 'LG', 'Lenovo', 'Dell', 'HP', 'ASUS', 'Huawei', 'Xiaomi'
]

export const DEFAULT_SETTINGS = {
  language: 'ko',
  currency: 'USD',
  thresholds: { superior: 20, slightlySuper: 5 },
  visibleCategories: ['기본 정보','바디','디스플레이','AP','메모리','카메라','사운드','배터리','통신 사양','센서'],
  defaultManufacturer: '',
  theme: 'light',
}

export const PC_DEFAULT_SETTINGS = {
  ...DEFAULT_SETTINGS,
  visibleCategories: ['기본 정보','Design','Entertainment','Performance','Productivity'],
}

const PC_CATEGORIES = [
  { name: '기본 정보', color: '#6b7280', specs: [
    { key: '_image', label: '이미지', isImage: true },
    { key: 'launch', label: '출시일/가격' },
  ]},
  { name: 'Design', color: '#8b5cf6', specs: [
    { key: 'thicknessWeight', label: '두께 / 무게' },
    { key: 'cmfColor', label: 'CMF / Color' },
  ]},
  { name: 'Entertainment', color: '#3b82f6', specs: [
    { key: 'display', label: 'Display' },
    { key: 'audio', label: 'Audio' },
    { key: 'webcam', label: 'Camera' },
  ]},
  { name: 'Performance', color: '#10b981', specs: [
    { key: 'ap', label: 'AP' },
    { key: 'graphics', label: 'Graphics' },
    { key: 'memory', label: 'Memory' },
    { key: 'storage', label: 'Storage' },
    { key: 'battery', label: 'Battery', numeric: true },
    { key: 'adapter', label: 'Adapter' },
  ]},
  { name: 'Productivity', color: '#f59e0b', specs: [
    { key: 'ports', label: 'Port' },
    { key: 'security', label: 'Security' },
  ]},
]

const EMPTY_ROW = () => ({ id: Date.now() + Math.random(), manufacturer: '', model: '', productList: [], specs: null, loading: false, imageUrl: null })

export default function App() {
  const [mode, setMode] = useState('tablet') // 'tablet' | 'pc'
  const [rows, setRows] = useState([{ id: 1, manufacturer: '', model: '', productList: [], specs: null, loading: false, imageUrl: null }])
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [layoutMode, setLayoutMode] = useState('left') // 'left' | 'center'
  const savedRows = useRef({ tablet: null, pc: null })

  const manufacturers = mode === 'pc' ? PC_MANUFACTURERS : TABLET_MANUFACTURERS
  const b2bMfr = mode === 'tablet' ? TABLET_B2B_MFR : []
  const apiPrefix = mode === 'pc' ? '/pc' : ''

  const switchMode = (newMode) => {
    if (newMode === mode) return
    savedRows.current[mode] = rows
    setMode(newMode)
    setRows(savedRows.current[newMode] || [EMPTY_ROW()])
    setSettings(newMode === 'pc' ? PC_DEFAULT_SETTINGS : DEFAULT_SETTINGS)
    setLayoutMode('left')
  }

  const toggleLayout = () => setLayoutMode(m => m === 'left' ? 'center' : 'left')

  const fetchProducts = async (manufacturer) => {
    try {
      const res = await fetch(`${WORKER_URL}${apiPrefix}/products?manufacturer=${encodeURIComponent(manufacturer)}`)
      const data = await res.json()
      return data.products || []
    } catch { return [] }
  }

  const fetchSpecs = async (manufacturer, model) => {
    try {
      const res = await fetch(`${WORKER_URL}${apiPrefix}/specs?manufacturer=${encodeURIComponent(manufacturer)}&model=${encodeURIComponent(model)}`)
      return await res.json()
    } catch { return null }
  }

  const handleManufacturerChange = async (id, mfr) => {
    const list = mfr ? await fetchProducts(mfr) : []
    setRows(prev => prev.map(r => r.id === id ? { ...r, manufacturer: mfr, model: '', productList: list, specs: null, imageUrl: null } : r))
  }

  const handleModelChange = async (id, model) => {
    if (!model) return
    setRows(prev => prev.map(r => r.id === id ? { ...r, model, specs: null, loading: true, imageUrl: null } : r))
    const row = rows.find(r => r.id === id)
    const specs = await fetchSpecs(row.manufacturer, model)
    setRows(prev => prev.map(r => r.id === id ? { ...r, specs, loading: false, imageUrl: specs?.imageUrl || null } : r))
  }

  const addRow = () => {
    if (rows.length >= 5) return
    setRows(prev => [...prev, EMPTY_ROW()])
  }

  const removeRow = (id) => {
    setRows(prev => prev.filter(r => r.id !== id))
  }

  const moveRow = (id, direction) => {
    setRows(prev => {
      const idx = prev.findIndex(r => r.id === id)
      if (direction === 'up' && idx > 0) {
        const next = [...prev]
        ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
        return next
      }
      if (direction === 'down' && idx < prev.length - 1) {
        const next = [...prev]
        ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
        return next
      }
      return prev
    })
  }

  const setReference = (id) => {
    setRows(prev => {
      const idx = prev.findIndex(r => r.id === id)
      if (idx <= 0) return prev
      const next = [...prev]
      const [item] = next.splice(idx, 1)
      return [item, ...next]
    })
  }

  const products = rows.map(r => ({
    id: r.id,
    manufacturer: r.manufacturer,
    model: r.model,
    specs: r.specs,
    loading: r.loading,
    imageUrl: r.imageUrl,
  }))

  return (
    <div style={{ display: 'flex' }}>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          {/* 태블릿 아이콘 — 활성 모드면 파란색 */}
          <button
            className={`sidebar-mode-btn${mode === 'tablet' ? ' active' : ''}`}
            title="태블릿 비교"
            onClick={() => switchMode('tablet')}
          >
            <svg viewBox="0 0 36 26" fill="none" stroke="currentColor" strokeWidth="1.8" width="30" height="22">
              <rect x="1" y="2" width="34" height="22" rx="3"/>
              <circle cx="18" cy="3.8" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </button>
        </div>

        {/* 노트북 아이콘 — PC 모드 전환 */}
        <button
          className={`sidebar-btn sidebar-mode-btn${mode === 'pc' ? ' active' : ''}`}
          title="PC 비교"
          onClick={() => switchMode('pc')}
        >
          <svg viewBox="0 0 32 29" fill="none" stroke="currentColor" strokeWidth="1.8" width="32" height="29">
            <rect x="1" y="1" width="30" height="17" rx="2"/>
            <path d="M0 24h32"/>
            <path d="M9 23v2M23 23v2"/>
          </svg>
        </button>

        <button
          className={`sidebar-btn sidebar-bottom ${showSettings ? 'active' : ''}`}
          title="설정"
          onClick={() => setShowSettings(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </aside>

      <div className="main-layout">
        <header className="header">
          <div>
            <div className="app-brand">NC Product Compare</div>
            <h1>{mode === 'pc' ? 'PC Compare' : 'Tablet Compare'}</h1>
          </div>
        </header>

        <div className="content">
          <div className="top-section">
            {/* ── 제품 선택 행들 ── */}
            <div className="selector-area">
              {rows.map((row, idx) => (
                <div key={row.id} className="selector-row">
                  <div className="selector-btn-cell">
                    {idx === 0
                      ? <span className="selector-reference-badge">기준</span>
                      : <button className="selector-remove-btn" onClick={() => removeRow(row.id)} title="제거">×</button>
                    }
                  </div>

                  <select
                    className="selector-select"
                    value={row.manufacturer}
                    onChange={e => handleManufacturerChange(row.id, e.target.value)}
                  >
                    <option value="">제조사 선택</option>
                    {manufacturers.filter(m => !b2bMfr.includes(m)).map(m => <option key={m} value={m}>{m}</option>)}
                    {b2bMfr.length > 0 && (
                      <optgroup label="B2B / Enterprise">
                        {b2bMfr.map(m => <option key={m} value={m}>{m}</option>)}
                      </optgroup>
                    )}
                  </select>

                  <select
                    className="selector-select selector-select-product"
                    value={row.model}
                    onChange={e => handleModelChange(row.id, e.target.value)}
                    disabled={!row.manufacturer}
                  >
                    <option value="">제품 선택</option>
                    {row.productList.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>

                  <div className="selector-move-cell">
                    <button className="selector-move-btn" onClick={() => moveRow(row.id, 'up')} disabled={idx === 0} title="위로">▲</button>
                    <button className="selector-move-btn" onClick={() => moveRow(row.id, 'down')} disabled={idx === rows.length - 1} title="아래로">▼</button>
                  </div>

                  {idx === rows.length - 1 && rows.length < 5 && (
                    <button className="selector-add-btn" onClick={addRow} title="제품 추가">+</button>
                  )}
                </div>
              ))}
            </div>

            {/* Info - selector 우측에 항상 표시 */}
            <div className="info-bar">
              <div className="info-card">
                <h4>사용 방법</h4>
                <ol>
                  <li>좌측 아이콘으로 태블릿 / PC 비교 모드를 선택합니다.</li>
                  <li>제조사를 선택하면 해당 브랜드의 제품 목록이 표시됩니다.</li>
                  <li>제품을 선택하면 스펙이 자동으로 채워집니다.</li>
                  <li>최대 5개 제품까지 비교 가능. 첫 번째 행이 기준이며, ▲▼ 버튼으로 순서 변경 또는 비교 제품 이름 클릭으로 기준 설정.</li>
                </ol>
              </div>
              <div className="info-card">
                <h4>비교 배지 설명</h4>
                <p style={{fontSize:'11px',color:'#6b7280',marginBottom:'8px'}}>꺽쇠가 더 큰 쪽으로 열립니다.</p>
                <div className="legend-row"><span className="legend-badge compare-badge">&lt;&lt;</span><span className="value-superior" style={{padding:'1px 6px',borderRadius:'3px'}}>기준 대비 {settings.thresholds.superior}%+ 우위</span></div>
                <div className="legend-row"><span className="legend-badge compare-badge">&lt;</span><span className="value-superior" style={{padding:'1px 6px',borderRadius:'3px'}}>{settings.thresholds.slightlySuper}~{settings.thresholds.superior}% 우위</span></div>
                <div className="legend-row"><span className="legend-badge compare-badge">=</span><span>±{settings.thresholds.slightlySuper}% 동등</span></div>
                <div className="legend-row"><span className="legend-badge compare-badge">&gt;</span><span className="value-inferior" style={{padding:'1px 6px',borderRadius:'3px'}}>{settings.thresholds.slightlySuper}~{settings.thresholds.superior}% 열세</span></div>
                <div className="legend-row"><span className="legend-badge compare-badge">&gt;&gt;</span><span className="value-inferior" style={{padding:'1px 6px',borderRadius:'3px'}}>{settings.thresholds.superior}%+ 열세</span></div>
              </div>
            </div>
          </div>

          {/* Compare table */}
          {products.some(p => p.specs) && (
            <CompareTable
              products={products}
              settings={settings}
              categories={mode === 'pc' ? PC_CATEGORIES : undefined}
              onSetReference={products.length > 1 ? setReference : undefined}
              layoutMode={layoutMode}
              onToggleLayout={toggleLayout}
            />
          )}
        </div>
      </div>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          manufacturers={manufacturers}
          mode={mode}
          onSave={(s) => { setSettings(s); setShowSettings(false) }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
