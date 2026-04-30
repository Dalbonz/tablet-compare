import { useState } from 'react'
import CompareTable from './components/CompareTable'
import SettingsPanel from './components/SettingsPanel'
import AddProductPanel from './components/AddProductPanel'

const WORKER_URL = import.meta.env.VITE_WORKER_URL || '/api'

const MANUFACTURERS = [
  'Apple', 'Samsung', 'Xiaomi', 'Lenovo', 'Huawei',
  'Microsoft', 'Google', 'Sony', 'ASUS', 'OnePlus'
]

export const DEFAULT_SETTINGS = {
  language: 'ko',
  currency: 'USD',
  thresholds: { superior: 20, slightlySuper: 5 },
  visibleCategories: ['기본 정보','바디','디스플레이','AP (성능)','메모리','카메라','사운드','배터리','통신 사양','센서','MISC'],
  defaultManufacturer: '',
  theme: 'light',
}

export default function App() {
  const [rows, setRows] = useState([
    { id: 1, manufacturer: '', model: '', productList: [], specs: null, loading: false, imageUrl: null }
  ])
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  const fetchProducts = async (manufacturer) => {
    try {
      const res = await fetch(`${WORKER_URL}/products?manufacturer=${encodeURIComponent(manufacturer)}`)
      const data = await res.json()
      return data.products || []
    } catch { return [] }
  }

  const fetchSpecs = async (manufacturer, model) => {
    try {
      const res = await fetch(`${WORKER_URL}/specs?manufacturer=${encodeURIComponent(manufacturer)}&model=${encodeURIComponent(model)}`)
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
    setRows(prev => [...prev, { id: Date.now(), manufacturer: '', model: '', productList: [], specs: null, loading: false, imageUrl: null }])
  }

  const removeRow = (id) => {
    setRows(prev => prev.filter(r => r.id !== id))
  }

  const canRun = rows.length >= 2 && rows.every(r => r.specs)

  // CompareTable용 products 포맷
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
          {/* 태블릿 가로모드 - 상단 중앙 카메라 점만, 왼쪽 점 제거 */}
          <svg viewBox="0 0 36 26" fill="none" stroke="currentColor" strokeWidth="1.8" width="30" height="22">
            <rect x="1" y="2" width="34" height="22" rx="3"/>
            <circle cx="18" cy="3.8" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </div>

        {/* 노트북 - 태블릿과 동일 사이즈 */}
        <button className="sidebar-btn sidebar-btn-upcoming" title="노트북 비교 (업데이트 예정)">
          <svg viewBox="0 0 36 26" fill="none" stroke="currentColor" strokeWidth="1.8" width="30" height="22">
            <rect x="2" y="2" width="32" height="18" rx="2"/>
            <path d="M0 22h36"/>
            <path d="M10 20v2M26 20v2"/>
          </svg>
          <span className="sidebar-upcoming-label">예정</span>
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
          <h1>Tablet Compare</h1>
        </header>

        <div className="content">
          {/* ── 제품 선택 행들 ── */}
          <div className="selector-area">
            {rows.map((row, idx) => (
              <div key={row.id} className="selector-row">
                {/* × 버튼 자리 - 항상 고정 너비 (첫 번째 행은 빈 자리) */}
                <div className="selector-btn-cell">
                  {idx > 0 && (
                    <button className="selector-remove-btn" onClick={() => removeRow(row.id)} title="제거">×</button>
                  )}
                </div>

                {/* 제조사 선택 */}
                <select
                  className={`selector-select${idx === 0 ? ' selector-select-first' : ''}`}
                  value={row.manufacturer}
                  onChange={e => handleManufacturerChange(row.id, e.target.value)}
                >
                  <option value="">제조사 선택</option>
                  {MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>

                {/* 제품 선택 */}
                <select
                  className="selector-select selector-select-product"
                  value={row.model}
                  onChange={e => handleModelChange(row.id, e.target.value)}
                  disabled={!row.manufacturer}
                >
                  <option value="">제품 선택</option>
                  {row.productList.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                {/* + 버튼 - 맨 마지막 행 오른쪽에만 */}
                {idx === rows.length - 1 && rows.length < 5 && (
                  <button className="selector-add-btn" onClick={addRow} title="제품 추가">+</button>
                )}
              </div>
            ))}
          </div>

          {/* Compare table */}
          {products.some(p => p.specs) && (
            <CompareTable products={products} settings={settings} />
          )}

          {/* Bottom info */}
          <div className="info-bar">
            <div className="info-card">
              <h4>사용 방법</h4>
              <ol>
                <li>제조사를 선택하면 해당 브랜드의 제품 목록이 최신순으로 표시됩니다.</li>
                <li>제품을 선택하면 스펙이 자동으로 채워집니다.</li>
                <li>최대 5개 제품까지 비교할 수 있습니다. (기준은 첫 번째 제품입니다.)</li>
                <li>가격 통화, 언어, 비교 기준 등은 좌측 하단 <strong>설정</strong>에서 변경할 수 있습니다.</li>
              </ol>
            </div>
            <div className="info-card">
              <h4>성능 비교 기준</h4>
              <div className="legend-row"><span className="legend-badge compare-badge badge-superior">&gt;&gt;</span><span>20% 이상 우위</span></div>
              <div className="legend-row"><span className="legend-badge compare-badge badge-slightly-superior">&gt;</span><span>5~20% 우위</span></div>
              <div className="legend-row"><span className="legend-badge compare-badge badge-equal">=</span><span>±5% 이내</span></div>
              <div className="legend-row"><span className="legend-badge compare-badge badge-slightly-inferior">&lt;</span><span>5~20% 열세</span></div>
              <div className="legend-row"><span className="legend-badge compare-badge badge-inferior">&lt;&lt;</span><span>20% 이상 열세</span></div>
            </div>
            <div className="info-card">
              <h4>표시 예시</h4>
              <div className="legend-row"><span className="legend-badge compare-badge badge-superior">&gt;&gt;</span><span style={{fontSize:'11px',color:'#6b7280'}}>기준 대비 20% 이상 우위</span></div>
              <div className="legend-row"><span className="legend-badge compare-badge badge-slightly-superior">&gt;</span><span style={{fontSize:'11px',color:'#6b7280'}}>기준 대비 5~20% 우위</span></div>
              <div className="legend-row"><span className="legend-badge compare-badge badge-equal">=</span><span style={{fontSize:'11px',color:'#6b7280'}}>기준과 동등</span></div>
              <div className="legend-row"><span className="legend-badge compare-badge badge-slightly-inferior">&lt;</span><span style={{fontSize:'11px',color:'#6b7280'}}>기준 대비 5~20% 열세</span></div>
              <div className="legend-row"><span className="legend-badge compare-badge badge-inferior">&lt;&lt;</span><span style={{fontSize:'11px',color:'#6b7280'}}>기준 대비 20% 이상 열세</span></div>
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          manufacturers={MANUFACTURERS}
          onSave={(s) => { setSettings(s); setShowSettings(false) }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

